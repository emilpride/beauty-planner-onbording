import type { Activity } from '@/types/activity'
import type { TaskInstance } from '@/types/task'

const MAX_DAYS_DEFAULT = 730
const MAX_RESULTS_DEFAULT = 1000

function dateOnly(source: Date): Date {
  return new Date(source.getFullYear(), source.getMonth(), source.getDate())
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base)
  copy.setDate(copy.getDate() + days)
  return copy
}

function addWeeks(base: Date, weeks: number): Date {
  return addDays(base, weeks * 7)
}

function addMonths(base: Date, months: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + months, base.getDate())
}

function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function calculateEndDate(activity: Activity, startDate: Date): Date | null {
  const endType = (activity.endBeforeType ?? '').toLowerCase()
  if (!endType) return null

  if (endType === 'date' && activity.selectedEndBeforeDate) {
    return dateOnly(activity.selectedEndBeforeDate)
  }

  if (endType === 'days' && activity.endBeforeUnit) {
    const days = Number.parseInt(activity.endBeforeUnit, 10)
    if (!Number.isNaN(days)) {
      return addDays(startDate, days)
    }
  }

  return null
}

function generateDailyDates(startDate: Date, endDate: Date, maxResults: number): Date[] {
  const dates: Date[] = []
  let current = dateOnly(startDate)

  while (current <= endDate && dates.length < maxResults) {
    dates.push(current)
    current = addDays(current, 1)
  }

  return dates
}

function generateWeeklyDates(
  activity: Activity,
  startDate: Date,
  endDate: Date,
  maxResults: number,
): Date[] {
  const dates: Date[] = []
  const interval = Math.max(activity.weeksInterval ?? 1, 1)
  const selectedWeekdays = new Set((activity.selectedDays ?? []).map((value) => Number(value)).filter((value) => !Number.isNaN(value)))
  // If nothing selected, mirror Flutter behaviour by defaulting to the start date's weekday
  if (!selectedWeekdays.size) {
    const flutterWeekday = ((startDate.getDay() % 7) + 1)
    selectedWeekdays.add(flutterWeekday)
  }

  let currentWeekStart = dateOnly(startDate)

  while (currentWeekStart <= endDate && dates.length < maxResults) {
    for (let offset = 0; offset < 7; offset++) {
      const candidate = addDays(currentWeekStart, offset)
      if (candidate > endDate) break
      const flutterWeekday = ((candidate.getDay() % 7) + 1)
      if (selectedWeekdays.has(flutterWeekday)) {
        dates.push(candidate)
      }
    }
    currentWeekStart = addWeeks(currentWeekStart, interval)
  }

  return dates
}

function generateMonthlyDates(
  activity: Activity,
  startDate: Date,
  endDate: Date,
  maxResults: number,
): Date[] {
  const dates: Date[] = []
  const selectedDays = new Set((activity.selectedMonthDays ?? []).map((value) => Number(value)).filter((value) => !Number.isNaN(value)))
  if (!selectedDays.size) return dates

  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  while (cursor <= endDate && dates.length < maxResults) {
    for (const day of selectedDays) {
      const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), day)
      if (candidate.getMonth() !== cursor.getMonth()) continue
      if (candidate < startDate || candidate > endDate) continue
      dates.push(candidate)
    }
    cursor = addMonths(cursor, 1)
  }

  return dates
}

function generateScheduledDatesForActivity(
  activity: Activity,
  { maxDays = MAX_DAYS_DEFAULT, maxResults = MAX_RESULTS_DEFAULT }: { maxDays?: number; maxResults?: number } = {},
): Date[] {
  if (!activity.activeStatus || !activity.enabledAt) return []

  const startDate = dateOnly(activity.enabledAt)
  const now = new Date()

  const rawType = (activity.type ?? '').toLowerCase()
  const rawFrequency = (activity.frequency ?? '').toLowerCase()

  if (rawType === 'one_time' || rawFrequency === 'one_time') {
    const oneTimeDate = activity.selectedEndBeforeDate ?? activity.enabledAt
    return oneTimeDate ? [dateOnly(oneTimeDate)] : []
  }

  const maxFutureDate = addDays(now, maxDays)
  const endCandidate = calculateEndDate(activity, startDate)
  const effectiveEnd = endCandidate && endCandidate < maxFutureDate ? endCandidate : maxFutureDate

  if (effectiveEnd < startDate) {
    return []
  }

  if (rawFrequency === 'daily') {
    return generateDailyDates(startDate, effectiveEnd, maxResults)
  }

  if (rawFrequency === 'weekly') {
    return generateWeeklyDates(activity, startDate, effectiveEnd, maxResults)
  }

  if (rawFrequency === 'monthly') {
    return generateMonthlyDates(activity, startDate, effectiveEnd, maxResults)
  }

  // Fallback: treat unknown frequencies as daily cadence
  return generateDailyDates(startDate, effectiveEnd, maxResults)
}

function buildTaskId(activity: Activity, date: Date) {
  const ymd = toYMD(date)
  if ((activity.type ?? '').toLowerCase() === 'one_time' && activity.time) {
    return `${activity.id}-${ymd}-${pad2(activity.time.hour)}${pad2(activity.time.minute)}`
  }
  return `${activity.id}-${ymd}`
}

/**
 * Generate planned TaskInstances for a specific date from active Activities.
 * This mirrors the Flutter ActivityController scheduling logic.
 */
export function generateTasksForDate(activities: Activity[], target: Date): TaskInstance[] {
  const targetDate = dateOnly(target)
  const ymd = toYMD(targetDate)
  const tasks: TaskInstance[] = []

  for (const activity of activities) {
    const scheduledDates = generateScheduledDatesForActivity(activity)
    if (!scheduledDates.some((scheduled) => scheduled.getTime() === targetDate.getTime())) {
      continue
    }

    const id = buildTaskId(activity, targetDate)
    tasks.push({
      id,
      activityId: activity.id,
      date: ymd,
      status: 'pending',
      updatedAt: new Date(),
      time: activity.time ? { hour: activity.time.hour, minute: activity.time.minute } : undefined,
    })
  }

  tasks.sort((a, b) => {
    const aH = a.time?.hour ?? 24
    const aM = a.time?.minute ?? 0
    const bH = b.time?.hour ?? 24
    const bM = b.time?.minute ?? 0
    return aH - bH || aM - bM
  })

  return tasks
}
