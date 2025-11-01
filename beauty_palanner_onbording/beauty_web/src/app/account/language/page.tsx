"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import Link from 'next/link'

// Language & Region controls are temporarily disabled

export default function LanguageRegionPage() {
  const { user } = useAuth()

  useEffect(() => { /* no-op while disabled */ }, [user?.uid])

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[720px] mx-auto py-8 space-y-6">
          <div className="mb-2 flex items-center gap-4">
            <Link href="/preferences" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Language & Region</h1>
          </div>

          <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm space-y-3">
            <p className="text-sm text-text-secondary">
              Language and region selection is temporarily disabled. The app will use English (US) for now.
            </p>
          </section>
        </div>
      </PageContainer>
    </Protected>
  )
}
