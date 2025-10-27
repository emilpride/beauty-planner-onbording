"use client"

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
    <div className="flex flex-row items-start gap-4 rounded-lg border border-border-subtle bg-surface p-6 shadow-md">
      {/* Left: Fire Icon & Streak */}
      <div className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-surface-hover px-4 py-1">
        <div className="mb-1 text-sm font-semibold text-[rgb(var(--accent))]">
          Current Streak
        </div>
        <div className="flex flex-col items-center rounded-md bg-surface px-12 py-2">
          {/* Fire Icon */}
          <div className="relative w-16 h-16 mb-2">
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
          <div className="text-[40px] font-bold leading-[50px] text-text-primary">
            {currentStreak}
          </div>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex flex-col items-start gap-2.5">
        <StatRow label="Completion rate" value={`${completionRate}%`} />
        <StatRow label="Activities completed" value={activitiesCompleted.toLocaleString()} />
        <StatRow label="Total perfect days" value={totalPerfectDays.toString()} />
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
  <div className="text-[13px] font-bold leading-tight text-text-secondary">
        {label}
      </div>
  <div className="text-xl font-semibold text-center text-text-primary">
        {value}
      </div>
    </div>
  )
}
