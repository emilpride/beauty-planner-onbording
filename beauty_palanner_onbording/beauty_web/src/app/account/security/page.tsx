"use client"

import Link from 'next/link'
import type { Route } from 'next'
import { getFirebaseAuth } from '@/lib/firebase'

function Item({ href, title, subtitle, danger }: { href: string; title: string; subtitle?: string; danger?: boolean }) {
  return (
    <Link
      href={href as Route}
      className="block rounded-xl border card p-4 hover:shadow-md transition-shadow"
      style={{ borderColor: 'rgb(var(--border-subtle))' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-base font-semibold ${danger ? 'text-red-600 dark:text-red-400' : ''}`}>{title}</div>
          {subtitle ? <div className="text-sm mt-1 text-[rgb(var(--text-secondary))]">{subtitle}</div> : null}
        </div>
        <div className="text-[rgb(var(--text-secondary))]">▶</div>
      </div>
    </Link>
  )
}

export default function SecurityPage() {
  // Ensure user is loaded to avoid flicker (no-op use)
  getFirebaseAuth()
  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Security</h1>
      <Item href="/account/security/change-password" title="Change Password" />
      <Item href="/account/security/devices" title="Device Management" subtitle="Manage your account on the various devices you own." />
      <Item href="/account/security/deactivate" title="Deactivate Account" subtitle="Temporarily deactivate your account. Easily reactivate when you're ready." />
      <Item href="/account/security/delete" title="Delete Account" subtitle="Permanently remove your account and data. Proceed with caution." danger />
    </div>
  )
}
