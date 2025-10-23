"use client"

import { useQuery } from '@tanstack/react-query'
import { fetchLatestAIAnalysis } from '@/lib/aiAnalysis'
import type { AIAnalysisModel } from '@/types/aiAnalysis'

export function useLatestAIAnalysis(userId?: string | null) {
  return useQuery<AIAnalysisModel | null>({
    queryKey: ['aiAnalysis', 'latest', userId ?? 'anon'],
    queryFn: async () => {
      if (!userId) return null
      return fetchLatestAIAnalysis(userId)
    },
    enabled: !!userId,
  })
}
