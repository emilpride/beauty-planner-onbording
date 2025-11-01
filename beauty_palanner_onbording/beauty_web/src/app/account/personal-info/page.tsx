"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useMemo, useState } from 'react'
import { useUpdatesInDateRange } from '@/hooks/useUpdates'
import { computeGeneralStats } from '@/lib/report'
import { calculateLevel } from '@/types/achievements'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserDetails, useUserStats, type DetailsProfile } from '@/hooks/useUserDetails'
import { getFirebaseStorage, getFirestoreDb } from '@/lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import Link from 'next/link'

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
  // Fallback to derive stats from updates if missing in Users doc
  const twoYearsAgo = useMemo(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d
  }, [])
  const updatesRange = useUpdatesInDateRange(user?.uid, twoYearsAgo, new Date())
  const derived = useMemo(() => computeGeneralStats(updatesRange.data?.items ?? []), [updatesRange.data?.items])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [showCalendar, setShowCalendar] = useState(false)
  const [form, setForm] = useState<DetailsProfile>({ fullName: '', email: '', gender: '', birthDate: null })

  const age = useMemo(() => {
    const fromDob = formatAge(details?.birthDate ?? null)
    return fromDob ?? (details?.ageNumber ?? null)
  }, [details?.birthDate, details?.ageNumber])

  // Initialize form when details load (used for local age calc only)
  useMemo(() => {
    if (details) setForm(details)
  }, [details])

  // Completed activities counter (strictly completions; do not fall back to configured activities)
  const completedActivities = useMemo(() => {
    if (typeof stats.data?.activitiesCompleted === 'number') return stats.data.activitiesCompleted
    return derived.totalActivitiesCompleted || 0
  }, [stats.data?.activitiesCompleted, derived.totalActivitiesCompleted])

  const currentStreak = stats.data?.currentStreak && stats.data.currentStreak > 0 ? stats.data.currentStreak : derived.currentStreak
  const completionPct = Math.round((stats.data?.completionRate ?? (derived.overallCompletionRate || 0)) * 100)
  const derivedLevel = useMemo(() => (derived.totalActivitiesCompleted ? calculateLevel(derived.totalActivitiesCompleted) : undefined), [derived.totalActivitiesCompleted])

  async function handlePhotoSelected(file: File) {
    if (!user?.uid) return
    setUploadError(null)
    // Basic validation
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('File is too large. Max size is 5 MB.')
      return
    }
    setUploading(true)
    try {
      const storage = getFirebaseStorage()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `avatars/${user.uid}/${Date.now()}.${ext}`
  const sref = storageRef(storage, path)
  await uploadBytes(sref, file, { contentType: file.type })
  const url = await getDownloadURL(sref)
      // Save photo fields to Firestore user doc directly (avoid overwriting other fields)
      const db = getFirestoreDb()
  const dref = doc(db, 'users_v2', user.uid)
      await setDoc(
        dref,
        {
          PhotoURL: url,
          PhotoUrl: url,
          ProfilePicture: url,
          AvatarUrl: url,
          AvatarURL: url,
          ProfileImage: url,
          ProfilePhoto: url,
          PhotoUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      // Update auth profile so UI that reads user.photoURL updates immediately
      if (user) {
        try { await updateProfile(user, { photoURL: url }) } catch {}
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to upload photo.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  async function handlePhotoRemove() {
    if (!user?.uid) return
    const currentUrl = details?.photoUrl || profileSummary?.profilePicture || user?.photoURL || null
    setUploadError(null)
    setUploading(true)
    try {
      if (currentUrl) {
        try {
          const storage = getFirebaseStorage()
          const sref = storageRef(storage, currentUrl)
          await deleteObject(sref)
        } catch (_) {
          // Ignore delete errors (could be external URL or permissions)
        }
      }
      const db = getFirestoreDb()
      const dref = doc(db, 'users_v2', user.uid)
      await setDoc(
        dref,
        {
          PhotoURL: null,
          PhotoUrl: null,
          ProfilePicture: null,
          AvatarUrl: null,
          AvatarURL: null,
          ProfileImage: null,
          ProfilePhoto: null,
          PhotoUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      try { await updateProfile(user, { photoURL: '' }) } catch {}
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to remove photo.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

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
                    <Image src={details?.photoUrl || profileSummary?.profilePicture || (user?.photoURL ?? '/icons/misc/assistant.png')} alt="Avatar" fill className="object-cover" />
                    {/* Change photo button overlay */}
                    <label className="absolute bottom-0 right-0 m-0.5 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handlePhotoSelected(f) }} />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 7H7L9 5H15L17 7H20V19H4V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </label>
                    {(details?.photoUrl || profileSummary?.profilePicture || user?.photoURL) && (
                      <button
                        title="Remove photo"
                        onClick={() => void handlePhotoRemove()}
                        className="absolute bottom-0 left-0 m-0.5 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-text-primary">{details?.fullName || profileSummary?.name || user?.displayName || '—'}</div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-surface-hover border border-border-subtle text-text-secondary">
                        lvl {stats.data?.level ?? derivedLevel ?? profileSummary?.level ?? 1}
                      </span>
                    </div>
                  </div>
                </div>
                {(uploading || uploadError) && (
                  <div className="mt-3 text-xs">
                    {uploading && <div className="text-text-secondary">Uploading photo…</div>}
                    {uploadError && <div className="text-red-600">{uploadError}</div>}
                  </div>
                )}
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
                  <Link href="/account/personal-info/edit" className="w-full h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-medium text-sm disabled:opacity-60 grid place-items-center">Edit profile</Link>
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
                    <div className="text-4xl font-bold text-text-primary leading-tight">{currentStreak ?? 0}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{completionPct}%</div>
                    <div className="text-xs text-text-secondary">Completion rate</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{completedActivities}</div>
                    <div className="text-xs text-text-secondary">Activities completed</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-hover p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{stats.data?.perfectDays ?? derived.totalPerfectDays ?? 0}</div>
                    <div className="text-xs text-text-secondary">Total perfect days</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/report" className="w-full h-10 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover grid place-items-center text-sm text-text-primary">More Details</Link>
                </div>
              </section>
            </div>

            {/* Right column intentionally left empty (edit is a separate page now) */}
            <div className="space-y-6" />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
