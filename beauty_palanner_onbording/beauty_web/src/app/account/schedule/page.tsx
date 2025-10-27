"use client"

import Link from 'next/link'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useSchedulePrefs, useSaveSchedulePrefs } from '@/hooks/useSchedulePrefs'
import { useRestartAllActivities } from '@/hooks/useActivities'
import { useMemo, useState } from 'react'

export default function ScheduleSettingsPage() {
  const { user } = useAuth()
  const { data: prefs } = useSchedulePrefs(user?.uid)
  const save = useSaveSchedulePrefs()
  const restartAll = useRestartAllActivities()
  const p = prefs ?? { weekStart: 'monday', vacation: false, daySections: { morning: '05:00', afternoon: '12:00', evening: '18:00' } }

  const [local, setLocal] = useState(p)
  const dirty = useMemo(() => JSON.stringify(local) !== JSON.stringify(p), [local, p])

  const setTime = (key: 'morning'|'afternoon'|'evening', val: string) => setLocal(s => ({ ...s, daySections: { ...s.daySections, [key]: val } }))

  const onSave = () => {
    if (!user?.uid) return
    try { localStorage.setItem('bm_week_start', local.weekStart) } catch {}
    save.mutate({ userId: user.uid, prefs: local })
  }

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
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Calendar & Schedule</h1>
          </div>

          <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm space-y-5">
            {/* Week start */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-text-secondary font-semibold">First day of the week</div>
                <div className="text-base font-bold text-text-primary capitalize">{local.weekStart}</div>
              </div>
              <div className="relative inline-flex rounded-xl border border-border-subtle bg-surface p-1">
                <span aria-hidden className="absolute top-1 bottom-1 left-1 rounded-lg bg-[rgb(var(--accent))] transition-[transform,width] duration-300" style={{ transform: `translateX(${local.weekStart==='monday'?0:100}%)`, width: 'calc(50% - 0.25rem)' }} />
                {(['monday','sunday'] as const).map((opt) => (
                  <button key={opt} aria-selected={local.weekStart===opt} onClick={() => setLocal(s => ({ ...s, weekStart: opt }))} className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-lg ${local.weekStart===opt? 'text-white':'text-text-primary'}`}>{opt[0].toUpperCase()+opt.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Vacation mode */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-text-secondary font-semibold">Vacation mode</div>
                <div className="text-xs text-text-tertiary">Pauses reminders and scheduling while enabled</div>
              </div>
              <label className="inline-flex items-center gap-2 select-none cursor-pointer">
                <input type="checkbox" className="toggle" checked={!!local.vacation} onChange={(e) => setLocal(s => ({ ...s, vacation: e.target.checked }))} />
              </label>
            </div>

            {/* Day sections */}
            <div>
              <div className="text-sm text-text-secondary font-semibold mb-2">Day sections</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['morning','afternoon','evening'] as const).map((key) => (
                  <div key={key} className="p-3 rounded-lg border border-border-subtle bg-surface-hover">
                    <div className="text-sm font-semibold capitalize mb-2">{key}</div>
                    <input type="time" value={local.daySections[key]} onChange={(e) => setTime(key, e.target.value)} className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setLocal(p)} disabled={!dirty} className={`px-4 h-10 rounded-lg text-sm font-medium border ${dirty? 'border-border-subtle hover:bg-surface-hover':'text-text-secondary cursor-default'}`}>Reset</button>
              <button onClick={onSave} disabled={!dirty || save.isPending} className={`px-4 h-10 rounded-lg text-sm font-medium border ${dirty && !save.isPending ? 'bg-[rgb(var(--accent))] text-white border-transparent':'bg-surface border-border-subtle text-text-secondary cursor-default'}`}>{save.isPending? 'Saving…':'Save'}</button>
            </div>

            <div className="border-t border-border-subtle my-2" />
            <div className="space-y-2">
              <div className="text-sm text-text-secondary font-semibold">Actions</div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-hover p-3">
                <div>
                  <div className="text-sm text-text-primary">Clear Cache</div>
                  <div className="text-xs text-text-tertiary">Clear local UI cache and reload</div>
                </div>
                <button
                  onClick={() => { localStorage.clear(); location.reload() }}
                  className="px-3 h-9 rounded-lg text-sm border border-border-subtle hover:bg-surface"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-hover p-3">
                <div>
                  <div className="text-sm text-text-primary">Restart All Activities</div>
                  <div className="text-xs text-text-tertiary">Re-enable and reset all scheduled activities</div>
                </div>
                <button
                  onClick={() => {
                    if (!user?.uid) return
                    const ok = window.confirm('Restart all activities now? This will re-enable them and clear end constraints.')
                    if (!ok) return
                    restartAll.mutate({ userId: user.uid })
                  }}
                  disabled={restartAll.isPending}
                  className={`px-3 h-9 rounded-lg text-sm border ${restartAll.isPending ? 'text-text-tertiary border-border-subtle' : 'border-[color:rgba(var(--accent),0.45)] text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.08)]'}`}
                >
                  {restartAll.isPending ? 'Restarting…' : 'Restart'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </Protected>
  )
}
