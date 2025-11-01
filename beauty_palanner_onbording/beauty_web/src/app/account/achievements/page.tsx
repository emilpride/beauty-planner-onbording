"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useMemo, useState } from 'react'
import { useUserStats } from '@/hooks/useUserDetails'
import { useUpdatesInDateRange } from '@/hooks/useUpdates'
import { ACHIEVEMENT_LEVELS, TOTAL_LEVELS, calculateLevel, levelThreshold } from '@/types/achievements'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

export default function AchievementsPage() {
  const { user } = useAuth()
  const stats = useUserStats(user?.uid)
  const { data: updatesAll } = useUpdatesInDateRange(user?.uid, new Date(2000,0,1), new Date())

  const completedCount = useMemo(() => {
    const agg = stats.data?.activitiesCompleted
    if (typeof agg === 'number' && agg >= 0) return agg
    const items = updatesAll?.items ?? []
    return items.filter((i) => i.status === 'completed').length
  }, [stats.data?.activitiesCompleted, updatesAll?.items])

  const totalLevels = TOTAL_LEVELS
  const currentLevel = useMemo(() => calculateLevel(completedCount), [completedCount])
  const unlockedLevels = useMemo(
    () => ACHIEVEMENT_LEVELS.filter((l) => completedCount >= l.requiredActivities).map((l) => l.level),
    [completedCount],
  )

  // Unlock popup
  const [showPopup, setShowPopup] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  useEffect(() => {
    if (!user?.uid) return
    ;(async () => {
      try {
        const db = getFirestoreDb()
        const ref = doc(db, 'users_v2', user.uid)
        const snap = await getDoc(ref)
        const lastSeen = (snap.data()?.Achievements?.LastSeenLevel as number | undefined) ?? 0
        if (currentLevel > lastSeen) {
          setNewLevel(currentLevel)
          setShowPopup(true)
          const payload = { Achievements: { LastSeenLevel: currentLevel, UpdatedAt: serverTimestamp() } }
          await setDoc(ref, payload, { merge: true })
          try {
            const confetti = (await import('canvas-confetti')).default
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.35 } })
            setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 200)
            setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 200)
          } catch {}
        }
      } catch {}
    })()
  }, [user?.uid, currentLevel])

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto py-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link href="/account" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-text-primary">Achievements</h1>
          </div>

          {/* Current Level Card */}
          <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-5 mb-4">
              <div className="relative w-[90px] h-[90px] shrink-0">
                <Image src={currentLevel < 1 ? '/icons/achievements/level_locked.png' : `/icons/achievements/level_${Math.min(totalLevels, currentLevel)}.png`} alt={currentLevel < 1 ? 'Locked' : `Level ${currentLevel}`} fill className="object-contain" />
              </div>
              <div className="flex-1">
                <h2 className="text-[40px] font-bold leading-tight text-text-primary">Level {currentLevel}</h2>
                <p className="text-lg font-semibold text-text-secondary">
                  {currentLevel >= totalLevels ? 'Legendary finisher! You reached the top.' : 'You are a rising star! Keep going!'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-text-primary">Level Progress</span>
                <span className="text-sm font-semibold text-text-secondary">{unlockedLevels.length}/{totalLevels}</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2">
                <div className="bg-gradient-to-r from-[#A385E9] to-[#8965D6] h-2 rounded-full transition-all duration-300" style={{ width: `${(unlockedLevels.length / totalLevels) * 100}%` }} />
              </div>
              <div className="mt-2 text-xs text-text-secondary">{completedCount} activities completed · Next at {levelThreshold(Math.min(totalLevels, currentLevel + 1))}</div>
            </div>
          </div>

          {/* All Achievements Grid */}
          <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary">
                All Levels ({unlockedLevels.length}/{totalLevels})
              </h3>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: totalLevels }, (_, i) => i + 1).map((level) => {
                const isUnlocked = unlockedLevels.includes(level)
                const iconPath = isUnlocked
                  ? `/icons/achievements/level_${level}.png`
                  : '/icons/achievements/level_locked.png'

                return (
                  <div
                    key={level}
                    className="relative group"
                  >
                    <div
                      className={`
                        relative aspect-square rounded-lg overflow-hidden bg-surface border border-border-subtle shadow-sm
                        ${isUnlocked 
                          ? 'ring-2 ring-[rgb(var(--accent))] ring-opacity-40' 
                          : 'opacity-60 grayscale'
                        }
                        transition-all duration-200 hover:scale-105
                      `}
                    >
                      <Image src={iconPath} alt={`Level ${level}`} fill className="object-contain p-2" />
                      {!isUnlocked && (
                        <div className="absolute inset-0 grid place-items-center text-[11px] text-text-secondary">
                          {levelThreshold(level)}
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Level {level} {isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>

                    {/* Level Number */}
                    <div className="text-center mt-2">
                      <span className={`text-sm font-semibold ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                        Level {level}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Achievement Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-surface border border-border-subtle rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-text-primary">{unlockedLevels.length}</div>
                <div className="text-sm font-semibold text-text-secondary mt-1">Unlocked</div>
              </div>
              <div className="bg-surface border border-border-subtle rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-text-primary">{totalLevels - unlockedLevels.length}</div>
                <div className="text-sm font-semibold text-text-secondary mt-1">Remaining</div>
              </div>
              <div className="bg-surface border border-border-subtle rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-text-primary">
                  {Math.round((unlockedLevels.length / totalLevels) * 100)}%
                </div>
                <div className="text-sm font-semibold text-text-secondary mt-1">Complete</div>
              </div>
            </div>

            {/* Next Achievement */}
            {unlockedLevels.length < totalLevels && (
              <div className="mt-6 p-4 bg-surface rounded-xl border border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <Image src="/icons/achievements/level_locked.png" alt="Next Level" fill className="object-contain opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-text-primary">
                      Next: Level {unlockedLevels.length + 1}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Complete {Math.max(0, levelThreshold(unlockedLevels.length + 1) - completedCount)} more activities to unlock the next level.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {showPopup && newLevel && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
              <div className="w-full max-w-[440px] rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-[#7E5BEF] to-[#5F44C1]">
                  <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(white 1px, transparent 1px)', backgroundSize:'10px 10px'}} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative w-24 h-24">
                      <Image src={`/icons/achievements/level_${newLevel}.png`} alt={`Level ${newLevel}`} fill className="object-contain drop-shadow-lg" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-extrabold text-text-primary mb-1">Level {newLevel} Unlocked!</h3>
                  <p className="text-sm text-text-secondary mb-4">Amazing progress — keep your routine rolling and claim the next badge soon.</p>
                  <button className="w-full h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-semibold text-sm" onClick={() => setShowPopup(false)}>Continue</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </Protected>
  )
}
