/**
 * Heartbeat mechanism for long-running Gemini analysis
 * Sends progress updates to client every 15 seconds during analysis
 * Prevents function timeout and keeps client informed of progress
 */

export interface HeartbeatConfig {
  intervalMs: number // Interval between heartbeats (e.g., 15000 for 15s)
  maxDurationMs: number // Max time to send heartbeats (e.g., 50000 for 50s)
}

export interface HeartbeatContext {
  stage: string // 'validating' | 'preprocessing' | 'caching' | 'analyzing' | 'parsing'
  progress: number // 0-100
  message: string
  timestamp: number
}

const DEFAULT_CONFIG: HeartbeatConfig = {
  intervalMs: 15000, // 15 seconds
  maxDurationMs: 50000, // 50 seconds (leave 10s buffer before Cloud Function timeout)
}

let heartbeatTimer: NodeJS.Timeout | null = null
let startTime: number = 0
let currentContext: HeartbeatContext | null = null

/**
 * Start sending heartbeat updates to client
 * Sends JSON chunks with stage, progress, and message
 * Client should handle streaming response
 */
export function startHeartbeat(res: any, config: Partial<HeartbeatConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  startTime = Date.now()
  let beatCount = 0

  // Send initial heartbeat immediately
  currentContext = {
    stage: 'preparing',
    progress: 5,
    message: 'Preparing analysis...',
    timestamp: Date.now(),
  }

  sendHeartbeatChunk(res, currentContext)

  // Schedule regular heartbeats
  heartbeatTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    if (elapsed > cfg.maxDurationMs) {
      stopHeartbeat()
      return
    }

    beatCount++
    const progress = Math.min(95, 5 + (beatCount * 15)) // Don't go over 95% until complete

    if (currentContext) {
      currentContext.progress = progress
      currentContext.timestamp = Date.now()
    }

    sendHeartbeatChunk(res, currentContext || getDefaultContext(progress))
  }, cfg.intervalMs)
}

/**
 * Update the current analysis stage
 */
export function updateHeartbeat(stage: string, progress: number, message: string): void {
  currentContext = {
    stage,
    progress: Math.min(95, progress),
    message,
    timestamp: Date.now(),
  }
}

/**
 * Stop sending heartbeats
 */
export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

/**
 * Send a heartbeat chunk to the client
 * Each chunk is a line-delimited JSON object
 */
function sendHeartbeatChunk(res: any, context: HeartbeatContext | null): void {
  try {
    if (!context) return

    // Send as line-delimited JSON (each heartbeat is a complete JSON object + newline)
    const chunk = JSON.stringify({
      type: 'heartbeat',
      ...context,
    }) + '\n'

    // Only write if response is still writable
    if (res.writable) {
      res.write(chunk)
    }
  } catch (error) {
    console.warn('[Heartbeat] Failed to send chunk:', error)
  }
}

/**
 * Get default context for a given progress level
 */
function getDefaultContext(progress: number): HeartbeatContext {
  let stage = 'preparing'
  let message = 'Preparing analysis...'

  if (progress > 80) {
    stage = 'finalizing'
    message = 'Finalizing results...'
  } else if (progress > 60) {
    stage = 'parsing'
    message = 'Processing AI response...'
  } else if (progress > 40) {
    stage = 'analyzing'
    message = 'Analyzing your profile...'
  } else if (progress > 20) {
    stage = 'preprocessing'
    message = 'Preparing data for analysis...'
  }

  return {
    stage,
    progress,
    message,
    timestamp: Date.now(),
  }
}

/**
 * Stream the final analysis result and close the response
 * Use this after analysis is complete
 */
export function streamAnalysisResult(res: any, analysis: any): void {
  try {
    stopHeartbeat()

    // Send final update with 100% progress
    const finalContext: HeartbeatContext = {
      stage: 'complete',
      progress: 100,
      message: 'Analysis complete!',
      timestamp: Date.now(),
    }

    const finalChunk = JSON.stringify({
      type: 'heartbeat',
      ...finalContext,
    }) + '\n'

    if (res.writable) {
      res.write(finalChunk)
    }

    // Send the actual analysis result
    const resultChunk = JSON.stringify({
      type: 'result',
      analysis,
      success: true,
    }) + '\n'

    if (res.writable) {
      res.write(resultChunk)
    }

    // End the response
    res.end()
  } catch (error) {
    console.error('[Heartbeat] Failed to stream result:', error)
    if (res.writable) {
      res.end()
    }
  }
}

/**
 * Stream an error and close the response
 */
export function streamError(res: any, error: string, statusCode: number = 502): void {
  try {
    stopHeartbeat()

    if (!res.headersSent) {
      res.status(statusCode)
    }

    const errorChunk = JSON.stringify({
      type: 'error',
      error,
      success: false,
    }) + '\n'

    if (res.writable) {
      res.write(errorChunk)
    }

    res.end()
  } catch (err) {
    console.error('[Heartbeat] Failed to stream error:', err)
    if (res.writable) {
      res.end()
    }
  }
}
