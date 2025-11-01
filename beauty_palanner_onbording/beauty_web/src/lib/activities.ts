import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { Activity } from '@/types/activity'
import { parseActivity, toFirebaseActivity } from '@/types/activity'

function userDocRef(userId: string) {
  return doc(getFirestoreDb(), 'users_v2', userId)
}

export async function fetchUserActivities(userId: string): Promise<Activity[]> {
  const ref = userDocRef(userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return []
  const data = snap.data() as Record<string, unknown>
  const raw = data['Activities'] as unknown
  const list = Array.isArray(raw) ? (raw as unknown[]) : []
  return list.map((x) => parseActivity((x ?? {}) as Record<string, unknown>))
}

export async function upsertActivity(userId: string, activity: Activity): Promise<void> {
  const db = getFirestoreDb()
  const ref = userDocRef(userId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
    const raw = data['Activities'] as unknown
    const list = Array.isArray(raw) ? (raw as unknown[]) : []
    const parsed = list.map((x) => parseActivity((x ?? {}) as Record<string, unknown>))
    const idx = parsed.findIndex((a) => a.id === activity.id)
    if (idx >= 0) parsed[idx] = { ...activity, lastModifiedAt: new Date() }
    else parsed.push({ ...activity, lastModifiedAt: new Date() })
    const out = parsed.map(toFirebaseActivity)
    transaction.set(ref, { Activities: out }, { merge: true })
  })
}

export async function deleteActivity(userId: string, activityId: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = userDocRef(userId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
    const activitiesRaw = data['Activities'] as unknown
    const list = Array.isArray(activitiesRaw) ? (activitiesRaw as unknown[]) : []
    const parsed = list.map((x) => parseActivity((x ?? {}) as Record<string, unknown>))
    const remaining = parsed.filter((a) => a.id !== activityId)
    const deletedRaw = data['DeletedActivities'] as unknown
    const deletedList = Array.isArray(deletedRaw) ? (deletedRaw as unknown[]) : []
    const deletedOut = [...deletedList, ...parsed.filter((a) => a.id === activityId).map(toFirebaseActivity)]
    transaction.set(ref, { Activities: remaining.map(toFirebaseActivity), DeletedActivities: deletedOut }, { merge: true })
  })
}

/**
 * Restart all activities for the user by setting them to active and clearing any end-before constraints.
 * This mirrors the Flutter app's "Restart All Activities" behavior.
 */
export async function restartAllActivities(userId: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = userDocRef(userId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
    const raw = data['Activities'] as unknown
    const list = Array.isArray(raw) ? (raw as unknown[]) : []
    const parsed = list.map((x) => parseActivity((x ?? {}) as Record<string, unknown>))
    const now = new Date()
    const restarted = parsed.map((a) => ({
      ...a,
      activeStatus: true,
      endBeforeActive: false,
      selectedEndBeforeDate: null,
      enabledAt: now,
      lastModifiedAt: now,
    }))
    transaction.set(ref, { Activities: restarted.map(toFirebaseActivity) }, { merge: true })
  })
}
