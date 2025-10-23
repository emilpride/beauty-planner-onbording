"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { LineDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'

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
    <div className="flex flex-col items-center p-4 gap-4 bg-white dark:bg-surface rounded-lg shadow-md">
      <GraphHeader title={title} selected={period} onChange={onChange} />
      
      {/* Divider */}
      <div className="w-full h-px bg-[#EEEEEE] dark:bg-border-subtle" />
      
      <div className="w-full h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm opacity-70">
            Not enough data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={display} margin={{ left: 40, right: 12, top: 8, bottom: 4 }}>
              {/* Grid lines */}
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="6.46%" stopColor="rgba(137, 133, 233, 0.24)" />
                  <stop offset="100%" stopColor="rgba(137, 133, 233, 0)" />
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#5C4688', fontSize: 14, fontWeight: 500 }}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 20, 40, 60, 80, 100]}
                tickFormatter={(v) => `${v}%`} 
                width={45} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#5C4688', fontSize: 14, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(v: ValueType, _n: NameType) => [`${String(v)}%`, 'Completion']}
                labelFormatter={(l) => String(l)}
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: 'none',
                  borderRadius: '9.68px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#A385E9" 
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={{ 
                  fill: '#FFFFFF', 
                  stroke: '#A385E9', 
                  strokeWidth: 2, 
                  r: 6 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
