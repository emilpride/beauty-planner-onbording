"use client"

import { PageContainer } from '@/components/common/PageContainer'

export default function OTPPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Enter verification code</h1>
      <section className="card p-6 space-y-3 max-w-sm">
        <input className="input input-bordered w-full" placeholder="123456" />
        <div className="flex gap-2">
          <button className="btn">Verify</button>
          <button className="btn btn-outline">Resend</button>
        </div>
      </section>
    </PageContainer>
  )
}
