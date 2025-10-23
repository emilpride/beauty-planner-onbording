"use client"

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import Link from 'next/link'
import { PageContainer } from '@/components/common/PageContainer'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email)
      setMessage('Password reset email sent')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Reset password</h1>
      <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-sm">
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <div className="text-sm">
          <Link href="/login" className="chip">Back to login</Link>
        </div>
      </form>
    </PageContainer>
  )
}
