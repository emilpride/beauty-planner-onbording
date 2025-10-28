"use client"

import { useState } from 'react'
import { functionsClient } from '@/lib/functionsClient'
import { getFirebaseAuth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DeleteAccountPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm) { setStatus('Please confirm you understand this action is permanent.'); return }
    try {
      setLoading(true)
      await functionsClient.deleteAccount()
      // Best-effort sign out locally and redirect
      await signOut(getFirebaseAuth()).catch(() => {})
      setStatus('Your account has been deleted.')
      router.push('/')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete account'
      setStatus(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delete Account</h1>
        <Link href="/account/security" className="chip">← Back</Link>
      </div>
      <div className="space-y-2">
        <p className="text-[rgb(var(--text-secondary))]">This will permanently remove your account and data. This action cannot be undone.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} />
          <span>I understand this action is permanent.</span>
        </label>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading || !confirm}
        className="inline-flex items-center rounded-lg px-4 py-2 text-white disabled:opacity-50 bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
      >
        {loading ? 'Deleting…' : 'Delete account'}
      </button>
      {status ? <div className="text-sm text-[rgb(var(--text-secondary))]">{status}</div> : null}
    </div>
  )
}
