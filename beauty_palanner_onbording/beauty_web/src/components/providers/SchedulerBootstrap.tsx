"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useActivities } from '@/hooks/useActivities'
import { ensureUpcomingUpdates, markMissed } from '@/lib/updateGenerator'

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
        // Best-effort: mark older pending as missed, then ensure upcoming tasks exist
        await markMissed(user.uid)
        await ensureUpcomingUpdates(user.uid, activities, 14)
      } catch (e) {
        // Non-fatal: avoid blocking UI
        console.error('Scheduler bootstrap failed', e)
      }
    })()
  }, [user?.uid, isLoading, activities])

  return null
}
