"use client"

import type { PeriodOption } from '@/lib/report'
import { Select } from '@/components/common/Select'

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
  onChange: (value: PeriodOption | string) => void
  items?: string[] // for calendar months
}) {
  const options = items ?? DEFAULT_PERIODS
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <h3 className="flex-1 text-lg font-medium text-text-primary">
        {title}
      </h3>
      <Select
        options={options}
        value={selected}
        onChange={(v) => onChange(String(v))}
  buttonClassName="rounded-lg border border-border-subtle !bg-surface px-5 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
      />
    </div>
  )
}
