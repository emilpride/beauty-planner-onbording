"use client"

import { useQuery } from '@tanstack/react-query'
import { collection, doc, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

export interface AnalysisUploadItem {
  id: string
  path: string
  url: string
  status: string
  createdAt?: Date
}

function parseUpload(id: string, data: Record<string, unknown>): AnalysisUploadItem {
  const v = data['createdAt']
  let date: Date | undefined
  if (v instanceof Timestamp) {
    date = v.toDate()
  } else if (typeof v === 'string') {
    const d = new Date(v)
    date = isNaN(d.getTime()) ? undefined : d
  }
  return {
    id,
    path: String(data['path'] ?? ''),
    url: String(data['url'] ?? ''),
    status: String(data['status'] ?? ''),
    createdAt: date,
  }
}

export function useAnalysisUploads(userId?: string | null) {
  return useQuery<AnalysisUploadItem[] | null>({
    queryKey: ['aiAnalysisUploads', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      const db = getFirestoreDb()
      const col = collection(doc(collection(db, 'users_v2'), userId), 'AIAnalysisUploads')
      const q = query(col, orderBy('createdAt', 'desc'), limit(5))
      const snap = await getDocs(q)
      return snap.docs.map((d) => parseUpload(d.id, d.data() as Record<string, unknown>))
    },
    enabled: !!userId,
    refetchInterval: 10_000,
  })
}
