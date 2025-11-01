import { collection, doc, getDocs, limit, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { AIAnalysisModel } from '@/types/aiAnalysis'
import { parseAIAnalysis } from '@/types/aiAnalysis'

export async function fetchLatestAIAnalysis(userId: string): Promise<AIAnalysisModel | null> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'users_v2'), userId), 'AIAnalysis')
  const q = query(col, orderBy('date', 'desc'), limit(1))
  const snap = await getDocs(q)
  if (snap.docs.length === 0) return null
  return parseAIAnalysis(snap.docs[0].data())
}

export async function recordPhotoUpload(userId: string, path: string, url: string) {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'users_v2'), userId), 'AIAnalysisUploads')
  await addDoc(col, {
    path,
    url,
    status: 'uploaded',
    createdAt: serverTimestamp(),
  })
}
