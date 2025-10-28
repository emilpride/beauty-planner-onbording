"use client"

import { getFirebaseAuth } from '@/lib/firebase'

const BASE = 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net'

async function authedPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) throw new Error('not_authenticated')
  const token = await user.getIdToken()
  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(text || `request_failed_${resp.status}`)
  }
  const ct = resp.headers.get('content-type') || ''
  if (ct.includes('application/json')) return (await resp.json()) as T
  return undefined as unknown as T
}

export const functionsClient = {
  revokeOtherSessions: () => authedPost('/revokeOtherSessions'),
  deactivateAccount: (reason?: string) => authedPost('/deactivateAccount', { reason }),
  reactivateAccount: () => authedPost('/reactivateAccount'),
  deleteAccount: () => authedPost('/deleteAccount', { confirm: true }),
}
