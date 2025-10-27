import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { Activity } from '@/types/activity'
import type { TaskStatus } from '@/types/task'

function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

// Removed Monday-anchored helpers; we'll use simple week stepping from start date

// Flutter-style simple week stepping from the activity start date (no Monday anchoring)
function weeksBetweenSimple(a: Date, b: Date) {
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  const diffDays = Math.floor((b0.getTime() - a0.getTime()) / (24 * 60 * 60 * 1000))
  return Math.floor(diffDays / 7)
}

function matchesSchedule(activity: Activity, date: Date): boolean {
  // Normalize to date-only
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const enabledAt = activity.enabledAt
    ? new Date(activity.enabledAt.getFullYear(), activity.enabledAt.getMonth(), activity.enabledAt.getDate())
    : null

  // Start boundary: must be on/after enabledAt when present
  if (enabledAt && d < enabledAt) return false

  // Handle one-time explicitly
  const rawType = (activity.type || '').toLowerCase()
  const rawFreq = (activity.frequency ?? '')
  const freq = rawFreq.toLowerCase().replace(/\s+/g, '')
  if (rawType === 'one_time' || freq === 'one_time') {
    const oneTimeDate = activity.selectedEndBeforeDate || activity.enabledAt
    if (!oneTimeDate) return false
    const one = new Date(oneTimeDate.getFullYear(), oneTimeDate.getMonth(), oneTimeDate.getDate())
    return d.getTime() === one.getTime()
  }

  // End-before constraint applies only when flag is active
  if (activity.endBeforeActive) {
    if (activity.endBeforeType === 'date' && activity.selectedEndBeforeDate) {
      const end = new Date(
        activity.selectedEndBeforeDate.getFullYear(),
        activity.selectedEndBeforeDate.getMonth(),
        activity.selectedEndBeforeDate.getDate(),
      )
      if (d > end) return false
    }
    if (activity.endBeforeType === 'days' && activity.endBeforeUnit && enabledAt) {
      const n = parseInt(activity.endBeforeUnit, 10)
      if (!Number.isNaN(n)) {
        const end = new Date(enabledAt)
        end.setDate(end.getDate() + n)
        if (d > end) return false
      }
    }
  }

  // Frequency normalization retained (after one-time handling above)

  // Monthly selected days support
  if ((activity.selectedMonthDays?.length ?? 0) > 0) {
    if (!activity.selectedMonthDays!.includes(d.getDate())) return false
  }

  // Weeks interval (weekly cadence every N weeks)
  if ((activity.weeksInterval ?? 1) > 1 && enabledAt) {
    const delta = weeksBetweenSimple(enabledAt, d)
    if (delta % (activity.weeksInterval ?? 1) !== 0) return false
  }

  // Daily vs weekly selection (support common synonyms/localizations)
  if (
    freq.includes('daily') ||
    freq.includes('everyday') ||
    freq === 'ежедневно' ||
    freq === 'каждыйдень'
  ) return true

  // Weekdays / Weekends helpers
  if (freq.includes('weekday')) {
    const js = date.getDay()
    return js >= 1 && js <= 5
  }
  if (freq.includes('weekend')) {
    const js = date.getDay()
    return js === 0 || js === 6
  }

  const selected = activity.selectedDays ?? []
  if (selected.length) {
    // Replicate Flutter mapping: Sunday=1..Saturday=7
    const js = d.getDay() // 0..6 (Sun=0)
    const flutterWeek = ((js % 7) + 1)
    if (selected.includes(flutterWeek)) return true
    return false
  }

  // Fallback: if frequency hints weekly and no specific days, match same weekday as enabledAt
  if ((freq.includes('week') || freq.includes('weekly')) && enabledAt) {
    return d.getDay() === enabledAt.getDay()
  }

  // Fallback: if no recognizable frequency but activity is active and has no explicit day constraints, assume daily
  if (!freq && (activity.selectedDays?.length ?? 0) === 0 && (activity.selectedMonthDays?.length ?? 0) === 0) {
    return true
  }

  return false
}

function buildUpdateId(activity: Activity, date: Date) {
  const ymd = toYMD(date)
  // Align with Flutter: regular tasks use id without time; one-time tasks include time
  if ((activity.type || '').toLowerCase() === 'one_time' && activity.time) {
    return `${activity.id}-${ymd}-${pad2(activity.time.hour)}${pad2(activity.time.minute)}`
  }
  return `${activity.id}-${ymd}`
}

export async function ensureUpcomingUpdates(userId: string, activities: Activity[], daysForward = 14) {
  const db = getFirestoreDb()
  const today = new Date()
  for (const a of activities) {
    if (!a.activeStatus) continue
    for (let i = 0; i <= daysForward; i++) {
      const date = addDays(today, i)
      if (!matchesSchedule(a, date)) continue
      const id = buildUpdateId(a, date)
      const ref = doc(collection(doc(collection(db, 'Users'), userId), 'Updates'), id)
      await setDoc(ref, {
        id,
        activityId: a.id,
        date: toYMD(date),
        status: 'pending' as TaskStatus,
        time: a.time ? { hour: a.time.hour, minute: a.time.minute } : undefined,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }
  }
}

export async function markMissed(userId: string) {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  const todayStr = toYMD(new Date())
  // All with date < today and status == pending
  const q = query(col, where('date', '<', todayStr), where('status', '==', 'pending'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    await updateDoc(d.ref, { status: 'missed', updatedAt: serverTimestamp() })
  }
}
