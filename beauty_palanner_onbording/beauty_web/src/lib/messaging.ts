import { getFirebaseApp } from '@/lib/firebase'
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging'

let messagingPromise: Promise<Messaging | null> | null = null

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        if (!(await isSupported())) return null
        const app = getFirebaseApp()
        return getMessaging(app)
      } catch {
        return null
      }
    })()
  }
  return messagingPromise
}

export async function getFcmToken(reg?: ServiceWorkerRegistration): Promise<string | null> {
  const msg = await getFirebaseMessaging()
  if (!msg) return null
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) return null
  try {
    const token = await getToken(msg, { vapidKey, serviceWorkerRegistration: reg })
    return token || null
  } catch {
    return null
  }
}

export async function onForegroundMessage(cb: (payload: unknown) => void): Promise<() => void> {
  const msg = await getFirebaseMessaging()
  if (!msg) return () => {}
  return onMessage(msg, (payload) => cb(payload))
}
