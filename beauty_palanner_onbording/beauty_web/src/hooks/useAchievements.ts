"use client"

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAchievementProgress, markAchievementLevelSeen } from '@/lib/achievements'
import { ACHIEVEMENT_LEVELS, calculateLevel, type AchievementProgress } from '@/types/achievements'
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

  // Local fallback: compute from updates if server progress is missing
  const { data: allUpdates } = useUpdatesSince(userId, new Date(2000, 0, 1))
  const effective: AchievementProgress | null = useMemo(() => {
    if (serverProgress) return { ...serverProgress, lastUpdated: serverProgress.lastUpdated }
    if (!allUpdates) return null
    const completed = allUpdates.stats.completed
    const level = calculateLevel(completed)
    return {
      totalCompletedActivities: completed,
      currentLevel: level,
      lastUpdated: new Date(),
      levelUnlockDates: {},
      lastSeenLevel: 0,
    }
  }, [serverProgress, allUpdates])

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
