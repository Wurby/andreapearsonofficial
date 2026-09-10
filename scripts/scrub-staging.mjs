// Overwrite local staging (Firebase emulators) with a fresh clone of prod.
// Reads prod via serviceAccountKey.json. Writes ONLY to emulator hosts.
// Never initializes a write client against cloud Firestore/Auth/Storage.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { envWithJava21 } from './java-home.mjs'
import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

if (existsSync('.env')) process.loadEnvFile('.env')

const PROJECT_ID = 'andreapearsonofficial'
const STAGING_DIR = resolve('.staging')
const STAGING_PASSWORD = 'staging'
const SA_PATH = resolve('serviceAccountKey.json')

const HOSTS = {
  hub: 'http://127.0.0.1:4400/emulators',
  firestore: '127.0.0.1:8080',
  auth: '127.0.0.1:9099',
  storage: '127.0.0.1:9199',
}

if (!existsSync(SA_PATH)) {
  console.error('Missing serviceAccountKey.json — needed to READ prod (writes still go to emulators).')
  process.exit(1)
}

if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
  console.error('Refusing to run: emulator env vars are already set. Unset them so the prod dump cannot be redirected.')
  process.exit(1)
}

const prodKey = JSON.parse(readFileSync(SA_PATH, 'utf8'))
if (prodKey.project_id !== PROJECT_ID) {
  console.error(`serviceAccountKey.json is for ${prodKey.project_id}, expected ${PROJECT_ID}.`)
  process.exit(1)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function portListening(hostPort) {
  try {
    await fetch(`http://${hostPort}/`, { signal: AbortSignal.timeout(800) })
    return true
  } catch (err) {
    return err?.cause?.code !== 'ECONNREFUSED'
  }
}

async function emulatorsUp() {
  let hub
  try {
    const res = await fetch(HOSTS.hub, { signal: AbortSignal.timeout(800) })
    if (!res.ok) return false
    hub = await res.json()
  } catch {
    return false
  }
  const ready = hub?.firestore && hub?.auth && hub?.storage
  if (!ready) return false
  const ports = await Promise.all([
    portListening(HOSTS.firestore),
    portListening(HOSTS.auth),
    portListening(HOSTS.storage),
  ])
  return ports.every(Boolean)
}

async function waitForEmulators(timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await emulatorsUp()) return
    await sleep(500)
  }
  throw new Error('Emulators did not become ready (need Auth, Firestore, Storage). Firestore needs Java 21+.')
}

async function dumpProd() {
  const prodApp = initializeApp({
    credential: cert(prodKey),
    projectId: PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`,
  }, 'prod-read')

  const db = getFirestore(prodApp)
  const auth = getAuth(prodApp)
  const bucket = getStorage(prodApp).bucket()

  console.log('Reading prod Firestore…')
  const docs = []
  async function walk(col) {
    const snap = await col.get()
    for (const doc of snap.docs) {
      docs.push({ path: doc.ref.path, data: doc.data() })
      const subs = await doc.ref.listCollections()
      for (const sub of subs) await walk(sub)
    }
  }
  const roots = await db.listCollections()
  for (const col of roots) await walk(col)
  console.log(`  ${docs.length} documents`)

  console.log('Reading prod Auth…')
  const users = []
  let page
  do {
    page = await auth.listUsers(1000, page?.pageToken)
    users.push(...page.users)
  } while (page.pageToken)
  console.log(`  ${users.length} users`)

  console.log('Reading prod Storage…')
  const files = []
  const [listed] = await bucket.getFiles()
  for (const file of listed) {
    const [buf] = await file.download()
    files.push({
      path: file.name,
      buf,
      contentType: file.metadata?.contentType,
    })
  }
  console.log(`  ${files.length} files`)

  await deleteApp(prodApp)
  return { docs, users, files, bucketName: bucket.name }
}

async function clearEmulators() {
  const encodedDb = encodeURIComponent('(default)')
  await fetch(`http://${HOSTS.firestore}/emulator/v1/projects/${PROJECT_ID}/databases/${encodedDb}/documents`, { method: 'DELETE' })
  await fetch(`http://${HOSTS.auth}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' })
}

async function writeStaging({ docs, users, files, bucketName }) {
  process.env.FIRESTORE_EMULATOR_HOST = HOSTS.firestore
  process.env.FIREBASE_AUTH_EMULATOR_HOST = HOSTS.auth
  // FIREBASE_* is host:port (no scheme). @google-cloud/storage treats a
  // schemeless STORAGE_EMULATOR_HOST as https, which the emulator is not.
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = HOSTS.storage
  process.env.STORAGE_EMULATOR_HOST = `http://${HOSTS.storage}`

  const stagingApp = initializeApp({
    projectId: PROJECT_ID,
    storageBucket: bucketName,
  }, 'staging-write')

  const db = getFirestore(stagingApp)
  const auth = getAuth(stagingApp)
  const bucket = getStorage(stagingApp).bucket()

  console.log('Writing Firestore to emulators…')
  for (const { path, data } of docs) {
    await db.doc(path).set(data)
  }

  console.log(`Writing Auth to emulators (password for every cloned user: "${STAGING_PASSWORD}")…`)
  for (const user of users) {
    if (!user.email) continue
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName || undefined,
      password: STAGING_PASSWORD,
      disabled: user.disabled,
    })
  }

  console.log('Writing Storage to emulators…')
  for (const file of files) {
    await bucket.file(file.path).save(file.buf, {
      resumable: false,
      metadata: file.contentType ? { contentType: file.contentType } : undefined,
    })
  }

  await deleteApp(stagingApp)
}

async function exportStaging() {
  await new Promise((resolvePromise, reject) => {
    const child = spawn('firebase', [
      'emulators:export',
      STAGING_DIR,
      '--force',
      '--project', PROJECT_ID,
    ], { stdio: 'inherit', env: envWithJava21() })
    child.on('exit', code => (code === 0 ? resolvePromise() : reject(new Error(`emulators:export exited ${code}`))))
    child.on('error', reject)
  })
}

let startedHere = null

try {
  console.log('Dumping prod (read-only)…')
  const dump = await dumpProd()

  if (!(await emulatorsUp())) {
    console.log('Starting emulators…')
    startedHere = spawn('firebase', [
      'emulators:start',
      '--project', PROJECT_ID,
      '--only', 'auth,firestore,storage,functions',
    ], { stdio: 'inherit', env: envWithJava21() })
    console.log('Waiting for Auth / Firestore / Storage to listen…')
    await waitForEmulators()
  } else {
    console.log('Emulators already running — seeding in place.')
  }

  console.log('Clearing staging…')
  await clearEmulators()
  await writeStaging(dump)
  await exportStaging()
  console.log(`Staging overwritten from prod. Data: ${STAGING_DIR}`)
  console.log(`Admin login on staging: cloned emails, password "${STAGING_PASSWORD}"`)
} catch (err) {
  console.error(err)
  process.exitCode = 1
} finally {
  if (startedHere) {
    startedHere.kill('SIGINT')
  }
}
