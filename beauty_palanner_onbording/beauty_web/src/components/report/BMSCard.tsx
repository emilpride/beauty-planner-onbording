"use client"

import BmsRing from '@/components/BmsRing'

export function BMSCard({
  score = 7.2,
  status = "Balanced",
  description = "Keep up with consistent routine!",
  delta,
}: {
  score?: number
  status?: string
  description?: string
  delta?: number
}) {
  return (
    <div className="flex h-full min-h-[260px] flex-col gap-5 rounded-lg border border-border-subtle bg-surface p-6 shadow-md">
      {/* Header */}
      <div className="flex w-full flex-row items-center justify-between">
        <h3 className="text-xl font-bold text-text-primary">
          Your BMS<sup className="text-sm text-[rgb(var(--accent))]">®</sup> is:
        </h3>
        <div className="flex items-end gap-3">
          {typeof delta === 'number' && !Number.isNaN(delta) && (
            <span className={`tabular-nums text-sm ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {delta >= 0 ? '+' : ''}{delta.toFixed(3)}
            </span>
          )}
          <span className="text-lg font-bold text-[rgb(var(--accent))]">{status}</span>
        </div>
      </div>
      <p className="leading-relaxed text-sm text-text-secondary">
        {description}
      </p>

      {/* Onboarding-style BMS ring */}
      <div className="flex items-center justify-center">
        <BmsRing
          size={220}
          thickness={26}
          overall={Number(score.toFixed(1))}
          scores={{
            skin: score,
            hair: score,
            physic: score,
            mental: score,
          }}
          icons={{
            skin: '/custom-icons/bms/skin_bms.svg',
            hair: '/custom-icons/bms/hair_bms.svg',
            physic: '/custom-icons/bms/physical_bms.svg',
            mental: '/custom-icons/bms/mental_bms.svg',
          }}
          colors={{
            skin: '#60A5FA',
            hair: '#6EE7B7',
            physic: '#FBBF24',
            mental: '#F472B6',
          }}
        />
      </div>
      {/* No Update button anymore */}
    </div>
  )
}
