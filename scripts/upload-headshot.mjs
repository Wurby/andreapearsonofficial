// Run with: node scripts/upload-headshot.mjs
// Uploads andrea-headshot.jpg to Firebase Storage and saves the URL to Firestore.

import { createInterface } from 'readline'
import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyCd04ynj7Iyf79g-lKS06V2MyLsTDhBPB0',
  authDomain:        'andreapearsonofficial.firebaseapp.com',
  projectId:         'andreapearsonofficial',
  storageBucket:     'andreapearsonofficial.firebasestorage.app',
  messagingSenderId: '210016091249',
  appId:             '1:210016091249:web:5a7c35caf11bbca3686fd0',
}

const app  = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db   = getFirestore(app)
const storage = getStorage(app)

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans) }))
}

const email    = await prompt('Admin email: ')
const password = await prompt('Admin password: ')

console.log('Signing in…')
await signInWithEmailAndPassword(auth, email, password)
console.log('Signed in ✓')

const fileBuffer = readFileSync('public/andrea-headshot.jpg')
const storageRef = ref(storage, 'content/andrea-headshot.jpg')

console.log('Uploading headshot to Storage…')
await uploadBytes(storageRef, fileBuffer, { contentType: 'image/jpeg' })
const url = await getDownloadURL(storageRef)
console.log('Uploaded ✓', url)

console.log('Updating Firestore content document…')
await updateDoc(doc(db, 'content', 'main'), { headshotUrl: url })
console.log('Done ✓  headshotUrl saved.')

process.exit(0)
