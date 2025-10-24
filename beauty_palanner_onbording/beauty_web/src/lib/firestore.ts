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

export async function fetchUserUpdatesForToday(userId: string) {
  return fetchUserUpdatesSince(userId, startOfDay(new Date()))
}

// New: Fetch updates by task date (YYYY-MM-DD string in documents)
function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function fetchUserUpdatesForDate(userId: string, date: Date): Promise<TaskInstance[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  const ymd = toYMD(date)

  // Some datasets use lowercase 'date', others PascalCase 'Date'. Query both and merge.
  const qLower = query(col, where('date', '==', ymd), orderBy('updatedAt', 'asc'))
  const qUpper = query(col, where('Date', '==', ymd), orderBy('updatedAt', 'asc'))

  const [snapLower, snapUpper] = await Promise.all([getDocs(qLower), getDocs(qUpper)])
  const map = new Map<string, TaskInstance>()
  for (const d of snapLower.docs) map.set(d.id, parseTaskInstance(d.id, d.data()))
  for (const d of snapUpper.docs) map.set(d.id, parseTaskInstance(d.id, d.data()))
  const items = Array.from(map.values())
  items.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
  return items
}

export async function fetchUserUpdatesInDateRange(
  userId: string,
  from: Date,
  to: Date,
): Promise<TaskInstance[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Updates')
  const fromStr = toYMD(from)
  const toStr = toYMD(to)
  // Query lowercase and PascalCase variants, then merge
  const qLower = query(col, where('date', '>=', fromStr), where('date', '<=', toStr), orderBy('date', 'asc'))
  const qUpper = query(col, where('Date', '>=', fromStr), where('Date', '<=', toStr), orderBy('Date', 'asc'))
  const [snapLower, snapUpper] = await Promise.all([getDocs(qLower), getDocs(qUpper)])
  const map = new Map<string, TaskInstance>()
  for (const d of snapLower.docs) map.set(d.id, parseTaskInstance(d.id, d.data()))
  for (const d of snapUpper.docs) map.set(d.id, parseTaskInstance(d.id, d.data()))
  const items = Array.from(map.values())
  items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return items
}
