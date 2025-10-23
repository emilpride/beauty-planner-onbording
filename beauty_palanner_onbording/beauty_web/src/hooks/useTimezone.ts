"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUserTimezone, saveUserTimezone } from '@/lib/userSettings'

export function useTimezone(userId?: string | null) {
  return useQuery<string | null>({
    queryKey: ['timezone', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      return fetchUserTimezone(userId)
    },
    enabled: !!userId,
  })
}

export function useSaveTimezone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, timezone }: { userId: string; timezone: string }) => saveUserTimezone(userId, timezone),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['timezone', vars.userId] })
    },
  })
}
