"use client"

import { useMemo, useState } from 'react'
import { Select } from '@/components/common/Select'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesInDateRange } from '@/hooks/useUpdates'
import type { Activity } from '@/types/activity'
import { getActivityMeta } from '@/data/activityMeta'
import { generateTasksForDate } from '@/lib/clientTaskGenerator'

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

export function CalendarPanel({
  selectedDate,
  onSelectDate,
  category,
  onCategoryChange,
  activities = [],
}: {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  category: 'all' | 'skin' | 'hair' | 'physical' | 'mental'
  onCategoryChange: (c: 'all' | 'skin' | 'hair' | 'physical' | 'mental') => void
  activities?: Activity[]
}) {
  const { user } = useAuth()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const grid = useMemo(() => monthMatrix(ym.y, ym.m), [ym])
  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })), []
  )

  const monthStart = new Date(ym.y, ym.m, 1)
  const monthEnd = new Date(ym.y, ym.m + 1, 0)
  const { data: monthUpdates } = useUpdatesInDateRange(user?.uid, monthStart, monthEnd)
  const activityById = useMemo(() => new Map(activities.map(a => [a.id, a])), [activities])
  const dayInfo = useMemo(() => {
    const map = new Map<number, { has: boolean; icon?: string }>()

    // 1) Use Firestore updates (if any)
    for (const inst of monthUpdates?.items ?? []) {
      const [y, m, d] = inst.date.split('-').map((x) => Number(x))
      if (y !== ym.y || m !== ym.m + 1) continue
      const act = activityById.get(inst.activityId)
      const cat = (act?.category || '').toLowerCase()
      const matches =
        category === 'all' ||
        (category === 'skin' && cat === 'skin') ||
        (category === 'hair' && cat === 'hair') ||
        (category === 'physical' && (cat === 'physical' || cat === 'physical health')) ||
        (category === 'mental' && (cat === 'mental' || cat === 'mental wellness'))
      if (!matches) continue
      if (!map.has(d)) {
        const meta = getActivityMeta(act?.id || '', act?.name)
        map.set(d, { has: true, icon: meta.iconPath })
      }
    }

    // 2) Also derive from scheduled activities (fallback if Updates are empty)
    const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      if (map.has(day)) continue
      const date = new Date(ym.y, ym.m, day)
      const generated = generateTasksForDate(activities, date)
      const first = generated.find((g) => {
        const act = activityById.get(g.activityId)
        const cat = (act?.category || '').toLowerCase()
        return (
          category === 'all' ||
          (category === 'skin' && cat === 'skin') ||
          (category === 'hair' && cat === 'hair') ||
          (category === 'physical' && (cat === 'physical' || cat === 'physical health')) ||
          (category === 'mental' && (cat === 'mental' || cat === 'mental wellness'))
        )
      })
      if (first) {
        const act = activityById.get(first.activityId)
        const meta = getActivityMeta(act?.id || '', act?.name)
        map.set(day, { has: true, icon: meta.iconPath })
      }
    }

    return map
  }, [monthUpdates?.items, ym, activityById, category, activities])

  return (
    <aside className="rounded-lg bg-surface p-4 w-full max-w-[382px] border border-border-subtle shadow-sm">
      {/* Filters row */}
      <div className="flex items-center justify-between gap-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs font-bold">Category:</span>
          <Select 
            options={["All","Skin","Hair","Physical","Mental"]}
            value={{ all:"All", skin:"Skin", hair:"Hair", physical:"Physical", mental:"Mental" }[category]}
            onChange={(v) => {
              const val = String(v).toLowerCase() as 'all'|'skin'|'hair'|'physical'|'mental'
              onCategoryChange(val)
            }}
            buttonClassName="py-1 text-xs" 
          />
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
          options={months.map((m) => `${m}`)}
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
          const isToday = d === new Date().getDate() && ym.y === now.getFullYear() && ym.m === now.getMonth()
          const info = d ? dayInfo.get(d) : undefined
          const isSelected = d
            ? (selectedDate.getFullYear() === ym.y && selectedDate.getMonth() === ym.m && selectedDate.getDate() === d)
            : false
          return (
            <div 
              key={`${rIdx}-${cIdx}`}
              className={`h-10 grid place-items-center rounded-[13px] text-sm ${d ? 'bg-surface-hover text-text-primary cursor-pointer' : ''}`}
              onClick={() => { if (d) onSelectDate(new Date(ym.y, ym.m, d)) }}
            >
              {d && (
                <div className={`relative flex items-center justify-center w-full h-full rounded-[13px] ${isSelected ? 'bg-[#A385E9] text-white font-semibold' : isToday ? 'border border-[#A385E9]' : ''}`}>
                  <span>{d}</span>
                  {info?.has && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <span className={`block h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[rgb(var(--accent))]'}`} />
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        }))}
      </div>

      <div className="border-t border-border-subtle my-3" />

  <button className="w-full h-11 rounded-[11px] bg-[#A385E9] text-white font-semibold text-sm">Add activity</button>

  <div className="mt-4 space-y-3 text-xs text-text-secondary">
        <div className="opacity-80">Tap a date to load its activities on the dashboard.</div>
      </div>
    </aside>
  )
}
