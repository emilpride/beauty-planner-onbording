"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSchedulePrefs, saveSchedulePrefs, type SchedulePrefs } from '@/lib/userSettings'

export function useSchedulePrefs(userId?: string | null) {
  return useQuery<SchedulePrefs>({
    queryKey: ['schedulePrefs', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return { weekStart: 'monday', vacation: false, daySections: { morning: '05:00', afternoon: '12:00', evening: '18:00' } }
      return fetchSchedulePrefs(userId)
    },
    enabled: !!userId,
  })
}

export function useSaveSchedulePrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, prefs }: { userId: string; prefs: SchedulePrefs }) => saveSchedulePrefs(userId, prefs),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['schedulePrefs', vars.userId] })
    },
  })
}
