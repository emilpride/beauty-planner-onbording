/**
 * Reliability utilities for Gemini API integration
 * Implements retry logic, circuit breaker, validation, and caching
 */

import * as admin from 'firebase-admin'
import * as Sentry from '@sentry/node'
import { logAPIEvent } from './monitoring'

const db = admin.firestore()

// ===== RETRY MECHANISM =====
export interface RetryOptions {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 4,
  initialDelayMs: 500, // Start with 500ms instead of 1s for faster retries
  maxDelayMs: 8000,
  backoffMultiplier: 2,
}

/**
 * Execute function with exponential backoff retry
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  context?: { userId?: string; sessionId?: string }
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any = null
  let delayMs = opts.initialDelayMs
  const startTime = Date.now()

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt}/${opts.maxRetries}`, { context })
      const result = await fn()
      
      // Record successful attempt
      const latency = Date.now() - startTime
      await logAPIEvent({
        type: attempt > 1 ? 'retry' : 'success',
        userId: context?.userId,
        latencyMs: latency,
        attemptNumber: attempt,
      }).catch(() => {})
      
      if (attempt > 1) {
        console.log(`[Retry] Success on attempt ${attempt}`, { context })
        Sentry.captureMessage(`Gemini API succeeded after ${attempt} attempts`, {
          level: 'info',
          tags: { attempt, feature: 'gemini_retry' },
          extra: { ...context, latencyMs: latency },
        })
      }
      return result
    } catch (error) {
      lastError = error
      if (attempt === opts.maxRetries) {
        console.error(`[Retry] All ${opts.maxRetries} attempts failed`, { error, context })
        
        // Record final failure
        const latency = Date.now() - startTime
        await logAPIEvent({
          type: 'failure',
          userId: context?.userId,
          latencyMs: latency,
          error: (error as any)?.message,
          attemptNumber: attempt,
        }).catch(() => {})
        
        Sentry.captureException(error, {
          tags: { feature: 'gemini_retry_exhausted', attempts: opts.maxRetries },
          extra: { ...context, latencyMs: latency },
        })
        throw error
      }

      // Calculate next delay with jitter to avoid thundering herd
      const jitter = Math.random() * 0.1 * delayMs // 10% jitter
      const nextDelayMs = Math.min(delayMs * opts.backoffMultiplier + jitter, opts.maxDelayMs)

      console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${Math.round(nextDelayMs)}ms`, {
        error: (error as any)?.message,
        context,
      })

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, nextDelayMs))
      delayMs = nextDelayMs
    }
  }

  throw lastError
}

// ===== CIRCUIT BREAKER =====
export interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  isOpen: boolean
  recoveryAttempts: number
}

const CIRCUIT_BREAKER_THRESHOLD = 0.3 // 30% failure rate
const CIRCUIT_BREAKER_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const CIRCUIT_BREAKER_RECOVERY_TIMEOUT_MS = 2 * 60 * 1000 // 2 minutes

let circuitBreakerState: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
  recoveryAttempts: 0,
}

let requestCounterWindow: { count: number; timestamp: number } = { count: 0, timestamp: Date.now() }

/**
 * Check if circuit breaker should allow requests
 */
export function isCircuitBreakerOpen(): boolean {
  const now = Date.now()

  // Reset window if expired
  if (now - requestCounterWindow.timestamp > CIRCUIT_BREAKER_WINDOW_MS) {
    requestCounterWindow = { count: 0, timestamp: now }
    circuitBreakerState.failures = 0
  }

  // If circuit is open, check if recovery timeout has passed
  if (circuitBreakerState.isOpen) {
    const timeSinceLastFailure = now - circuitBreakerState.lastFailureTime
    if (timeSinceLastFailure > CIRCUIT_BREAKER_RECOVERY_TIMEOUT_MS) {
      console.log('[CircuitBreaker] Attempting recovery')
      circuitBreakerState.isOpen = false
      circuitBreakerState.recoveryAttempts = 0
    } else {
      return true // Circuit still open
    }
  }

  return false
}

/**
 * Record a request (success or failure)
 */
export function recordRequest(success: boolean): void {
  const now = Date.now()

  // Reset window if expired
  if (now - requestCounterWindow.timestamp > CIRCUIT_BREAKER_WINDOW_MS) {
    requestCounterWindow = { count: 0, timestamp: now }
    circuitBreakerState.failures = 0
  }

  requestCounterWindow.count++

  if (!success) {
    circuitBreakerState.failures++
    circuitBreakerState.lastFailureTime = now

    const failureRate = circuitBreakerState.failures / requestCounterWindow.count

    console.log('[CircuitBreaker] Request failed', {
      failureRate: (failureRate * 100).toFixed(1) + '%',
      failures: circuitBreakerState.failures,
      total: requestCounterWindow.count,
    })

    if (failureRate > CIRCUIT_BREAKER_THRESHOLD) {
      if (!circuitBreakerState.isOpen) {
        console.error(
          `[CircuitBreaker] OPENING CIRCUIT - failure rate ${(failureRate * 100).toFixed(1)}% exceeds threshold`
        )
        circuitBreakerState.isOpen = true
        Sentry.captureMessage('Gemini API circuit breaker opened', {
          level: 'error',
          tags: { feature: 'circuit_breaker' },
          extra: { failureRate, threshold: CIRCUIT_BREAKER_THRESHOLD },
        })
      }
    }
  }
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return {
    isOpen: circuitBreakerState.isOpen,
    failureRate: (
      (circuitBreakerState.failures / Math.max(1, requestCounterWindow.count)) *
      100
    ).toFixed(1),
    failures: circuitBreakerState.failures,
    totalRequests: requestCounterWindow.count,
    windowExpiresIn: Math.max(
      0,
      CIRCUIT_BREAKER_WINDOW_MS - (Date.now() - requestCounterWindow.timestamp)
    ),
  }
}

// ===== INPUT VALIDATION & PREPROCESSING =====

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  cleaned: any
}

/**
 * Validate and preprocess user answers before sending to Gemini
 */
export function validateUserAnswers(answers: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const cleaned: any = { ...answers }

  // Required fields check
  const requiredFields = ['Age', 'Gender', 'Height', 'Weight']
  for (const field of requiredFields) {
    if (!answers[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate Age
  if (typeof cleaned.Age === 'number') {
    if (cleaned.Age < 13) {
      errors.push('Age must be at least 13')
    } else if (cleaned.Age > 120) {
      warnings.push('Age seems unusually high, may indicate data entry error')
    }
  }

  // Validate Height
  if (typeof cleaned.Height === 'string') {
    const heightNum = parseFloat(cleaned.Height)
    if (cleaned.HeightUnit === 'cm') {
      if (heightNum < 140 || heightNum > 220) {
        warnings.push('Height outside typical range for cm')
      }
    } else if (cleaned.HeightUnit === 'ft&in') {
      if (heightNum < 4.5 || heightNum > 7.5) {
        warnings.push('Height outside typical range for ft&in')
      }
    }
  }

  // Validate Weight
  if (typeof cleaned.Weight === 'string') {
    const weightNum = parseFloat(cleaned.Weight)
    if (cleaned.WeightUnit === 'kg') {
      if (weightNum < 30 || weightNum > 300) {
        warnings.push('Weight outside typical range for kg')
      }
    } else if (cleaned.WeightUnit === 'lbs') {
      if (weightNum < 70 || weightNum > 700) {
        warnings.push('Weight outside typical range for lbs')
      }
    }
  }

  // Trim and limit string fields
  const stringFields = [
    'Name',
    'BirthDate',
    'WorkEnvironment',
    'HairType',
    'Ethnicity',
  ]
  for (const field of stringFields) {
    if (typeof cleaned[field] === 'string') {
      cleaned[field] = cleaned[field].trim().slice(0, 500)
    }
  }

  // Limit array sizes
  if (Array.isArray(cleaned.SkinProblems)) {
    if (cleaned.SkinProblems.length > 15) {
      warnings.push(`Truncating SkinProblems from ${cleaned.SkinProblems.length} to 15`)
      cleaned.SkinProblems = cleaned.SkinProblems.slice(0, 15)
    }
  }

  if (Array.isArray(cleaned.HairProblems)) {
    if (cleaned.HairProblems.length > 12) {
      warnings.push(`Truncating HairProblems from ${cleaned.HairProblems.length} to 12`)
      cleaned.HairProblems = cleaned.HairProblems.slice(0, 12)
    }
  }

  if (Array.isArray(cleaned.PhysicalActivities)) {
    if (cleaned.PhysicalActivities.length > 20) {
      warnings.push(`Truncating PhysicalActivities from ${cleaned.PhysicalActivities.length} to 20`)
      cleaned.PhysicalActivities = cleaned.PhysicalActivities.slice(0, 20)
    }
  }

  // Remove null/undefined values at top level
  for (const [key, value] of Object.entries(cleaned)) {
    if (value === null || value === undefined) {
      delete cleaned[key]
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleaned,
  }
}

// ===== ANALYSIS CACHING =====

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Generate cache key based on user profile similarity
 * Uses age range, gender, and key conditions instead of exact values
 */
export function generateCacheKey(answers: any): string {
  try {
    const ageRange =
      answers.Age < 20 ? '13-20' : answers.Age < 30 ? '20-30' : answers.Age < 40 ? '30-40' : '40+'
    const gender = answers.Gender === 2 ? 'female' : 'male'
    const skinType = answers.SkinType || 'unknown'

    // Get top skin problems (max 3)
    const topSkinProblems = (
      Array.isArray(answers.SkinProblems) ? answers.SkinProblems : []
    )
      .filter((p: any) => p.isActive)
      .map((p: any) => p.id)
      .sort()
      .slice(0, 3)
      .join(',')

    // Get top hair problems (max 2)
    const topHairProblems = (
      Array.isArray(answers.HairProblems) ? answers.HairProblems : []
    )
      .filter((p: any) => p.isActive)
      .map((p: any) => p.id)
      .sort()
      .slice(0, 2)
      .join(',')

    const stressLevel = answers.Stress || 'unknown'
    const mood = answers.Mood || 'unknown'

    const cacheKey = `${ageRange}:${gender}:${skinType}:${topSkinProblems}:${topHairProblems}:${stressLevel}:${mood}`
    return Buffer.from(cacheKey).toString('base64')
  } catch (error) {
    console.warn('[Cache] Failed to generate cache key:', error)
    return ''
  }
}

/**
 * Get cached analysis from Firestore
 */
export async function getCachedAnalysis(cacheKey: string): Promise<any | null> {
  try {
    if (!cacheKey) return null

    const cacheDoc = await db.collection('ai_analysis_cache').doc(cacheKey).get()

    if (!cacheDoc.exists) return null

    const data = cacheDoc.data()
    if (!data) return null

    // Check if cache has expired
    const createdAt = data.createdAt?.toMillis?.() || 0
    const now = Date.now()
    if (now - createdAt > CACHE_TTL_MS) {
      console.log('[Cache] Cache entry expired, removing')
      await cacheDoc.ref.delete().catch(() => {})
      return null
    }

    console.log('[Cache] Cache HIT for key:', cacheKey)
    return data.analysis
  } catch (error) {
    console.warn('[Cache] Failed to retrieve cached analysis:', error)
    return null
  }
}

/**
 * Save analysis to cache
 */
export async function saveCacheAnalysis(cacheKey: string, analysis: any): Promise<void> {
  try {
    if (!cacheKey) return

    await db.collection('ai_analysis_cache').doc(cacheKey).set(
      {
        analysis,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        hitCount: admin.firestore.FieldValue.increment(0),
      },
      { merge: true }
    )

    console.log('[Cache] Cached analysis for key:', cacheKey)
  } catch (error) {
    console.warn('[Cache] Failed to save analysis cache:', error)
    // Don't throw - caching is optional
  }
}

/**
 * Increment cache hit counter for analytics
 */
export async function incrementCacheHit(cacheKey: string): Promise<void> {
  try {
    if (!cacheKey) return
    await db.collection('ai_analysis_cache').doc(cacheKey).update({
      hitCount: admin.firestore.FieldValue.increment(1),
    })
  } catch (error) {
    console.warn('[Cache] Failed to increment cache hit:', error)
  }
}

// ===== TIMEOUT MANAGEMENT =====

/**
 * Create an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // Store the timeout ID to allow cleanup if needed
  ;(controller as any).__timeoutId = timeoutId

  return controller
}

/**
 * Clean up timeout controller
 */
export function cleanupTimeoutController(controller: AbortController): void {
  const timeoutId = (controller as any).__timeoutId
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}
