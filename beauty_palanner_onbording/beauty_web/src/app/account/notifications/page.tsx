"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/useNotifications'
import { useNotificationPrefs, useSaveNotificationPrefs } from '@/hooks/useNotificationPrefs'

export default function NotificationsSettingsPage() {
  const { user } = useAuth()
  const { supported, permission, token, busy, enable, disable } = usePushNotifications(user?.uid)
  const { data: prefs } = useNotificationPrefs(user?.uid)
  const savePrefs = useSaveNotificationPrefs()
  const p = prefs ?? { emailReminders: false, weeklyEmail: false, mobilePush: false }
  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <section className="card p-6 space-y-4 max-w-xl">
          {/* Email + Mobile push prefs (source of truth for reminders) */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle"
                checked={!!p.emailReminders}
                onChange={(e) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, emailReminders: e.target.checked } })}
              />
              <span>Email reminders</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle"
                checked={!!p.weeklyEmail}
                onChange={(e) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, weeklyEmail: e.target.checked } })}
              />
              <span>Weekly progress email</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle"
                checked={!!p.mobilePush}
                onChange={(e) => user && savePrefs.mutate({ userId: user.uid, prefs: { ...p, mobilePush: e.target.checked } })}
              />
              <span>Mobile push (send to my phone)</span>
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
      </PageContainer>
    </Protected>
  )
}
