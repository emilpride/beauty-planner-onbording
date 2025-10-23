"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { BarDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'

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
    <div className="flex flex-col items-center p-4 gap-4 bg-white dark:bg-surface rounded-lg shadow-md">
      <GraphHeader title={title} selected={period} onChange={onChange} />
      
      {/* Divider */}
      <div className="w-full h-px bg-[#EEEEEE] dark:bg-border-subtle" />
      
      <div className="w-full h-[260px]">
        {data.length === 0 ? (
          <Empty state="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 4 }}>
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#5C4688', fontSize: 14, fontWeight: 500 }}
              />
              <YAxis 
                allowDecimals={false} 
                width={28} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#5C4688', fontSize: 14, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(v: ValueType, _n: NameType) => [`${String(v)}`, 'Activities']}
                labelFormatter={(l) => `Day ${String(l)}`}
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: 'none',
                  borderRadius: '9.68px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]} 
                fill="#A385E9"
                opacity={0.48}
                activeBar={{ opacity: 1 }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function Empty({ state }: { state: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm opacity-70">
      {state}
    </div>
  )
}
