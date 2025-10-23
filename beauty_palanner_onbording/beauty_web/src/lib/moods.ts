import { Timestamp, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { MoodEntry } from '@/types/mood'
import { moodDateKey, parseMood } from '@/types/mood'

export async function fetchMoodsSince(userId: string, since: Date): Promise<MoodEntry[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Moods')
  const q = query(col, where('updatedAt', '>', Timestamp.fromDate(since)), orderBy('updatedAt', 'asc'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => parseMood(d.id, d.data()))
}

export async function fetchMoodsInRange(userId: string, start: Date, end: Date): Promise<MoodEntry[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'Moods')
  const q = query(
    col,
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<=', Timestamp.fromDate(end)),
    orderBy('date', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => parseMood(d.id, d.data()))
}

export async function upsertMood(userId: string, entry: Omit<MoodEntry, 'id' | 'userId' | 'updatedAt'>) {
  const db = getFirestoreDb()
  const id = moodDateKey(userId, entry.date)
  const ref = doc(collection(doc(collection(db, 'Users'), userId), 'Moods'), id)
  const payload = {
    userId,
    date: Timestamp.fromDate(entry.date),
    mood: entry.mood,
    feeling: entry.feeling,
    updatedAt: Timestamp.fromDate(new Date()),
  }
  await setDoc(ref, payload, { merge: true })
}

export async function deleteMood(userId: string, date: Date) {
  const db = getFirestoreDb()
  const id = moodDateKey(userId, date)
  const ref = doc(collection(doc(collection(db, 'Users'), userId), 'Moods'), id)
  await deleteDoc(ref)
}
