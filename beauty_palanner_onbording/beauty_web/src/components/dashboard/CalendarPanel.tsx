"use client"

import { useMemo, useState } from 'react'
import { Select } from '@/components/common/Select'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startIdx = first.getDay()
  const daysInMonth = last.getDate()
  const rows: (number | null)[][] = []
  let day = 1 - startIdx
  for (let r = 0; r < 6; r++) {
    const row: (number | null)[] = []
    for (let c = 0; c < 7; c++) {
      if (day < 1 || day > daysInMonth) row.push(null)
      else row.push(day)
      day++
    }
    rows.push(row)
  }
  return rows
}

export function CalendarPanel() {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const grid = useMemo(() => monthMatrix(ym.y, ym.m), [ym])
  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })), []
  )

  return (
    <aside className="rounded-lg bg-surface p-4 w-full max-w-[382px] border border-border-subtle shadow-sm">
      {/* Filters row */}
      <div className="flex items-center justify-between gap-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs font-bold">Filter by:</span>
          <Select options={["Name"]} value={"Name"} onChange={() => {}} buttonClassName="py-1 text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs mb-3">
        <button className="px-3 py-1 rounded-md bg-surface-hover text-text-primary border border-border-subtle">Today</button>
        <button className="px-3 py-1 rounded-md bg-surface-hover text-text-primary border border-border-subtle">All</button>
        <Select
          options={Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)}
          value={ym.y}
          onChange={(v) => setYm((s) => ({ ...s, y: Number(v) }))}
          buttonClassName="py-1 text-xs"
        />
        <Select
          options={months.map((m, i) => `${m}`)}
          value={months[ym.m]}
          onChange={(v) => setYm((s) => ({ ...s, m: months.indexOf(String(v)) }))}
          buttonClassName="py-1 text-xs"
        />
      </div>

  <div className="border-t border-border-subtle mb-2" />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 text-center text-sm text-text-secondary font-medium mb-1">
        {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.flatMap((row, rIdx) => row.map((d, cIdx) => {
          const isToday = d === 23 && ym.y === now.getFullYear() && ym.m === now.getMonth()
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`h-10 grid place-items-center rounded-[13px] text-sm ${
                d ? (isToday ? 'bg-[#A385E9] text-white font-semibold' : 'bg-surface-hover text-text-primary') : ''
              }`}
            >
              {d ?? ''}
            </div>
          )
        }))}
      </div>

      <div className="border-t border-border-subtle my-3" />

      <button className="w-full h-11 rounded-[11px] bg-[#A385E9] text-white font-semibold text-sm">Add activity</button>

  <div className="mt-4 space-y-3">
        {/* Schedule items */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-[#FB7988] grid place-items-center text-white shrink-0">📋</div>
          <div className="flex-1 min-w-0">
            <div className="text-text-secondary/80 text-xs font-semibold">10:00</div>
            <div className="text-text-primary font-normal">Set Small Goals</div>
            <div className="text-text-secondary text-xs">Everyday</div>
          </div>
          <button className="text-[#8F9BB3]">⋮</button>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-[#9AC058] grid place-items-center text-white shrink-0">🧘</div>
          <div className="flex-1 min-w-0">
            <div className="text-text-secondary/80 text-xs font-semibold">10:00</div>
            <div className="text-text-primary font-normal">Meditation</div>
            <div className="text-text-secondary text-xs">5 days per week</div>
          </div>
          <button className="text-[#8F9BB3]">⋮</button>
        </div>
      </div>
    </aside>
  )
}
