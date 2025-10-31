"use client"
import { ReactNode } from 'react'

export function CurrentStreakCard({
  currentStreak = 182,
  completionRate = 89,
  activitiesCompleted = 3268,
  totalPerfectDays = 307,
}: {
  currentStreak?: number
  completionRate?: number
  activitiesCompleted?: number
  totalPerfectDays?: number
}) {
  return (
    <div className="flex h-full min-h-[260px] flex-col justify-between gap-4 rounded-lg border border-border-subtle bg-surface p-6 shadow-md">
      {/* Header: Title, Fire Icon, Big Number */}
      <div className="flex flex-col items-center">
        <div className="text-xs tracking-wide uppercase text-text-secondary">Current Streak</div>
        <div className="relative w-16 h-16 my-2">
          {/* Glow */}
          <div className="absolute inset-0 -z-10 rounded-full blur-[14px] opacity-50" style={{ background: 'radial-gradient(closest-side, rgba(251,139,0,0.6), transparent)' }} />
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F14230" />
                <stop offset="100%" stopColor="#FB8B00" />
              </linearGradient>
            </defs>
            <path
              d="M32 4C32 4 16 16 16 32C16 40.837 23.163 48 32 48C40.837 48 48 40.837 48 32C48 16 32 4 32 4Z"
              fill="url(#fireGradient)"
            />
            <ellipse cx="32" cy="34" rx="8" ry="10" fill="#FFED6F" opacity="0.8" />
          </svg>
        </div>
        <div className="text-6xl font-extrabold leading-none text-text-primary tabular-nums">{currentStreak}</div>
        {/* completion rate progress */}
        <div className="mt-3 w-full">
          <div className="relative h-2 w-full rounded-full bg-surface-hover">
            <div
              className="absolute h-2 rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, completionRate))}%`,
                background: 'linear-gradient(90deg,#33C75A 0%,#FFEB3B 60%,#E53935 100%)',
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-text-secondary text-center">Completion rate</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatRow label="Completion rate" value={`${completionRate}%`} icon={<IconGauge />} />
        <StatRow label="Activities completed" value={activitiesCompleted.toLocaleString()} icon={<IconChecklist />} />
        <StatRow label="Perfect days" value={totalPerfectDays.toString()} icon={<IconCrown />} />
      </div>
    </div>
  )
}

function StatRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-[12px] font-semibold leading-tight text-text-secondary">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xl font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}

function IconGauge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 13a8 8 0 1116 0v3a1 1 0 01-1 1h-3a1 1 0 110-2h2v-2a6 6 0 10-12 0v2h2a1 1 0 110 2H5a1 1 0 01-1-1v-3z" fill="currentColor" opacity=".6"/>
      <path d="M12 13l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconChecklist() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" opacity=".6"/>
      <path d="M8 9h8M8 12h6M8 15h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCrown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7l4 3 5-6 5 6 4-3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" opacity=".6"/>
      <path d="M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
