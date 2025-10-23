"use client"

import type { PeriodOption } from '@/lib/report'

const DEFAULT_PERIODS: PeriodOption[] = [
  'Today',
  'This Week',
  'This Month',
  'Last Month',
  'Last 6 Months',
  'This Year',
]

export function GraphHeader({
  title,
  selected,
  onChange,
  items,
}: {
  title: string
  selected: string
  onChange: (v: PeriodOption | string) => void
  items?: string[] // for calendar months
}) {
  const options = items ?? DEFAULT_PERIODS
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <select
        className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
