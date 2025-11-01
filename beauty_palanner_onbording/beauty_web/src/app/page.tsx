"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [loading, user, router])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-sm opacity-70">
      <span>Redirecting…</span>
    </div>
  )
}
