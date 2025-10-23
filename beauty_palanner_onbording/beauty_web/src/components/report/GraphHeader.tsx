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
  onChange: (PeriodOption | string) => void
  items?: string[] // for calendar months
}) {
  const options = items ?? DEFAULT_PERIODS
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <h3 className="font-medium text-lg text-[#5C4688] dark:text-text-primary flex-1">
        {title}
      </h3>
      <Select
        options={options}
        value={selected}
        onChange={(v) => onChange(String(v))}
        buttonClassName="py-1.5 px-5 text-sm bg-[#F8F8F8] dark:bg-surface-hover rounded-lg"
      />
    </div>
  )
}
