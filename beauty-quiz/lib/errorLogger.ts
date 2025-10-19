import * as Sentry from '@sentry/nextjs'

/**
 * Error Logger Service
 * Centralizes error tracking and reporting via Sentry
 * Supports both client and server-side error capture
 */

export interface ErrorContext {
  userId?: string
  sessionId?: string
  action?: string
  metadata?: Record<string, unknown>
}

/**
 * Initialize Sentry (called once at app startup)
 */
export function initializeErrorLogger() {
  if (typeof window === 'undefined') {
    // Server-side initialization
    return
  }

  // Client-side initialization handled by Next.js Sentry wrapper
  const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  // Sentry is initialized by Next.js via instrumentation
  // Just set up the configuration if needed
  Sentry.setTag('environment', process.env.NODE_ENV || 'development')
}

/**
 * Capture a generic error with optional context
 */
export function captureError(error: Error | string, context?: ErrorContext) {
  const errorObj = typeof error === 'string' ? new Error(error) : error

  if (context) {
    Sentry.withScope((scope) => {
      if (context.userId) scope.setUser({ id: context.userId })
      if (context.sessionId) scope.setTag('sessionId', context.sessionId)
      if (context.action) scope.setTag('action', context.action)
      if (context.metadata) scope.setContext('metadata', context.metadata)
      Sentry.captureException(errorObj)
    })
  } else {
    Sentry.captureException(errorObj)
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorLogger]', errorObj)
  }
}

/**
 * Capture a warning/info message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
  if (context) {
    Sentry.withScope((scope) => {
      if (context.userId) scope.setUser({ id: context.userId })
      if (context.sessionId) scope.setTag('sessionId', context.sessionId)
      if (context.action) scope.setTag('action', context.action)
      if (context.metadata) scope.setContext('metadata', context.metadata)
      Sentry.captureMessage(message, level)
    })
  } else {
    Sentry.captureMessage(message, level)
  }
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>, category = 'user-action') {
  Sentry.addBreadcrumb({
    message,
    data,
    category,
    level: 'info',
  })
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, _op = 'http.request') {
  // In Sentry 8+, use metrics and custom spans via the context
  // Mark the current point in time for performance tracking
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`sentry-transaction-${name}`)
  }
  return { name, startedAt: Date.now() }
}

/**
 * Set user context for all subsequent errors
 */
export function setUser(userId: string | null, email?: string) {
  if (userId) {
    Sentry.setUser({ id: userId, email })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * React Error Boundary integration
 * Use this in your Error Boundary component
 */
export function captureReactError(error: Error, errorInfo: { componentStack: string }) {
  captureError(error, {
    action: 'react-error-boundary',
    metadata: { componentStack: errorInfo.componentStack },
  })
}

/**
 * Wrap async functions to automatically catch errors
 */
export function withErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), context)
      throw error
    }
  }) as T
}

/**
 * Wrap sync functions to automatically catch errors
 */
export function withSyncErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args)
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), context)
      throw error
    }
  }) as T
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      action: 'unhandledRejection',
    })
  })

  // Global error handler
  window.addEventListener('error', (event) => {
    captureError(event.error || event.message, {
      action: 'globalError',
    })
  })
}
