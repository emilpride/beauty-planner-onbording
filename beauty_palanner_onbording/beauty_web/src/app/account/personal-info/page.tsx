"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useMemo, useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserDetails, useSaveUserDetails, useUserStats, type DetailsProfile } from '@/hooks/useUserDetails'

function formatAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const d = new Date(birthDate)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

// Lightweight date picker modal (month grid)
function CalendarModal({ value, onClose, onPick }: { value: string | null; onClose: () => void; onPick: (iso: string) => void }) {
  const initial = value ? new Date(value) : new Date()
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() })
  const firstDay = new Date(view.year, view.month, 1)
  const startIdx = firstDay.getDay() // 0..6
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells = useMemo(() => {
    const arr: Array<{ key: string; day: number | null }> = []
    for (let i = 0; i < startIdx; i++) arr.push({ key: `e-${i}`, day: null })
    for (let d = 1; d <= daysInMonth; d++) arr.push({ key: `d-${d}`, day: d })
    return arr
  }, [startIdx, daysInMonth])

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const select = (day: number) => {
    const iso = new Date(view.year, view.month, day).toISOString().slice(0, 10)
    onPick(iso)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[380px] bg-surface rounded-2xl border border-border-subtle shadow-xl">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 grid place-items-center rounded-lg border border-border-subtle hover:bg-surface-hover" onClick={() => setView(v => ({ year: v.month===0? v.year-1: v.year, month: v.month===0? 11 : v.month-1 }))} aria-label="Prev month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="text-sm font-semibold text-text-primary">
              {view.year} – {months[view.month]}
            </div>
            <button className="h-8 w-8 grid place-items-center rounded-lg border border-border-subtle hover:bg-surface-hover" onClick={() => setView(v => ({ year: v.month===11? v.year+1: v.year, month: v.month===11? 0 : v.month+1 }))} aria-label="Next month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="rotate-180"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <button className="text-sm px-3 py-1 rounded-lg border border-border-subtle hover:bg-surface-hover" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 text-xs text-text-secondary mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (<div key={d} className="h-6 grid place-items-center">{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ key, day }) => day ? (
              <button key={key} onClick={() => select(day)} className="h-9 rounded-lg border border-border-subtle hover:bg-surface-hover text-sm">
                {day}
              </button>
            ) : (
              <div key={key} />
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-border-subtle flex items-center justify-end gap-2">
          <button className="px-3 h-9 rounded-lg border border-border-subtle hover:bg-surface-hover text-sm" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function PersonalInfoPage() {
  const { user } = useAuth()
  const { data: profileSummary } = useUserProfile(user?.uid)
  const { data: details } = useUserDetails(user?.uid)
  const stats = useUserStats(user?.uid)
  const save = useSaveUserDetails()

  const [editing, setEditing] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [form, setForm] = useState<DetailsProfile>({ fullName: '', email: '', gender: '', birthDate: null })

  const age = useMemo(() => {
    const fromDob = formatAge(details?.birthDate ?? null)
    return fromDob ?? (details?.ageNumber ?? null)
  }, [details?.birthDate, details?.ageNumber])

  // Initialize form when details load
  useMemo(() => {
    if (details) setForm(details)
  }, [details])

  const activitiesPill = useMemo(() => {
    const completed = stats.data?.activitiesCompleted
    if (typeof completed === 'number') return completed
    return profileSummary?.activitiesCount || 0
  }, [stats.data?.activitiesCompleted, profileSummary?.activitiesCount])

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[900px] mx-auto py-8 space-y-6">
          {/* Header */}
          <div className="mb-2 flex items-center gap-4">
            <Link href="/account" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Personal Info</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Profile card */}
              <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden border border-border-subtle">
                    <Image src={profileSummary?.profilePicture || '/icons/misc/avatar_placeholder.png'} alt="Avatar" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-text-primary">{profileSummary?.name || details?.fullName || '—'}</div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-surface-hover border border-border-subtle text-text-secondary">
                        lvl {stats.data?.level ?? profileSummary?.level ?? 1}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-green-500/10 border border-green-500/30 text-green-600">
                        {activitiesPill} Activities
                      </span>
                    </div>
                  </div>
                </div>
                {/* Details rows */}
                <div className="mt-4 space-y-3">
                  <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                    <div className="text-xs text-text-secondary font-semibold">Email</div>
                    <div className="text-sm text-text-primary break-all">{details?.email || user?.email || '—'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                      <div className="text-xs text-text-secondary font-semibold">Gender</div>
                      <div className="text-sm text-text-primary capitalize">{details?.gender || '—'}</div>
                    </div>
                    <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                      <div className="text-xs text-text-secondary font-semibold">Age</div>
                      <div className="text-sm text-text-primary">{age ?? '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button onClick={() => setEditing(true)} className="w-full h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-medium text-sm">Edit profile</button>
                </div>
              </section>

              {/* Streak & stats */}
              <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl grid place-items-center bg-orange-100 text-orange-600 border border-orange-200">
                    {/* Inline flame icon reused from report */}
                    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden>
                      <defs>
                        <linearGradient id="fireGradientPI" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F14230" />
                          <stop offset="100%" stopColor="#FB8B00" />
                        </linearGradient>
                      </defs>
                      <path d="M32 4C32 4 16 16 16 32C16 40.837 23.163 48 32 48C40.837 48 48 40.837 48 32C48 16 32 4 32 4Z" fill="url(#fireGradientPI)" />
                      <ellipse cx="32" cy="34" rx="8" ry="10" fill="#FFED6F" opacity="0.8" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary font-semibold">Current Streak</div>
                    <div className="text-4xl font-bold text-text-primary leading-tight">{stats.data?.currentStreak ?? 0}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{Math.round((stats.data?.completionRate ?? 0) * 100)}%</div>
                    <div className="text-xs text-text-secondary">Completion rate</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{stats.data?.activitiesCompleted ?? 0}</div>
                    <div className="text-xs text-text-secondary">Activities completed</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{stats.data?.perfectDays ?? 0}</div>
                    <div className="text-xs text-text-secondary">Total perfect days</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/report" className="w-full h-10 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover grid place-items-center text-sm text-text-primary">More Details</Link>
                </div>
              </section>
            </div>

            {/* Right column: Edit form */}
            <div className="space-y-6">
              {editing && (
                <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="text-xl font-bold text-text-primary">Edit Profile</h2>
                  </div>
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
                      <div className="relative">
                        <input value={form.birthDate ?? ''} readOnly onClick={() => setShowCalendar(true)} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm pr-10 cursor-pointer" placeholder="YYYY-MM-DD" />
                        <button type="button" onClick={() => setShowCalendar(true)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md border border-border-subtle">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 11H17M7 15H14M16 3V7M8 3V7M7 7H17C18.1046 7 19 7.89543 19 9V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V9C5 7.89543 5.89543 7 7 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </label>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => { if (!user?.uid) return; save.mutate({ userId: user.uid, profile: form }, { onSuccess: () => setEditing(false) }) }}
                      disabled={save.isPending}
                      className="w-full h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-medium text-sm"
                    >{save.isPending ? 'Saving…' : 'Save'}</button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
        {showCalendar && (
          <CalendarModal
            value={form.birthDate}
            onClose={() => setShowCalendar(false)}
            onPick={(iso) => { setForm(s => ({ ...s, birthDate: iso })); setShowCalendar(false) }}
          />
        )}
      </PageContainer>
    </Protected>
  )
}
