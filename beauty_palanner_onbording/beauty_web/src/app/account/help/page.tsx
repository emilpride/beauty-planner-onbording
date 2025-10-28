"use client"

import { useState } from 'react'
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

export default function HelpAndSupportPage() {
  const auth = getFirebaseAuth()
  const user = auth.currentUser

  const [name, setName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [topic, setTopic] = useState('General')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setError(null)

    if (!email || !message || !subject) {
      setError('Please provide your email, a subject, and a message.')
      return
    }

    try {
      setLoading(true)
      const db = getFirestoreDb()
      await addDoc(collection(db, 'SupportMessages'), {
        uid: user?.uid || null,
        name: name || null,
        email,
        topic,
        subject,
        message,
        status: 'new',
        createdAt: serverTimestamp(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
      setStatus('Thanks! Your message has been submitted. Our team will get back to you shortly.')
      setSubject('')
      setMessage('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to submit. Please try again later.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <a href="/account" className="chip">← Back to Account</a>
      </header>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Contact us</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
              style={{ borderColor: 'rgb(var(--border-subtle))' }}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
              style={{ borderColor: 'rgb(var(--border-subtle))' }}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))]"
              style={{ borderColor: 'rgb(var(--border-subtle))' }}
            >
              <option>General</option>
              <option>Billing</option>
              <option>Technical issue</option>
              <option>Feedback</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
              style={{ borderColor: 'rgb(var(--border-subtle))' }}
              placeholder="Brief summary"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-[rgb(var(--text-secondary))] mb-1">Message</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border p-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))] placeholder:text-gray-400"
              style={{ borderColor: 'rgb(var(--border-subtle))' }}
              placeholder="How can we help? Please include any relevant details."
              required
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" className="btn disabled:opacity-50" disabled={loading}>
              {loading ? 'Sending…' : 'Send message'}
            </button>
            {status ? <span className="text-sm text-green-600">{status}</span> : null}
            {error ? <span className="text-sm text-red-500">{error}</span> : null}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">FAQ</h2>
        <div className="space-y-3">
          <details className="rounded-md border" style={{ borderColor: 'rgb(var(--border-subtle))' }}>
            <summary className="cursor-pointer px-4 py-3 font-medium">How do I change my password?</summary>
            <div className="px-4 pb-4 text-[rgb(var(--text-secondary))]">
              Go to Account → Security → Change Password. Enter your current password and your new one, then save.
            </div>
          </details>
          <details className="rounded-md border" style={{ borderColor: 'rgb(var(--border-subtle))' }}>
            <summary className="cursor-pointer px-4 py-3 font-medium">How can I manage my subscription?</summary>
            <div className="px-4 pb-4 text-[rgb(var(--text-secondary))]">
              Open Account → Billing to view your plan and manage it via the store that you used for purchase.
            </div>
          </details>
          <details className="rounded-md border" style={{ borderColor: 'rgb(var(--border-subtle))' }}>
            <summary className="cursor-pointer px-4 py-3 font-medium">I’m not receiving notifications</summary>
            <div className="px-4 pb-4 text-[rgb(var(--text-secondary))]">
              Ensure notifications are enabled in Account → Notifications and allowed in your browser/system settings.
            </div>
          </details>
          <details className="rounded-md border" style={{ borderColor: 'rgb(var(--border-subtle))' }}>
            <summary className="cursor-pointer px-4 py-3 font-medium">How do I export or delete my data?</summary>
            <div className="px-4 pb-4 text-[rgb(var(--text-secondary))]">
              You can deactivate or delete your account in Account → Security. For data export, contact us using the form above.
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
