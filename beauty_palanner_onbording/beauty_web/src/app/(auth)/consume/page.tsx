"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithCustomToken } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

export default function ConsumeTokenPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null
    if (!token) {
      setError('Missing token')
      // Go to home after a short delay
      const t = setTimeout(() => router.replace('/'), 1200)
      return () => clearTimeout(t)
    }
    let cancelled = false
    ;(async () => {
      try {
        const auth = getFirebaseAuth()
        await signInWithCustomToken(auth, token)
        if (!cancelled) router.replace('/')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('Token consume failed:', msg)
        setError('Authentication failed, please sign in again')
        const t = setTimeout(() => router.replace('/'), 1500)
        // cleanup handled by outer effect return; just schedule redirect here
      }
    })()
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-xl border border-border-subtle bg-surface px-6 py-8 shadow-sm text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">Preparing your account…</div>
        <div className="text-sm text-text-secondary">
          {error ? error : 'Signing you in securely. This will only take a moment.'}
        </div>
      </div>
    </div>
  )
}
