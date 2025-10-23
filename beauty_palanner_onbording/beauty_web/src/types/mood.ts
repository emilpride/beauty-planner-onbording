export interface MoodEntry {
  id: string
  userId: string
  date: Date
  mood: number // 1=sad, 2=neutral, 3=happy
  feeling: string
  updatedAt: Date
}

export function parseMood(id: string, data: Record<string, unknown>): MoodEntry {
  const tsToDate = (v: unknown) =>
    (typeof v === 'object' && v !== null && 'toDate' in (v as { toDate?: unknown }) && typeof (v as { toDate?: unknown }).toDate === 'function'
      ? (v as { toDate: () => Date }).toDate()
      : typeof v === 'string'
        ? new Date(v)
        : new Date())
  const asString = (v: unknown) => (typeof v === 'string' ? v : '')
  const asNumber = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0))
  return {
    id,
    userId: asString(data.userId),
    date: tsToDate(data.date),
    mood: asNumber(data.mood),
    feeling: asString(data.feeling),
    updatedAt: tsToDate(data.updatedAt ?? new Date()),
  }
}

export function moodDateKey(userId: string, date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${userId}_${y}-${m}-${d}`
}
