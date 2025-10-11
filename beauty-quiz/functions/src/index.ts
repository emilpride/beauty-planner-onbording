import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import axios from 'axios'
// Use dynamic require for Secret Manager to avoid TypeScript proto typing issues in build

admin.initializeApp()
const db = admin.firestore()
let secretClient: any = null

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

// Принудительное развертывание от 10 октября 2025
export const analyzeUserData = onRequest(async (req, res) => {
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }
	try {
		const body = req.body
		const { userId, sessionId, events, answers, photoUrls } = body || {}
		if (!userId) { res.status(400).send({ error: 'userId required' }); return }

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

		// If the parsed object is invalid, do NOT use the fallback unless explicitly allowed.
		const allowFallback = (process.env.GEMINI_ALLOW_FALLBACK || 'false').toLowerCase() === 'true'
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
					events: sanitizedEvents || []
				})
			} else {
				if (sanitizedEvents && sanitizedEvents.length > 0) {
					await sessionDocRef.update({
						events: admin.firestore.FieldValue.arrayUnion(...sanitizedEvents),
					endTime: now,
					status: 'completed'
				})
				} else {
					await sessionDocRef.update({ endTime: now, status: 'completed' })
				}
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
				events: sanitizedEvents || []
			})
		} else {
			// Update existing
			if (sanitizedEvents && sanitizedEvents.length > 0) {
				await docRef.update({
					events: admin.firestore.FieldValue.arrayUnion(...sanitizedEvents),
					endTime: now,
					status: 'completed'
				})
			} else {
				await docRef.update({ endTime: now, status: 'completed' })
			}
		}

		res.status(200).json({ success: true }); return
	} catch (e: any) {
		console.error('saveOnboardingSession error', e)
		res.status(500).json({ error: e?.message || 'internal' }); return
	}
})

