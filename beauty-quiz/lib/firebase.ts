import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
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

// Ensure we have at least anonymous auth on the client so Storage/Firestore rules that
// require authentication work during onboarding before signup.
if (typeof window !== 'undefined') {
  try {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((e) => {
          console.warn('Anonymous sign-in failed:', e?.message || e)
        })
      }
    })
  } catch (e) {
    // Non-fatal: continue without auth if something unexpected happens
    console.warn('Auth init warning:', (e as any)?.message || e)
  }
}

// Helper to ensure we have a signed-in (anonymous) user before sensitive ops
export async function ensureAuthUser() {
  if (typeof window === 'undefined') return null
  if (auth.currentUser) return auth.currentUser
  try {
    await signInAnonymously(auth)
    return auth.currentUser
  } catch (e) {
    console.warn('ensureAuthUser: anonymous sign-in failed', (e as any)?.message || e)
    return auth.currentUser
  }
}

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

function detectClientDevice(): 'android' | 'ios' | 'web' {
  if (typeof navigator === 'undefined') return 'web'
  const ua = (navigator.userAgent || '').toLowerCase()
  if (ua.includes('android')) return 'android'
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || ua.includes('ios')) return 'ios'
  return 'web'
}

function getUtmSource(): string | null {
  try {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const utm = params.get('utm_source') || params.get('utmSource')
    return utm
  } catch { return null }
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

  const payload = {
    sessionId,
    events,
    userId,
    meta: {
      utmSource: getUtmSource(),
      device: detectClientDevice(),
      // Referrer helps server classify source; header also typically carries it
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    }
  }
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
