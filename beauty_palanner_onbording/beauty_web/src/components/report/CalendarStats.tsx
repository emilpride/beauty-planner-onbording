"use client"

import { ReportCard } from '@/components/report/ReportCard'
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
    <ReportCard>
      <GraphHeader title="Calendar Stats" selected={monthLabel} onChange={onMonthChange} items={monthOptions} />
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-2 text-center text-sm text-zinc-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((d) => {
            const key = toKey(d)
            const rate = stats[key]
            const inMonth = d.getMonth() === monthDate.getMonth()
            const isToday = sameDay(d, new Date())
            return (
              <div key={key} className="flex h-10 w-10 items-center justify-center place-self-center">
                <Ring rate={rate} highlight={isToday} faded={!inMonth} label={String(d.getDate())} />
              </div>
            )
          })}
        </div>
      </div>
    </ReportCard>
  )
}

function Ring({ rate, label, highlight, faded }: { rate: number | undefined; label: string; highlight?: boolean; faded?: boolean }) {
  const r = typeof rate === 'number' ? Math.max(-1, Math.min(1, rate)) : -1
  const pct = r < 0 ? 0 : r
  const circumference = 2 * Math.PI * 16
  const progress = circumference * pct
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className={faded ? 'opacity-70' : ''}>
      <circle cx="20" cy="20" r="16" stroke="#EBEDFC" strokeWidth="3" fill="none" />
      {r >= 0 && (
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="#7C4DFF"
          strokeWidth={highlight ? 4 : 3}
          fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          transform="rotate(-90 20 20)"
          strokeLinecap="round"
        />
      )}
      <text x="20" y="22" textAnchor="middle" fontSize="12" fontWeight={highlight ? 700 : 500} fill={highlight ? '#7C4DFF' : '#111'}>
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
  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(first)
    d.setDate(first.getDate() - (firstWeekday - i))
    days.push(d)
  }
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(first)
    d.setDate(first.getDate() + i)
    days.push(d)
  }
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
