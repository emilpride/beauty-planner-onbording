import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Initialize Firebase app (use env vars for config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Function to save onboarding session events in real-time via your deployed
// cloud function. Returns parsed JSON result or null on error.
export async function saveOnboardingSession(sessionId: string, events: any[], userId?: string) {
  try {
    const response = await fetch('https://saveonboardingsession-jy4jt54bea-uc.a.run.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, events, userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (e) {
    console.error('Error saving onboarding session:', e)
    return null
  }
}

// Helper to save or upsert a user document after signup - used by some components.
export async function saveUserToFirestore(userModel: any) {
  try {
    const userId = userModel?.Id || userModel?.uid || userModel?.id
    if (!userId) throw new Error('User ID is required')

    const ref = doc(collection(db, 'users'), userId)
    await setDoc(ref, { ...userModel, updatedAt: serverTimestamp() }, { merge: true })
    return userId
  } catch (e) {
    console.error('Error saving user to Firestore:', e)
    return null
  }
}

export default {
  auth,
  db,
  storage,
  saveOnboardingSession,
  saveUserToFirestore,
}
