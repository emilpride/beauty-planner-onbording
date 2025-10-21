import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * User profile data structure
 */
export interface UserProfile {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  createdAt?: number
  lastUpdated?: number
}

/**
 * Quiz analysis result
 */
export interface QuizAnalysisResult {
  userId: string
  sessionId: string
  recommendations: string[]
  scores: Record<string, number>
  insights: string
  createdAt: number
}

// Query keys factory for user data
export const userQueryKeys = {
  all: ['users'] as const,
  details: () => [...userQueryKeys.all, 'details'] as const,
  detail: (userId: string) => [...userQueryKeys.details(), userId] as const,
}

// Query keys factory for analysis data
export const analysisQueryKeys = {
  all: ['analysis'] as const,
  details: () => [...analysisQueryKeys.all, 'details'] as const,
  detail: (sessionId: string) => [...analysisQueryKeys.details(), sessionId] as const,
}

/**
 * Hook to fetch user profile
 */
export function useUserQuery(userId: string | null) {
  return useQuery({
    queryKey: userQueryKeys.detail(userId || 'anonymous'),
    queryFn: async () => {
      if (!userId) return null
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch user')
      }
      return response.json() as Promise<UserProfile>
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 1 * 60 * 60 * 1000, // 1 hour
    enabled: !!userId,
  })
}

/**
 * Hook to update user profile
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      return response.json() as Promise<UserProfile>
    },
    onSuccess: (data) => {
      // Invalidate user cache
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(data.uid) })
    },
  })
}

/**
 * Hook to trigger quiz analysis via Gemini AI
 */
export function useAnalyzeQuizMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      sessionId: string
      events?: unknown[]
      answers?: unknown
      photoUrls?: string[]
    }) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze quiz')
      }

      return response.json() as Promise<QuizAnalysisResult>
    },
    onSuccess: (data) => {
      // Cache analysis result
      queryClient.setQueryData(analysisQueryKeys.detail(data.sessionId), data)
    },
  })
}

/**
 * Hook to fetch quiz analysis result
 */
export function useAnalysisQuery(sessionId: string | null) {
  return useQuery({
    queryKey: analysisQueryKeys.detail(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) return null
      const response = await fetch(`/api/analysis/${sessionId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch analysis')
      }
      return response.json() as Promise<QuizAnalysisResult>
    },
    staleTime: Infinity, // Analysis results never change
    enabled: !!sessionId,
  })
}
