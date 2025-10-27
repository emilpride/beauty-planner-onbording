"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useAchievements } from '@/hooks/useAchievements'
import { progressToNextLevel } from '@/types/achievements'

export default function AchievementsPage() {
  const { user } = useAuth()
  const { progress, levels, markLevelSeen } = useAchievements(user?.uid)

  const pct = progress ? Math.round(progressToNextLevel(progress.totalCompletedActivities, progress.currentLevel) * 100) : 0

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold text-text-primary">Achievements</h1>

        <section className="card p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
              <span className="text-3xl font-bold text-accent">{progress?.currentLevel ?? 1}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-text-secondary">Current Level</div>
              <div className="text-lg font-semibold text-text-primary">Level {progress?.currentLevel ?? 1}</div>
              <div className="mt-2 h-2 w-full rounded bg-border-subtle/60">
                <div className="h-2 rounded bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-sm text-text-secondary">{pct}% to next level</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Completed activities</div>
              <div className="text-xl font-bold text-text-primary">{progress?.totalCompletedActivities ?? '—'}</div>
            </div>
          </div>
          <div className="mt-4">
            <button className="chip" onClick={() => markLevelSeen()}>Mark level as seen</button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {levels.map((l) => (
            <div key={l.level} className="rounded-xl bg-surface border border-border-subtle p-4 text-center shadow-sm">
              <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border ${l.unlocked ? 'bg-accent text-white border-transparent' : 'bg-surface-hover text-text-secondary border-border-subtle'}`}>
                <span className="text-2xl font-bold">{l.level}</span>
              </div>
              <div className="font-semibold text-text-primary">{l.title}</div>
              {l.unlocked ? (
                <div className="text-green-500 text-sm">Unlocked</div>
              ) : (
                <div className="text-sm text-text-secondary">Pass {l.requiredActivities} activities</div>
              )}
            </div>
          ))}
        </section>
      </PageContainer>
    </Protected>
  )
}
