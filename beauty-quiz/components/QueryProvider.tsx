'use client'

import { ReactNode } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

// Create a single QueryClient instance for the entire app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Avoid refetching when user tabs back
    },
    mutations: {
      retry: 1,
    },
  },
})

export interface QueryProviderProps {
  children: ReactNode
}

/**
 * QueryProvider wraps your app with TanStack Query (React Query)
 * Required at the top level of your app (in layout.tsx)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
