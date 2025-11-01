import { describe, it, expect } from 'vitest'
import type { TaskInstance } from '../../types/task'
import { mergeScheduledWithUpdates } from '../updatesMerge'

function makeTask(partial: Partial<TaskInstance>): TaskInstance {
  return {
    id: partial.id || 'id',
    activityId: partial.activityId || 'A',
    date: partial.date || '2025-10-31',
    status: partial.status || 'pending',
    updatedAt: partial.updatedAt || new Date(0),
    time: partial.time,
  }
}

describe('mergeScheduledWithUpdates', () => {
  it('keeps latest status when multiple updates exist for same key', () => {
    const scheduled = [
      makeTask({ id: 'A-2025-10-31', activityId: 'A', date: '2025-10-31' }),
    ]
    const older = makeTask({ id: 'random-1', activityId: 'A', date: '2025-10-31', status: 'pending', updatedAt: new Date(1) })
    const newer = makeTask({ id: 'random-2', activityId: 'A', date: '2025-10-31', status: 'completed', updatedAt: new Date(2) })

    const merged = mergeScheduledWithUpdates(scheduled, [older, newer], new Map(), [])
    expect(merged).toHaveLength(1)
    expect(merged[0].status).toBe('completed')
  })

  it('adds one-time updates not in scheduled list', () => {
    const scheduled: TaskInstance[] = []
    const upd = makeTask({ id: 'one-1', activityId: 'B', date: '2025-10-31', status: 'completed', updatedAt: new Date(5) })
    const merged = mergeScheduledWithUpdates(scheduled, [upd], new Map(), [])
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('one-1')
  })

  it('matches legacy update without time to scheduled with time', () => {
    const scheduled = [
      makeTask({ id: 'A-2025-10-31-0600', activityId: 'A', date: '2025-10-31', time: { hour: 6, minute: 0 } }),
    ]
    // Legacy update missing time, but later in time than pending
    const upd = makeTask({ id: 'random-3', activityId: 'A', date: '2025-10-31', status: 'completed', updatedAt: new Date(10) })
    const merged = mergeScheduledWithUpdates(scheduled, [upd], new Map(), [])
    expect(merged).toHaveLength(1)
    expect(merged[0].status).toBe('completed')
  })

  it('prefers completed over later pending for same key', () => {
    const scheduled = [
      makeTask({ id: 'A-2025-10-31', activityId: 'A', date: '2025-10-31' }),
    ]
    const completedOlder = makeTask({ id: 'upd1', activityId: 'A', date: '2025-10-31', status: 'completed', updatedAt: new Date(1000) })
    const pendingLater = makeTask({ id: 'upd2', activityId: 'A', date: '2025-10-31', status: 'pending', updatedAt: new Date(2000) })
    const merged = mergeScheduledWithUpdates(scheduled, [completedOlder, pendingLater], new Map(), [])
    expect(merged[0].status).toBe('completed')
  })

  it('does not downgrade completed to later pending for same key', () => {
    const scheduled = [
      makeTask({ id: 'A-2025-10-31', activityId: 'A', date: '2025-10-31' }),
    ]
    const completed = makeTask({ id: 'u1', activityId: 'A', date: '2025-10-31', status: 'completed', updatedAt: new Date(10) })
    const laterPending = makeTask({ id: 'u2', activityId: 'A', date: '2025-10-31', status: 'pending', updatedAt: new Date(20) })
    const merged = mergeScheduledWithUpdates(scheduled, [completed, laterPending], new Map(), [])
    expect(merged).toHaveLength(1)
    expect(merged[0].status).toBe('completed')
  })
})
