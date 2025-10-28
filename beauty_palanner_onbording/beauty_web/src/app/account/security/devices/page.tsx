"use client"

import { useState } from 'react'
import { functionsClient } from '@/lib/functionsClient'
import Link from 'next/link'

export default function DevicesPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRevoke() {
    try {
      setLoading(true)
      await functionsClient.revokeOtherSessions()
      setStatus('All sessions have been revoked. You may need to sign in again on other devices.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to revoke sessions'
      setStatus(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Device Management</h1>
        <Link href="/account/security" className="chip">← Back</Link>
      </div>
      <p className="text-[rgb(var(--text-secondary))]">Sign out your account from all other devices. This will keep only your current device active.</p>
      <button
        onClick={handleRevoke}
        disabled={loading}
        className="btn disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Sign out of other devices'}
      </button>
      {status ? <div className="text-sm text-[rgb(var(--text-secondary))]">{status}</div> : null}
    </div>
  )
}
