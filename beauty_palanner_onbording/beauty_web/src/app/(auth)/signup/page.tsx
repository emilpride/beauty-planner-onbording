"use client"

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageContainer } from '@/components/common/PageContainer'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
      router.push('/')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Signup failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Create account</h1>
      <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-sm">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <div className="text-sm">
          <Link href="/login" className="chip">Have an account? Sign in</Link>
        </div>
      </form>
    </PageContainer>
  )
}
