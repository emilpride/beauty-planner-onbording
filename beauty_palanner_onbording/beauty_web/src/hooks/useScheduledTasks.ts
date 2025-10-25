import { useMemo } from 'react'
import type { Activity } from '@/types/activity'
import { generateTasksForDate } from '@/lib/clientTaskGenerator'

/**
 * Generate TaskInstances for a specific date based on Activity schedules.
 * This matches Flutter's loadTasksForToday() logic where tasks are generated
 * from Activities, not queried from Updates collection.
 * 
 * Returns "planned" tasks (status=pending) that SHOULD happen today based on schedule.
 * Actual completion status should be merged from Updates collection separately.
 */
export function useScheduledTasks(activities: Activity[] | undefined, date: Date) {
  return useMemo(() => {
    if (!activities) return []
    return generateTasksForDate(activities, date)
  }, [activities, date])
}
