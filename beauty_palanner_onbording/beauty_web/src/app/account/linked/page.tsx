"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'

export default function LinkedAccountsPage() {
  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Linked accounts</h1>
        <section className="card p-6 space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Google</div>
              <div className="text-sm opacity-60">Sign in with Google</div>
            </div>
            <button className="btn btn-outline">Connect</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Apple</div>
              <div className="text-sm opacity-60">Sign in with Apple</div>
            </div>
            <button className="btn btn-outline">Connect</button>
          </div>
        </section>
      </PageContainer>
    </Protected>
  )
}
