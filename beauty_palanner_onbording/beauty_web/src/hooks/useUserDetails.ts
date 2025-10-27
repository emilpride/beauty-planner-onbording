"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUserProfile, fetchUserStats, saveUserProfile, type UserProfile as DetailsProfile, type UserStats } from '@/lib/userSettings'

export type { DetailsProfile, UserStats }

export function useUserDetails(userId?: string | null) {
  return useQuery<DetailsProfile>({
    queryKey: ['userDetails', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return { fullName: '', email: '', gender: '', birthDate: null }
      return fetchUserProfile(userId)
    },
    enabled: !!userId,
  })
}

export function useSaveUserDetails() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, profile }: { userId: string; profile: DetailsProfile }) => saveUserProfile(userId, profile),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['userDetails', vars.userId] })
    },
  })
}

export function useUserStats(userId?: string | null) {
  return useQuery<UserStats>({
    queryKey: ['userStats', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return { level: 1, currentStreak: 0, completionRate: 0, activitiesCompleted: 0, perfectDays: 0, totalActivities: 0 }
      return fetchUserStats(userId)
    },
    enabled: !!userId,
  })
}
