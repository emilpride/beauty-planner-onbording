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
  // Firestore Timestamp can be object with toDate()
  let updatedAt: Date
  const u = (data as { updatedAt?: unknown }).updatedAt
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

  return {
    id,
    activityId: typeof data.activityId === 'string' ? data.activityId : '',
    date: typeof data.date === 'string' ? data.date : '',
    status: (data.status as TaskStatus) ?? 'pending',
    updatedAt,
    time: (data as { time?: { hour: number; minute: number } }).time,
  }
}
