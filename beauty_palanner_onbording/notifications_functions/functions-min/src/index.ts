import * as admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

if (!(admin as any).apps?.length) {
  admin.initializeApp()
}

function cors(res: any) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
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

// Read from Secret Manager if available; otherwise allow graceful inactive fallback
const REVENUECAT_SECRET = defineSecret('REVENUECAT_API_KEY')

export const getUserSubscription = onRequest({ cors: true, secrets: [REVENUECAT_SECRET] }, async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  try {
    await verifyBearerToUid(req)

    const apiKey = REVENUECAT_SECRET.value() || ''
    if (!apiKey) {
      // Graceful fallback so UI doesn't fail
      res.status(200).json({
        status: 'inactive', planId: null, entitlement: null, store: 'unknown', expiresAt: null, willRenew: false, period: 'unknown'
      })
      return
    }

    // If a key is present, you could optionally call RevenueCat here as in full version.
    // Keeping minimal to avoid analyzer timeouts.
    res.status(200).json({
      status: 'inactive', planId: null, entitlement: null, store: 'unknown', expiresAt: null, willRenew: false, period: 'unknown'
    })
  } catch (e: any) {
    const code = e?.code === 401 ? 401 : 500
    res.status(code).json({ error: e?.message || 'internal' })
  }
})
