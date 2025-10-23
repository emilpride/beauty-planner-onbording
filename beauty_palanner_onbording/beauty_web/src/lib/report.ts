import type { TaskInstance, TaskStatus } from '@/types/task'
import type { MoodEntry } from '@/types/mood'

export type PeriodOption =
  | 'Today'
  | 'This Week'
  | 'Last Week'
  | 'This Month'
  | 'Last Month'
  | 'Last 6 Months'
  | 'This Year'
  | 'Last Year'
  | 'All Time'

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function getStartDate(period: PeriodOption, now = new Date()): Date {
  switch (period) {
    case 'Today':
      return startOfDay(now)
    case 'This Week': {
      const dow = now.getDay() // 0..6, Sun=0
      const start = new Date(now)
      start.setDate(now.getDate() - dow)
      return startOfDay(start)
    }
    case 'Last Week': {
      const dow = now.getDay()
      const endLastWeek = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow - 1))
      return startOfDay(new Date(endLastWeek.getFullYear(), endLastWeek.getMonth(), endLastWeek.getDate() - 6))
    }
    case 'This Month':
      return startOfMonth(now)
    case 'Last Month':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1)
    case 'Last 6 Months':
      return new Date(now.getFullYear(), now.getMonth() - 5, 1)
    case 'This Year':
      return new Date(now.getFullYear(), 0, 1)
    case 'Last Year':
      return new Date(now.getFullYear() - 1, 0, 1)
    case 'All Time':
    default:
      return new Date(2000, 0, 1)
  }
}

export function normalizeDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseInstanceDay(i: TaskInstance): Date {
  // TaskInstance.date is ISO (YYYY-MM-DD)
  // Use midnight local to match UI expectations
  return new Date(`${i.date}T00:00:00`)
}

// --- General stats ---
export interface GeneralStats {
  currentStreak: number
  overallCompletionRate: number // 0..1
  totalActivitiesCompleted: number
  totalActivitiesTracked: number
  totalPerfectDays: number
}

export function computeGeneralStats(instances: TaskInstance[]): GeneralStats {
  if (!instances.length) {
    return {
      currentStreak: 0,
      overallCompletionRate: 0,
      totalActivitiesCompleted: 0,
      totalActivitiesTracked: 0,
      totalPerfectDays: 0,
    }
  }

  const relevant = instances.filter((t) => isTrackable(t.status))
  const completed = relevant.filter((t) => t.status === 'completed').length
  const overallCompletionRate = relevant.length ? completed / relevant.length : 0

  const byDay = groupBy(instances, (t) => normalizeDateKey(parseInstanceDay(t)))
  let perfectDays = 0
  for (const tasks of Object.values(byDay)) {
    if (tasks.length && tasks.every((t) => t.status === 'completed')) perfectDays++
  }

  const streak = calculateStreak(instances)

  return {
    currentStreak: streak,
    overallCompletionRate,
    totalActivitiesCompleted: instances.filter((t) => t.status === 'completed').length,
    totalActivitiesTracked: relevant.length,
    totalPerfectDays: perfectDays,
  }
}

function calculateStreak(instances: TaskInstance[]): number {
  // Consecutive days (up to today) where all tasks for the day are completed.
  let streak = 0
  let dateToCheck = startOfDay(new Date())

  // Pre-group for speed
  const byDay = groupBy(instances, (t) => normalizeDateKey(parseInstanceDay(t)))

  for (let safety = 0; safety < 1000; safety++) {
    const key = normalizeDateKey(dateToCheck)
    const tasksForDay = byDay[key] ?? []

    if (!tasksForDay.length) {
      // If no tasks that day, keep going backwards
      dateToCheck = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate() - 1)
      continue
    }

    const allCompleted = tasksForDay.every((t) => t.status === 'completed')
    if (allCompleted) {
      streak++
      dateToCheck = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

function isTrackable(status: TaskStatus) {
  return status === 'completed' || status === 'missed' || status === 'skipped'
}

function groupBy<T>(arr: T[], keyFn: (t: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = keyFn(item)
    ;(acc[k] ||= []).push(item)
    return acc
  }, {})
}

// --- Activities Completed (bar) ---
export interface BarDatum { label: string; value: number }

export function activitiesCompletedData(instances: TaskInstance[], period: PeriodOption, now = new Date()): BarDatum[] {
  const filtered = instances.filter((i) => i.status === 'completed')

  if (period === 'Today') {
    const byHour: number[] = Array.from({ length: 24 }, () => 0)
    for (const i of filtered) {
      const h = i.time?.hour ?? 12
      byHour[h]++
    }
    return byHour.map((v, h) => ({ label: `${h}`, value: v }))
  }

  if (period.includes('Week')) {
    const start = getStartDate(period as PeriodOption, now)
    const end = period === 'This Week' ? startOfDay(now) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
    const days = endDiffDays(start, end) + 1
    const values = Array.from({ length: 7 }, () => 0)
    for (const i of filtered) {
      const d = parseInstanceDay(i)
      if (d < start || d > end) continue
      const weekday = d.getDay() // Sun=0
      values[weekday]++
    }
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return values.map((v, idx) => ({ label: labels[idx], value: v }))
  }

  if (period === 'This Month' || period === 'Last Month') {
    const start = getStartDate(period, now)
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = period === 'This Month' ? now : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const days = endDiffDays(monthStart, monthEnd) + 1
    const values = Array.from({ length: days }, () => 0)
    for (const i of filtered) {
      const d = parseInstanceDay(i)
      if (d < monthStart || d > monthEnd) continue
      const idx = d.getDate() - 1
      values[idx]++
    }
    return values.map((v, idx) => ({ label: String(idx + 1), value: v }))
  }

  // Monthly groupings
  const startMonth = period === 'Last 6 Months' ? new Date(now.getFullYear(), now.getMonth() - 5, 1)
    : period === 'This Year' ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const monthsCount = period === 'Last 6 Months' ? 6 : period === 'This Year' ? now.getMonth() + 1 : 12
  const values = Array.from({ length: monthsCount }, () => 0)
  for (const i of filtered) {
    const d = parseInstanceDay(i)
    if (d < startMonth) continue
    const idx = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth())
    if (idx >= 0 && idx < monthsCount) values[idx]++
  }
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return values.map((v, idx) => ({ label: monthLabels[(startMonth.getMonth() + idx) % 12], value: v }))
}

// --- Completion Rate (line 0..100) ---
export interface LineDatum { x: number; y: number; label?: string }

export function completionRateData(instances: TaskInstance[], period: PeriodOption, now = new Date()): LineDatum[] {
  const trackable = instances.filter((i) => isTrackable(i.status))

  if (period === 'Today') {
    const buckets = Array.from({ length: 24 }, () => ({ total: 0, completed: 0 }))
    for (const i of trackable) {
      const h = i.time?.hour ?? 0
      buckets[h].total++
      if (i.status === 'completed') buckets[h].completed++
    }
    return buckets.map((b, h) => ({ x: h, y: b.total ? (b.completed / b.total) * 100 : 0 }))
  }

  if (period.includes('Week')) {
    const start = getStartDate(period as PeriodOption, now)
    const end = period === 'This Week' ? startOfDay(now) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
    const days = endDiffDays(start, end) + 1
    const buckets = Array.from({ length: days }, () => ({ total: 0, completed: 0 }))
    for (const i of trackable) {
      const d = parseInstanceDay(i)
      if (d < start || d > end) continue
      const idx = endDiffDays(start, d)
      buckets[idx].total++
      if (i.status === 'completed') buckets[idx].completed++
    }
    return buckets.map((b, idx) => ({ x: idx, y: b.total ? (b.completed / b.total) * 100 : 0 }))
  }

  if (period === 'This Month' || period === 'Last Month') {
    const start = getStartDate(period, now)
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = period === 'This Month' ? now : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const days = endDiffDays(monthStart, monthEnd) + 1
    const buckets = Array.from({ length: days }, () => ({ total: 0, completed: 0 }))
    for (const i of trackable) {
      const d = parseInstanceDay(i)
      if (d < monthStart || d > monthEnd) continue
      const idx = endDiffDays(monthStart, d)
      buckets[idx].total++
      if (i.status === 'completed') buckets[idx].completed++
    }
    return buckets.map((b, idx) => ({ x: idx, y: b.total ? (b.completed / b.total) * 100 : 0 }))
  }

  // Monthly aggregations
  const startMonth = period === 'Last 6 Months' ? new Date(now.getFullYear(), now.getMonth() - 5, 1)
    : period === 'This Year' ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const monthsCount = period === 'Last 6 Months' ? 6 : period === 'This Year' ? now.getMonth() + 1 : 12
  const buckets = Array.from({ length: monthsCount }, () => ({ total: 0, completed: 0 }))
  for (const i of trackable) {
    const d = parseInstanceDay(i)
    if (d < startMonth) continue
    const idx = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth())
    if (idx >= 0 && idx < monthsCount) {
      buckets[idx].total++
      if (i.status === 'completed') buckets[idx].completed++
    }
  }
  return buckets.map((b, idx) => ({ x: idx, y: b.total ? (b.completed / b.total) * 100 : 0 }))
}

// --- Calendar (date -> rate 0..1 or -1 for no data) ---
export type CalendarStats = Record<string, number>

export function calendarStats(instances: TaskInstance[], forMonth: Date): CalendarStats {
  const month = new Date(forMonth.getFullYear(), forMonth.getMonth(), 1)
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)
  const dayMap: Record<string, { total: number; completed: number }> = {}
  for (const i of instances) {
    const d = parseInstanceDay(i)
    if (d < month || d >= nextMonth) continue
    const key = normalizeDateKey(d)
    if (!dayMap[key]) dayMap[key] = { total: 0, completed: 0 }
    if (isTrackable(i.status)) {
      dayMap[key].total++
      if (i.status === 'completed') dayMap[key].completed++
    }
  }
  const stats: CalendarStats = {}
  // Fill the whole month
  for (let d = new Date(month); d < nextMonth; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const key = normalizeDateKey(d)
    const rec = dayMap[key]
    stats[key] = rec ? (rec.total ? rec.completed / rec.total : -1) : -1
  }
  return stats
}

// --- Mood (line 1..5) ---
export function moodLineData(moods: MoodEntry[], period: PeriodOption, now = new Date()): LineDatum[] {
  if (!moods.length) return []

  if (period === 'Today') {
    const byHour: number[] = Array.from({ length: 24 }, () => 0)
    const counts: number[] = Array.from({ length: 24 }, () => 0)
    for (const m of moods) {
      const h = m.date.getHours()
      byHour[h] += m.mood
      counts[h]++
    }
    return byHour.map((sum, h) => ({ x: h, y: counts[h] ? sum / counts[h] : 0 }))
  }

  if (period.includes('Week')) {
    const start = getStartDate(period as PeriodOption, now)
    const end = period === 'This Week' ? startOfDay(now) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
    const days = endDiffDays(start, end) + 1
    const sum: number[] = Array.from({ length: days }, () => 0)
    const cnt: number[] = Array.from({ length: days }, () => 0)
    for (const m of moods) {
      const d = startOfDay(m.date)
      if (d < start || d > end) continue
      const idx = endDiffDays(start, d)
      sum[idx] += m.mood
      cnt[idx]++
    }
    return sum.map((s, i) => ({ x: i, y: cnt[i] ? s / cnt[i] : 0 }))
  }

  if (period === 'This Month' || period === 'Last Month') {
    const start = getStartDate(period, now)
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = period === 'This Month' ? now : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const days = endDiffDays(monthStart, monthEnd) + 1
    const sum: number[] = Array.from({ length: days }, () => 0)
    const cnt: number[] = Array.from({ length: days }, () => 0)
    for (const m of moods) {
      const d = startOfDay(m.date)
      if (d < monthStart || d > monthEnd) continue
      const idx = endDiffDays(monthStart, d)
      sum[idx] += m.mood
      cnt[idx]++
    }
    return sum.map((s, i) => ({ x: i, y: cnt[i] ? s / cnt[i] : 0 }))
  }

  const startMonth = period === 'Last 6 Months' ? new Date(now.getFullYear(), now.getMonth() - 5, 1)
    : period === 'This Year' ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const monthsCount = period === 'Last 6 Months' ? 6 : period === 'This Year' ? now.getMonth() + 1 : 12
  const sum: number[] = Array.from({ length: monthsCount }, () => 0)
  const cnt: number[] = Array.from({ length: monthsCount }, () => 0)
  for (const m of moods) {
    const d = startOfDay(m.date)
    if (d < startMonth) continue
    const idx = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth())
    if (idx >= 0 && idx < monthsCount) {
      sum[idx] += m.mood
      cnt[idx]++
    }
  }
  return sum.map((s, i) => ({ x: i, y: cnt[i] ? s / cnt[i] : 0 }))
}

function endDiffDays(start: Date, end: Date) {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
