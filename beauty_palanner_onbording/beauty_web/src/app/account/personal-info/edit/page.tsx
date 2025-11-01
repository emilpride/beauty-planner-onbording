"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserDetails, useSaveUserDetails, type DetailsProfile } from '@/hooks/useUserDetails'
import { useEffect, useState } from 'react'

export default function EditPersonalInfoPage() {
  const { user } = useAuth()
  const { data: details } = useUserDetails(user?.uid)
  const save = useSaveUserDetails()
  const [form, setForm] = useState<DetailsProfile>({ fullName: '', email: '', gender: '', birthDate: null })

  useEffect(() => {
    if (details) setForm(details)
  }, [details])

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[720px] mx-auto py-8 space-y-6">
          <div className="mb-2 flex items-center gap-4">
            <Link href="/account/personal-info" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Edit Personal Info</h1>
          </div>

          <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-5 shadow-sm">
            <div className="space-y-3">
              <label className="block">
                <div className="text-xs text-text-secondary font-semibold mb-1">Full Name</div>
                <input value={form.fullName} onChange={(e) => setForm(s => ({ ...s, fullName: e.target.value }))} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm" placeholder="Your name" />
              </label>
              <label className="block">
                <div className="text-xs text-text-secondary font-semibold mb-1">Email</div>
                <input value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm" placeholder="name@domain.com" />
              </label>
              <label className="block">
                <div className="text-xs text-text-secondary font-semibold mb-1">Gender</div>
                <select value={form.gender} onChange={(e) => setForm(s => ({ ...s, gender: e.target.value as DetailsProfile['gender'] }))} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs text-text-secondary font-semibold mb-1">Birth Date</div>
                <input type="date" value={form.birthDate ?? ''} onChange={(e) => setForm(s => ({ ...s, birthDate: e.target.value || null }))} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm" />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { if (!user?.uid) return; save.mutate({ userId: user.uid, profile: form }, { onSuccess: () => history.back() }) }}
                disabled={save.isPending}
                className="flex-1 h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-medium text-sm"
              >{save.isPending ? 'Saving…' : 'Save'}</button>
              <Link href="/account/personal-info" className="h-10 grid place-items-center px-4 rounded-lg border border-border-subtle text-sm">Cancel</Link>
            </div>
          </section>
        </div>
      </PageContainer>
    </Protected>
  )
}
