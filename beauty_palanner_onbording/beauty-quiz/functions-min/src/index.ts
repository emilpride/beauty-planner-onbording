import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import axios from 'axios'

// Initialize Admin SDK once
try {
  if ((admin as any).apps ? (admin as any).apps.length === 0 : !(admin as any).getApps?.()?.length) {
    admin.initializeApp()
  }
} catch {}

function addSecurityHeaders(res: any) {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'SAMEORIGIN')
  res.set('X-XSS-Protection', '1; mode=block')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
}

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

const db = admin.firestore()

export const finalizeOnboarding = onRequest(async (req, res) => {
  addSecurityHeaders(res)
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }

  try {
    const uid = await verifyIdTokenFromRequest(req)
    if (!uid) { res.status(401).json({ error: 'Unauthorized' }); return }

    const sessionId = (req.body?.sessionId as string) || ''
    if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return }

    // Pull minimal info from onboarding session if available
    const sessionSnap = await db.collection('users_web_onbording').doc(sessionId).get()
    const session = sessionSnap.exists ? (sessionSnap.data() || {}) : {}

    const overrides = typeof req.body?.overrides === 'object' && req.body.overrides ? req.body.overrides : {}
    const profile = (typeof req.body?.profile === 'object' && req.body.profile)
      ? req.body.profile
      : (typeof overrides?.profile === 'object' && overrides.profile)
        ? overrides.profile
        : overrides

    // Very small set of fields to avoid heavy processing
    const name = (profile?.name as string) || ''
    const email = (profile?.email as string) || ''
    const language = (profile?.language as string) || (profile?.languageCode as string) || 'en'
    const assistant = (profile?.assistant as string) || (session['assistant'] as string) || 'Sofia'
    const theme = (profile?.theme as string) || (session['theme'] as string) || 'light'
    const primaryColor = (profile?.primaryColor as string) || (session['primaryColor'] as string) || '#A385E9'

    const doc: any = {
      Id: uid,
      Name: name,
      Email: email,
      LanguageCode: language,
      Assistant: /ellie/i.test(String(assistant)) ? 2 : 1,
      Theme: /dark/i.test(String(theme)) ? 2 : (/system|auto/i.test(String(theme)) ? 0 : 1),
      PrimaryColor: primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`,
      Onboarding2Completed: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await db.collection('users_v2').doc(uid).set(doc, { merge: true })
    await db.collection('users_web_onbording').doc(sessionId).set({ finalizedAt: admin.firestore.FieldValue.serverTimestamp(), finalizedByUid: uid }, { merge: true })

    const token = await admin.auth().createCustomToken(uid)
    res.status(200).json({ ok: true, token })
  } catch (e: any) {
    console.error('finalizeOnboarding(minimal) error', e?.message || e)
    res.status(500).json({ error: 'internal' })
  }
})

export const generateAvatar = onRequest({ maxInstances: 10, timeoutSeconds: 60, cors: true }, async (req, res) => {
  addSecurityHeaders(res)
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  try {
    const uid = await verifyIdTokenFromRequest(req)
    if (!uid) { res.status(401).json({ error: 'Unauthorized' }); return }

    const overrideUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl as string : null
    let sourceUrl: string | null = overrideUrl
    if (!sourceUrl) {
      const snap = await db.collection('users_v2').doc(uid).get()
      const data = snap.exists ? (snap.data() || {}) : {}
      sourceUrl = (data['FaceImageUrl'] as string) || (data['ProfilePicture'] as string) || (data['PhotoURL'] as string) || (data['PhotoUrl'] as string) || null
    }
    if (!sourceUrl) { res.status(400).json({ error: 'No source image available' }); return }

    const resp = await axios.get(sourceUrl, { responseType: 'arraybuffer', timeout: 10000 }).catch(() => { throw new Error('Image download failed') })
    const inputBuffer = Buffer.from(resp.data)

    // Lazy import sharp
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sharp: any = require('sharp')
    const size = 512
    const svgMask = Buffer.from(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"${size}\" height=\"${size}\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"${size/2}\" cy=\"${size/2}\" r=\"${size/2}\" fill=\"#fff\"/></svg>`)

    let processed: Buffer
    try {
      processed = await sharp(inputBuffer, { failOnError: false })
        .rotate()
        .resize(size, size, { fit: 'cover', position: 'attention' })
        .modulate({ saturation: 1.05 })
        .composite([{ input: svgMask, blend: 'dest-in' }])
        .webp({ quality: 80 })
        .toBuffer()
    } catch {
      processed = await sharp(inputBuffer, { failOnError: false }).resize(size, size, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()
    }

    const bucket = admin.storage().bucket()
    const filename = `avatar-${Date.now()}.webp`
    const path = `avatars/${uid}/${filename}`
    const file = bucket.file(path)
    await file.save(processed, { metadata: { contentType: 'image/webp', metadata: { createdBy: uid, purpose: 'avatar' } }, resumable: false })
    const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })

    await db.collection('users_v2').doc(uid).set({ AvatarUrl: signedUrl, AvatarStoragePath: path, AvatarUpdatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
    try { await admin.auth().updateUser(uid, { photoURL: signedUrl }) } catch {}

    res.status(200).json({ ok: true, url: signedUrl })
  } catch (e: any) {
    console.error('generateAvatar(minimal) error', e?.message || e)
    res.status(500).json({ error: 'internal' })
  }
})
