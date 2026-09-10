// Starts Firebase emulators + Vite. Staging data lives in .staging/ and is
// written back on exit. First run with an empty dump is fine — use
// `npm run scrub:staging` to clone prod into it.
import { mkdirSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { envWithJava21 } from './java-home.mjs'

const PROJECT_ID = 'andreapearsonofficial'
const STAGING_DIR = resolve('.staging')
mkdirSync(STAGING_DIR, { recursive: true })

const sa = resolve('serviceAccountKey.json')
const env = envWithJava21()
env.VITE_USE_EMULATORS = 'true'
if (existsSync(sa)) env.GOOGLE_APPLICATION_CREDENTIALS = sa

const args = [
  'emulators:exec',
  '--project', PROJECT_ID,
  '--export-on-exit', STAGING_DIR,
  '--ui',
]
if (existsSync(resolve(STAGING_DIR, 'firebase-export-metadata.json'))) {
  args.push('--import', STAGING_DIR)
}
args.push('vite')

const child = spawn('firebase', args, { stdio: 'inherit', env, shell: false })

// Ctrl+C goes to the whole process group. Firebase uses the first SIGINT to
// export .staging and shut down; a second SIGINT force-kills. Swallow it here
// so this wrapper doesn't exit (and signal again) before that export finishes.
process.on('SIGINT', () => {})
process.on('SIGTERM', () => {})

child.on('close', (code, signal) => {
  if (signal === 'SIGINT' || signal === 'SIGTERM') process.exit(0)
  process.exit(code ?? 1)
})
child.on('error', err => {
  console.error('Failed to start Firebase emulators.', err.message)
  console.error('Install the Firebase CLI (`npm i -g firebase-tools`) and Java (Firestore emulator).')
  process.exit(1)
})
