"use client"

import { useState } from 'react'
import { getFirebaseAuth } from '@/lib/firebase'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import Link from 'next/link'

// Standard flow with old + new password (requires re-authentication)
export default function ChangePasswordPage() {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  const email = user?.email ?? ''

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!user || !email) {
      setError('Please sign in with an email/password account to change your password here.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      const cred = EmailAuthProvider.credential(email, oldPassword)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, newPassword)
      setMessage('Your password has been updated successfully.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to change password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Change Password</h1>
        <Link href="/account/security" className="chip">← Back</Link>
      </div>
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        {message ? <div className="text-sm text-green-600">{message}</div> : null}
        {error ? <div className="text-sm text-red-500">{error}</div> : null}

        <div>
          <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))]"
            style={{ borderColor: 'rgb(var(--border-subtle))' }}
          />
        </div>

        <div>
          <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Current password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
            style={{ borderColor: 'rgb(var(--border-subtle))' }}
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
            style={{ borderColor: 'rgb(var(--border-subtle))' }}
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
            style={{ borderColor: 'rgb(var(--border-subtle))' }}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn disabled:opacity-50">
            {loading ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  )
}
