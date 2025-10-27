"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/useNotifications'
import { useNotificationPrefs, useSaveNotificationPrefs } from '@/hooks/useNotificationPrefs'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

function ChannelChooser({
  label,
  value,
  onChange,
}: {
  label: string
  value: { push: boolean; email: boolean }
  onChange: (v: { push: boolean; email: boolean }) => void
}) {
  // Map to three-state segmented control: Off | Push | Email | Both
  type Mode = 'off' | 'push' | 'email' | 'both'
  const mode: Mode = value.push && value.email ? 'both' : value.push ? 'push' : value.email ? 'email' : 'off'
  const setMode = (m: Mode) => {
    if (m === 'off') onChange({ push: false, email: false })
    else if (m === 'push') onChange({ push: true, email: false })
    else if (m === 'email') onChange({ push: false, email: true })
    else onChange({ push: true, email: true })
  }
  const idx = ['off','push','email','both'].indexOf(mode)
  // precise pill alignment
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([])
  useEffect(() => {
    const update = () => {
      const btn = btnRefs.current[idx]
      const indicator = indicatorRef.current
      if (!btn || !indicator) return
      indicator.style.transform = `translateX(${btn.offsetLeft}px)`
      indicator.style.width = `${btn.offsetWidth}px`
    }
    const raf = requestAnimationFrame(update)
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [idx])
  return (
    <div className="space-y-2">
      <div className="text-sm text-text-secondary">{label}</div>
      <div ref={tabsRef} className="relative inline-flex rounded-xl border border-border-subtle bg-surface p-1">
        <span ref={indicatorRef} aria-hidden className="absolute top-1 bottom-1 left-1 rounded-lg bg-[rgb(var(--accent))] transition-[transform,width] duration-300" style={{ transform: 'translateX(0)', width: 0 }} />
        {(['off','push','email','both'] as Mode[]).map((m, i) => (
          <button ref={(el) => { btnRefs.current[i] = el }} key={m} role="tab" aria-selected={mode===m} onClick={() => setMode(m)} className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-lg ${mode===m? 'text-white':'text-text-primary'}`}>
            {m === 'off' ? 'Off' : m === 'push' ? 'Push' : m === 'email' ? 'Email' : 'Both'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NotificationsSettingsPage() {
  const { user } = useAuth()
  const { supported, permission, token, busy, enable, disable } = usePushNotifications(user?.uid)
  const { data: prefs } = useNotificationPrefs(user?.uid)
  const savePrefs = useSaveNotificationPrefs()
  const p = prefs ?? { procedures: { push: false, email: false }, mood: { push: false, email: false }, weeklyEmail: false }
  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[720px] mx-auto py-8">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/preferences" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Notifications</h1>
          </div>
        
        <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm space-y-6">
          {/* Procedures reminders: choose push/email/both/off */}
          <ChannelChooser
            label="Reminders for procedures"
            value={p.procedures}
            onChange={(val) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, procedures: val } })}
          />

          {/* Mood check-in: choose push/email/both/off */}
          <ChannelChooser
            label="Reminder to log mood"
            value={p.mood}
            onChange={(val) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, mood: val } })}
          />

          <div className="pt-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle"
                checked={!!p.weeklyEmail}
                onChange={(e) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, weeklyEmail: e.target.checked } })}
              />
              <span>Weekly progress email</span>
            </label>
          </div>

          <hr className="my-2" />
          {/* Optional browser push (not required; kept for convenience) */}
          <div className="text-sm opacity-70">
            {supported ? 'Browser supports push notifications' : 'Browser push is not supported here'}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn" disabled={!user || busy || permission === 'granted'} onClick={() => enable()}>
              {permission === 'granted' ? 'Enabled' : busy ? 'Enabling…' : 'Enable Push Notifications'}
            </button>
            {permission === 'granted' && (
              <button className="btn btn-outline" disabled={!user || busy || !token} onClick={() => disable()}>
                {busy ? 'Disabling…' : 'Disable'}
              </button>
            )}
          </div>
          <div className="text-xs opacity-60 break-all">
            Permission: {permission}
            {token ? <div>FCM token: {token}</div> : null}
          </div>
        </section>
        </div>
      </PageContainer>
    </Protected>
  )
}
