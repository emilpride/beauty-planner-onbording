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

  function formatYMD(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function normalizeDateValue(): string {
    const raw = getField<unknown>('date', 'Date')
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      // Case 1: YYYY[sep]MM[sep]DD at string start
      let match = trimmed.match(/^(\d{4})\D?(\d{1,2})\D?(\d{1,2})/)
      if (match) {
        const [, y, m, d] = match
        const year = Number(y)
        const month = Number(m)
        const day = Number(d)
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
          return formatYMD(new Date(year, month - 1, day))
        }
      }
      // Case 2: DD[sep]MM[sep]YYYY anywhere (common mobile format)
      match = trimmed.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/)
      if (match) {
        const [, d, m, y] = match
        const year = Number(y)
        const month = Number(m)
        const day = Number(d)
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
          return formatYMD(new Date(year, month - 1, day))
        }
      }
      // Case 3: generic 3-number pattern, pick the 4-digit part as year
      match = trimmed.match(/(\d{1,4})\D(\d{1,2})\D(\d{1,4})/)
      if (match) {
        const [, a, b, c] = match
        const nums = [a, b, c].map((n) => Number(n))
        const idxYear = [a, b, c].findIndex((n) => n.length === 4)
        if (idxYear >= 0) {
          const year = nums[idxYear]
          const other = nums.filter((_n, i) => i !== idxYear)
          const month = other[0]
          const day = other[1]
          if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
            return formatYMD(new Date(year, month - 1, day))
          }
        }
      }
    }
    if (typeof raw === 'number') {
      return formatYMD(new Date(raw))
    }
    if (
      typeof raw === 'object' &&
      raw !== null &&
      'toDate' in (raw as { toDate?: unknown }) &&
      typeof (raw as { toDate?: unknown }).toDate === 'function'
    ) {
      return formatYMD((raw as { toDate: () => Date }).toDate())
    }
    // Fallback: derive date from deterministic id pattern activityId-YYYY-MM-DD[-HHmm]
  // Prefer matching a -YYYY-MM-DD segment near the end (optionally followed by -HHmm)
  const idMatch = id.match(/(?:^|[^0-9])(\d{4})-(\d{2})-(\d{2})(?:-|$)/)
    if (idMatch) {
      const [, yy, mm, dd] = idMatch
      const year = Number(yy)
      const month = Number(mm)
      const day = Number(dd)
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return formatYMD(new Date(year, month - 1, day))
      }
    }
    return ''
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
  // Legacy documents may lack updatedAt; set a very old date so they don't override newer states on merge
  else updatedAt = new Date(0)

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
    date: normalizeDateValue(),
    status: parseStatus(),
    updatedAt,
    time: parseTime(),
  }
}
