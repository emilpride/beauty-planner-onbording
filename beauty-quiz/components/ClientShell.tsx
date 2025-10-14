'use client'

import { ReactNode, useEffect } from 'react'
import BurgerMenu from '@/components/ui/BurgerMenu'
import { usePathname } from 'next/navigation'
import { saveOnboardingSession } from '@/lib/firebase'
import { useQuizStore } from '@/store/quizStore'

// Client-only shell rendered within RootLayout to mount global client UI (theme toggle)
export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideBurger = pathname === '/' || pathname.startsWith('/welcome') || pathname.startsWith('/procedures')
  const sessionId = useQuizStore((s) => s.sessionId)

  // Global error instrumentation: capture runtime errors and send lightweight events
  useEffect(() => {
    function onError(ev: ErrorEvent) {
      try {
        const event = {
          eventName: 'error',
          timestamp: new Date().toISOString(),
          details: {
            message: ev.message,
            source: ev.filename,
            lineno: ev.lineno,
            colno: ev.colno,
            stack: ev.error && ev.error.stack ? String(ev.error.stack).slice(0, 1000) : null,
            url: typeof window !== 'undefined' ? window.location.href : null,
            path: pathname,
          },
        }
        if (sessionId) {
          // fire-and-forget
          Promise.resolve(saveOnboardingSession(sessionId, [event])).catch(() => {})
        }
      } catch { /* ignore */ }
    }

    function onUnhandled(ev: PromiseRejectionEvent) {
      try {
        const reason = (ev.reason && (ev.reason.message || ev.reason.toString())) || 'unhandledrejection'
        const stack = ev.reason && ev.reason.stack ? String(ev.reason.stack).slice(0, 1000) : null
        const event = {
          eventName: 'error',
          timestamp: new Date().toISOString(),
          details: {
            message: reason,
            stack,
            url: typeof window !== 'undefined' ? window.location.href : null,
            path: pathname,
          },
        }
        if (sessionId) {
          Promise.resolve(saveOnboardingSession(sessionId, [event])).catch(() => {})
        }
      } catch { /* ignore */ }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [sessionId, pathname])
  return (
    <>
      {/* Global hamburger menu (also used inline inside quiz app bar) */}
      {!hideBurger && <BurgerMenu />}
      {children}
    </>
  )
}
