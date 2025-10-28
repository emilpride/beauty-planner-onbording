"use client"

import { useState } from 'react'
import { functionsClient } from '@/lib/functionsClient'
import Link from 'next/link'

export default function DeactivatePage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')

  async function handleDeactivate() {
    try {
      setLoading(true)
      await functionsClient.deactivateAccount(reason)
      setStatus('Your account has been deactivated. You can reactivate anytime by signing in and visiting this page.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to deactivate'
      setStatus(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deactivate Account</h1>
        <Link href="/account/security" className="chip">← Back</Link>
      </div>
      <p className="text-[rgb(var(--text-secondary))]">Deactivation disables access to your account until you reactivate it. Your data remains intact.</p>
      <label className="block">
        <span className="text-sm text-[rgb(var(--text-secondary))]">Reason (optional)</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
          style={{ borderColor: 'rgb(var(--border-subtle))' }}
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </label>
      <button
        onClick={handleDeactivate}
        disabled={loading}
        className="inline-flex items-center rounded-lg px-4 py-2 text-white disabled:opacity-50 bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400"
      >
        {loading ? 'Deactivating…' : 'Deactivate account'}
      </button>
      {status ? <div className="text-sm text-[rgb(var(--text-secondary))]">{status}</div> : null}
    </div>
  )
}
