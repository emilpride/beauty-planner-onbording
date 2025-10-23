"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useAchievements } from '@/hooks/useAchievements'
import { ACHIEVEMENT_LEVELS, levelThreshold, progressToNextLevel } from '@/types/achievements'

export default function AchievementsPage() {
  const { user } = useAuth()
  const { progress, levels, markLevelSeen, isLoading } = useAchievements(user?.uid)

  const pct = progress ? Math.round(progressToNextLevel(progress.totalCompletedActivities, progress.currentLevel) * 100) : 0

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Achievements</h1>

        <section className="card p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(124,77,255,0.1)] ring-1 ring-[rgba(124,77,255,0.2)]">
              <span className="text-3xl font-bold text-[#7C4DFF]">{progress?.currentLevel ?? 1}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-70">Current Level</div>
              <div className="text-lg font-semibold">Level {progress?.currentLevel ?? 1}</div>
              <div className="mt-2 h-2 w-full rounded bg-zinc-200">
                <div className="h-2 rounded bg-[#7C4DFF]" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-sm opacity-70">{pct}% to next level</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Completed activities</div>
              <div className="text-xl font-bold">{progress?.totalCompletedActivities ?? '—'}</div>
            </div>
          </div>
          <div className="mt-4">
            <button className="chip" onClick={() => markLevelSeen()}>Mark level as seen</button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {levels.map((l) => (
            <div key={l.level} className="rounded-xl bg-white ring-1 ring-black/5 p-4 text-center">
              <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full ${l.unlocked ? 'bg-[#7C4DFF] text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                <span className="text-2xl font-bold">{l.level}</span>
              </div>
              <div className="font-semibold">{l.title}</div>
              {l.unlocked ? (
                <div className="text-green-600 text-sm">Unlocked</div>
              ) : (
                <div className="text-sm opacity-70">Pass {l.requiredActivities} activities</div>
              )}
            </div>
          ))}
        </section>
      </PageContainer>
    </Protected>
  )
}
