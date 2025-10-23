"use client"

import { PageContainer } from '@/components/common/PageContainer'

export default function VerifyEmailPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Verify your email</h1>
      <section className="card p-6 space-y-3 max-w-xl">
        <p>We sent a verification link to your email. Please check your inbox.</p>
        <button className="btn btn-outline">Resend</button>
      </section>
    </PageContainer>
  )
}
