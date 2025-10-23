"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { useAuth } from '@/hooks/useAuth'
import { useTimezone, useSaveTimezone } from '@/hooks/useTimezone'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: tz } = useTimezone(user?.uid)
  const saveTz = useSaveTimezone()
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
        <section className="card p-6 space-y-4 max-w-xl">
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
