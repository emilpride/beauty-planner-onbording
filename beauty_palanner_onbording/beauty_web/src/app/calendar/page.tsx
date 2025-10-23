"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesSince } from '@/hooks/useUpdates'
import React from 'react'
import Link from 'next/link'
import type { Route } from 'next'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }

export default function CalendarPage() {
  const { user } = useAuth()
  const [month, setMonth] = React.useState(new Date())
  const from = startOfMonth(month)
  const { data } = useUpdatesSince(user?.uid, from)

  // Aggregate by date (YYYY-MM-DD)
  const byDate = React.useMemo(() => {
    const m = new Map<string, { completed: number; total: number }>()
    for (const u of data?.items ?? []) {
      const key = (u.date ?? '').slice(0, 10)
      const v = m.get(key) ?? { completed: 0, total: 0 }
      v.total += 1
      if (u.status === 'completed') v.completed += 1
      m.set(key, v)
    }
    return m
  }, [data])

  const days = getMonthDays(month)

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <section className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <button className="chip" onClick={() => setMonth(addMonths(month, -1))}>Prev</button>
            <div className="font-semibold">{month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
            <button className="chip" onClick={() => setMonth(addMonths(month, 1))}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <div key={d} className="opacity-60 text-sm">{d}</div>
            ))}
            {days.map((d) => {
              const key = isoDate(d)
              const stats = byDate.get(key)
              const pct = stats ? (stats.total ? stats.completed / stats.total : 0) : 0
              const href = (`/calendar/${key}`) as Route
              return (
                <Link key={key} href={href} className="p-2 rounded-md border hover:bg-base-200">
                  <div className="text-sm opacity-70">{d.getDate()}</div>
                  <div className="mt-1 h-2 rounded bg-gray-300" aria-label={`${Math.round(pct*100)}%`}>
                    <div className="h-2 rounded" style={{ width: `${pct*100}%`, background: 'rgb(var(--accent))' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </PageContainer>
    </Protected>
  )
}

function getMonthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = first.getDay() === 0 ? 6 : first.getDay() - 1 // Monday first
  const days: Date[] = []
  for (let i = 0; i < start; i++) days.push(new Date(first.getFullYear(), first.getMonth(), 1 - (start - i)))
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  for (let d = 1; d <= lastDate; d++) days.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (days.length % 7 !== 0) days.push(new Date(month.getFullYear(), month.getMonth() + 1, days.length % 7))
  return days
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

function isoDate(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}
