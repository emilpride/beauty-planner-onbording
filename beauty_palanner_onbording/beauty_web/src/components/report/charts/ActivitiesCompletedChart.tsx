"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { BarDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'
import { ReportCard } from '@/components/report/ReportCard'

export function ActivitiesCompletedChart({
  title = 'Activities Completed',
  period,
  onChange,
  data,
}: {
  title?: string
  period: string
  onChange: (v: string) => void
  data: BarDatum[]
}) {
  return (
    <ReportCard>
      <GraphHeader title={title} selected={period} onChange={onChange} />
      <div className="mt-6 h-[260px] w-full">
        {data.length === 0 ? (
          <Empty state="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 12, top: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: ValueType, _n: NameType) => [`${String(v)} activities`, '']}
                labelFormatter={(l) => String(l)}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#A688FA" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ReportCard>
  )
}

function Empty({ state }: { state: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm opacity-70">
      {state}
    </div>
  )
}
