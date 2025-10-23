"use client"

import { PageContainer } from '@/components/common/PageContainer'

export default function ReauthPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Re-authentication required</h1>
      <section className="card p-6 space-y-3 max-w-xl">
        <p>For security reasons, please sign in again.</p>
        <div className="flex gap-2">
          <button className="btn">Sign in</button>
          <button className="btn btn-outline">Use another method</button>
        </div>
      </section>
    </PageContainer>
  )
}
