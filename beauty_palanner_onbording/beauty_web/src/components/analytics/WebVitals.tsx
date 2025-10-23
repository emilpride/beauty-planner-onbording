"use client"

import { useEffect } from 'react'
import type { Metric } from 'web-vitals'
import type { Analytics } from 'firebase/analytics'

// Lazy import to keep bundle minimal
export function WebVitals() {
  useEffect(() => {
    ;(async () => {
      const mod = await import('web-vitals')
      const { onCLS, onFCP, onINP, onLCP, onTTFB } = mod
      const report = createReporter()
      onCLS(report)
      onFCP(report)
      onINP(report)
      onLCP(report)
      onTTFB(report)
    })()
  }, [])

  return null
}

function createReporter() {
  // Try to send to Firebase Analytics if available; else log to console
  let analytics: Analytics | null = null
  const tryInitAnalytics = async (): Promise<
    | { logEvent: (a: Analytics, name: string, params?: Record<string, unknown>) => void }
    | null
  > => {
    try {
      const { getAnalytics, isSupported, logEvent } = await import('firebase/analytics')
      const supported = await isSupported()
      if (!supported) return null
      const { getFirebaseApp } = await import('@/lib/firebase')
      const app = getFirebaseApp()
      analytics = getAnalytics(app)
      return { logEvent }
    } catch {
      return null
    }
  }

  let loggerPromise:
    | Promise<{ logEvent: (a: Analytics, name: string, params?: Record<string, unknown>) => void } | null>
    | null = null
  return (metric: Metric) => {
    if (!loggerPromise) loggerPromise = tryInitAnalytics()
    loggerPromise.then((logger) => {
      const payload = {
        name: metric.name,
        id: metric.id,
        value: metric.value,
        rating: metric.rating,
      }
      if (logger && analytics) {
        logger.logEvent(analytics, 'web_vital', payload)
      } else {
        // Fallback to console for local/dev
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('[web-vitals]', payload)
        }
      }
    })
  }
}
