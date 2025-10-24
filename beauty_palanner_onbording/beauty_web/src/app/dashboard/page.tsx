"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { ProgressRings } from '@/components/dashboard/ProgressRings'
import { ProceduresList } from '@/components/dashboard/ProceduresList'
import { CalendarPanel } from '@/components/dashboard/CalendarPanel'
import { useActivities } from '@/hooks/useActivities'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesForDate, useUpdatesInDateRange } from '@/hooks/useUpdates'
import { useScheduledTasks } from '@/hooks/useScheduledTasks'
import { useMemo, useState } from 'react'
import type { Activity } from '@/types/activity'
import type { TaskInstance } from '@/types/task'
import type { TaskStatus } from '@/types/task'
import { setTaskStatus } from '@/lib/taskActions'

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

interface TimeItem {
  time?: { hour?: number }
}

function filterByTime<T extends TimeItem>(items: T[], tf: 'all' | 'morning' | 'afternoon' | 'evening') {
  if (tf === 'all') return items
  return items.filter((t) => {
    const h = t.time?.hour
    if (typeof h !== 'number') return false
    if (tf === 'morning') return h < 12
    if (tf === 'afternoon') return h >= 12 && h < 17
    return h >= 17
  })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all')
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Overall'>('Daily')
  const [calendarCategoryFilter, setCalendarCategoryFilter] = useState<'all' | 'skin' | 'hair' | 'physical' | 'mental'>('all')
  const [overrides, setOverrides] = useState<Map<string, TaskStatus>>(new Map())

  // Fetch activities and generate scheduled tasks for selected date (like Flutter's loadTasksForToday)
  const { data: activities } = useActivities(user?.uid)
  const scheduledTasks = useScheduledTasks(activities, selectedDate)

  // Fetch actual updates for this date (to merge status/one-time tasks) and ranges (for rings)
  const { data: dateData } = useUpdatesForDate(user?.uid, selectedDate)
  const { data: weekData } = useUpdatesInDateRange(user?.uid, addDays(selectedDate, -6), addDays(selectedDate, 0))
  const { data: monthData } = useUpdatesInDateRange(user?.uid, addDays(selectedDate, -29), addDays(selectedDate, 0))

  // Merge scheduled tasks with Updates for the day: Updates override status/time or add one‑time tasks
  const allTodayTasks: TaskInstance[] = useMemo(() => {
    const map = new Map<string, TaskInstance>()
    for (const t of scheduledTasks) {
      map.set(t.id, t)
    }
    const updates = dateData?.items ?? []
    for (const u of updates) {
      // If ids align, overwrite; otherwise, try to merge by composite key activityId+date+time
      const hasById = map.has(u.id)
      if (hasById) {
        map.set(u.id, u)
      } else {
        const key = `${u.activityId}-${u.date}-${u.time?.hour ?? 'xx'}${u.time?.minute ?? 'xx'}`
        const found = Array.from(map.values()).find(
          (x) => x.activityId === u.activityId && x.date === u.date && ((x.time?.hour ?? -1) === (u.time?.hour ?? -2)) && ((x.time?.minute ?? -1) === (u.time?.minute ?? -2))
        )
        if (found) {
          map.set(found.id, u)
        } else {
          // One-time or edited task – include from Updates
          map.set(u.id, u)
        }
      }
    }
    // Sort by time for display
    return Array.from(map.values()).sort((a, b) => {
      const aH = a.time?.hour ?? 24
      const aM = a.time?.minute ?? 0
      const bH = b.time?.hour ?? 24
      const bM = b.time?.minute ?? 0
      return aH - bH || aM - bM
    })
    // Apply local overrides (optimistic UI)
    for (const [id, st] of overrides.entries()) {
      const item = map.get(id)
  if (item) map.set(id, { ...item, status: st } as TaskInstance)
    }
    return Array.from(map.values())
  }, [scheduledTasks, dateData?.items, overrides])

  // Filter procedures by time for LEFT panel
  const plannedItems = filterByTime(allTodayTasks.filter((t) => t.status === 'pending'), timeFilter)
  const completedItems = filterByTime(allTodayTasks.filter((t) => t.status === 'completed'), timeFilter)
  const skippedItems = filterByTime(allTodayTasks.filter((t) => t.status === 'missed' || t.status === 'skipped'), timeFilter)

  // Get window items based on selected period for rings calculation
  function getPeriodWindow() {
    if (period === 'Daily') {
      return allTodayTasks
    }
    if (period === 'Weekly') {
      return weekData?.items ?? []
    }
    return monthData?.items ?? []
  }
  const windowItems = getPeriodWindow()

  // Calculate totals for status-based legend (displayed with period selector) - used in legend below
  const totalCompleted = windowItems.filter((i: TaskInstance) => i.status === 'completed').length
  const totalSkippedMissed = windowItems.filter((i: TaskInstance) => i.status === 'missed' || i.status === 'skipped').length
  const totalPending = windowItems.filter((i: TaskInstance) => i.status === 'pending').length

  // Category-based progress rings (Skin, Mental, Hair)
  const activityById = useMemo(() => new Map((activities ?? []).map(a => [a.id, a as Activity])), [activities])

  async function handleStatusChange(task: TaskInstance, status: TaskStatus) {
    if (!user?.uid) return
    // optimistic
    setOverrides(prev => new Map(prev).set(task.id, status))
    try {
      await setTaskStatus(user.uid, task, status)
    } catch (e) {
      // rollback on error
      setOverrides(prev => {
        const next = new Map(prev)
        next.delete(task.id)
        return next
      })
      console.error('Failed to set status', e)
    }
  }
  
  function getCategoryKey(a?: Activity): 'skin' | 'hair' | 'physical' | 'mental' | 'other' {
    const c = (a?.category || '').toLowerCase()
    if (c === 'skin') return 'skin'
    if (c === 'hair') return 'hair'
    if (c === 'physical' || c === 'physical health') return 'physical'
    if (c === 'mental' || c === 'mental wellness') return 'mental'
    return 'other'
  }

  // Calculate category-based progress
  type CategoryAcc = Record<string, { total: number; completed: number }>
  const categoryAcc: CategoryAcc = { skin: { total: 0, completed: 0 }, mental: { total: 0, completed: 0 }, hair: { total: 0, completed: 0 }, physical: { total: 0, completed: 0 } }
  
  for (const item of windowItems) {
    const activity = activityById.get(item.activityId)
    const categoryKey = getCategoryKey(activity)
    if (!(categoryKey in categoryAcc)) continue
    
    // Count all non-missed items as "total"
    if (item.status === 'pending' || item.status === 'completed' || item.status === 'skipped') {
      (categoryAcc as Record<string, { total: number; completed: number }>)[categoryKey].total++
    }
    
    // Only count completed items as "completed"
    if (item.status === 'completed') {
      (categoryAcc as Record<string, { total: number; completed: number }>)[categoryKey].completed++
    }
  }

  const getPct = (n: number, d: number) => (d > 0 ? Math.max(0, Math.min(1, n / d)) : 0)
  
  const rings = [
    { key: 'skin', pct: getPct(categoryAcc.skin.completed, categoryAcc.skin.total), color: '#0080FF', width: 18 },
    { key: 'mental', pct: getPct(categoryAcc.mental.completed, categoryAcc.mental.total), color: '#FFAE00', width: 18 },
    { key: 'hair', pct: getPct(categoryAcc.hair.completed, categoryAcc.hair.total), color: '#00C853', width: 18 },
  ]

  return (
    <Protected>
      <PageContainer>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,420px),1fr,minmax(320px,400px)] items-start">
          {/* Left: Procedures (Activities) with time filters */}
          <div className="space-y-4">
            {/* Time of day filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'morning', 'afternoon', 'evening'] as const).map((k) => (
                <button
                  key={k}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    timeFilter === k ? 'bg-[#A385E9] text-white' : 'bg-surface border border-border-strong text-text-primary hover:bg-surface-hover'
                  }`}
                  onClick={() => setTimeFilter(k)}
                >
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>

            <ProceduresList 
              planned={plannedItems} 
              completed={completedItems} 
              skipped={skippedItems} 
              activities={activities ?? []}
              onComplete={(t) => handleStatusChange(t, 'completed')}
              onSkip={(t) => handleStatusChange(t, 'skipped')}
              onUndo={(t) => handleStatusChange(t, 'pending')}
            />
          </div>

          {/* Center: Category-based Progress Rings with legend and period selector */}
          <div className="flex flex-col items-center justify-start pt-2">
            <div className="space-y-6 w-full max-w-[500px]">
              {/* Period selector */}
              <div className="flex gap-2 justify-center">
                {(['Daily', 'Weekly', 'Overall'] as const).map((p) => (
                  <button
                    key={p}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                      period === p 
                        ? 'bg-[#A385E9] text-white shadow-md' 
                        : 'bg-surface text-text-primary border border-border-subtle hover:border-[#A385E9]'
                    }`}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              {/* Progress rings */}
              <div className="flex flex-col items-center gap-6">
                <ProgressRings size={270} rings={rings} />
                
                {/* Legend showing category progress (not status) */}
                <div className="grid grid-cols-2 gap-4 text-sm w-full px-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#0080FF]" />
                    <span>Skin</span>
                    <strong className="ml-auto">{categoryAcc.skin.completed}/{categoryAcc.skin.total}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#FFAE00]" />
                    <span>Mental</span>
                    <strong className="ml-auto">{categoryAcc.mental.completed}/{categoryAcc.mental.total}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#00C853]" />
                    <span>Hair</span>
                    <strong className="ml-auto">{categoryAcc.hair.completed}/{categoryAcc.hair.total}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#FF6B6B]" />
                    <span>Physical</span>
                    <strong className="ml-auto">{categoryAcc.physical.completed}/{categoryAcc.physical.total}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Calendar with category filter and date selection */}
          <div className="space-y-4 xl:sticky xl:top-4">
            <CalendarPanel 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              category={calendarCategoryFilter}
              onCategoryChange={setCalendarCategoryFilter}
              activities={activities ?? []}
            />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
