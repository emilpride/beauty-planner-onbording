"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { useAuth } from '@/hooks/useAuth'
import { useTimezone, useSaveTimezone } from '@/hooks/useTimezone'
import { useMetrics, useSaveMetrics } from '@/hooks/useUserMetrics'
import BmsRing from '@/components/BmsRing'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: tz } = useTimezone(user?.uid)
  const saveTz = useSaveTimezone()
  const { data: metrics } = useMetrics(user?.uid)
  const saveMetrics = useSaveMetrics()
  const detected = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
    ? new Intl.DateTimeFormat().resolvedOptions().timeZone
    : ''
  const current = tz || detected || ''
  function isValidZone(name: string) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: name })
      return true
    } catch {
      return false
    }
  }
  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="grid gap-6 max-w-5xl md:grid-cols-2">
          {/* Wellness Score Card */}
          <section className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Wellness Score</h2>
                  <span className="text-xs opacity-60">0–10</span>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-3xl font-bold tabular-nums">
                    {metrics ? metrics.bms.toFixed(3) : '—'}
                  </div>
                  <div className={`text-sm tabular-nums ${metrics && metrics.bmsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics ? `${metrics.bmsDelta >= 0 ? '+' : ''}${metrics.bmsDelta.toFixed(3)}` : ''}
                  </div>
                </div>
                <p className="text-xs opacity-70">Changes daily based on adherence to your plan. Completing tasks increases Wellness Score slightly; skipping decreases it.</p>
              </div>
              <div className="shrink-0">
                <BmsRing
                  size={200}
                  thickness={24}
                  overall={Number(metrics?.bms?.toFixed(1) ?? 0)}
                  // Distribute overall into equal segments for now (no per-domain scores yet)
                  scores={{
                    skin: metrics?.bms ?? 0,
                    hair: metrics?.bms ?? 0,
                    physic: metrics?.bms ?? 0,
                    mental: metrics?.bms ?? 0,
                  }}
                  icons={{
                    skin: '/custom-icons/bms/skin_bms.svg',
                    hair: '/custom-icons/bms/hair_bms.svg',
                    physic: '/custom-icons/bms/physical_bms.svg',
                    mental: '/custom-icons/bms/mental_bms.svg',
                  }}
                  colors={{
                    skin: '#60A5FA',
                    hair: '#6EE7B7',
                    physic: '#FBBF24',
                    mental: '#F472B6',
                  }}
                />
              </div>
            </div>
          </section>

          {/* BMI Card */}
          <section className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">BMI</h2>
              <span className="text-xs opacity-60">Body Mass Index</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-bold tabular-nums">
                {metrics?.bmi != null ? metrics.bmi.toFixed(1) : '—'}
              </div>
              <div className="text-sm opacity-70">{metrics?.bmiCategory ?? '—'}</div>
            </div>
            {metrics?.bodyFatPct != null && (
              <div className="text-sm text-text-secondary">Estimated body fat: <span className="font-semibold tabular-nums">{metrics.bodyFatPct.toFixed(1)}%</span></div>
            )}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input id="height-input" type="number" inputMode="decimal" min={80} max={250} step={1}
                  defaultValue={metrics?.heightCm ?? ''}
                  className="input input-bordered flex-1" placeholder="Height (cm)" />
                <input id="weight-input" type="number" inputMode="decimal" min={25} max={250} step={0.1}
                  defaultValue={metrics?.weightKg ?? ''}
                  className="input input-bordered flex-1" placeholder="Weight (kg)" />
              </div>
              <button
                className="btn"
                disabled={!user || saveMetrics.isPending}
                onClick={() => {
                  const h = (document.getElementById('height-input') as HTMLInputElement | null)?.value
                  const w = (document.getElementById('weight-input') as HTMLInputElement | null)?.value
                  const heightCm = h ? Number(h) : undefined
                  const weightKg = w ? Number(w) : undefined
                  if (!heightCm || !weightKg || Number.isNaN(heightCm) || Number.isNaN(weightKg)) {
                    alert('Please enter valid height (cm) and weight (kg).')
                    return
                  }
                  if (user) saveMetrics.mutate({ userId: user.uid, heightCm, weightKg })
                }}
              >Update BMI</button>
            </div>
          </section>
        </div>

        <section className="card p-6 space-y-4 max-w-xl mt-6">
          <label className="form-control">
            <div className="label"><span className="label-text">Full name</span></div>
            <input className="input input-bordered" placeholder="Your name" />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Birthday</span></div>
            <input type="date" className="input input-bordered" />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Timezone</span></div>
            <div className="flex items-center gap-2">
              <input
                id="tz-input"
                defaultValue={current}
                className="input input-bordered flex-1"
                placeholder="e.g., Europe/Moscow"
              />
              <button
                className="btn"
                disabled={!user || saveTz.isPending}
                onClick={() => {
                  const el = document.getElementById('tz-input') as HTMLInputElement | null
                  const value = (el?.value || '').trim()
                  if (!value || !isValidZone(value)) {
                    alert('Please enter a valid IANA timezone like Europe/Moscow')
                    return
                  }
                  if (user) saveTz.mutate({ userId: user.uid, timezone: value })
                }}
              >Save</button>
            </div>
            {detected && <div className="text-xs opacity-60">Detected: {detected}</div>}
          </label>
          <div>
            <button className="btn">Save</button>
          </div>
        </section>
      </PageContainer>
    </Protected>
  )
}
