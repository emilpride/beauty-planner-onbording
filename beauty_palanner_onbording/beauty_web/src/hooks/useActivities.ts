"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Activity } from '@/types/activity'
import { deleteActivity, fetchUserActivities, upsertActivity, restartAllActivities } from '@/lib/activities'

export function useActivities(userId?: string | null) {
  return useQuery<Activity[]>({
    queryKey: ['activities', userId ?? 'anon'],
    queryFn: async () => (userId ? fetchUserActivities(userId) : []),
    enabled: !!userId,
  })
}

export function useSaveActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, activity }: { userId: string; activity: Activity }) => {
      await upsertActivity(userId, activity)
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['activities', vars.userId] })
    },
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: string }) => {
      await deleteActivity(userId, id)
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['activities', vars.userId] })
    },
  })
}

export function useRestartAllActivities() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await restartAllActivities(userId)
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['activities', vars.userId] })
    },
  })
}
