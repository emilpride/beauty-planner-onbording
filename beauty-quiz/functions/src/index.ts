import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import axios from 'axios'
// Use dynamic require for Secret Manager to avoid TypeScript proto typing issues in build

admin.initializeApp()
const db = admin.firestore()
let secretClient: any = null

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

		const prompt = `Provide JSON matching the AIAnalysisModel schema. User answers: ${JSON.stringify(answers || {})}. Photo URLs: ${JSON.stringify(photoUrls || {})}`

		// Use the requested model endpoint: gemini-2.5-flash
		const resp = await axios.post(
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
			{
				contents: [{ parts: [{ text: prompt }] }]
			},
			{
				headers: {
					// Use x-goog-api-key to pass API key (avoid Authorization header issues)
					'x-goog-api-key': apiKey,
					'Content-Type': 'application/json'
				},
				timeout: 30000,
			}
		);

		const generated = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
		let parsed: any = null
		if (typeof generated === 'string') {
			try { parsed = JSON.parse(generated) } catch (e) { parsed = null }
		} else if (typeof generated === 'object') parsed = generated

		if (!parsed || !validateAIModel(parsed)) {
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

		const docRef = db.collection('users').doc(userId).collection('analysis').doc()
		await docRef.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: parsed })

		// Save onboarding session
		if (sessionId && events) {
			const sessionDocRef = db.collection('users_web_onbording').doc(sessionId)
			const sessionDoc = await sessionDocRef.get()
			const now = admin.firestore.FieldValue.serverTimestamp()

			if (!sessionDoc.exists) {
				await sessionDocRef.set({
					sessionId,
					userId,
					startTime: now,
					status: 'completed',
					events
				})
			} else {
				await sessionDocRef.update({
					events: admin.firestore.FieldValue.arrayUnion(...events),
					endTime: now,
					status: 'completed'
				})
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
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }
	try {
		const body = req.body
		const { sessionId, events, userId } = body || {}
		if (!sessionId) { res.status(400).send({ error: 'sessionId required' }); return }

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
				events: events || []
			})
		} else {
			// Update existing
			await docRef.update({
				events: admin.firestore.FieldValue.arrayUnion(...(events || [])),
				endTime: now,
				status: 'completed'
			})
		}

		res.status(200).json({ success: true }); return
	} catch (e: any) {
		console.error('saveOnboardingSession error', e)
		res.status(500).json({ error: e?.message || 'internal' }); return
	}
})

