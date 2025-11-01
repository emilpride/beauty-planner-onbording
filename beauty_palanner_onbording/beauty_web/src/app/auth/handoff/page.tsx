"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseApp } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

function getFunctionsBase() {
  if (process.env.NEXT_PUBLIC_FUNCTIONS_BASE) return process.env.NEXT_PUBLIC_FUNCTIONS_BASE
  // Default to us-central1 for the current project
  return 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net'
}

export default function AuthHandoffPage() {
  const router = useRouter()
  useEffect(() => {
    const url = new URL(window.location.href)
    const app = getFirebaseApp()
    const auth = getAuth(app)

    const customToken = url.searchParams.get('ct')
    const idToken = url.searchParams.get('idToken')
    const next = url.searchParams.get('next') || '/'

    async function run() {
      // Already signed in? just go next
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          unsub()
          window.location.replace(next)
        }
      })

      try {
        if (customToken) {
          await signInWithCustomToken(auth, customToken)
          window.location.replace(next)
          return
        }
        if (idToken) {
          const resp = await fetch(`${getFunctionsBase()}/exchangeIdToken`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: '{}',
          })
          if (!resp.ok) throw new Error('exchange_failed')
          const json = await resp.json()
          const ct = json.customToken as string
          await signInWithCustomToken(auth, ct)
          window.location.replace(next)
          return
        }
        // No token present, go to login
        router.replace('/login')
      } catch {
        router.replace('/login')
      }
    }

    run()
  }, [router])

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <div className="animate-pulse text-sm text-text-secondary">Signing you in…</div>
      </div>
    </div>
  )
}
