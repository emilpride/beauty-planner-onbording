import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryOptions } from '@tanstack/react-query'

export interface SessionEvent {
  type: string
  timestamp?: number
  data?: unknown
}

export interface OnboardingSession {
  sessionId: string
  userId?: string
  startTime: number
  endTime?: number
  status: 'in_progress' | 'completed' | 'abandoned'
  events: SessionEvent[]
  ip?: string
  device?: string
  source?: string
  country?: string
  platformOS?: string
  formFactor?: string
  utm?: Record<string, string>
  referrer?: string
  pageUrl?: string
}

// Query keys factory
export const sessionQueryKeys = {
  all: ['sessions'] as const,
  details: () => [...sessionQueryKeys.all, 'details'] as const,
  detail: (sessionId: string) => [...sessionQueryKeys.details(), sessionId] as const,
}

/**
 * Hook to save/update an onboarding session
 * Automatically batches multiple calls within a short window
 */
export function useSaveSessionMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (session: Partial<OnboardingSession> & { sessionId: string; events?: SessionEvent[] }) => {
      const response = await fetch('/api/sessions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save session')
      }
      
      return response.json() as Promise<{ success: boolean; sessionId: string }>
    },
    onSuccess: (data) => {
      // Invalidate session cache after successful save
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(data.sessionId) })
    },
  })
}

/**
 * Hook to fetch session details
 */
export function useSessionQuery(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(sessionId),
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch session')
      return response.json() as Promise<OnboardingSession>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    enabled,
  })
}

/**
 * Hook to bulk save multiple session events with deduplication
 */
export function useBatchEventsMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: { sessionId: string; events: SessionEvent[]; userId?: string }) => {
      const response = await fetch('/api/sessions/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save events')
      }
      
      return response.json()
    },
    onSuccess: (_data, variables) => {
      // Invalidate related session query
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.detail(variables.sessionId) })
    },
  })
}
