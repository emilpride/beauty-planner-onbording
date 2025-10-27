"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '@/lib/userSettings'

export function useNotificationPrefs(userId?: string | null) {
  return useQuery<NotificationPrefs>({
    queryKey: ['notificationPrefs', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return { procedures: { push: false, email: false }, mood: { push: false, email: false }, weeklyEmail: false }
      return fetchNotificationPrefs(userId)
    },
    enabled: !!userId,
  })
}

export function useSaveNotificationPrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, prefs }: { userId: string; prefs: NotificationPrefs }) => {
      await saveNotificationPrefs(userId, prefs)
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['notificationPrefs', vars.userId] })
    },
  })
}
