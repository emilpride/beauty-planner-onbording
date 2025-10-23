"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { LineDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'
import { ReportCard } from '@/components/report/ReportCard'

const moodTicks = [1, 2, 3, 4, 5]
const moodLabels = ['', 'Bad', 'Not Good', 'Okay', 'Good', 'Great']

export function MoodChart({
  title = 'Mood Over Time',
  period,
  onChange,
  data,
}: {
  title?: string
  period: string
  onChange: (v: string) => void
  data: LineDatum[]
}) {
  const display = data.map((d) => ({ label: String(d.x), value: Number(d.y.toFixed(2)) }))
  return (
    <ReportCard>
      <GraphHeader title={title} selected={period} onChange={onChange} />
      <div className="mt-6 h-[260px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm opacity-70">No mood entries for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={display} margin={{ left: 8, right: 12, top: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} ticks={moodTicks} tickFormatter={(v) => moodLabels[v] ?? ''} width={56} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: ValueType, _n: NameType) => [String(v), '']}
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
