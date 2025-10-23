"use client"

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAchievementProgress, markAchievementLevelSeen } from '@/lib/achievements'
import { ACHIEVEMENT_LEVELS, calculateLevel, progressToNextLevel, type AchievementProgress } from '@/types/achievements'
import { useUpdatesSince } from '@/hooks/useUpdates'

/**
 * Achievements hook
 * - Reads server progress from Firestore (Achievements/Progress)
 * - Optionally computes local progress from updates to show immediate values
 */
export function useAchievements(userId?: string | null) {
  const { data: serverProgress } = useQuery({
    queryKey: ['achievements', 'progress', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      return fetchAchievementProgress(userId)
    },
    enabled: !!userId,
  })

  // Local completed count from all-time updates (optional fast path)
  // We can skip fetching all-time for now to avoid heavy reads; rely on server.
  const effective: AchievementProgress | null = useMemo(() => {
    if (!serverProgress) return null
    const pct = progressToNextLevel(
      serverProgress.totalCompletedActivities,
      serverProgress.currentLevel,
    )
    return { ...serverProgress, lastUpdated: serverProgress.lastUpdated }
  }, [serverProgress])

  const levels = useMemo(() => {
    const current = effective?.currentLevel ?? 1
    return ACHIEVEMENT_LEVELS.map((l) => ({ ...l, unlocked: l.level <= current }))
  }, [effective?.currentLevel])

  const qc = useQueryClient()
  const markSeen = useMutation({
    mutationFn: async () => {
      if (!userId || !effective) return
      await markAchievementLevelSeen(userId, effective.currentLevel)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['achievements'] })
    },
  })

  return {
    progress: effective,
    levels,
    markLevelSeen: markSeen.mutateAsync,
    isLoading: !effective,
  }
}
