import { Timestamp, collection, doc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { TaskInstance } from '@/types/task'
import { parseTaskInstance } from '@/types/task'

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export async function fetchUserUpdatesSince(userId: string, since: Date): Promise<TaskInstance[]> {
  const db = getFirestoreDb()

  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  // Firestore requires an orderBy on the field used in range queries
  const q = query(
    col,
    where('updatedAt', '>', Timestamp.fromDate(since)),
    where('updatedAt', '<=', Timestamp.fromDate(new Date())),
    orderBy('updatedAt', 'asc'),
  )

  const snap = await getDocs(q)
  const items = snap.docs.map((d) => parseTaskInstance(d.id, d.data()))
  // Sort by updatedAt as string order may differ
  items.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
  return items
}

// Shared helper to normalize YYYY-MM-DD strings
function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function fetchUserUpdatesForToday(userId: string) {
  return fetchUserUpdatesForDate(userId, new Date())
}

export async function fetchUserUpdatesForDate(userId: string, date: Date): Promise<TaskInstance[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  const ymd = toYMD(date)

  const snap = await getDocs(col)
  const items = snap.docs.map((d) => parseTaskInstance(d.id, d.data()))
  const filtered = items.filter((item) => {
    const normal = (item.date || '').trim()
    if (!normal) return false
    if (normal === ymd) return true
    const parts = normal.split(/[^0-9]/).filter(Boolean)
    if (parts.length === 3) {
      const [year, month, day] = parts.map((part) => Number(part))
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        const rebuilt = toYMD(new Date(year, month - 1, day))
        return rebuilt === ymd
      }
    }
    return false
  })
  filtered.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
  return filtered
}

export async function fetchUserUpdatesInDateRange(
  userId: string,
  from: Date,
  to: Date,
): Promise<TaskInstance[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  const snap = await getDocs(col)
  const start = startOfDay(from)
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)

  const items = snap.docs.map((d) => parseTaskInstance(d.id, d.data()))
  const filtered = items.filter((item) => {
    if (!item.date) return false
    const parts = item.date.split('-').map((part) => Number(part))
    if (parts.length !== 3) return false
    const [y, m, day] = parts
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(day)) return false
    const taskDate = new Date(y, m - 1, day)
    return taskDate >= start && taskDate <= end
  })
  filtered.sort((a, b) => {
    if (a.date === b.date) return a.updatedAt.getTime() - b.updatedAt.getTime()
    return a.date < b.date ? -1 : 1
  })
  return filtered
}
