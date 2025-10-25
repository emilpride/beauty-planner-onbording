import { collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { AchievementProgress } from '@/types/achievements'

function tsToDate(v: unknown) {
  return typeof v === 'object' && v !== null && 'toDate' in (v as { toDate?: unknown }) &&
    typeof (v as { toDate?: unknown }).toDate === 'function'
    ? (v as { toDate: () => Date }).toDate()
    : typeof v === 'string'
      ? new Date(v)
      : new Date()
}

export async function fetchAchievementProgress(userId: string): Promise<AchievementProgress | null> {
  const db = getFirestoreDb()
  const ref = doc(collection(doc(collection(db, 'Users'), userId), 'Achievements'), 'Progress')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as Record<string, unknown>

  // Accept both lower-case and PascalCase field names (Flutter had mixed usage)
  const total = (data['totalCompletedActivities'] ?? data['TotalCompletedActivities']) as unknown
  const level = (data['currentLevel'] ?? data['CurrentLevel']) as unknown
  const lastUpd = (data['lastUpdated'] ?? data['LastUpdated']) as unknown
  const levelDates = (data['levelUnlockDates'] ?? data['LevelUnlockDates']) as Record<string, unknown> | undefined
  const lastSeen = (data['lastSeenLevel'] ?? data['LastSeenLevel']) as unknown

  const levelUnlockDates: Record<number, Date> = {}
  if (levelDates) {
    for (const [k, v] of Object.entries(levelDates)) {
      const n = Number(k)
      if (!Number.isNaN(n)) levelUnlockDates[n] = tsToDate(v)
    }
  }

  return {
    totalCompletedActivities: typeof total === 'number' ? total : Number(total ?? 0),
    currentLevel: typeof level === 'number' ? level : Number(level ?? 1),
    lastUpdated: tsToDate(lastUpd ?? new Date()),
    levelUnlockDates,
    lastSeenLevel: typeof lastSeen === 'number' ? lastSeen : Number(lastSeen ?? 0),
  }
}

export async function markAchievementLevelSeen(userId: string, currentLevel: number) {
  const db = getFirestoreDb()
  const ref = doc(collection(doc(collection(db, 'Users'), userId), 'Achievements'), 'Progress')
  await updateDoc(ref, { LastSeenLevel: currentLevel })
}
