"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { LineDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'
import { ReportCard } from '@/components/report/ReportCard'

export function CompletionRateChart({
  title = 'Completion Rate',
  period,
  onChange,
  data,
}: {
  title?: string
  period: string
  onChange: (v: string) => void
  data: LineDatum[]
}) {
  const display = data.map((d) => ({ label: String(d.x), value: Number(d.y.toFixed(1)) }))
  return (
    <ReportCard>
      <GraphHeader title={title} selected={period} onChange={onChange} />
      <div className="mt-6 h-[260px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm opacity-70">Not enough data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={display} margin={{ left: 8, right: 12, top: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: ValueType, _n: NameType) => [`${String(v)}%`, '']}
                labelFormatter={(l) => String(l)}
              />
              <Line type="monotone" dataKey="value" stroke="#7C4DFF" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ReportCard>
  )
}
