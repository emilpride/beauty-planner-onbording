"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Link from 'next/link'
import type { Route } from 'next'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

function formatPrice(planId?: string | null, period?: string | null) {
  // Optional known mapping by product id → price
  // TODO: Extend with real product ids
  const map: Record<string, { price: string; period: 'year' | 'month' | 'week' | 'lifetime' }> = {
    'premium_year': { price: '$49.99', period: 'year' },
    'premium_annual': { price: '$49.99', period: 'year' },
    'premium_month': { price: '$6.99', period: 'month' },
  }
  if (planId && map[planId]) return `${map[planId].price} / ${map[planId].period}`
  if (period === 'annual') return '$— / year'
  if (period === 'monthly') return '$— / month'
  if (period === 'weekly') return '$— / week'
  if (period === 'lifetime') return 'Lifetime'
  return '$—'
}

function formatExpiry(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function manageLink(store?: string | null) {
  const s = (store || '').toLowerCase()
  if (s.includes('appstore') || s.includes('ios')) return 'https://apps.apple.com/account/subscriptions'
  if (s.includes('play') || s.includes('android')) return 'https://play.google.com/store/account/subscriptions'
  // Could be Stripe portal if used for web checkout (not available here)
  return 'https://support.google.com/googleplay/answer/7018481'
}

export default function BillingPage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useSubscription()

  const price = formatPrice(data?.planId || undefined, data?.period || null)
  const expires = formatExpiry(data?.expiresAt)
  const isActive = data?.status === 'active'

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Billing & Subscriptions</h1>

          <div className="relative bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            {/* Ribbon */}
            <div className="absolute right-3 top-3 bg-accent text-white text-[11px] font-semibold rounded-full px-2 py-[2px]">
              Save 17%
            </div>

            <div className="p-5">
              <div className="text-center mb-2">
                <div className="text-sm font-semibold text-accent">Beauty Mirror Premium</div>
                <div className="text-4xl font-extrabold text-text-primary mt-2">{price}</div>
                <div className="text-[11px] uppercase tracking-wide text-text-secondary mt-1">{isActive ? 'Your current plan' : 'Free plan'}</div>
              </div>

              {/* Features list */}
              <ul className="mt-4 space-y-2 text-sm text-text-primary">
                {([
                  ['Unlimited Activity tracking', '/procedures'],
                  ['Advanced progress tracking and reports', '/report'],
                  ['Customization options (themes, notifications)', '/account/appearance'],
                  ['Customer priority support', '/account/help'],
                  ['Advanced mood stat options', '/moods'],
                  ['Ad-free experience', '/dashboard'],
                ] as Array<[string, Route]>).map(([label, href]) => (
                  <li key={label as string} className="flex items-start gap-2">
                    <span className="mt-[2px] text-accent">✓</span>
                    <Link href={href} className="underline hover:text-accent">{label}</Link>
                  </li>
                ))}
              </ul>

              {/* Footer note */}
              <div className="mt-6 text-xs text-text-secondary">
                {isLoading && <div>Loading your subscription…</div>}
                {isError && <div>We couldn’t load your subscription. It may be inactive.</div>}
                {isActive && (
                  <div>
                    Your subscription will {data?.willRenew ? 'renew' : 'expire'}{expires ? ` on ${expires}` : ''}. Renew or cancel your subscription{' '}
                    <a className="underline" href={manageLink(data?.store)} target="_blank" rel="noreferrer">here</a>.
                  </div>
                )}
                {!isActive && !isLoading && (
                  <div>
                    You&apos;re on the Free plan. Purchase Premium in the mobile app to unlock all features.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
