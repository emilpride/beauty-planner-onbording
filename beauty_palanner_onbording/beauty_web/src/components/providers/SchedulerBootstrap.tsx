"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useActivities } from '@/hooks/useActivities'
import { ensureUpcomingUpdates, markMissed } from '@/lib/updateGenerator'
import { doc, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { Activity } from '@/types/activity'
import { toFirebaseActivity } from '@/types/activity'

export function SchedulerBootstrap() {
  const { user } = useAuth()
  const { data: activities, isLoading } = useActivities(user?.uid)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!user?.uid) return
    if (isLoading) return
    if (!activities) return
    if (ranRef.current) return

    ranRef.current = true
    ;(async () => {
      try {
        // If the user has no Activities yet, seed a small sensible default set
        let effectiveActivities: Activity[] = activities
        if (Array.isArray(activities) && activities.length === 0) {
          const now = new Date()
          const defaults: Activity[] = [
            {
              id: 'drink_water',
              name: 'Drink a glass of water',
              category: 'Wellness',
              categoryId: 'wellness',
              illustration: '',
              note: '',
              isRecommended: true,
              type: 'regular',
              activeStatus: true,
              time: { hour: 8, minute: 0 },
              frequency: 'daily',
              selectedDays: [],
              weeksInterval: 1,
              selectedMonthDays: [],
              notifyBefore: '',
              cost: 0,
              color: '#FF7C4DFF',
              enabledAt: now,
              lastModifiedAt: now,
              endBeforeUnit: '',
              endBeforeType: 'date',
              endBeforeActive: false,
              selectedEndBeforeDate: null,
            },
            {
              id: 'morning_skincare',
              name: 'Morning skincare routine',
              category: 'Skincare',
              categoryId: 'skincare',
              illustration: '',
              note: '',
              isRecommended: true,
              type: 'regular',
              activeStatus: true,
              time: { hour: 7, minute: 30 },
              frequency: 'daily',
              selectedDays: [],
              weeksInterval: 1,
              selectedMonthDays: [],
              notifyBefore: '',
              cost: 0,
              color: '#FF7C4DFF',
              enabledAt: now,
              lastModifiedAt: now,
              endBeforeUnit: '',
              endBeforeType: 'date',
              endBeforeActive: false,
              selectedEndBeforeDate: null,
            },
            {
              id: 'evening_skincare',
              name: 'Evening skincare routine',
              category: 'Skincare',
              categoryId: 'skincare',
              illustration: '',
              note: '',
              isRecommended: true,
              type: 'regular',
              activeStatus: true,
              time: { hour: 22, minute: 0 },
              frequency: 'daily',
              selectedDays: [],
              weeksInterval: 1,
              selectedMonthDays: [],
              notifyBefore: '',
              cost: 0,
              color: '#FF7C4DFF',
              enabledAt: now,
              lastModifiedAt: now,
              endBeforeUnit: '',
              endBeforeType: 'date',
              endBeforeActive: false,
              selectedEndBeforeDate: null,
            },
          ]

          const db = getFirestoreDb()
          const ref = doc(db, 'users_v2', user.uid)
          await setDoc(
            ref,
            { Activities: defaults.map(toFirebaseActivity) },
            { merge: true },
          )
          effectiveActivities = defaults
        }

        // Best-effort: mark older pending as missed, then ensure upcoming tasks exist
        await markMissed(user.uid)
        await ensureUpcomingUpdates(user.uid, effectiveActivities, 14)
      } catch (e) {
        // Non-fatal: avoid blocking UI
        console.error('Scheduler bootstrap failed', e)
      }
    })()
  }, [user?.uid, isLoading, activities])

  return null
}
