"use client"

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { PWARegister } from '@/components/pwa/PWARegister'
import { WebVitals } from '@/components/analytics/WebVitals'
import { SchedulerBootstrap } from '@/components/providers/SchedulerBootstrap'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <PWARegister />
          <WebVitals />
          <SchedulerBootstrap />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
