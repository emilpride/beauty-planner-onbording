"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMoodsInRange, upsertMood } from '@/lib/moods'
import type { MoodEntry } from '@/types/mood'

export function useMoodsInRange(userId?: string | null, start?: Date, end?: Date) {
  const enabled = !!userId && !!start && !!end
  return useQuery<MoodEntry[]>({
    queryKey: ['moods', userId, start?.toISOString(), end?.toISOString()],
    queryFn: async () => {
      if (!userId || !start || !end) return []
      return fetchMoodsInRange(userId, start, end)
    },
    enabled,
  })
}

export function useUpsertMood(userId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { date: Date; mood: number; feeling: string }) => {
      if (!userId) throw new Error('No user')
      return upsertMood(userId, input)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moods'] })
    },
  })
}
