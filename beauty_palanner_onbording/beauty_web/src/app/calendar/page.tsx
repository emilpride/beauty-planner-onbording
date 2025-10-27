"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { CalendarPanel } from '@/components/dashboard/CalendarPanel'
import { CalendarStrip } from '@/components/dashboard/CalendarStrip'
import { useActivities } from '@/hooks/useActivities'
import { useAuth } from '@/hooks/useAuth'
import { useScheduledTasks } from '@/hooks/useScheduledTasks'
import { useUpdatesForDate } from '@/hooks/useUpdates'
import { setTaskStatus } from '@/lib/taskActions'
import type { TaskInstance, TaskStatus } from '@/types/task'
import type { Activity } from '@/types/activity'
import Link from 'next/link'
import { getActivityMeta } from '@/data/activityMeta'
import { useMemo, useState } from 'react'

export default function CalendarPage() {
  const { user } = useAuth()
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'skin' | 'hair' | 'physical' | 'mental'>('all')
  const [overrides, setOverrides] = useState<Map<string, TaskStatus>>(new Map())

  const { data: activities } = useActivities(user?.uid)
  const scheduledTasks = useScheduledTasks(activities, selectedDate)
  const { data: dateData } = useUpdatesForDate(user?.uid, selectedDate)

  const allTasks = useMemo(() => {
    const map = new Map<string, TaskInstance>()
    for (const task of scheduledTasks) {
      map.set(task.id, task)
    }
    const updates = dateData?.items ?? []
    for (const update of updates) {
      if (map.has(update.id)) {
        map.set(update.id, update)
        continue
      }
      const match = Array.from(map.values()).find((existing) => {
        if (existing.activityId !== update.activityId) return false
        if (existing.date !== update.date) return false
        const updateHasTime = typeof update.time?.hour === 'number' && typeof update.time?.minute === 'number'
        const existingHasTime = typeof existing.time?.hour === 'number' && typeof existing.time?.minute === 'number'
        if (updateHasTime && existingHasTime) {
          return existing.time!.hour === update.time!.hour && existing.time!.minute === update.time!.minute
        }
        if (!updateHasTime) return true
        return false
      })
      if (match) {
        map.set(match.id, update)
      } else {
        map.set(update.id, update)
      }
    }
    for (const [id, status] of overrides.entries()) {
      const item = map.get(id)
      if (item) {
        map.set(id, { ...item, status })
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const aH = a.time?.hour ?? 24
      const aM = a.time?.minute ?? 0
      const bH = b.time?.hour ?? 24
      const bM = b.time?.minute ?? 0
      return aH - bH || aM - bM
    })
  }, [scheduledTasks, dateData?.items, overrides])

  const activityMap = useMemo(() => new Map((activities ?? []).map((a) => [a.id, a])), [activities])

  const totalToday = allTasks.length
  const totalPlanned = scheduledTasks.length
  const totalCompleted = allTasks.filter((t) => t.status === 'completed').length
  const totalSkipped = allTasks.filter((t) => t.status === 'skipped' || t.status === 'missed').length

  async function handleStatusChange(task: TaskInstance, status: TaskStatus) {
    if (!user?.uid) return
    setOverrides((prev) => new Map(prev).set(task.id, status))
    try {
      await setTaskStatus(user.uid, task, status)
    } catch (err) {
      console.error('Failed to update status', err)
      setOverrides((prev) => {
        const next = new Map(prev)
        next.delete(task.id)
        return next
      })
    }
  }

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Protected>
      <PageContainer>
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
            <p className="text-sm text-text-secondary">Pick a date to review and manage its scheduled procedures.</p>
          </header>

          <div className="space-y-4">
            <div className="lg:hidden">
              <CalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                activities={activities ?? []}
              />
            </div>
            <CalendarPanel
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              activities={activities ?? []}
              className="w-full max-w-5xl mx-auto"
            />
          </div>

          <section className="space-y-4 w-full max-w-5xl mx-auto">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Procedures on {dateLabel}</h2>
                <p className="text-sm text-text-secondary">Complete, skip, or start each procedure directly from the list.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary">
                <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Total: <b className="text-text-primary">{totalToday}</b></span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Planned: <b className="text-text-primary">{totalPlanned}</b></span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Done: <b className="text-text-primary">{totalCompleted}</b></span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Skipped: <b className="text-text-primary">{totalSkipped}</b></span>
              </div>
            </header>

            <CompactProceduresList
              tasks={allTasks}
              activities={activities ?? []}
              activityMap={activityMap}
              onComplete={(t) => handleStatusChange(t, 'completed')}
              onSkip={(t) => handleStatusChange(t, 'skipped')}
              onUndo={(t) => handleStatusChange(t, 'pending')}
            />
          </section>
        </div>
      </PageContainer>
    </Protected>
  )
}

function CompactProceduresList({
  tasks,
  activities,
  activityMap,
  onComplete,
  onSkip,
  onUndo,
}: {
  tasks: TaskInstance[]
  activities: Activity[]
  activityMap: Map<string, Activity>
  onComplete: (task: TaskInstance) => void
  onSkip: (task: TaskInstance) => void
  onUndo: (task: TaskInstance) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-10 text-center text-sm text-text-secondary">
        No procedures scheduled for this day yet.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface shadow-sm overflow-hidden">
      <div className="divide-y divide-border-subtle/60">
        {tasks.map((task) => {
          const activity = activityMap.get(task.activityId) || activities.find((a) => a.id === task.activityId)
          const meta = getActivityMeta(activity?.id || task.activityId, activity?.name)
          const time = formatTime(task.time?.hour, task.time?.minute)
          const status = task.status === 'missed' ? 'skipped' : task.status
          const statusStyles = getStatusStyles(status)
          const color = activity?.color || meta.primary || '#A385E9'
          return (
            <div key={task.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle/70"
                  style={{ backgroundColor: `${color}1A` }}>
                  {meta.iconPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={meta.iconPath} alt="" className="h-5 w-5 icon-auto" />
                  ) : (
                    <span className="text-sm font-semibold" style={{ color }}>{(activity?.name || meta.name || 'P').charAt(0)}</span>
                  )}
                </span>
                <div>
                  <div className="text-sm font-semibold text-text-primary break-words">{activity?.name || meta.name || 'Procedure'}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    {time && <span className="rounded-full border border-border-subtle px-2 py-0.5">{time}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles.badge}`}>{statusStyles.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href={{ pathname: '/procedure', query: { id: task.activityId, date: task.date } }}
                  className="rounded-full border border-border-subtle bg-surface-hover px-3 py-1 font-medium text-text-primary transition hover:border-[#A385E9]"
                >
                  Start
                </Link>
                {task.status === 'pending' && (
                  <>
                    <button
                      className="rounded-full bg-emerald-500 px-3 py-1 font-medium text-white transition hover:bg-emerald-600"
                      onClick={() => onComplete(task)}
                    >
                      Mark done
                    </button>
                    <button
                      className="rounded-full border border-border-subtle px-3 py-1 font-medium text-text-primary transition hover:border-[#A385E9]"
                      onClick={() => onSkip(task)}
                    >
                      Skip
                    </button>
                  </>
                )}
                {(task.status === 'completed' || task.status === 'skipped' || task.status === 'missed') && (
                  <button
                    className="rounded-full border border-border-subtle px-3 py-1 font-medium text-text-primary transition hover:border-[#A385E9]"
                    onClick={() => onUndo(task)}
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(hour?: number, minute?: number) {
  if (typeof hour !== 'number' || typeof minute !== 'number') return ''
  const dt = new Date()
  dt.setHours(hour, minute, 0, 0)
  return dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function getStatusStyles(status: TaskStatus | 'skipped') {
  switch (status) {
    case 'completed':
      return { label: 'Done', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
    case 'skipped':
      return { label: 'Skipped', badge: 'bg-rose-100 text-rose-700 border border-rose-200' }
    default:
      return { label: 'Planned', badge: 'bg-surface-hover text-text-secondary border border-border-subtle' }
  }
}
