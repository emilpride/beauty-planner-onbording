"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Image from 'next/image'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { LineDatum } from '@/lib/report'
import { GraphHeader } from '@/components/report/GraphHeader'

// Mood emoji mapping (1-5 scale from worst to best)
const MOOD_EMOJIS = [
  '/emojis/pouting-face.png',      // 1 - Angry/worst
  '/emojis/crying-face.png',        // 2 - Sad
  '/emojis/neutral-face.png',       // 3 - Neutral
  '/emojis/smiling-face-with-smiling-eyes.png',  // 4 - Happy
  '/emojis/smiling-face-with-sunglasses.png',    // 5 - Great/best
]

// Background colors for each mood
const MOOD_BG_COLORS = [
  'rgba(254, 51, 35, 0.08)',   // Red - angry
  'rgba(255, 211, 0, 0.08)',   // Yellow - sad
  'rgba(117, 117, 117, 0.08)', // Gray - neutral
  'rgba(0, 168, 107, 0.08)',   // Green - happy
  'rgba(35, 93, 255, 0.08)',   // Blue - great
]

export function MoodChart({
  title = 'Mood Chart',
  period,
  onChange,
  data,
}: {
  title?: string
  period: string
  onChange: (v: string) => void
  data: LineDatum[]
}) {
  const display = data.map((d) => ({ label: String(d.x), value: Number(d.y.toFixed(0)) }))
  
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border-subtle bg-surface p-4 shadow-md">
      <GraphHeader title={title} selected={period} onChange={onChange} />
      
      {/* Divider */}
  <div className="h-px w-full bg-border-subtle" />
      
      <div className="w-full h-[234px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm opacity-70">
            No mood entries for this period
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Emoji Y-axis */}
            <div className="absolute left-0 top-0 h-[200px] w-6 flex flex-col justify-between items-center py-2">
              {[4, 3, 2, 1, 0].map((idx) => (
                <div key={idx} className="w-6 h-6 relative">
                  <Image 
                    src={MOOD_EMOJIS[idx]} 
                    alt={`Mood ${idx + 1}`} 
                    width={24} 
                    height={24}
                  />
                </div>
              ))}
            </div>
            
            {/* Chart area */}
            <div className="ml-8 w-[calc(100%-32px)] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={display} margin={{ left: 8, right: 12, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="3.67%" stopColor="rgb(var(--accent))" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'rgb(var(--text-primary))', fontSize: 14, fontWeight: 500 }}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    hide
                  />
                  <Tooltip
                    formatter={(v: ValueType, _n: NameType) => [`Mood Level ${String(v)}`, '']}
                    labelFormatter={(l) => `Day ${String(l)}`}
                    contentStyle={{
                      backgroundColor: 'rgb(var(--surface))',
                      border: `1px solid rgb(var(--border-subtle))`,
                      borderRadius: '9.68px',
                      padding: '8px 12px',
                      color: 'rgb(var(--text-primary))',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="rgb(var(--accent))" 
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                    dot={{ 
                      fill: 'rgb(var(--surface))', 
                      stroke: 'rgb(var(--accent))', 
                      strokeWidth: 2, 
                      r: 6 
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Background mood color bands */}
              <div className="absolute top-2 left-8 right-3 h-[200px] -z-10 flex flex-col pointer-events-none">
                {MOOD_BG_COLORS.slice().reverse().map((color, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
