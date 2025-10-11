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

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

export async function saveOnboardingSession(sessionId: string, events: any[], userId?: string) {
  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    console.warn('saveOnboardingSession skipped: missing sessionId');
    return null;
  }
  // Determine endpoint at call time to ensure browser uses the proxy API route
  const endpoint =
    typeof window !== 'undefined'
      ? '/api/save-onboarding-session'
      : process.env.SAVE_ONBOARDING_URL ||
        process.env.NEXT_PUBLIC_SAVE_ONBOARDING_URL ||
        'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/saveOnboardingSession'

  const payload = { sessionId, events, userId }
  const opts: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }

  // Retry logic: try up to 2 times for transient network failures
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(endpoint, opts, 8000)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`)
      }
      return await res.json()
    } catch (err: any) {
      console.error(`saveOnboardingSession attempt ${attempt} failed:`, err?.message || err)
      if (attempt === 2) return null
      // small backoff
      await new Promise(r => setTimeout(r, 300 * attempt))
    }
  }
  return null
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
