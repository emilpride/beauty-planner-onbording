import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import axios from 'axios'
import Stripe from 'stripe'
// Use dynamic require for Secret Manager to avoid TypeScript proto typing issues in build

admin.initializeApp()
const db = admin.firestore()
let secretClient: any = null
const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null

// Sanitize objects before saving to Firestore: remove functions, symbols, undefined,
// cut off deep nesting and break cycles.
function sanitizeForFirestore(value: any, maxDepth = 10) {

	const seen = new WeakSet()

	function _sanitize(v: any, depth: number): any {
		if (v === null) return null
		if (depth <= 0) return '[MaxDepth]'
		const t = typeof v
		if (t === 'string' || t === 'number' || t === 'boolean') return v
		if (t === 'undefined') return null
		if (t === 'function') return undefined
		if (t === 'symbol') return String(v)
		if (v instanceof Date) return v.toISOString()
		if (Array.isArray(v)) {
			const out: any[] = []
			for (const el of v) {
				try {
					const s = _sanitize(el, depth - 1)
					// drop functions/undefined
					if (typeof s !== 'undefined') out.push(s)
				} catch (e) {
					// ignore
				}
			}
			return out
		}
		if (t === 'object') {
			if (seen.has(v)) return '[Cycle]'
			seen.add(v)
			const out: Record<string, any> = {}
			for (const k of Object.keys(v)) {
				try {
					const s = _sanitize(v[k], depth - 1)
					if (typeof s !== 'undefined') out[k] = s
				} catch (e) {
					// ignore individual property
				}
			}
			return out
		}
		return null
	}

	try {
		return _sanitize(value, maxDepth)
	} catch (e) {
		return null
	}
}

type AIAnalysisModel = {
	bmi: number | null
	skinCondition: { score: number; explanation: string; recommendations: string[] }
	hairCondition: { score: number; explanation: string; recommendations: string[] }
	physicalCondition: { score: number; explanation: string; recommendations: string[] }
	mentalCondition: { score: number; explanation: string; recommendations: string[] }
	bmsScore: number
}

// --- Helpers: request metadata parsing ---
function getClientIp(req: any): string | null {
	try {
		const xff = (req.headers['x-forwarded-for'] as string) || ''
		if (xff) {
			// XFF may be a comma-separated list; take the first non-empty
			const first = xff.split(',').map(s => s.trim()).find(Boolean)
			if (first) return first
		}
		return (req.ip as string) || null
	} catch {
		return null
	}
}

function detectDeviceFromUA(ua: string | undefined): 'android' | 'ios' | 'web' {
	const u = (ua || '').toLowerCase()
	if (/android/.test(u)) return 'android'
	if (/iphone|ipad|ipod|ios/.test(u)) return 'ios'
	return 'web'
}

// More detailed platform OS detection (for analytics)
function detectPlatformOS(ua: string | undefined): 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown' {
	const u = (ua || '').toLowerCase()
	if (/android/.test(u)) return 'Android'
	if (/iphone|ipad|ipod|ios/.test(u)) return 'iOS'
	if (/windows nt/.test(u)) return 'Windows'
	if (/(macintosh|mac os x)/.test(u)) return 'macOS'
	if (/linux/.test(u)) return 'Linux'
	return 'Unknown'
}

// Very rough form factor detection based on UA
function detectFormFactor(ua: string | undefined): 'mobile' | 'tablet' | 'desktop' {
	const u = (ua || '').toLowerCase()
	if (/ipad|tablet/.test(u)) return 'tablet'
	if (/mobi|iphone|android/.test(u)) return 'mobile'
	return 'desktop'
}

function classifySource(opts: { referrer?: string | null; utmSource?: string | null }): 'google' | 'facebook' | 'direct' | 'organic' {
	const ref = (opts.referrer || '').toLowerCase()
	const utm = (opts.utmSource || '').toLowerCase()

	// UTM has priority if present
	if (utm) {
		if (utm.includes('google')) return 'google'
		if (utm.includes('fb') || utm.includes('facebook') || utm.includes('instagram') || utm.includes('meta')) return 'facebook'
	}

	if (!ref) return 'direct'
	if (ref.includes('facebook') || ref.includes('instagram') || ref.includes('fb.')) return 'facebook'
	if (ref.includes('google.')) return 'google'

	// Other common search engines considered organic
	if (ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('yandex.') || ref.includes('duckduckgo.') || ref.includes('baidu.')) {
		return 'organic'
	}
	// Fallback: treat unknown referrers as organic
	return 'organic'
}

function extractTrafficMeta(req: any): { ip: string | null; device: 'android' | 'ios' | 'web'; source: 'google' | 'facebook' | 'direct' | 'organic'; country: string | null; platformOS: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown'; formFactor: 'mobile' | 'tablet' | 'desktop' } {
	const ip = getClientIp(req)
	const ua = (req.headers['user-agent'] as string) || ''
	const device = detectDeviceFromUA(ua)
	const bodyMeta = (req.body && req.body.meta) || {}
	const utmSource: string | null = (bodyMeta.utmSource as string) || null
	const referrerHeader: string | null = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || null
	const source = classifySource({ referrer: referrerHeader, utmSource })
	// Country via Google headers if available (Cloud Run/Functions sometimes set x-appengine-country)
	const gaeCountry = (req.headers['x-appengine-country'] as string) || ''
	const country = gaeCountry && gaeCountry !== 'ZZ' ? gaeCountry.toUpperCase() : null
	const platformOS = detectPlatformOS(ua)
	const formFactor = detectFormFactor(ua)
	return { ip, device, source, country, platformOS, formFactor }
}

async function accessGeminiKey(): Promise<string> {

	// Prefer Secret Manager via GEMINI_SECRET_NAME; fallback to GEMINI_API_KEY env
	const secretName = process.env.GEMINI_SECRET_NAME
	if (secretName) {
			if (!secretClient) {
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const sm = require('@google-cloud/secret-manager')
				secretClient = new sm.SecretManagerServiceClient()
			}
			const [version] = await secretClient.accessSecretVersion({ name: secretName })
		const payload = version.payload?.data?.toString()
		if (!payload) throw new Error('Empty secret payload')
		return payload
	}
	const key = process.env.GEMINI_API_KEY
	if (!key) throw new Error('GEMINI_API_KEY not set and GEMINI_SECRET_NAME not provided')
	return key
}

// Simple JSON sanity check to ensure returned object matches expected shape minimally
function validateAIModel(obj: any): obj is AIAnalysisModel {
	if (typeof obj !== 'object' || obj == null) return false
	if (typeof obj.bmsScore !== 'number') return false
	const checks = ['skinCondition','hairCondition','physicalCondition','mentalCondition']
	for (const k of checks) {
		if (typeof obj[k] !== 'object' || typeof obj[k].score !== 'number' || !Array.isArray(obj[k].recommendations)) return false
	}
	return true
}

// Forced deployment on Oct 10, 2025
export const analyzeUserData = onRequest(async (req, res) => {
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }
	try {
		const body = req.body
		const { userId, sessionId, events, answers, photoUrls } = body || {}
		if (!userId) { res.status(400).send({ error: 'userId required' }); return }

		// Extract traffic meta for session doc (ip/device/source)
		const meta = extractTrafficMeta(req)

		// Retrieve API key and sanitize (trim + remove newlines) to avoid invalid header characters
		let apiKey: any = await accessGeminiKey()
		if (typeof apiKey === 'string') {
			apiKey = apiKey.trim().replace(/\r?\n/g, '')
		} else if (apiKey && typeof apiKey.toString === 'function') {
			apiKey = apiKey.toString().trim().replace(/\r?\n/g, '')
		}
		// Small debug: report length only to avoid leaking secret value in logs
		console.debug('Using Gemini API key length:', typeof apiKey === 'string' ? apiKey.length : 'unknown')

		// Build a strict prompt asking Gemini to return ONLY valid JSON matching the schema.
		const basePrompt = `You are an assistant that MUST return valid JSON only. Provide a single JSON object matching this TypeScript schema: ${JSON.stringify({
			bmi: 'number|null',
			skinCondition: { score: 'number', explanation: 'string', recommendations: ['string'] },
			hairCondition: { score: 'number', explanation: 'string', recommendations: ['string'] },
			physicalCondition: { score: 'number', explanation: 'string', recommendations: ['string'] },
			mentalCondition: { score: 'number', explanation: 'string', recommendations: ['string'] },
			bmsScore: 'number'
		})}. Respond with JSON only, no markdown, no commentary, no surrounding text. User answers: ${JSON.stringify(answers || {})}. Photo URLs: ${JSON.stringify(photoUrls || {})}`

		// Helper to call Gemini once with the given prompt
		async function callGemini(promptText: string) {
			const resp = await axios.post(
				'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
				{ contents: [{ parts: [{ text: promptText }] }] },
				{ headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: 30000 }
			)
			return resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text
		}

		// Try primary call then one retry with an explicit 'Return JSON only' reminder
		let generated: any = null
		let parsed: any = null
		try {
			generated = await callGemini(basePrompt)
			if (typeof generated === 'string') {
				try { parsed = JSON.parse(generated) } catch (e) { parsed = null }
			} else if (typeof generated === 'object') parsed = generated

			if (!parsed) {
				// Retry with an explicit instruction to return JSON only and a short schema example
				const retryPrompt = basePrompt + ' ONLY return the JSON object. Example format: {"bmi":null,...}'
				const retryResp = await callGemini(retryPrompt)
				if (typeof retryResp === 'string') {
					try { parsed = JSON.parse(retryResp) } catch (e) { parsed = null }
				} else if (typeof retryResp === 'object') parsed = retryResp
			}
		} catch (e) {
			console.error('Gemini request failed', e)
			parsed = null
		}

	// If the parsed object is invalid, use a safe fallback by default so UX does not stall.
	// Can be disabled by setting GEMINI_ALLOW_FALLBACK=false.
	const allowFallback = (process.env.GEMINI_ALLOW_FALLBACK || 'true').toLowerCase() === 'true'
		if (!parsed || !validateAIModel(parsed)) {
			console.error('Gemini returned invalid or unparsable response', { generated, parsed })
			if (!allowFallback) {
				// Return an error to the client so the UI can surface it—no silent fallback.
				res.status(502).json({ error: 'Invalid response from Gemini. Please retry.' }); return
			}
			// If fallback is allowed, save and return the fallback as before
			const fallback: AIAnalysisModel = {
				bmi: null,
				skinCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['cleanse-hydrate','deep-hydration'] },
				hairCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['wash-care','deep-nourishment'] },
				physicalCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['morning-stretch','cardio-boost'] },
				mentalCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['mindful-meditation','breathing-exercises'] },
				bmsScore: 6
			}
			const ref = await db.collection('users').doc(userId).collection('analysis').doc()
			await ref.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: fallback, raw: generated || null })
			res.status(200).json({ analysis: fallback }); return
		}

		// Valid parsed model — persist and return
		const docRef = db.collection('users').doc(userId).collection('analysis').doc()
		await docRef.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: parsed })

		// Save onboarding session
		if (sessionId && events) {
			// sanitize events before writing to Firestore
			let sanitizedEvents: any[] = []
			try {
				if (Array.isArray(events)) sanitizedEvents = events.map(e => sanitizeForFirestore(e, 8))
				else sanitizedEvents = [sanitizeForFirestore(events, 8)]
			} catch (err) {
				console.warn('Failed to sanitize events for analyzeUserData', err)
			}

			const sessionDocRef = db.collection('users_web_onbording').doc(sessionId)
			const sessionDoc = await sessionDocRef.get()
			const now = admin.firestore.FieldValue.serverTimestamp()

			if (!sessionDoc.exists) {
				await sessionDocRef.set({
					sessionId,
					userId,
					startTime: now,
					status: 'completed',
					events: sanitizedEvents || [],
					ip: meta.ip || null,
					device: meta.device,
					source: meta.source,
					country: meta.country,
					platformOS: meta.platformOS,
					formFactor: meta.formFactor
				})
			} else {
				const updates: Record<string, any> = { endTime: now, status: 'completed' }
				if (sanitizedEvents && sanitizedEvents.length > 0) {
					updates.events = admin.firestore.FieldValue.arrayUnion(...sanitizedEvents)
				}
				// Only set ip/device/source if not already set
				const data = sessionDoc.data() || {}
				if (!data.ip && meta.ip) updates.ip = meta.ip
				if (!data.device && meta.device) updates.device = meta.device
				if (!data.source && meta.source) updates.source = meta.source
				if (!data.country && meta.country) updates.country = meta.country
				if (!data.platformOS && meta.platformOS) updates.platformOS = meta.platformOS
				if (!data.formFactor && meta.formFactor) updates.formFactor = meta.formFactor
				await sessionDocRef.update(updates)
			}
		}

		res.status(200).json({ analysis: parsed }); return
	} catch (e: any) {
		console.error('analyzeUserData error', e)
		res.status(500).json({ error: e?.message || 'internal' }); return
	}
})

export const saveOnboardingSession = onRequest(async (req, res) => {
	// Real-time onboarding session event logging - v2
	// CORS handling: allow browser clients to POST from different origins.
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.set('Access-Control-Allow-Headers', 'Content-Type')
	if (req.method === 'OPTIONS') { res.status(204).send(''); return }
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }
	try {
		const body = req.body
		const { sessionId, events, userId } = body || {}
		if (!sessionId) { res.status(400).send({ error: 'sessionId required' }); return }

		// Extract traffic meta once per incoming event batch
		const meta = extractTrafficMeta(req)

		// sanitize incoming events for storage
		let sanitizedEvents: any[] = []
		try {
			if (Array.isArray(events)) sanitizedEvents = events.map(e => sanitizeForFirestore(e, 8)).filter(e => typeof e !== 'undefined' && e !== null)
			else if (typeof events !== 'undefined' && events !== null) sanitizedEvents = [sanitizeForFirestore(events, 8)]
		} catch (err) {
			console.warn('Failed to sanitize events for saveOnboardingSession', err)
		}

		const docRef = db.collection('users_web_onbording').doc(sessionId)
		const doc = await docRef.get()
		const now = admin.firestore.FieldValue.serverTimestamp()

		if (!doc.exists) {
			// Create new
			await docRef.set({
				sessionId,
				userId: userId || null,
				startTime: now,
				status: 'in_progress',
				events: sanitizedEvents || [],
				ip: meta.ip || null,
				device: meta.device,
				source: meta.source,
				country: meta.country,
				platformOS: meta.platformOS,
				formFactor: meta.formFactor
			})
		} else {
			// Update existing
			const updates: Record<string, any> = { endTime: now, status: 'completed' }
			if (sanitizedEvents && sanitizedEvents.length > 0) {
				updates.events = admin.firestore.FieldValue.arrayUnion(...sanitizedEvents)
			}
			// Only set ip/device/source if not already set
			const data = doc.data() || {}
			if (!data.ip && meta.ip) updates.ip = meta.ip
			if (!data.device && meta.device) updates.device = meta.device
			if (!data.source && meta.source) updates.source = meta.source
			if (!data.country && meta.country) updates.country = meta.country
			if (!data.platformOS && meta.platformOS) updates.platformOS = meta.platformOS
			if (!data.formFactor && meta.formFactor) updates.formFactor = meta.formFactor
			await docRef.update(updates)
		}

		res.status(200).json({ success: true }); return
	} catch (e: any) {
		console.error('saveOnboardingSession error', e)
		res.status(500).json({ error: e?.message || 'internal' }); return
	}
})

// Simple Stripe payment endpoint for Payment Request Button / card fallback
// Expects: POST { amount: number (cents), currency: string, paymentMethodId?: string }
// Creates + confirms a PaymentIntent when paymentMethodId provided. Returns status + client_secret.
export const processPayment = onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.set('Access-Control-Allow-Headers', 'Content-Type')
	if (req.method === 'OPTIONS') { res.status(204).send(''); return }
	if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

	try {
		if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return }

		const { amount, currency = 'usd', paymentMethodId, sessionId, userId } = req.body || {}
		if (typeof amount !== 'number' || amount <= 0) { res.status(400).json({ error: 'Invalid amount' }); return }

		// Create PaymentIntent (confirm immediately if we have a payment method from PRB)
		const params: Stripe.PaymentIntentCreateParams = {
			amount,
			currency,
			automatic_payment_methods: { enabled: true },
			capture_method: 'automatic',
			metadata: {
				sessionId: sessionId || '',
				userId: userId || '',
			}
		}

		if (paymentMethodId) {
			// Immediate confirmation path used by Payment Request Button
			const intent = await stripe.paymentIntents.create({
				...params,
				payment_method: paymentMethodId,
				confirm: true,
				return_url: 'https://quiz-beautymirror-app.web.app/success',
			})
			res.status(200).json({ id: intent.id, clientSecret: intent.client_secret, status: intent.status, nextAction: intent.next_action || null }); return
		}

		// Create only; client confirms with Elements/card fields if desired (not implemented here)
		const intent = await stripe.paymentIntents.create(params)
		res.status(200).json({ id: intent.id, clientSecret: intent.client_secret, status: intent.status, nextAction: intent.next_action || null }); return
	} catch (e: any) {
		console.error('processPayment error', e)
		// Stripe-specific error formatting
		const msg = e?.message || 'internal'
		res.status(500).json({ error: msg })
	}
})

// Stripe webhook to capture reliable payment events and persist to Firestore
// Set env STRIPE_WEBHOOK_SECRET with the endpoint secret from Stripe dashboard
export const stripeWebhook = onRequest(async (req, res) => {
	if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return }
	try {
		if (!stripe) { res.status(500).send('Stripe not configured'); return }
		const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
		if (!endpointSecret) { res.status(500).send('Webhook secret not configured'); return }

		// rawBody is available in Cloud Functions; use it for signature verification
		const sig = req.headers['stripe-signature'] as string
		const rawBody = (req as any).rawBody
		if (!rawBody || !sig) { res.status(400).send('Missing signature or body'); return }

		let event: Stripe.Event
		try {
			event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
		} catch (err: any) {
			console.error('Webhook signature verification failed', err?.message || err)
			res.status(400).send(`Webhook Error: ${err?.message || 'invalid signature'}`)
			return
		}

		// Handle only PaymentIntent and Charge events we care about
		switch (event.type) {
			case 'payment_intent.succeeded':
			case 'payment_intent.payment_failed':
			case 'payment_intent.processing':
			case 'payment_intent.requires_action': {
				const intent = event.data.object as Stripe.PaymentIntent
				const pid = intent.id
				const meta = intent.metadata || {}
				const sessionId = meta.sessionId || null
				const userId = meta.userId || null
				const amount = intent.amount || null
				const currency = intent.currency || null
				const status = intent.status
						// Charges list may not be present in typed SDK unless expanded; use any-safe access
						const chargesArr: any[] = (((intent as any).charges && (intent as any).charges.data) || []) as any[]
						const charges = chargesArr.map((c: any) => ({
					id: c.id,
					amount: c.amount,
					currency: c.currency,
					paid: c.paid,
					receipt_email: c.receipt_email || c.billing_details?.email || null,
					receipt_url: c.receipt_url || null,
					payment_method_details: {
								type: (c.payment_method_details as any)?.type || null,
								card: (c.payment_method_details as any)?.card ? {
									brand: (c.payment_method_details as any).card.brand,
									last4: (c.payment_method_details as any).card.last4,
						} : null
					}
				}))

				const paymentsRef = db.collection('payments').doc(pid)
				await paymentsRef.set({
					id: pid,
					type: 'payment_intent',
					status,
					amount,
					currency,
					created: admin.firestore.Timestamp.fromMillis((intent.created || Math.floor(Date.now()/1000)) * 1000),
					sessionId,
					userId,
					charges,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
				}, { merge: true })

				// Update session doc for quick lookups
				if (sessionId) {
					const sessionRef = db.collection('users_web_onbording').doc(sessionId)
					await sessionRef.set({
						payment: {
							paymentIntentId: pid,
							status,
							amount,
							currency,
							updatedAt: admin.firestore.FieldValue.serverTimestamp(),
						}
					}, { merge: true })
				}
				break
			}
			case 'charge.succeeded': {
				const charge = event.data.object as Stripe.Charge
				const pid = (charge.payment_intent as string) || charge.id
				const sessionId = (charge.metadata || {}).sessionId || null
				const paymentsRef = db.collection('payments').doc(pid)
				await paymentsRef.set({
					lastCharge: {
						id: charge.id,
						amount: charge.amount,
						currency: charge.currency,
						paid: charge.paid,
						receipt_email: charge.receipt_email || charge.billing_details?.email || null,
						receipt_url: charge.receipt_url || null,
					},
					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
				}, { merge: true })

				if (sessionId) {
					const sessionRef = db.collection('users_web_onbording').doc(sessionId)
					await sessionRef.set({
						payment: {
							chargeId: charge.id,
							status: 'succeeded',
							amount: charge.amount,
							currency: charge.currency,
							updatedAt: admin.firestore.FieldValue.serverTimestamp(),
						}
					}, { merge: true })
				}
				break
			}
			default:
				// Ignore other event types
				break
		}

		res.status(200).send('ok')
	} catch (e: any) {
		console.error('stripeWebhook error', e)
		res.status(500).send('internal')
	}
})

// --- NEW: Server-side upload proxy to bypass client CORS/Auth issues ---
export const uploadPhoto = onRequest({
	maxInstances: 10,
	timeoutSeconds: 60,
	cors: true,
}, async (req, res) => {
	try {
		if (req.method !== 'POST') {
			res.status(405).send('Method Not Allowed')
			return
		}

		const { userId, photoType, base64Data, contentType = 'image/jpeg' } = req.body

		if (!userId || !photoType || !base64Data) {
			res.status(400).json({ error: 'Missing userId, photoType, or base64Data' })
			return
		}

		// Decode base64 to buffer
		const buffer = Buffer.from(base64Data, 'base64')
		const timestamp = Date.now()
		const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.jpg`
		const storagePath = `user-uploads/${userId}/${photoType}/${filename}`

		// Upload directly via Admin SDK (no CORS issues)
		const bucket = admin.storage().bucket()
		const file = bucket.file(storagePath)

		await file.save(buffer, {
			metadata: {
				contentType,
				metadata: {
					uploadedBy: userId,
					uploadedAt: new Date().toISOString(),
				},
			},
		})

		// Make file publicly readable (or adjust based on your rules)
		await file.makePublic()
		const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

		res.status(200).json({
			success: true,
			url: publicUrl,
			path: storagePath,
		})
	} catch (e: any) {
		console.error('uploadPhoto error', e)
		res.status(500).json({ error: 'Upload failed', details: e.message })
	}
})

