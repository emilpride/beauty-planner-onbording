/**
 * Monitoring and analytics for Gemini reliability
 * Tracks API health, cache hits, circuit breaker events, and sends Sentry alerts
 */

import * as admin from 'firebase-admin'
import * as Sentry from '@sentry/node'

// Ensure Firebase Admin app is initialized even if this module is loaded before index.ts
try {
  // admin.apps is available in firebase-admin v11; for newer versions, this remains for compatibility
  // Initialize only if not already initialized
  if ((admin as any).apps ? (admin as any).apps.length === 0 : !(admin as any).getApps?.()?.length) {
    admin.initializeApp()
  }
} catch (_) {
  // Ignore initialization race conditions
}

const db = admin.firestore()

export interface APIHealthMetrics {
  timestamp: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  averageLatencyMs: number
  cacheHitRate: number
  cacheHits: number
  cacheMisses: number
  circuitBreakerOpen: boolean
  claudeFallbackUsed: number
}

/**
 * Log API event to Firestore for analytics
 */
export async function logAPIEvent(event: {
  type: 'success' | 'failure' | 'retry' | 'circuit_open' | 'cache_hit' | 'cache_miss' | 'claude_fallback'
  userId?: string
  latencyMs?: number
  error?: string
  attemptNumber?: number
  timestamp?: number
}): Promise<void> {
  try {
    const eventDoc = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      recordedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Log to events collection partitioned by date for better performance
    const dateKey = new Date(event.timestamp || Date.now()).toISOString().split('T')[0] || ''
    const eventsRef = db.collection('api_events').doc(dateKey).collection('events')
    await eventsRef.add(eventDoc)

    // Also increment counters for real-time metrics
    await updateRealtimeMetrics(event.type)
  } catch (error) {
    console.warn('[Analytics] Failed to log event:', error)
  }
}

/**
 * Update real-time metrics document
 */
async function updateRealtimeMetrics(eventType: string): Promise<void> {
  try {
    const metricsRef = db.collection('system').doc('api_metrics')
    const now = Date.now()
    const currentMinute = Math.floor(now / 60000) // Round to minute

    const updates: any = {
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Update event counters
    const field = `events.${eventType}`
    updates[field] = admin.firestore.FieldValue.increment(1)

    // Update total requests
    updates['events.total'] = admin.firestore.FieldValue.increment(1)

    // Update window counter for circuit breaker
    if (eventType === 'success') {
      updates['window.success'] = admin.firestore.FieldValue.increment(1)
    } else if (eventType === 'failure') {
      updates['window.failures'] = admin.firestore.FieldValue.increment(1)
    }

    updates['window.timestamp'] = currentMinute

    await metricsRef.update(updates).catch(async () => {
      // If document doesn't exist, create it
      const initialMetrics = {
        events: {
          total: 1,
          [eventType]: 1,
          success: 0,
          failure: 0,
          retry: 0,
          circuit_open: 0,
          cache_hit: 0,
          cache_miss: 0,
          claude_fallback: 0,
        },
        window: { success: 0, failures: 0, timestamp: currentMinute },
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }
      initialMetrics.events[eventType as keyof typeof initialMetrics.events] = 1
      return metricsRef.set(initialMetrics)
    })
  } catch (error) {
    console.warn('[Analytics] Failed to update metrics:', error)
  }
}

/**
 * Get current API health metrics
 */
export async function getAPIHealthMetrics(): Promise<APIHealthMetrics | null> {
  try {
    const metricsDoc = await db.collection('system').doc('api_metrics').get()
    const data = metricsDoc.data()

    if (!data?.events) {
      return null
    }

    const total = data.events.total || 0
    const successful = data.events.success || 0
    const failed = data.events.failure || 0
    const cacheHits = data.events.cache_hit || 0
    const cacheMisses = data.events.cache_miss || 0

    return {
      timestamp: Date.now(),
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageLatencyMs: data.avgLatency || 0,
      cacheHitRate: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0,
      cacheHits,
      cacheMisses,
      circuitBreakerOpen: data.circuitBreakerOpen || false,
      claudeFallbackUsed: data.events.claude_fallback || 0,
    }
  } catch (error) {
    console.warn('[Analytics] Failed to get metrics:', error)
    return null
  }
}

/**
 * Send Sentry alert for critical events
 */
export function sendSentryAlert(
  level: 'info' | 'warning' | 'error' | 'fatal',
  message: string,
  context?: Record<string, any>
): void {
  try {
    Sentry.captureMessage(message, {
      level,
      tags: {
        feature: 'gemini_reliability',
        ...context?.tags,
      },
      extra: context,
    })
  } catch (error) {
    console.warn('[Analytics] Failed to send Sentry alert:', error)
  }
}

/**
 * Alert on circuit breaker opening
 */
export function alertCircuitBreakerOpen(failureRate: number, threshold: number): void {
  sendSentryAlert('error', 'Gemini API Circuit Breaker Opened', {
    failureRate: (failureRate * 100).toFixed(1) + '%',
    threshold: (threshold * 100).toFixed(1) + '%',
    tags: {
      event: 'circuit_breaker_open',
      severity: 'high',
    },
  })

  console.error(`[ALERT] Circuit breaker opened! Failure rate: ${(failureRate * 100).toFixed(1)}%`)
}

/**
 * Alert on repeated fallback usage
 */
export async function checkAndAlertFallbackUsage(): Promise<void> {
  try {
    const metrics = await getAPIHealthMetrics()

    if (!metrics) return

    // Alert if Claude fallback is being used too frequently
    if (metrics.totalRequests > 0) {
      const fallbackRate = (metrics.claudeFallbackUsed / metrics.totalRequests) * 100

      if (fallbackRate > 10) {
        // More than 10% of requests using fallback
        sendSentryAlert('warning', 'High Claude Fallback Usage', {
          fallbackRate: fallbackRate.toFixed(1) + '%',
          fallbackRequests: metrics.claudeFallbackUsed,
          totalRequests: metrics.totalRequests,
          tags: {
            event: 'high_fallback_usage',
            severity: 'medium',
          },
        })
      }
    }
  } catch (error) {
    console.warn('[Analytics] Failed to check fallback usage:', error)
  }
}

/**
 * Log analysis latency for performance monitoring
 */
export async function recordAnalysisLatency(latencyMs: number, success: boolean): Promise<void> {
  try {
    const metricsRef = db.collection('system').doc('api_metrics')

    const updates: any = {
      lastLatency: latencyMs,
      lastLatencyTime: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Update average latency with exponential moving average
    // New average = 0.7 * old average + 0.3 * new value
    const data = (await metricsRef.get()).data()
    const oldAvg = data?.avgLatency || 0
    const newAvg = oldAvg * 0.7 + latencyMs * 0.3

    updates.avgLatency = newAvg

    // Track p95 and p99 percentiles using array append (limited to last 100)
    updates.latencies = admin.firestore.FieldValue.arrayUnion(latencyMs)

    await metricsRef.update(updates).catch(() => {
      // Create if not exists
      return metricsRef.set({
        avgLatency: latencyMs,
        lastLatency: latencyMs,
        lastLatencyTime: admin.firestore.FieldValue.serverTimestamp(),
        latencies: [latencyMs],
      })
    })

    // Alert if latency is too high
    if (latencyMs > 45000) {
      // More than 45 seconds
      sendSentryAlert('warning', 'High API Latency Detected', {
        latencyMs,
        success,
        tags: {
          event: 'high_latency',
          severity: 'medium',
        },
      })
    }
  } catch (error) {
    console.warn('[Analytics] Failed to record latency:', error)
  }
}

/**
 * Generate health report and log to Sentry
 */
export async function generateAndLogHealthReport(): Promise<void> {
  try {
    const metrics = await getAPIHealthMetrics()

    if (!metrics) {
      console.warn('[Analytics] No metrics available for health report')
      return
    }

    const report = `
API Health Report:
- Total Requests: ${metrics.totalRequests}
- Success Rate: ${metrics.successRate.toFixed(1)}%
- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%
- Average Latency: ${metrics.averageLatencyMs.toFixed(0)}ms
- Claude Fallback Usage: ${metrics.claudeFallbackUsed}
- Circuit Breaker: ${metrics.circuitBreakerOpen ? 'OPEN' : 'CLOSED'}
    `

    console.log('[Analytics]', report)

    sendSentryAlert('info', 'API Health Report', {
      ...metrics,
      tags: {
        event: 'health_report',
        severity: 'info',
      },
    })

    // Alert if health is poor
    if (metrics.successRate < 80) {
      sendSentryAlert('error', 'Poor API Health Detected', {
        successRate: metrics.successRate.toFixed(1) + '%',
        failedRequests: metrics.failedRequests,
        totalRequests: metrics.totalRequests,
        tags: {
          event: 'poor_health',
          severity: 'high',
        },
      })
    }
  } catch (error) {
    console.warn('[Analytics] Failed to generate health report:', error)
  }
}

/**
 * Schedule periodic health checks (call this in a scheduled Cloud Function)
 */
export async function periodicHealthCheck(): Promise<void> {
  try {
    console.log('[Analytics] Running periodic health check...')

    // Check fallback usage
    await checkAndAlertFallbackUsage()

    // Generate and log report
    await generateAndLogHealthReport()

    console.log('[Analytics] Health check completed')
  } catch (error) {
    console.error('[Analytics] Health check failed:', error)
    sendSentryAlert('error', 'Health check failed', { error: String(error) })
  }
}
