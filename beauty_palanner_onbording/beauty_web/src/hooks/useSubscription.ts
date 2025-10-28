"use client"

import { useQuery } from '@tanstack/react-query'
import { getFirebaseAuth } from '@/lib/firebase'

export type SubscriptionInfo = {
  status: 'active' | 'inactive'
  planId: string | null
  entitlement: string | null
  store: 'appstore' | 'playstore' | 'stripe' | 'promotional' | 'unknown' | null
  expiresAt: string | null // ISO
  willRenew: boolean
  period: 'annual' | 'monthly' | 'weekly' | 'lifetime' | 'unknown' | null
}

const ENDPOINT = 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/getUserSubscription'

async function fetchSubscription(): Promise<SubscriptionInfo | null> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) return null
  const token = await user.getIdToken()
  const resp = await fetch(ENDPOINT, { headers: { Authorization: `Bearer ${token}` } })
  if (!resp.ok) throw new Error(`Subscription fetch failed: ${resp.status}`)
  return (await resp.json()) as SubscriptionInfo
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  })
}
