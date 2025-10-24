// Shared Task/Update types for the web app

export type TaskStatus =
  | 'pending'
  | 'completed'
  | 'skipped'
  | 'missed'
  | 'deleted'

export interface TaskInstance {
  id: string // composite id activityId-YYYY-MM-DD[-HHmm]
  activityId: string
  date: string // ISO date string (YYYY-MM-DD) as stored in Flutter
  status: TaskStatus
  updatedAt: Date
  time?: { hour: number; minute: number }
}

export function parseTaskInstance(id: string, data: Record<string, unknown>): TaskInstance {
  // Support both camelCase and PascalCase field names coming from Flutter
  function getField<T = unknown>(...keys: string[]): T | undefined {
    for (const k of keys) {
      const v = (data as Record<string, unknown>)[k]
      if (typeof v !== 'undefined') return v as T
    }
    return undefined
  }

  // Firestore Timestamp or value to Date
  let updatedAt: Date
  const u = getField<unknown>('updatedAt', 'UpdatedAt')
  if (
    typeof u === 'object' &&
    u !== null &&
    'toDate' in (u as { toDate?: unknown }) &&
    typeof (u as { toDate?: unknown }).toDate === 'function'
  ) {
    updatedAt = (u as { toDate: () => Date }).toDate()
  }
  else if (typeof u === 'string') updatedAt = new Date(u)
  else if (typeof u === 'number') updatedAt = new Date(u)
  else updatedAt = new Date()

  // Time can arrive as {hour,minute} or PascalCase {Hour,Minute} under 'time' or 'Time'
  function parseTime(): { hour: number; minute: number } | undefined {
    const t = getField<unknown>('time', 'Time')
    if (!t || typeof t !== 'object') return undefined
    const obj = t as Record<string, unknown>
    const hour = (typeof obj['hour'] === 'number' ? obj['hour'] : typeof obj['Hour'] === 'number' ? obj['Hour'] : undefined) as number | undefined
    const minute = (typeof obj['minute'] === 'number' ? obj['minute'] : typeof obj['Minute'] === 'number' ? obj['Minute'] : undefined) as number | undefined
    if (typeof hour === 'number' && typeof minute === 'number') return { hour, minute }
    return undefined
  }

  // Normalize status from Flutter variants (planned->pending, done->completed, etc.)
  function parseStatus(): TaskStatus {
    const raw = getField<string>('status', 'Status')
    if (!raw) return 'pending'
    const lower = raw.toLowerCase()
    if (lower === 'planned') return 'pending'
    if (lower === 'done') return 'completed'
    if (lower === 'pending' || lower === 'completed' || lower === 'skipped' || lower === 'missed' || lower === 'deleted') {
      return lower as TaskStatus
    }
    return 'pending'
  }

  return {
    id,
    activityId: getField<string>('activityId', 'ActivityId') || '',
    date: getField<string>('date', 'Date') || '',
    status: parseStatus(),
    updatedAt,
    time: parseTime(),
  }
}
