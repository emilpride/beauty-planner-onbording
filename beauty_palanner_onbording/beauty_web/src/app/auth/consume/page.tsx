"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthConsumeRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = window.location.search || ''
    // Preserve the token and any other query params. Use a hard redirect to avoid typedRoutes constraint.
    window.location.replace(`/consume${search}`)
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-xl border border-border-subtle bg-surface px-6 py-8 shadow-sm text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">Redirecting…</div>
        <div className="text-sm text-text-secondary">Taking you to secure sign-in.</div>
      </div>
    </div>
  )
}
