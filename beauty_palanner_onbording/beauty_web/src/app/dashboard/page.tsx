"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { CalendarPanel } from '@/components/dashboard/CalendarPanel'
import { ProgressRings } from '@/components/dashboard/ProgressRings'
import { ProceduresList } from '@/components/dashboard/ProceduresList'
import { ProfileCard } from '@/components/dashboard/ProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesForDate, useUpdatesInDateRange, useUpdatesSince } from '@/hooks/useUpdates'
import { useState } from 'react'

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function filterByTime<T extends { time?: { hour: number } }>(items: T[], tf: 'all' | 'morning' | 'afternoon' | 'evening') {
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
  const yesterday = addDays(today, -1)
  const past30 = addDays(today, -30)

  const { data: todayData } = useUpdatesForDate(user?.uid, today)
  const { data: pastRange } = useUpdatesInDateRange(user?.uid, addDays(today, -14), yesterday)
  const { data: nextRange } = useUpdatesInDateRange(user?.uid, today, addDays(today, 14))
  const { data: monthRange } = useUpdatesSince(user?.uid, past30)

  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all')
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Overall'>('Daily')

  const plannedItems = filterByTime((todayData?.items ?? []).filter((t) => t.status === 'pending'), timeFilter)
  const completedItems = filterByTime((pastRange?.items ?? []).filter((t) => t.status === 'completed'), timeFilter)
  const skippedItems = filterByTime((nextRange?.items ?? []).filter((t) => t.status === 'missed' || t.status === 'skipped'), timeFilter)

  return (
    <Protected>
      <PageContainer>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,420px),1fr,minmax(320px,400px)] items-start">
          {/* Left: Procedures List */}
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

            <ProceduresList />
          </div>

          {/* Center: Progress Rings */}
          <div className="flex flex-col items-center justify-start pt-2">
            <div className="space-y-6 w-full max-w-[500px]">
              {/* Period selector above Activities */}
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

              <div className="flex items-baseline justify-between px-4">
                <h2 className="text-xl font-bold text-text-primary">Activities</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">16</span>
                  <span className="text-base text-text-secondary">/24</span>
                </div>
              </div>

              {/* Rings */}
              <div className="flex justify-center py-6">
                <div className="relative p-4">
                  <ProgressRings
                    size={270}
                    rings={[
                      { pct: 0.50, color: '#2AC4CF', width: 18 },
                      { pct: 0.75, color: '#2ACF56', width: 18 },
                      { pct: 0.40, color: '#FE7E07', width: 18 },
                      { pct: 0.90, color: '#A162F7', width: 18 },
                    ]}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-6 px-4">
                {[
                  { color: '#2AC4CF', label: 'Skin Care', pct: '50' },
                  { color: '#2ACF56', label: 'Hair Care', pct: '75' },
                  { color: '#FE7E07', label: 'Mental', pct: '40' },
                  { color: '#A162F7', label: 'Physics', pct: '90' },
                ].map((leg) => (
                  <div key={leg.label} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: leg.color }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">{leg.label}</div>
                      <div className="text-xs text-text-secondary">{leg.pct}/100%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Calendar only (profile already in header) */}
          <div className="space-y-4 xl:sticky xl:top-4">
            <CalendarPanel />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
