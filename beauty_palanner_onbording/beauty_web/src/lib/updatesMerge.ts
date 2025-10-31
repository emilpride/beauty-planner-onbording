import type { TaskInstance, TaskStatus } from '@/types/task'
import type { Activity } from '@/types/activity'

export function buildUpdateKey(i: Pick<TaskInstance, 'activityId' | 'date' | 'time'>): string {
  const hh = typeof i.time?.hour === 'number' ? String(i.time.hour).padStart(2, '0') : ''
  const mm = typeof i.time?.minute === 'number' ? String(i.time.minute).padStart(2, '0') : ''
  const t = hh && mm ? `${hh}${mm}` : ''
  return `${i.activityId}|${i.date}|${t}`
}

export function buildKeyWithoutTime(i: Pick<TaskInstance, 'activityId' | 'date'>): string {
  return `${i.activityId}|${i.date}|`
}

/**
 * Keep only the latest update for each (activityId, date, time?) key, using updatedAt.
 */
function statusRank(s: TaskStatus): number {
  // Higher is stronger: completed/skipped should dominate later pending/missed for same key
  if (s === 'completed') return 3
  if (s === 'skipped') return 3
  if (s === 'missed') return 2
  if (s === 'pending') return 1
  return 0
}

export function pickLatestUpdates(updates: TaskInstance[]): Map<string, TaskInstance> {
  const map = new Map<string, TaskInstance>()
  for (const u of updates) {
    const key = buildUpdateKey(u)
    const prev = map.get(key)
    if (!prev) {
      map.set(key, u)
      continue
    }
    const prevRank = statusRank(prev.status)
    const curRank = statusRank(u.status)
    if (curRank > prevRank) {
      map.set(key, u)
      continue
    }
    if (curRank === prevRank) {
      const prevTs = prev.updatedAt?.getTime?.() ?? 0
      const curTs = u.updatedAt?.getTime?.() ?? 0
      if (curTs >= prevTs) map.set(key, u)
    }
    // If curRank < prevRank, keep stronger prev (e.g., completed beats later pending)
  }
  return map
}

/**
 * Merge scheduled tasks with the latest updates and optional optimistic overrides.
 * - Unknown pending updates (activity removed) are dropped from the UI.
 * - One-time updates that don't match a scheduled task are added to the list.
 */
export function mergeScheduledWithUpdates(
  scheduled: TaskInstance[],
  updates: TaskInstance[],
  overrides?: Map<string, TaskStatus>,
  activities?: Activity[],
): TaskInstance[] {
  const latestByKey = pickLatestUpdates(updates)
  const knownIds = new Set((activities ?? []).map((a) => a.id))
  const out: TaskInstance[] = []

  // First, take scheduled tasks and override them when we have an update for the same key
  for (const t of scheduled) {
    const keyExact = buildUpdateKey(t)
    const keyNoTime = buildKeyWithoutTime(t)
    const upd = latestByKey.get(keyExact) || latestByKey.get(keyNoTime)
    out.push(upd ? { ...t, ...upd } : t)
  }

  // Then add one-time updates that don't have a matching scheduled key (rare but supported)
  for (const u of updates) {
    const key = buildUpdateKey(u)
    const keyNoTime = buildKeyWithoutTime(u)
    const hasScheduled = out.some((x) => buildUpdateKey(x) === key || buildKeyWithoutTime(x) === keyNoTime)
    if (!hasScheduled) out.push(u)
  }

  // Apply optimistic overrides
  if (overrides && overrides.size) {
    for (let i = 0; i < out.length; i++) {
      const id = out[i].id
      if (overrides.has(id)) {
        out[i] = { ...out[i], status: overrides.get(id)! }
      }
    }
  }

  // Drop orphan pending updates (no known activity)
  const filtered = out.filter((it) => it.status !== 'pending' || knownIds.has(it.activityId))

  // Sort by time for display
  filtered.sort((a, b) => {
    const aH = a.time?.hour ?? 24
    const aM = a.time?.minute ?? 0
    const bH = b.time?.hour ?? 24
    const bM = b.time?.minute ?? 0
    return aH - bH || aM - bM
  })

  return filtered
}
