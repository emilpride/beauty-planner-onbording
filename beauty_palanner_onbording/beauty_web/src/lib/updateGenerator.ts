import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
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

function startOfWeek(d: Date) {
  const js = d.getDay() // 0..6
  const monIndex = js === 0 ? 6 : js - 1
  const x = new Date(d)
  x.setDate(d.getDate() - monIndex)
  x.setHours(0,0,0,0)
  return x
}

function weeksBetween(a: Date, b: Date) {
  const ms = startOfWeek(b).getTime() - startOfWeek(a).getTime()
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
}

function matchesSchedule(activity: Activity, date: Date): boolean {
  // End before date constraint
  if (activity.endBeforeType === 'date' && activity.selectedEndBeforeDate) {
    if (date > activity.selectedEndBeforeDate) return false
  }

  const freq = (activity.frequency ?? '').toLowerCase()

  // Monthly selected days support
  if ((activity.selectedMonthDays?.length ?? 0) > 0) {
    if (!activity.selectedMonthDays!.includes(date.getDate())) return false
  }

  // Weeks interval (weekly cadence every N weeks)
  if ((activity.weeksInterval ?? 1) > 1 && activity.enabledAt) {
    const delta = weeksBetween(activity.enabledAt, date)
    if (delta % (activity.weeksInterval ?? 1) !== 0) return false
  }

  // Daily vs weekly selection
  if (freq.includes('daily')) return true

  const selected = activity.selectedDays ?? []
  if (selected.length) {
    // Flutter likely uses 1..7 (Mon..Sun). JS getDay() is 0..6 (Sun..Sat)
    const js = date.getDay() // 0..6
    const monBased = js === 0 ? 7 : js // 1..7 with Mon=1..Sun=7
    if (selected.includes(monBased) || selected.includes(js)) return true
    return false
  }

  // Fallback: if frequency hints weekly and no specific days, match same weekday as enabledAt
  if (freq.includes('week') && activity.enabledAt) {
    return date.getDay() === activity.enabledAt.getDay()
  }

  return false
}

function buildUpdateId(activityId: string, date: Date, hour?: number, minute?: number) {
  const ymd = toYMD(date)
  if (typeof hour === 'number' && typeof minute === 'number') {
    return `${activityId}-${ymd}-${pad2(hour)}${pad2(minute)}`
  }
  return `${activityId}-${ymd}`
}

export async function ensureUpcomingUpdates(userId: string, activities: Activity[], daysForward = 14) {
  const db = getFirestoreDb()
  const today = new Date()
  for (const a of activities) {
    if (!a.activeStatus) continue
    for (let i = 0; i <= daysForward; i++) {
      const date = addDays(today, i)
      if (!matchesSchedule(a, date)) continue
      const id = buildUpdateId(a.id, date, a.time?.hour, a.time?.minute)
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
