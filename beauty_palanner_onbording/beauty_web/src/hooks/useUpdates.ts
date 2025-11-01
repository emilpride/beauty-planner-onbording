"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserUpdatesForDate,
  fetchUserUpdatesForToday,
  fetchUserUpdatesInDateRange,
  fetchUserUpdatesSince,
  startOfDay,
} from '@/lib/firestore'
import type { TaskInstance, TaskStatus } from '@/types/task'
import { completeUpdate, skipUpdate } from '@/lib/updates'
import { recomputeAchievements as recomputeAchievementsFn } from '@/lib/achievementsClient'

export function useTodayUpdates(userId?: string | null) {
  return useQuery<{ items: TaskInstance[]; stats: UpdateStats } | null>({
    queryKey: ['updates', 'today', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      const items = await fetchUserUpdatesForToday(userId)
      return { items, stats: toStats(items) }
    },
    enabled: !!userId,
  })
}

export function useUpdatesSince(userId?: string | null, since?: Date) {
  const from = since ?? startOfDay(new Date())
  return useQuery<{ items: TaskInstance[]; stats: UpdateStats } | null>({
    queryKey: ['updates', from.toISOString(), userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      const items = await fetchUserUpdatesSince(userId, from)
      return { items, stats: toStats(items) }
    },
    enabled: !!userId,
  })
}

// New: Hooks for date and date range windows (needed for dashboard lists)
export function useUpdatesForDate(userId?: string | null, date?: Date) {
  const target = date ?? startOfDay(new Date())
  return useQuery<{ items: TaskInstance[]; stats: UpdateStats } | null>({
    queryKey: ['updates', 'byDate', target.toISOString(), userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      const items = await fetchUserUpdatesForDate(userId, target)
      return { items, stats: toStats(items) }
    },
    enabled: !!userId,
  })
}

export function useUpdatesInDateRange(userId?: string | null, from?: Date, to?: Date) {
  const start = from ?? startOfDay(new Date())
  const end = to ?? new Date()
  return useQuery<{ items: TaskInstance[]; stats: UpdateStats } | null>({
    queryKey: ['updates', 'dateRange', start.toISOString(), end.toISOString(), userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      const items = await fetchUserUpdatesInDateRange(userId, start, end)
      return { items, stats: toStats(items) }
    },
    enabled: !!userId,
  })
}

// Mutations for completing or skipping a task with optimistic cache updates
export function useUpdateActions() {
  const qc = useQueryClient()

  const complete = useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: string }) => {
      await completeUpdate(userId, id)
      return { id }
    },
    onSuccess: async (_res, vars) => {
      // Invalidate any updates queries
      qc.invalidateQueries({ queryKey: ['updates'] })
      // Best-effort: ask backend to recompute achievements immediately
      try { await recomputeAchievementsFn() } catch {}
    },
  })

  const skip = useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: string }) => {
      await skipUpdate(userId, id)
      return { id }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['updates'] }),
  })

  return { complete, skip }
}

export interface UpdateStats {
  total: number
  byStatus: Record<TaskStatus, number>
  completed: number
}

function toStats(items: TaskInstance[]): UpdateStats {
  const byStatus = {
    pending: 0,
    completed: 0,
    skipped: 0,
    missed: 0,
    deleted: 0,
  } as Record<TaskStatus, number>
  for (const i of items) byStatus[i.status] = (byStatus[i.status] ?? 0) + 1
  return {
    total: items.length,
    byStatus,
    completed: byStatus.completed,
  }
}
