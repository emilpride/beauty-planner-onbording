"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import { ACHIEVEMENT_LEVELS, calculateLevel } from '@/types/achievements'

export function AchievementsNotifier() {
  const { user } = useAuth()
  const [popupLevel, setPopupLevel] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const db = getFirestoreDb()
    // Listen live to Achievements/Progress or fallback to counting Updates if missing
    const progressRef = doc(collection(doc(collection(db, 'users_v2'), user.uid), 'Achievements'), 'Progress')
    const unsub = onSnapshot(progressRef, async (snap) => {
      let total = 0
      if (snap.exists()) {
        const data = snap.data() as Record<string, unknown>
        total = Number((data['TotalCompletedActivities'] ?? data['totalCompletedActivities']) as unknown) || 0
      } else {
        // No progress doc yet; skip to avoid expensive client counting.
        total = 0
      }
      const current = calculateLevel(total)
      // Read last seen marker from root (shared with Achievements page)
      const userRef = doc(db, 'users_v2', user.uid)
      const root = await getDoc(userRef)
      const lastSeen = (root.data()?.Achievements?.LastSeenLevel as number | undefined) ?? 0
      if (current > lastSeen) {
        setPopupLevel(current)
        setVisible(true)
        // Mark as seen
        await setDoc(userRef, { Achievements: { LastSeenLevel: current, UpdatedAt: serverTimestamp() } }, { merge: true })
        // Best-effort: trigger confetti
        try {
          const confetti = (await import('canvas-confetti')).default
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.35 } })
          setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 200)
          setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 200)
        } catch {}
      }
    })
    return () => unsub()
  }, [user?.uid])

  if (!visible || !popupLevel) return null
  const level = Math.max(1, Math.min(ACHIEVEMENT_LEVELS.length, popupLevel))
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[440px] rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-[#7E5BEF] to-[#5F44C1]">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(white 1px, transparent 1px)', backgroundSize:'10px 10px'}} />
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative w-24 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/achievements/level_${level}.png`} alt={`Level ${level}`} className="object-contain w-full h-full drop-shadow-lg" />
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-2xl font-extrabold text-text-primary mb-1">Level {level} Unlocked!</h3>
          <p className="text-sm text-text-secondary mb-4">Awesome! Keep up your routine and claim more achievements.</p>
          <button className="w-full h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-semibold text-sm" onClick={() => setVisible(false)}>Continue</button>
        </div>
      </div>
    </div>
  )
}
