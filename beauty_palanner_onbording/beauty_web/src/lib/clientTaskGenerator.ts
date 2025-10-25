import type { Activity } from '@/types/activity'
import type { TaskInstance } from '@/types/task'

function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

// removed unused addDays helper

function startOfWeek(d: Date) {
  const js = d.getDay() // 0..6
  const monIndex = js === 0 ? 6 : js - 1
  const x = new Date(d)
  x.setDate(d.getDate() - monIndex)
  x.setHours(0,0,0,0)
  return x
}

function weeksBetween(a: Date, b: Date) {
  const ms = startOfWeek(b).getTime() - startOfWeek(a).getTime()
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
}

function matchesSchedule(activity: Activity, date: Date): boolean {
  // End before date constraint
  if (activity.endBeforeType === 'date' && activity.selectedEndBeforeDate) {
    if (date > activity.selectedEndBeforeDate) return false
  }

  const raw = (activity.frequency ?? '')
  const freq = raw.toLowerCase().replace(/\s+/g, '')

  // Monthly selected days support
  if ((activity.selectedMonthDays?.length ?? 0) > 0) {
    if (!activity.selectedMonthDays!.includes(date.getDate())) return false
  }

  // Weeks interval (weekly cadence every N weeks)
  if ((activity.weeksInterval ?? 1) > 1 && activity.enabledAt) {
    const delta = weeksBetween(activity.enabledAt, date)
    if (delta % (activity.weeksInterval ?? 1) !== 0) return false
  }

  // Daily vs weekly selection (support common synonyms/localizations)
  if (
    freq.includes('daily') ||
    freq.includes('everyday') ||
    freq === 'ежедневно' ||
    freq === 'каждыйдень'
  ) return true

  // Weekdays / Weekends helpers
  if (freq.includes('weekday')) {
    const js = date.getDay()
    return js >= 1 && js <= 5
  }
  if (freq.includes('weekend')) {
    const js = date.getDay()
    return js === 0 || js === 6
  }

  const selected = activity.selectedDays ?? []
  if (selected.length) {
    // Flutter likely uses 1..7 (Mon..Sun). JS getDay() is 0..6 (Sun..Sat)
    const js = date.getDay() // 0..6
    const monBased = js === 0 ? 7 : js // 1..7 with Mon=1..Sun=7
    if (selected.includes(monBased) || selected.includes(js)) return true
    return false
  }

  // Fallback: if frequency hints weekly and no specific days, match same weekday as enabledAt
  if ((freq.includes('week') || freq.includes('weekly')) && activity.enabledAt) {
    return date.getDay() === activity.enabledAt.getDay()
  }

  // Fallback: if no recognizable frequency but activity is active and has no explicit day constraints, assume daily (Flutter often defaults to daily)
  if (!freq && (activity.selectedDays?.length ?? 0) === 0 && (activity.selectedMonthDays?.length ?? 0) === 0) {
    return true
  }

  return false
}

function buildTaskId(activityId: string, date: Date, hour?: number, minute?: number) {
  const ymd = toYMD(date)
  if (typeof hour === 'number' && typeof minute === 'number') {
    return `${activityId}-${ymd}-${pad2(hour)}${pad2(minute)}`
  }
  return `${activityId}-${ymd}`
}

/**
 * Generate planned TaskInstances for a specific date from active Activities.
 * This is client-side generation for display, not creating Firestore docs.
 */
export function generateTasksForDate(activities: Activity[], date: Date): TaskInstance[] {
  const items: TaskInstance[] = []
  const ymd = toYMD(date)
  
  for (const activity of activities) {
    if (!activity.activeStatus) continue
    if (!matchesSchedule(activity, date)) continue
    
    const id = buildTaskId(activity.id, date, activity.time?.hour, activity.time?.minute)
    items.push({
      id,
      activityId: activity.id,
      date: ymd,
      status: 'pending',
      updatedAt: new Date(),
      time: activity.time ? { hour: activity.time.hour, minute: activity.time.minute } : undefined,
    })
  }
  
  // Sort by time if available
  items.sort((a, b) => {
    const aH = a.time?.hour ?? 24
    const aM = a.time?.minute ?? 0
    const bH = b.time?.hour ?? 24
    const bM = b.time?.minute ?? 0
    return aH - bH || aM - bM
  })
  
  return items
}
