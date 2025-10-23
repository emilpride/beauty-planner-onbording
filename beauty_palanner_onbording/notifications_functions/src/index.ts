import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/lib/v2/providers/scheduler'
import nodemailer from 'nodemailer'

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// SMTP transport (set env vars or functions:config)
const SMTP_HOST = process.env.SMTP_HOST || process.env.FUNCTIONS_EMULATOR && 'localhost'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || 'info@beauty-mirror.com'

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
})

type Activity = {
  id: string
  name: string
  time?: { Hour?: number; Minute?: number } | null
  notifyBefore?: string | null
}

type TaskInstance = {
  id: string
  activityId: string
  date: string // YYYY-MM-DD
  status: 'pending' | 'completed' | 'skipped' | 'missed' | 'deleted'
  time?: { hour: number; minute: number }
}

function parseTzOffsetFromParts(tz: string, date: Date): number | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    } as any)
    const parts = (fmt as any).formatToParts(date) as Array<{ type: string; value: string }>
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || ''
    const m = tzName.match(/GMT([+\-]\d{1,2})(?::(\d{2}))?/)
    if (!m) return null
    const hours = parseInt(m[1], 10)
    const minutes = m[2] ? parseInt(m[2], 10) : 0
    return hours * 60 + (hours >= 0 ? minutes : -minutes)
  } catch {
    return null
  }
}

function getTzOffsetMinutes(tz: string, atUtc: Date): number | null {
  return parseTzOffsetFromParts(tz, atUtc)
}

function zonedLocalToUtc(ymd: string, hour: number, minute: number, tz: string): Date | null {
  // Initial guess: interpret ymd h:m as UTC
  const guess = new Date(Date.UTC(
    Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)),
    hour, minute, 0, 0,
  ))
  const off1 = getTzOffsetMinutes(tz, guess)
  if (off1 == null) return null
  const instant = new Date(Date.UTC(
    Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)),
    hour, minute, 0, 0,
  ) - off1 * 60_000)
  // One refinement for DST boundaries
  const off2 = getTzOffsetMinutes(tz, instant)
  if (off2 == null || off2 === off1) return instant
  return new Date(Date.UTC(
    Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)),
    hour, minute, 0, 0,
  ) - off2 * 60_000)
}

function parseNotifyBefore(s?: string | null): number { // minutes
  if (!s) return 0
  const v = s.trim().toLowerCase()
  if (!v) return 0
  // Accept forms like '15m', '30 m', '1h', '2 h', '45min', 'minutes'
  const match = v.match(/^(\d+)\s*(m|min|minutes)?$/)
  if (match) return Number(match[1])
  const hmatch = v.match(/^(\d+)\s*(h|hr|hour|hours)$/)
  if (hmatch) return Number(hmatch[1]) * 60
  // Known presets
  if (v === '5m') return 5
  if (v === '10m') return 10
  if (v === '15m') return 15
  if (v === '30m') return 30
  if (v === '1h') return 60
  if (v === '2h') return 120
  return 0
}

function toDateFromYmdAndTime(ymd: string, hour?: number, minute?: number): Date | null {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3])
  const date = new Date(Date.UTC(y, mo, d, hour ?? 9, minute ?? 0, 0, 0))
  return date
}

async function getUserEmail(uid: string): Promise<string | null> {
  try {
    const user = await admin.auth().getUser(uid)
    return user.email || null
  } catch {
    return null
  }
}

async function alreadySent(userId: string, updateId: string, channel: 'email'): Promise<boolean> {
  const ref = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`)
  const snap = await ref.get()
  return snap.exists
}

async function markSent(userId: string, updateId: string, channel: 'email') {
  const ref = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`)
  await ref.set({ channel, updateId, sentAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: SMTP_FROM, to, subject, html })
}

export const sendEmailReminders = onSchedule({ schedule: 'every 5 minutes', timeZone: 'Etc/UTC' }, async () => {
    const now = new Date()
    const windowMinutes = 6 // include small overlap window for reliability
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

    const usersSnap = await db
      .collection('Users')
      .where('NotificationPrefs.emailReminders', '==', true)
      .get()

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id
      const prefs = (userDoc.get('NotificationPrefs') || {}) as { emailReminders?: boolean }
      if (!prefs.emailReminders) continue

      const email = await getUserEmail(userId)
      if (!email) continue

      // Load Activities array once
      const activities = ((userDoc.get('Activities') as any[]) || []).map((a) => ({
        id: String(a?.Id || ''),
        name: String(a?.Name || ''),
        time: a?.Time || null,
        notifyBefore: typeof a?.NotifyBefore === 'string' ? a.NotifyBefore : null,
      })) as Activity[]
      const activityById = new Map(activities.map((a) => [a.id, a]))

      // Query Updates for today (pending)
      const today = new Date()
      const y = today.getUTCFullYear(), m = String(today.getUTCMonth() + 1).padStart(2, '0'), d = String(today.getUTCDate()).padStart(2, '0')
      const todayStr = `${y}-${m}-${d}`

      const updatesSnap = await db
        .collection('Users').doc(userId)
        .collection('Updates')
        .where('date', '==', todayStr)
        .where('status', '==', 'pending')
        .get()

      for (const upd of updatesSnap.docs) {
        const u = upd.data() as TaskInstance
        const act = activityById.get(u.activityId)
        const hour = u.time?.hour ?? act?.time?.Hour ?? null
        const minute = u.time?.minute ?? act?.time?.Minute ?? null
        if (hour === null || minute === null) continue // no exact time => skip

        const tzName = String(userDoc.get('Timezone') || '')
        const base = tzName
          ? zonedLocalToUtc(u.date, hour ?? 0, minute ?? 0, tzName)
          : toDateFromYmdAndTime(u.date, hour ?? undefined, minute ?? undefined)
        if (!base) continue
        const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined)
        const scheduled = new Date(base.getTime() - minutesBefore * 60_000)
        // send if scheduled within [windowStart, now]
        if (scheduled.getTime() <= now.getTime() && scheduled.getTime() > windowStart.getTime()) {
          const sent = await alreadySent(userId, u.id, 'email')
          if (sent) continue
          const subject = minutesBefore > 0
            ? `Reminder: ${act?.name || 'Activity'} in ${minutesBefore} min`
            : `Reminder: ${act?.name || 'Activity'} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
          const html = `<p>Hi!</p>
          <p>This is your reminder for <strong>${act?.name || 'activity'}</strong>
          ${minutesBefore > 0 ? ` starting in ${minutesBefore} minutes` : ` scheduled at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (today)`}.</p>
          <p><a href="https://web.beautymirror.app/dashboard">Open Beauty Mirror</a></p>`
          try {
            await sendEmail(email, subject, html)
            await markSent(userId, u.id, 'email')
          } catch (e) {
            console.error('Email send failed', userId, u.id, e)
          }
        }
      }
    }

    return null
  })

export const sendMobilePushReminders = onSchedule({ schedule: 'every 5 minutes', timeZone: 'Etc/UTC' }, async () => {
    const now = new Date()
    const windowMinutes = 6
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

    const usersSnap = await db
      .collection('Users')
      .where('NotificationPrefs.mobilePush', '==', true)
      .get()

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id
      const prefs = (userDoc.get('NotificationPrefs') || {}) as { mobilePush?: boolean }
      if (!prefs.mobilePush) continue

      // Optional timezone offset in minutes; if present, convert local scheduled -> UTC
  const tzName = String(userDoc.get('Timezone') || '')
  const tzOffsetMin = tzName ? null : Number(userDoc.get('TimezoneOffsetMinutes') || 0)

      const activities = ((userDoc.get('Activities') as any[]) || []).map((a) => ({
        id: String(a?.Id || ''),
        name: String(a?.Name || ''),
        time: a?.Time || null,
        notifyBefore: typeof a?.NotifyBefore === 'string' ? a.NotifyBefore : null,
      })) as Activity[]
      const activityById = new Map(activities.map((a) => [a.id, a]))

      const today = new Date()
      const y = today.getUTCFullYear(), m = String(today.getUTCMonth() + 1).padStart(2, '0'), d = String(today.getUTCDate()).padStart(2, '0')
      const todayStr = `${y}-${m}-${d}`

      const updatesSnap = await db
        .collection('Users').doc(userId)
        .collection('Updates')
        .where('date', '==', todayStr)
        .where('status', '==', 'pending')
        .get()

      // Collect due updates within window
      const due: { u: TaskInstance; act: Activity; scheduled: Date }[] = []
      for (const upd of updatesSnap.docs) {
        const u = upd.data() as TaskInstance
        const act = activityById.get(u.activityId)
        if (!act) continue
        const hour = u.time?.hour ?? act?.time?.Hour ?? null
        const minute = u.time?.minute ?? act?.time?.Minute ?? null
        if (hour === null || minute === null) continue
        let baseLocal: Date | null
        if (tzName) {
          baseLocal = zonedLocalToUtc(u.date, hour ?? 0, minute ?? 0, tzName)
        } else {
          baseLocal = toDateFromYmdAndTime(u.date, hour ?? undefined, minute ?? undefined)
        }
        if (!baseLocal) continue
        const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined)
        let scheduled = new Date(baseLocal.getTime() - minutesBefore * 60_000)
        if (!tzName && tzOffsetMin) scheduled = new Date(scheduled.getTime() - tzOffsetMin * 60_000)
        if (scheduled.getTime() <= now.getTime() && scheduled.getTime() > windowStart.getTime()) {
          due.push({ u, act, scheduled })
        }
      }

      if (due.length === 0) continue

      // Fetch mobile tokens (best-effort filter by platform field)
      const tokensSnap = await db.collection('Users').doc(userId).collection('FcmTokens').get()
      const tokens: string[] = []
      for (const t of tokensSnap.docs) {
        const data = t.data() as { token?: string; platform?: string }
        const plat = (data.platform || '').toLowerCase()
        if (plat.includes('android') || plat.includes('ios')) {
          if (data.token) tokens.push(data.token)
        }
      }
      if (tokens.length === 0) continue

      for (const item of due) {
        const { u, act } = item
        const sentRef = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${u.id}-push`)
        const sentSnap = await sentRef.get()
        if (sentSnap.exists) continue

        const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined)
        const title = 'Beauty Mirror reminder'
        const body = minutesBefore > 0
          ? `${act?.name || 'Activity'} in ${minutesBefore} min`
          : `${act?.name || 'Activity'} now`

        const message: admin.messaging.MulticastMessage = {
          tokens,
          notification: { title, body },
          data: {
            updateId: u.id,
            activityId: u.activityId,
            date: u.date,
          },
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' }, payload: { aps: { sound: 'default' } } },
        }
        try {
          const res = await admin.messaging().sendEachForMulticast(message)
          if (res.successCount > 0) {
            await sentRef.set({ channel: 'push', updateId: u.id, sentAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
          }
        } catch (e) {
          console.error('Push send failed', userId, u.id, e)
        }
      }
    }

    return null
  })
