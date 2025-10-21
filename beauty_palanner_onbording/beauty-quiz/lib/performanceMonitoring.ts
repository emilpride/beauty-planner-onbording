import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

export interface Metric {
  name: string
  value: number
  rating?: string
  delta?: number
  id: string
}

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint) - loading performance
 * - CLS (Cumulative Layout Shift) - visual stability
 * - FCP (First Contentful Paint) - perceived load speed
 * - TTFB (Time to First Byte) - server response time
 */

export const metrics: Record<string, number> = {}

/**
 * Send metric to analytics/monitoring service
 */
function reportMetric(metric: Metric): void {
  // Store locally
  metrics[metric.name.toLowerCase()] = metric.value

  // Send to Sentry for performance monitoring
  if (typeof window !== 'undefined') {
    const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
    if (dsn) {
      Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        tags: {
          metric: metric.name,
          rating: metric.rating ?? 'unknown',
        },
        extra: {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
        },
        level: 'info',
      })
    }
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: metric.rating,
      delta: metric.delta?.toFixed(2) ?? 'N/A',
    })
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    const data = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    })

    try {
      navigator.sendBeacon('/api/metrics', data)
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initializeWebVitals(): void {
  if (typeof window === 'undefined') return

  // Track all Core Web Vitals
  onCLS(reportMetric)
  onFCP(reportMetric)
  onLCP(reportMetric)
  onTTFB(reportMetric)
}

/**
 * Custom performance markers
 */
export function markPerformance(label: string): void {
  if (typeof window !== 'undefined' && performance.mark) {
    performance.mark(label)
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(label: string, startMark: string, endMark: string): number {
  if (typeof window !== 'undefined' && performance.measure) {
    try {
      performance.measure(label, startMark, endMark)
      const measure = performance.getEntriesByName(label)[0]
      if (measure && 'duration' in measure) {
        const duration = (measure as PerformanceMeasure).duration
        console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`)
        return duration
      }
    } catch (error) {
      console.error(`Failed to measure ${label}:`, error)
    }
  }
  return 0
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): Record<string, number> {
  return { ...metrics }
}

/**
 * Check if metrics meet targets
 */
export function checkMetricTargets(): Record<string, boolean> {
  const targets: Record<string, number> = {
    lcp: 2500, // 2.5s
    cls: 0.1, // 0.1
    fcp: 1800, // 1.8s
    ttfb: 600, // 600ms
  }

  const results: Record<string, boolean> = {}

  for (const [metric, target] of Object.entries(targets)) {
    const value = metrics[metric]
    results[metric] = value ? value <= target : false
  }

  return results
}

/**
 * Analytics event with custom performance data
 */
export function trackCustomMetric(name: string, value: number, unit = 'ms'): void {
  if (typeof window !== 'undefined') {
    const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
    if (dsn) {
      Sentry.captureMessage(`Custom Metric: ${name}`, {
        tags: {
          metric: name,
        },
        extra: {
          value,
          unit,
          timestamp: Date.now(),
        },
        level: 'info',
      })
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`📈 Custom Metric - ${name}: ${value.toFixed(2)}${unit}`)
  }
}

/**
 * Performance timeline for debugging
 */
export function getPerformanceTimeline(): Array<{
  name: string
  type: string
  startTime: string
  duration: string
}> {
  if (typeof window === 'undefined') return []

  const entries = performance.getEntries()
  return entries.map((entry) => ({
    name: entry.name,
    type: entry.entryType,
    startTime: entry.startTime.toFixed(2),
    duration: 'duration' in entry ? (entry as PerformanceMeasure).duration.toFixed(2) : 'N/A',
  }))
}
