"use client"

import { Protected } from '@/components/auth/Protected'
import Link from 'next/link'
import { PageContainer } from '@/components/common/PageContainer'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { useAuth } from '@/hooks/useAuth'
import { useTodayUpdates } from '@/hooks/useUpdates'
import React from 'react'

export default function HomePage() {
  const { user } = useAuth()
  const { data, isLoading } = useTodayUpdates(user?.uid)

  const total = data?.stats.total ?? 0
  const completed = data?.stats.completed ?? 0
  const progress = total > 0 ? completed / total : 0

  return (
    <Protected>
      <PageContainer>
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav className="flex items-center gap-3">
            <Link className="chip" href="/dashboard">Daily</Link>
            <Link className="chip" href="/dashboard?tab=weekly">Weekly</Link>
            <Link className="chip" href="/dashboard?tab=overall">Overall</Link>
            <Link className="chip" href="/account">Account</Link>
          </nav>
        </header>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Activities</h2>
              <p className="opacity-70">Your progress today</p>
            </div>
            <div className="text-right">
              {isLoading ? (
                <span className="opacity-70">Loading…</span>
              ) : (
                <>
                  <span className="text-3xl font-bold">{completed}</span>
                  <span className="opacity-70">/{total}</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <ProgressRing size={200} progress={progress} />
          </div>
        </section>
      </PageContainer>
    </Protected>
  )
}
