import * as admin from 'firebase-admin'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import nodemailer from 'nodemailer'
import fetch from 'node-fetch'
import { defineSecret } from 'firebase-functions/params'
import { randomUUID } from 'node:crypto'

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

// RevenueCat secret API key (secure Secret Manager)
const REVENUECAT_SECRET = defineSecret('REVENUECAT_API_KEY')
const REVENUECAT_BASE = 'https://api.revenuecat.com/v1'

type NormalizedPlan = {
  status: 'active' | 'inactive'
  planId: string | null
  entitlement: string | null
  store: 'appstore' | 'playstore' | 'stripe' | 'promotional' | 'unknown' | null
  expiresAt: string | null // ISO
  willRenew: boolean
  period: 'annual' | 'monthly' | 'weekly' | 'lifetime' | 'unknown' | null
}

function guessPeriodFromProductId(productId?: string | null): NormalizedPlan['period'] {
  if (!productId) return 'unknown'
  const id = productId.toLowerCase()
  if (id.includes('year') || id.includes('annual') || id.endsWith('.y') || id.includes('yr')) return 'annual'
  if (id.includes('month') || id.includes('monthly') || id.endsWith('.m') || id.includes('mo')) return 'monthly'
  if (id.includes('week') || id.includes('weekly') || id.endsWith('.w')) return 'weekly'
  if (id.includes('lifetime')) return 'lifetime'
  return 'unknown'
}

// CORS helper
function cors(res: any) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

// GET /getUserSubscription
// Auth: Authorization: Bearer <Firebase ID token>
export const getUserSubscription = onRequest({ cors: true, secrets: [REVENUECAT_SECRET] }, async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }

  try {
    const auth = req.headers.authorization || ''
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (!m) { res.status(401).json({ error: 'missing_bearer' }); return }
    const idToken = m[1]!
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const apiKey = REVENUECAT_SECRET.value()
    if (!apiKey) {
      res.status(500).json({ error: 'revenuecat_key_missing' })
      return
    }

    // Query RevenueCat subscriber
    const resp = await fetch(`${REVENUECAT_BASE}/subscribers/${encodeURIComponent(uid)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    })
    if (!resp.ok) {
      const txt = await resp.text()
      res.status(resp.status).json({ error: 'revenuecat_error', details: txt })
      return
    }
    const json: any = await resp.json()
    const sub = json?.subscriber
    let status: NormalizedPlan['status'] = 'inactive'
    let planId: string | null = null
    let entitlement: string | null = null
    let expiresAt: string | null = null
    let store: NormalizedPlan['store'] = 'unknown'
    let willRenew = false

    // Prefer entitlements for active status
    const ents = sub?.entitlements || {}
    for (const [key, ent] of Object.entries<any>(ents)) {
      if (ent?.active) {
        status = 'active'
        entitlement = key
        planId = ent?.product_identifier || ent?.productIdentifier || null
        const exp = ent?.expires_date || ent?.expiresDate || ent?.expiration_date || null
        expiresAt = exp ? new Date(exp).toISOString() : null
        willRenew = !!ent?.will_renew || !!ent?.willRenew
        break
      }
    }
    // If not found via entitlements, check subscriptions
    if (status === 'inactive') {
      const subs = sub?.subscriptions || {}
      for (const [pid, s] of Object.entries<any>(subs)) {
        const isActive = !s?.expires_date || new Date(s.expires_date).getTime() > Date.now()
        if (isActive) {
          status = 'active'
          planId = pid
          const exp = s?.expires_date || null
          expiresAt = exp ? new Date(exp).toISOString() : null
          willRenew = !!s?.auto_resume || !!s?.will_renew || !!s?.renewal_status
          store = (s?.store || 'unknown').toLowerCase() as any
          break
        }
      }
    }

    const period = guessPeriodFromProductId(planId)
    const normalized: NormalizedPlan = { status, planId, entitlement, store, expiresAt, willRenew, period }
    res.status(200).json(normalized)
  } catch (e: any) {
    console.error('getUserSubscription failed', e?.message || e)
    res.status(500).json({ error: 'internal', message: e?.message || String(e) })
  }
})

// Helpers for auth + CORS for POST endpoints
function allowCorsPost(res: any) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

async function verifyBearerToUid(req: any): Promise<string> {
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) throw Object.assign(new Error('missing_bearer'), { code: 401 })
  const idToken = m[1]!
  const decoded = await admin.auth().verifyIdToken(idToken)
  return decoded.uid
}

// POST /revokeOtherSessions
export const revokeOtherSessions = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const uid = await verifyBearerToUid(req)
    await admin.auth().revokeRefreshTokens(uid)
    res.status(200).json({ ok: true, revokedAt: new Date().toISOString() })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
})

// POST /deactivateAccount
export const deactivateAccount = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const uid = await verifyBearerToUid(req)
    const reason = (req.body?.reason || '').toString().slice(0, 500) || null
    await admin.auth().updateUser(uid, { disabled: true })
    const now = new Date().toISOString()
    await db.collection('users_v2').doc(uid).set({
      status: 'deactivated',
      deactivated: true,
      deactivatedAt: now,
      deactivatedReason: reason,
    }, { merge: true })
    res.status(200).json({ ok: true, deactivatedAt: now })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
})

// POST /reactivateAccount
export const reactivateAccount = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const uid = await verifyBearerToUid(req)
    await admin.auth().updateUser(uid, { disabled: false })
    const now = new Date().toISOString()
    await db.collection('users_v2').doc(uid).set({
      status: 'active',
      deactivated: false,
      reactivatedAt: now,
    }, { merge: true })
    res.status(200).json({ ok: true, reactivatedAt: now })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
})

// POST /exchangeIdToken
// Body: { idToken?: string } or Authorization: Bearer <ID_TOKEN>
// Returns: { customToken: string }
export const exchangeIdToken = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const auth = req.headers.authorization || ''
    let idToken = ''
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (m) {
      idToken = m[1]!
    } else if (typeof req.body?.idToken === 'string') {
      idToken = req.body.idToken
    }
    if (!idToken) { res.status(400).json({ error: 'missing_id_token' }); return }
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid
    const customToken = await admin.auth().createCustomToken(uid)
    res.status(200).json({ customToken })
  } catch (e: any) {
    const msg = e?.message || 'internal'
    const code = msg.includes('Firebase ID token') ? 401 : 500
    res.status(code).json({ error: msg })
  }
})

// POST /createDeferredToken
// Auth: Bearer <Firebase ID token>
// Returns: { tokenId: string, dynamicLink: string }
export const createDeferredToken = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const uid = await verifyBearerToUid(req)
    const tokenId = randomUUID()
    const now = Date.now()
    const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    await db.collection('DeferredTokens').doc(tokenId).set({ uid, createdAt: new Date().toISOString(), expiresAt }, { merge: true })

    const DOMAIN = process.env.DYNAMIC_LINK_DOMAIN || 'beauty-mirror.page.link'
    const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || 'com.beautymirror.app'
    const IOS_BUNDLE = process.env.IOS_BUNDLE_ID || 'com.beautymirror.app'
    const IOS_APP_ID = process.env.IOS_APP_ID || ''
    const FALLBACK = process.env.WEB_FALLBACK_URL || 'https://web.beautymirror.app/login'
    // The deep link your app handles to redeem the tokenId
    const deepLink = `https://beautymirror.app/redeem?dt=${encodeURIComponent(tokenId)}`
    const params = new URLSearchParams({
      link: deepLink,
      apn: ANDROID_PACKAGE,
      ibi: IOS_BUNDLE,
      ofl: FALLBACK,
    })
    if (IOS_APP_ID) params.set('isi', IOS_APP_ID)
    const dynamicLink = `https://${DOMAIN}/?${params.toString()}`

    res.status(200).json({ tokenId, dynamicLink, expiresAt })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
})

// POST /redeemDeferredToken
// Body: { tokenId: string }
// Returns: { customToken: string }
export const redeemDeferredToken = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const tokenId = (req.body?.tokenId || '').toString()
    if (!tokenId) { res.status(400).json({ error: 'missing_tokenId' }); return }
    const ref = db.collection('DeferredTokens').doc(tokenId)
    const snap = await ref.get()
    if (!snap.exists) { res.status(404).json({ error: 'not_found' }); return }
    const data = snap.data() as { uid?: string; expiresAt?: string; redeemedAt?: string }
    if (!data?.uid) { res.status(400).json({ error: 'invalid_token' }); return }
    if (data.redeemedAt) { res.status(410).json({ error: 'already_redeemed' }); return }
    if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) { res.status(410).json({ error: 'expired' }); return }
    const customToken = await admin.auth().createCustomToken(data.uid)
    await ref.set({ redeemedAt: new Date().toISOString() }, { merge: true })
    res.status(200).json({ customToken })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal' })
  }
})

// Utilities to recursively delete user data
async function deleteCollectionBatch(colRef: FirebaseFirestore.CollectionReference, batchSize = 300) {
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined
  while (true) {
    const query = lastDoc
      ? colRef.orderBy('__name__').startAfter(lastDoc).limit(batchSize)
      : colRef.orderBy('__name__').limit(batchSize)
    const snap = await query.get()
    if (snap.empty) break
    const batch = db.batch()
    for (const doc of snap.docs) {
      batch.delete(doc.ref)
    }
    await batch.commit()
    lastDoc = snap.docs[snap.docs.length - 1]
    if (snap.size < batchSize) break
  }
}

async function deleteDocRecursively(docRef: FirebaseFirestore.DocumentReference, depth = 0) {
  // Limit recursion depth to avoid runaway; typical depth 1-2 in this app
  if (depth > 3) return
  const subcols = await docRef.listCollections()
  for (const col of subcols) {
    // Delete nested docs first
    const docs = await col.get()
    for (const d of docs.docs) {
      await deleteDocRecursively(d.ref, depth + 1)
    }
    // Then ensure collection is empty
    await deleteCollectionBatch(col)
  }
  await docRef.delete().catch(() => { /* ignore if already deleted */ })
}

// POST /deleteAccount
export const deleteAccount = onRequest({ cors: true }, async (req, res) => {
  allowCorsPost(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  try {
    const uid = await verifyBearerToUid(req)
    // Best-effort: remove Firestore user document and subcollections
    const userDoc = db.collection('users_v2').doc(uid)
    await deleteDocRecursively(userDoc)
    // Finally, delete the auth user
    await admin.auth().deleteUser(uid)
    res.status(200).json({ ok: true })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
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
  const ref = db.collection('users_v2').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`)
  const snap = await ref.get()
  return snap.exists
}

async function markSent(userId: string, updateId: string, channel: 'email') {
  const ref = db.collection('users_v2').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`)
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
      .collection('users_v2')
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
        .collection('users_v2').doc(userId)
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
      .collection('users_v2')
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
        .collection('users_v2').doc(userId)
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
      const tokensSnap = await db.collection('users_v2').doc(userId).collection('FcmTokens').get()
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
        const sentRef = db.collection('users_v2').doc(userId).collection('NotificationsSent').doc(`${u.id}-push`)
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

// =====================
// Achievements compute
// Lightweight server-side authoritative computation
// =====================

type ServerAchievementProgress = {
  totalCompletedActivities: number
  currentLevel: number
  lastUpdated: admin.firestore.FieldValue
  levelUnlockDates?: Record<string, any>
}

// Keep thresholds modest and monotonic
const ACHIEVEMENT_LEVELS_SERVER: { level: number; requiredActivities: number }[] = [
  { level: 1, requiredActivities: 0 },
  { level: 2, requiredActivities: 5 },
  { level: 3, requiredActivities: 15 },
  { level: 4, requiredActivities: 30 },
  { level: 5, requiredActivities: 60 },
  { level: 6, requiredActivities: 100 },
  { level: 7, requiredActivities: 150 },
  { level: 8, requiredActivities: 220 },
  { level: 9, requiredActivities: 300 },
]

function calcLevelServer(completed: number): number {
  let lvl = 1
  for (let i = ACHIEVEMENT_LEVELS_SERVER.length - 1; i >= 0; i--) {
    const step = ACHIEVEMENT_LEVELS_SERVER[i]!
    if (completed >= step.requiredActivities) { lvl = step.level; break }
  }
  return lvl
}

async function recomputeAchievementsForUser(userId: string): Promise<ServerAchievementProgress> {
  const col = db.collection('users_v2').doc(userId).collection('Updates')
  const snap = await col.where('status', '==', 'completed').get()
  const completed = snap.size
  const level = calcLevelServer(completed)

  const ref = db.collection('users_v2').doc(userId).collection('Achievements').doc('Progress')
  const before = await ref.get()
  const prev = before.exists ? (before.data() || {}) : {}
  const levelUnlockDates: Record<string, any> = (prev['LevelUnlockDates'] || prev['levelUnlockDates'] || {}) as any
  if (!levelUnlockDates[level]) levelUnlockDates[String(level)] = admin.firestore.FieldValue.serverTimestamp()

  const payload: ServerAchievementProgress = {
    totalCompletedActivities: completed,
    currentLevel: level,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    levelUnlockDates,
  }
  await ref.set({
    TotalCompletedActivities: payload.totalCompletedActivities,
    CurrentLevel: payload.currentLevel,
    LastUpdated: payload.lastUpdated,
    LevelUnlockDates: payload.levelUnlockDates,
  }, { merge: true })
  // Mirror on users_v2 root for web header/stats consumers
  await db.collection('users_v2').doc(userId).set({
    ActivitiesCompleted: payload.totalCompletedActivities,
    TotalCompletedActivities: payload.totalCompletedActivities,
    Level: payload.currentLevel,
    LevelUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true })
  return payload
}

// Firestore trigger: recompute on any update write
export const onUpdateWriteRecomputeAchievements = onDocumentWritten('users_v2/{userId}/Updates/{updateId}', async (event) => {
  try {
    const userId = event.params.userId as string
    if (!userId) return
    await recomputeAchievementsForUser(userId)
  } catch (e) {
    console.error('Recompute achievements trigger failed:', (e as any)?.message || e)
  }
})

// Simple auth helper: verify Firebase ID token from Authorization header or body.idToken
async function verifyIdTokenFromRequest(req: any): Promise<string | null> {
  try {
    const bodyToken = typeof req?.body?.idToken === 'string' ? (req.body.idToken as string) : ''
    let token: string = bodyToken
    if (!token) {
      const rawHeader = String((req?.headers?.['authorization'] || req?.headers?.['Authorization'] || ''))
      if (rawHeader) {
        const parts = rawHeader.split(' ')
        const bearerVal: string = parts.length >= 2 ? (parts[1] || '') : ''
        const scheme: string = parts.length >= 1 ? (parts[0] || '') : ''
        token = /^Bearer$/i.test(scheme) ? bearerVal : rawHeader
      }
    }
    if (!token) return null
    const decoded = await admin.auth().verifyIdToken(token)
    return decoded?.uid || null
  } catch {
    return null
  }
}

// CORS/security headers
function addSecurityHeaders(res: any) {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'SAMEORIGIN')
  res.set('X-XSS-Protection', '1; mode=block')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
}

// HTTPS endpoint to recompute on demand (for the signed-in user)
export const recomputeAchievements = onRequest(async (req, res) => {
  addSecurityHeaders(res)
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  try {
    const uid = await verifyIdTokenFromRequest(req)
    if (!uid) { res.status(401).json({ error: 'Unauthorized' }); return }
    const result = await recomputeAchievementsForUser(uid)
    res.status(200).json({ ok: true, progress: result })
  } catch (e) {
    console.error('recomputeAchievements error', e)
    res.status(500).json({ error: 'internal' })
  }
})
