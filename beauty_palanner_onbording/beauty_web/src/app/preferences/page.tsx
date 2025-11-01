"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Link from 'next/link'

export default function PreferencesPage() {

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto space-y-3 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Preferences</h1>
          {/* App Appearance */}
          <Link href="/account/appearance" className="block">
            <div className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition">
              <h3 className="text-xl font-semibold text-text-primary flex-1">App Appearance</h3>
            </div>
          </Link>
          {/* Notifications */}
          <Link href="/account/notifications" className="block">
            <div className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition">
              <h3 className="text-xl font-semibold text-text-primary flex-1">Notifications</h3>
            </div>
          </Link>
          {/* Language & Region (temporarily hidden) */}
          {/* Calendar & Schedule */}
          <Link href="/account/schedule" className="block">
            <div className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition">
              <h3 className="text-xl font-semibold text-text-primary flex-1">Calendar & Schedule</h3>
            </div>
          </Link>
        </div>
      </PageContainer>
    </Protected>
  )
}
