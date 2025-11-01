"use client"

import { useEffect } from 'react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useTheme } from '@/components/theme/ThemeProvider'
import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

const NAMED_TO_HEX: Record<string, string> = {
  pink: '#FF69B4',
  purple: '#A385E9',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
}

function normalizeHex(input?: unknown): string | null {
  if (!input) return null
  const s = String(input).trim()
  const hex = s.startsWith('#') ? s : `#${s}`
  return /^#([A-Fa-f0-9]{6})$/.test(hex) ? hex : null
}

export function UserThemeSync() {
  const { user } = useAuthContext()
  const { setAccent, setMode } = useTheme()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        if (!user?.uid) return
        const db = getFirestoreDb()
        const ref = doc(db, 'users_v2', user.uid)
        const snap = await getDoc(ref)
        const data = (snap.data() as Record<string, unknown>) || {}

        // Theme mode
        const themeRaw = (data['Theme'] as string) || (data['theme'] as string) || ''
        const theme = ['light', 'dark', 'system'].includes(themeRaw) ? (themeRaw as 'light' | 'dark' | 'system') : undefined
        if (!cancelled && theme) setMode(theme)

        // Accent color
        const hex = normalizeHex(data['PrimaryColor']) || normalizeHex(data['primaryColor'])
        let finalHex = hex
        if (!finalHex) {
          const named = (data['primaryColor'] as string) || ''
          const mapped = NAMED_TO_HEX[named.toLowerCase()] || null
          if (mapped) finalHex = mapped
        }
        if (!cancelled && finalHex) setAccent(finalHex)
      } catch (e) {
        // Non-fatal: keep defaults
        console.warn('UserThemeSync: failed to load theme from Firestore', e)
      }
    }
    run()
    return () => { cancelled = true }
  }, [user?.uid, setAccent, setMode])

  return null
}
