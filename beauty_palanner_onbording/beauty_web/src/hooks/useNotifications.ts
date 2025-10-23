"use client"

import { useCallback, useEffect, useState } from 'react'
import { getFcmToken } from '@/lib/messaging'
import { removeFcmToken, saveFcmToken } from '@/lib/notifications'

export function usePushNotifications(userId?: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const [token, setToken] = useState<string | null>(null)
  const [supported, setSupported] = useState<boolean>(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'Notification' in window)
    setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  }, [])

  const enable = useCallback(async () => {
    if (!userId) return false
    if (!supported) return false
    try {
      setBusy(true)
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return false
      const reg = await navigator.serviceWorker.ready
      const t = await getFcmToken(reg)
      if (!t) return false
      await saveFcmToken(userId, t)
      setToken(t)
      return true
    } finally {
      setBusy(false)
    }
  }, [userId, supported])

  const disable = useCallback(async () => {
    if (!userId || !token) return false
    try {
      setBusy(true)
      await removeFcmToken(userId, token)
      setToken(null)
      return true
    } finally {
      setBusy(false)
    }
  }, [userId, token])

  return { supported, permission, token, busy, enable, disable }
}
