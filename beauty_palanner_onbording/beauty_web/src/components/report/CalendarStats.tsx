"use client"

import { GraphHeader } from '@/components/report/GraphHeader'
import type { CalendarStats } from '@/lib/report'

export function CalendarStatsCard({
  monthLabel,
  onMonthChange,
  stats,
  monthDate,
}: {
  monthLabel: string
  onMonthChange: (label: string) => void
  stats: CalendarStats
  monthDate: Date
}) {
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  })

  const days = getCalendarDays(monthDate)

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border-subtle bg-surface p-4 shadow-md">
      <GraphHeader title="Calendar Stats" selected={monthLabel} onChange={onMonthChange} items={monthOptions} />
      
      {/* Divider */}
  <div className="h-px w-full bg-border-subtle" />
      
      <div className="w-full">
        {/* Weekday headers */}
        <div className="mb-3 flex justify-center gap-[11px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="w-[42px] text-center text-sm font-medium text-text-secondary">
              {d}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-[11px]">
          {days.map((d) => {
            const key = toKey(d)
            const rate = stats[key]
            const inMonth = d.getMonth() === monthDate.getMonth()
            const isToday = sameDay(d, new Date())
            return (
              <div key={key} className="flex items-center justify-center">
                <Ring rate={rate} highlight={isToday} faded={!inMonth} label={String(d.getDate())} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Ring({ rate, label, highlight, faded }: { rate: number | undefined; label: string; highlight?: boolean; faded?: boolean }) {
  const r = typeof rate === 'number' ? Math.max(-1, Math.min(1, rate)) : -1
  const pct = r < 0 ? 0 : r
  const circumference = 2 * Math.PI * 16
  const progress = circumference * pct

  const secondary = 'rgb(var(--text-secondary))'
  const primary = 'rgb(var(--text-primary))'
  const accent = 'rgb(var(--accent))'

  // Determine text color based on completion rate
  let textColor = secondary
  if (r >= 0.7) textColor = primary
  if (r >= 1) textColor = accent
  if (highlight) textColor = accent

  return (
    <svg viewBox="0 0 42 42" width="42" height="42" className={faded ? 'opacity-40' : ''}>
      {/* Background ring */}
      <circle cx="21" cy="21" r="16" stroke="rgb(var(--border-subtle))" strokeWidth="3" fill="none" />
      
      {/* Progress ring */}
      {r >= 0 && (
        <circle
          cx="21"
          cy="21"
          r="16"
          stroke={accent}
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          transform="rotate(-90 21 21)"
          strokeLinecap="round"
        />
      )}
      
      {/* Day number */}
      <text 
        x="21" 
        y="25" 
        textAnchor="middle" 
        fontSize="16" 
        fontWeight="500"
        fill={textColor}
      >
        {label}
      </text>
    </svg>
  )
}

function getCalendarDays(displayMonth: Date): Date[] {
  const first = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate()
  const firstWeekday = first.getDay() // 0..6
  const days: Date[] = []
  
  // Add padding days from previous month (start from Monday)
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1
  for (let i = 0; i < mondayOffset; i++) {
    const d = new Date(first)
    d.setDate(first.getDate() - (mondayOffset - i))
    days.push(d)
  }
  
  // Add days of current month
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(first)
    d.setDate(first.getDate() + i)
    days.push(d)
  }
  
  // Add padding days from next month to complete grid
  const remaining = 42 - days.length
  const last = days[days.length - 1]
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(last)
    d.setDate(last.getDate() + i)
    days.push(d)
  }
  return days
}

function toKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
