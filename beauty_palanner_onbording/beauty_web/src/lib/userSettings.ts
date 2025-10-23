import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

export interface NotificationPrefs {
  emailReminders: boolean
  weeklyEmail: boolean
  mobilePush: boolean
  updatedAt?: Date
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailReminders: false,
  weeklyEmail: false,
  mobilePush: false,
}

export async function fetchNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const db = getFirestoreDb()
  const ref = doc(db, 'Users', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as Record<string, unknown> | undefined
  const prefs = (data?.NotificationPrefs as Record<string, unknown> | undefined) ?? {}
  return {
    emailReminders: Boolean(prefs.emailReminders ?? DEFAULT_PREFS.emailReminders),
    weeklyEmail: Boolean(prefs.weeklyEmail ?? DEFAULT_PREFS.weeklyEmail),
    mobilePush: Boolean(prefs.mobilePush ?? DEFAULT_PREFS.mobilePush),
  }
}

export async function saveNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'Users', userId)
  await setDoc(
    ref,
    {
      NotificationPrefs: {
        emailReminders: !!prefs.emailReminders,
        weeklyEmail: !!prefs.weeklyEmail,
        mobilePush: !!prefs.mobilePush,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true },
  )
}

export async function fetchUserTimezone(userId: string): Promise<string | null> {
  const db = getFirestoreDb()
  const ref = doc(db, 'Users', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as Record<string, unknown> | undefined
  const tz = (data?.Timezone as string | undefined) || null
  return tz
}

export async function saveUserTimezone(userId: string, timezone: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'Users', userId)
  await setDoc(ref, { Timezone: timezone, TimezoneUpdatedAt: serverTimestamp() }, { merge: true })
}
