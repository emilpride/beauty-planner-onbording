"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { TaskList } from '@/components/dashboard/TaskList'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesForDate, useUpdatesInDateRange, useUpdatesSince } from '@/hooks/useUpdates'
import { useActivities } from '@/hooks/useActivities'
import { useMemo, useState } from 'react'

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

export default function DashboardPage() {
  const { user } = useAuth()
  const today = new Date()
  const yesterday = addDays(today, -1)
  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 6)
  const past30 = addDays(today, -30)

  const { data: todayData } = useUpdatesForDate(user?.uid, today)
  const { data: pastRange } = useUpdatesInDateRange(user?.uid, addDays(today, -14), yesterday)
  const { data: nextRange } = useUpdatesInDateRange(user?.uid, today, addDays(today, 14))
  const { data: weekRange } = useUpdatesInDateRange(user?.uid, weekStart, weekEnd)
  const { data: monthRange } = useUpdatesSince(user?.uid, past30)
  const { data: activities } = useActivities(user?.uid)

  // UI state: time-of-day filter + period segment
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all')
  const [segment, setSegment] = useState<'Daily' | 'Weekly' | 'Overall'>('Daily')

  const todayItems = filterByTime((todayData?.items ?? []).filter((t) => t.status === 'pending'), timeFilter)
  const overdueItems = filterByTime((pastRange?.items ?? []).filter((t) => t.status === 'pending' || t.status === 'missed'), timeFilter)
  const upcomingItems = filterByTime((nextRange?.items ?? []).filter((t) => t.status === 'pending'), timeFilter)

  // Category progress based on segment selection
  const periodItems = useMemo(() => {
    if (segment === 'Daily') return todayData?.items ?? []
    if (segment === 'Weekly') return weekRange?.items ?? []
    return monthRange?.items ?? []
  }, [segment, todayData?.items, weekRange?.items, monthRange?.items])

  const categoryProgress = useMemo(() => computeCategoryProgress(periodItems, activities ?? []), [periodItems, activities])

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Filters & Segments */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {(['all','morning','afternoon','evening'] as const).map((k) => (
              <button
                key={k}
                className={`chip ${timeFilter === k ? 'chip-active' : ''}`}
                onClick={() => setTimeFilter(k)}
                aria-pressed={timeFilter === k}
              >{capitalize(k)}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-md border p-1">
            {(['Daily','Weekly','Overall'] as const).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded ${segment === p ? 'bg-[rgb(var(--accent))] text-white' : 'opacity-80'}`}
                onClick={() => setSegment(p)}
                aria-pressed={segment === p}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Category progress cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryProgress.map((c) => (
            <section key={c.category} className="card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold truncate" title={c.category}>{c.category}</div>
                <div className="text-sm opacity-60">{Math.round(c.pct*100)}%</div>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 rounded" style={{ width: `${c.pct*100}%`, background: 'rgb(var(--accent))' }} />
              </div>
              <div className="text-xs opacity-60 mt-1">{c.completed}/{c.total} completed</div>
            </section>
          ))}
          {categoryProgress.length === 0 && (
            <section className="card p-3 text-sm opacity-60">No tasks in this period</section>
          )}
        </div>

        {/* Lists */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TaskList title="Today" items={todayItems} />
          </div>
          <div className="lg:col-span-1">
            <TaskList title="Overdue" items={overdueItems} />
          </div>
          <div className="lg:col-span-1">
            <TaskList title="Upcoming" items={upcomingItems} />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}

function startOfWeek(d: Date) {
  const day = d.getDay() === 0 ? 7 : d.getDay() // Monday=1..Sunday=7
  const diff = day - 1
  const x = new Date(d)
  x.setDate(d.getDate() - diff)
  x.setHours(0,0,0,0)
  return x
}

function filterByTime<T extends { time?: { hour: number } }>(items: T[], tf: 'all'|'morning'|'afternoon'|'evening') {
  if (tf === 'all') return items
  return items.filter((t) => {
    const h = t.time?.hour
    if (typeof h !== 'number') return false
    if (tf === 'morning') return h < 12 // 0-11
    if (tf === 'afternoon') return h >= 12 && h < 17
    return h >= 17
  })
}

function computeCategoryProgress(items: { activityId: string; status: string }[], activities: { id: string; category?: string }[]) {
  const byId = new Map(activities.map((a) => [a.id, a]))
  const agg = new Map<string, { completed: number; total: number }>()
  for (const it of items) {
    const a = byId.get(it.activityId)
    const category = (a?.category || 'Other').trim() || 'Other'
    const entry = agg.get(category) ?? { completed: 0, total: 0 }
    entry.total += 1
    if (it.status === 'completed') entry.completed += 1
    agg.set(category, entry)
  }
  return Array.from(agg.entries()).map(([category, v]) => ({ category, completed: v.completed, total: v.total, pct: v.total ? v.completed / v.total : 0 }))
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
