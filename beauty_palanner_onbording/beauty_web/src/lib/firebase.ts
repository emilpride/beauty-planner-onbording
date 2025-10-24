// Firebase SDK initialization (placeholder). Fill with real config via env vars.
// This file intentionally avoids reading process.env until runtime usage is added.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

// Default public Firebase config for beauty-planner-26cc0 (matches Flutter web config).
// This is safe to commit; Firebase client config is not a secret.
const defaultConfig = {
  apiKey: 'AIzaSyDtNfdtikHmUsKrNRFzP1RBXuie19jUTfw',
  authDomain: 'beauty-planner-26cc0.firebaseapp.com',
  projectId: 'beauty-planner-26cc0',
  storageBucket: 'beauty-planner-26cc0.firebasestorage.app',
  messagingSenderId: '587635367697',
  appId: '1:587635367697:web:c61adfac7731beeb0ab6b0',
  measurementId: 'G-KC24E368V1',
} as const

export function getFirebaseApp() {
  if (!app) {
    // Build config from env when provided; otherwise fall back to known project defaults
    const envConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
    const config = {
      apiKey: envConfig.apiKey || defaultConfig.apiKey,
      authDomain: envConfig.authDomain || defaultConfig.authDomain,
      projectId: envConfig.projectId || defaultConfig.projectId,
      storageBucket: envConfig.storageBucket || defaultConfig.storageBucket,
      messagingSenderId: envConfig.messagingSenderId || defaultConfig.messagingSenderId,
      appId: envConfig.appId || defaultConfig.appId,
      measurementId: envConfig.measurementId || defaultConfig.measurementId,
    }
    app = initializeApp(config)
  }
  return app!
}

export function getFirebaseAuth() {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

export function getFirestoreDb() {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}

export function getFirebaseStorage() {
  if (!storage) storage = getStorage(getFirebaseApp())
  return storage
}
