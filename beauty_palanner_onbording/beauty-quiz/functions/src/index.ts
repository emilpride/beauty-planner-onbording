import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import axios from 'axios'
import FormData from 'form-data'
// Use require for busboy to avoid TS type requirements
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Busboy = require('busboy')
// Defer loading of heavy native module 'sharp' to runtime paths that need it to avoid deploy-time analyzer timeouts
// We'll require('sharp') inside the specific handler instead of at module load.
import Stripe from 'stripe'
import * as crypto from 'crypto'
import { 
	retryWithBackoff, 
	isCircuitBreakerOpen, 
	recordRequest, 
	validateUserAnswers,
	generateCacheKey,
	getCachedAnalysis,
	saveCacheAnalysis,
	incrementCacheHit
} from './reliability'
// import { startHeartbeat, updateHeartbeat, stopHeartbeat } from './heartbeat' // Disabled - causes response stream issues
import { callClaudeAnalysis, isClaudeFallbackEnabled } from './claude'
import { getAPIHealthMetrics, periodicHealthCheck } from './monitoring'

// Stub heartbeat functions - disabled to avoid response stream conflicts
// These are stubbed to prevent response stream conflicts with res.write() calls
export function startHeartbeat(..._args: any[]) { /* disabled */ }
export function updateHeartbeat(..._args: any[]) { /* disabled */ }
export function stopHeartbeat(..._args: any[]) { /* disabled */ }

// Use dynamic require for Secret Manager to avoid TypeScript proto typing issues in build

// Initialize Admin SDK only once (avoid duplicate-app error if other modules initialized first)
try {
	if ((admin as any).apps ? (admin as any).apps.length === 0 : !(admin as any).getApps?.()?.length) {
		admin.initializeApp()
	}
} catch (_) {
	// ignore race conditions
}
const db = admin.firestore()
let secretClient: any = null
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')
// Face++ API credentials (prefer FACEPLUS_* names as provided by user; keep FACEPP_* for backward-compat)
const FACEPLUS_API_KEY = defineSecret('FACEPLUS_API_KEY')
const FACEPLUS_API_SECRET = defineSecret('FACEPLUS_API_SECRET')
// Pixel ID is public; use env override if provided or default to the known ID
const META_PIXEL_ID = process.env.META_PIXEL_ID || '785592354117222'
const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null

// ===== RATE LIMITING =====
// Simple in-memory rate limiter with Firestore persistence across invocations
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitCache = new Map<string, RateLimitEntry>()

async function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): Promise<boolean> {
  const now = Date.now()
  
  // Check in-memory cache first
  let entry = rateLimitCache.get(key)
  if (entry && entry.resetAt > now) {
    // Still within window
    return entry.count < maxRequests
  }
  
  // Window expired or no cache entry
  rateLimitCache.set(key, { count: 1, resetAt: now + windowMs })
  return true
}

async function incrementRateLimit(key: string, windowMs: number = 60000): Promise<void> {
  const now = Date.now()
  const entry = rateLimitCache.get(key)
  
  if (entry && entry.resetAt > now) {
    entry.count++
  } else {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowMs })
  }
}

// ===== SECURITY HEADERS =====
// Add security headers to all responses
function addSecurityHeaders(res: any) {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'SAMEORIGIN')
  res.set('X-XSS-Protection', '1; mode=block')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(self), payment=(self)')
}

// ===== Meta Conversions API =====
function sha256Lower(s: string): string {
	return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex')
}

async function sendMetaCapiEvent(params: {
	eventName: string
	value?: number
	currency?: string
	email?: string | null
	clientIp?: string | null
	userAgent?: string | null
	eventSourceUrl?: string | null
	eventId?: string | null
}): Promise<void> {
	try {
		const token = process.env.META_CAPI_ACCESS_TOKEN
		if (!token || !META_PIXEL_ID) {
			return
		}
		const user_data: any = {}
		if (params.email) user_data.em = [sha256Lower(params.email)]
		if (params.clientIp) user_data.client_ip_address = params.clientIp
		if (params.userAgent) user_data.client_user_agent = params.userAgent

		const payload = {
			data: [
				{
					event_name: params.eventName,
					event_time: Math.floor(Date.now() / 1000),
					action_source: 'website',
					event_source_url: params.eventSourceUrl || undefined,
					event_id: params.eventId || undefined,
					user_data,
					custom_data: {
						currency: params.currency,
						value: params.value,
					},
				},
			],
		}

		const url = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`
		await axios.post(url, payload, { params: { access_token: token } }).catch(() => {})
	} catch (err) {
		console.warn('[Meta CAPI] Event send failed:', (err as any)?.message || err)
	}
}

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

// ===== AUTH HELPERS =====
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

// ===== FLUTTER SCHEMA MAPPING =====
type TimeHM = { Hour: number; Minute: number }

function toTimeHM(s?: any): TimeHM | null {
	try {
		if (!s || typeof s !== 'string') return null
		const [hh, mm] = s.split(':')
		const h = Number(hh)
		const m = Number(mm)
		if (Number.isNaN(h) || Number.isNaN(m)) return null
		return { Hour: h, Minute: m }
	} catch { return null }
}

function mapAssistant(v?: any): number {
	if (!v) return 1
	const s = String(v).toLowerCase()
	return s.includes('ellie') ? 2 : 1
}

function mapTheme(v?: any): number {
	const s = (v ? String(v) : '').toLowerCase()
	if (s === 'system' || s === 'auto') return 0
	if (s === 'dark') return 2
	return 1
}

function ensureHex(color?: any, fallback = '#A385E9'): string {
	const s = color ? String(color).trim() : ''
	if (!s) return fallback
	return s.startsWith('#') ? s : `#${s}`
}

function pickLast<T = any>(arr: any[], predicate: (e: any) => boolean): T | null {
	if (!Array.isArray(arr)) return null
	for (let i = arr.length - 1; i >= 0; i--) {
		try { if (predicate(arr[i])) return arr[i] as T } catch {}
	}
	return null
}

function findInEvent(e: any, keys: string[]): any {
	if (!e || typeof e !== 'object') return undefined
	for (const k of keys) {
		if (k in e) return (e as any)[k]
		// case-insensitive search
		const key = Object.keys(e).find(x => x.toLowerCase() === k.toLowerCase())
		if (key) return (e as any)[key]
	}
	return undefined
}

function extractFromSession(session: any): {
	assistant?: string
	theme?: string
	primaryColor?: string
	name?: string
	email?: string
	language?: string
	wakeUp?: string
	endDay?: string
	morningStartsAt?: string
	afternoonStartsAt?: string
	eveningStartsAt?: string
	reminderTime?: string
	activities?: any[]
} {
	const out: any = {}
	try {
		const events: any[] = Array.isArray(session?.events) ? session.events : []

		// Assistant
		const eAssistant = pickLast(events, (e) => {
			const en = String(e?.eventName || '').toLowerCase()
			return en.includes('assistant') ||
						 typeof findInEvent(e, ['assistant']) !== 'undefined'
		})
		const assistantVal = eAssistant ? (findInEvent(eAssistant, ['assistant', 'value', 'option', 'answer']) ?? eAssistant?.assistant) : undefined
		if (assistantVal) out.assistant = String(assistantVal)

		// Theme
		const eTheme = pickLast(events, (e) => {
			const en = String(e?.eventName || '').toLowerCase()
			return en.includes('theme') || typeof findInEvent(e, ['theme', 'themeMode']) !== 'undefined'
		})
		const themeVal = eTheme ? (findInEvent(eTheme, ['theme', 'themeMode', 'value']) ?? eTheme?.theme) : undefined
		if (themeVal) out.theme = String(themeVal)

		// Primary color
		const eColor = pickLast(events, (e) => {
			const en = String(e?.eventName || '').toLowerCase()
			return en.includes('color') || typeof findInEvent(e, ['primaryColor', 'color', 'colorHex']) !== 'undefined'
		})
		const colorVal = eColor ? (findInEvent(eColor, ['primaryColor', 'color', 'colorHex', 'value']) ?? eColor?.color) : undefined
		if (colorVal) out.primaryColor = String(colorVal)

		// Name / Email / Language (if present in any final step)
		const eProfile = pickLast(events, (e) => {
			return typeof findInEvent(e, ['name', 'email', 'language', 'languageCode']) !== 'undefined'
		})
		if (eProfile) {
			const name = findInEvent(eProfile, ['name'])
			const email = findInEvent(eProfile, ['email'])
			const lang = findInEvent(eProfile, ['language', 'languageCode'])
			if (name) out.name = String(name)
			if (email) out.email = String(email)
			if (lang) out.language = String(lang)
		}

		// Times
		const eTimes = pickLast(events, (e) => {
			return typeof findInEvent(e, ['wakeUp', 'endDay', 'morningStartsAt', 'afternoonStartsAt', 'eveningStartsAt', 'reminderTime']) !== 'undefined'
		})
		if (eTimes) {
			const keys = ['wakeUp','endDay','morningStartsAt','afternoonStartsAt','eveningStartsAt','reminderTime']
			for (const k of keys) {
				const v = findInEvent(eTimes, [k])
				if (v) out[k] = String(v)
			}
		}

		// Activities (optional)
		const eAct = pickLast(events, (e) => {
			return Array.isArray(findInEvent(e, ['activities']))
		})
		if (eAct) {
			out.activities = findInEvent(eAct, ['activities'])
		}
	} catch {}
	return out
}

function buildFlutterUserDoc(input: {
	uid: string
	name?: string
	email?: string
	language?: string
	assistant?: string
	theme?: string
	primaryColor?: string
	wakeUp?: string
	endDay?: string
	morningStartsAt?: string
	afternoonStartsAt?: string
	eveningStartsAt?: string
	reminderTime?: string
	activities?: any[]
}) {
	const doc: any = {
		Id: input.uid,
		Name: input.name || '',
		Email: input.email || '',
		LanguageCode: input.language || 'en',
		Assistant: mapAssistant(input.assistant),
		Theme: mapTheme(input.theme),
		PrimaryColor: ensureHex(input.primaryColor, '#A385E9'),
		Onboarding2Completed: true,
	}

	const times: Record<string, TimeHM | null> = {
		WakeUp: toTimeHM(input.wakeUp),
		EndDay: toTimeHM(input.endDay),
		MorningStartsAt: toTimeHM(input.morningStartsAt),
		AfternoonStartsAt: toTimeHM(input.afternoonStartsAt),
		EveningStartsAt: toTimeHM(input.eveningStartsAt),
		ReminderTime: toTimeHM(input.reminderTime),
	}
	for (const [k, v] of Object.entries(times)) if (v) (doc as any)[k] = v

	if (Array.isArray(input.activities) && input.activities.length) {
		doc.Activities = input.activities.map((a) => {
			const id = a?.Id || a?.id || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()))
			const timeStr = a?.Time || a?.time
			const color = a?.Color || a?.color
			return {
				Id: id,
				Name: a?.Name ?? a?.name ?? '',
				Illustration: a?.Illustration ?? a?.illustration ?? '',
				Category: a?.Category ?? a?.category ?? '',
				CategoryId: a?.CategoryId ?? a?.categoryId ?? '',
				Note: a?.Note ?? a?.note ?? '',
				IsRecommended: Boolean(a?.IsRecommended ?? a?.isRecommended ?? false),
				Type: a?.Type ?? a?.type ?? 'regular',
				ActiveStatus: Boolean(a?.ActiveStatus ?? a?.active ?? true),
				Time: typeof timeStr === 'string' ? toTimeHM(timeStr) : (a?.Time && typeof a.Time === 'object' && 'Hour' in a.Time ? a.Time : null),
				Frequency: a?.Frequency ?? a?.frequency ?? 'daily',
				SelectedDays: Array.isArray(a?.SelectedDays ?? a?.selectedDays) ? (a?.SelectedDays ?? a?.selectedDays) : [],
				WeeksInterval: Number(a?.WeeksInterval ?? a?.weeksInterval ?? 1),
				SelectedMonthDays: Array.isArray(a?.SelectedMonthDays ?? a?.selectedMonthDays) ? (a?.SelectedMonthDays ?? a?.selectedMonthDays) : [],
				NotifyBefore: a?.NotifyBefore ?? a?.notifyBefore ?? '',
				Cost: Number(a?.Cost ?? a?.cost ?? 0),
				SelectedNotifyBeforeUnit: a?.SelectedNotifyBeforeUnit ?? a?.selectedNotifyBeforeUnit ?? '',
				SelectedNotifyBeforeFrequency: a?.SelectedNotifyBeforeFrequency ?? a?.selectedNotifyBeforeFrequency ?? '',
				Color: ensureHex(color || '#FFA385E9'),
				EnabledAt: a?.EnabledAt ?? new Date().toISOString(),
				LastModifiedAt: a?.LastModifiedAt ?? new Date().toISOString(),
				EndBeforeUnit: a?.EndBeforeUnit ?? a?.endBeforeUnit ?? '',
				EndBeforeType: a?.EndBeforeType ?? a?.endBeforeType ?? 'date',
				SelectedEndBeforeDate: a?.SelectedEndBeforeDate ?? a?.selectedEndBeforeDate ?? null,
			}
		})
	}
	return doc
}

export const finalizeOnboarding = onRequest(async (req, res) => {
	// CORS + headers
	addSecurityHeaders(res)
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	if (req.method === 'OPTIONS') { res.status(204).send(''); return }
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }

	try {
		// Rate limit per IP
		const xffHeader = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xffHeader?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rlKey = `finalize_${clientIp}`
		const allowed = await checkRateLimit(rlKey, 20, 60000)
		if (!allowed) { res.status(429).json({ error: 'Too many requests' }); return }
		await incrementRateLimit(rlKey, 60000)

		// Auth
		const uidFromToken = await verifyIdTokenFromRequest(req)
		if (!uidFromToken) { res.status(401).json({ error: 'Unauthorized' }); return }

		const body = req.body || {}
		const sessionId = body.sessionId as string | undefined
		if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return }

		const sessionRef = db.collection('users_web_onbording').doc(sessionId)
		const snap = await sessionRef.get()
		if (!snap.exists) { res.status(404).json({ error: 'session not found' }); return }
		const session = snap.data() || {}

		// Build doc: prioritize explicit overrides from body.profile over session-derived values
		const fromSession = extractFromSession(session)
		const profile = body.profile || {}
		const input = {
			uid: uidFromToken,
			name: profile.name ?? fromSession.name,
			email: profile.email ?? fromSession.email,
			language: profile.language ?? profile.languageCode ?? fromSession.language,
			assistant: profile.assistant ?? fromSession.assistant,
			theme: profile.theme ?? fromSession.theme,
			primaryColor: profile.primaryColor ?? fromSession.primaryColor,
			wakeUp: profile.wakeUp ?? fromSession.wakeUp,
			endDay: profile.endDay ?? fromSession.endDay,
			morningStartsAt: profile.morningStartsAt ?? fromSession.morningStartsAt,
			afternoonStartsAt: profile.afternoonStartsAt ?? fromSession.afternoonStartsAt,
			eveningStartsAt: profile.eveningStartsAt ?? fromSession.eveningStartsAt,
			reminderTime: profile.reminderTime ?? fromSession.reminderTime,
			activities: Array.isArray(profile.activities) ? profile.activities : fromSession.activities,
		}

		const userDoc = buildFlutterUserDoc(input)

		// Write to Users/{uid}
		const userRef = db.collection('Users').doc(uidFromToken)
		await userRef.set({ ...userDoc, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

		// Mark session finalized (idempotency)
		await sessionRef.set({ finalizedAt: admin.firestore.FieldValue.serverTimestamp(), finalizedByUid: uidFromToken }, { merge: true })

		// Mint a short-lived custom token so the Web app can sign the user in cross-domain
		// Note: Firebase custom tokens are JWTs signed by the Admin SDK. They do not expire immediately
		// but should be consumed promptly. The client will exchange this token for an ID token.
		const token = await admin.auth().createCustomToken(uidFromToken)
		res.status(200).json({ ok: true, token })
	} catch (e: any) {
		console.error('finalizeOnboarding error', e?.message || e)
		res.status(500).json({ error: 'internal' })
	}
})

// ===== Achievements computation (server-side authoritative) =====
type ServerAchievementProgress = {
	totalCompletedActivities: number
	currentLevel: number
	lastUpdated: admin.firestore.FieldValue
	levelUnlockDates?: Record<string, any>
}

// Mirror client thresholds; keep simple stepped levels
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
	// Count completed updates
	const col = db.collection('Users').doc(userId).collection('Updates')
	const snap = await col.where('status', '==', 'completed').get()
	const completed = snap.size
	const level = calcLevelServer(completed)

	// Merge into Achievements/Progress
	const ref = db.collection('Users').doc(userId).collection('Achievements').doc('Progress')
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
	return payload
}

// Firestore trigger: recompute on any update write
export const onUpdateWriteRecomputeAchievements = onDocumentWritten('Users/{userId}/Updates/{updateId}', async (event) => {
	try {
		const userId = event.params.userId as string
		if (!userId) return
		await recomputeAchievementsForUser(userId)
	} catch (e) {
		console.error('Recompute achievements trigger failed:', (e as any)?.message || e)
	}
})

// HTTP endpoint to recompute achievements on demand for the current user
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

type RecommendedScheduleItem = {
	id: string
	repeat: 'Daily' | 'Weekly' | 'Monthly'
	weeklyInterval?: number
	weeklyDays?: number[]
	monthlyDays?: number[]
	allDay?: boolean
	timePeriod?: 'Morning' | 'Afternoon' | 'Evening' | null
	time?: string | null
	// New: when the same id should occur multiple times per day, we aggregate here
	times?: { time: string, timePeriod: 'Morning' | 'Afternoon' | 'Evening' }[]
	note?: string
}

type AIAnalysisModel = {
	bmi: number | null
	bmiCategory: string
	bmiDescription: string
	bmiImageId: string
	skinCondition: { score: number; explanation: string; recommendations: string[] }
	hairCondition: { score: number; explanation: string; recommendations: string[] }
	physicalCondition: { score: number; explanation: string; recommendations: string[] }
	mentalCondition: { score: number; explanation: string; recommendations: string[] }
	bmsScore: number
	bmsCategory: string
	bmsDescription: string
	recommendedSchedule?: RecommendedScheduleItem[]
}

// BMI calculation and conversion functions
function convertHeightToMeters(height: number, unit: string): number {
	if (unit === 'ft&in') {
		// Height in format like 5.8 feet
		const feet = Math.floor(height)
		const inches = (height - feet) * 10 // Convert decimal part to inches
		return (feet * 12 + inches) * 0.0254 // Convert to meters
	}
	// cm to meters
	return height / 100
}

function convertWeightToKg(weight: number, unit: string): number {
	if (unit === 'lbs') {
		return weight * 0.453592 // Convert pounds to kg
	}
	return weight // Already in kg
}

function calculateBMI(height: number, heightUnit: string, weight: number, weightUnit: string): number | null {
	if (!height || !weight || height <= 0 || weight <= 0) return null
	
	const heightInMeters = convertHeightToMeters(height, heightUnit)
	const weightInKg = convertWeightToKg(weight, weightUnit)
	
	if (heightInMeters <= 0 || weightInKg <= 0) return null
	
	return Math.round((weightInKg / (heightInMeters * heightInMeters)) * 10) / 10
}

// BMI is NOT converted into a 0-10 score for BMS. It is reported separately and
// already reflected within physicalCondition coming from the model.

// Get BMI category and description
function getBMIInfo(bmi: number | null, gender: number): { category: string; description: string; imageId: string } {
	const isFemale = gender === 2
	const genderPrefix = isFemale ? 'female' : 'male'
	
	if (bmi === null) {
		return {
			category: 'Unknown',
			description: 'Unable to calculate BMI due to insufficient data.',
			imageId: `#bmi_${genderPrefix}_2`
		}
	}
	
	if (bmi < 18.5) {
		return {
			category: 'Underweight',
			description: 'Underweight may be associated with health risks, including a weakened immune system and lack of energy. It\'s important to focus on a balanced and nutrient-dense diet.',
			imageId: `#bmi_${genderPrefix}_1`
		}
	}
	
	if (bmi >= 18.5 && bmi < 25) {
		return {
			category: 'Normal Weight',
			description: 'Your weight is in a healthy range. This is an excellent indicator! Continue to maintain a balance between nutrition and physical activity to preserve this result.',
			imageId: `#bmi_${genderPrefix}_2`
		}
	}
	
	if (bmi >= 25 && bmi < 30) {
		return {
			category: 'Overweight',
			description: 'Being overweight can increase risks for the cardiovascular system. It is recommended to focus on dietary adjustments and increasing regular physical activity.',
			imageId: `#bmi_${genderPrefix}_3`
		}
	}
	
	return {
		category: 'Obesity',
		description: 'This range is associated with significant health risks. A consultation with a specialist is strongly recommended to develop a comprehensive weight management program.',
		imageId: `#bmi_${genderPrefix}_4`
	}
}

// Get BMS category and description
function getBMSInfo(bmsScore: number): { category: string; description: string } {
	if (bmsScore < 4) {
		return {
			category: 'Needs Attention',
			description: 'Your lifestyle requires comprehensive attention. It is likely that one or more areas (nutrition, sleep, stress, self-care) are out of balance and affecting your overall well-being. It\'s important to focus on building basic healthy habits.'
		}
	}
	
	if (bmsScore < 6) {
		return {
			category: 'On the Path to Balance',
			description: 'You are on the right path to harmony. Some areas of your life are already showing good results, while others require additional support. Keep moving in the same direction, paying attention to the areas that are lagging.'
		}
	}
	
	if (bmsScore < 8) {
		return {
			category: 'Balanced State',
			description: 'You have achieved a good balance between physical health, mental state, and self-care. Your system is working cohesively. Maintain your current rhythm and remember to listen to your body\'s signals.'
		}
	}
	
	return {
		category: 'Radiant State',
		description: 'Your lifestyle is in a state of radiant harmony. Physical energy, mental clarity, and appearance complement each other perfectly. You are an excellent example of a holistic approach to health.'
	}
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

	async function geoLookup(ip: string): Promise<string | null> {
		if (!ip) return null
		try {
			// Best-effort free lookup; do not block or throw
			const resp = await axios.get(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, { timeout: 1200 })
			const country = (resp.data || '').toString().trim().toUpperCase()
			return country && country.length === 2 ? country : null
		} catch { return null }
	}

function extractTrafficMetaSync(req: any): { ip: string | null; device: 'android' | 'ios' | 'web'; source: 'google' | 'facebook' | 'direct' | 'organic'; country: string | null; platformOS: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown'; formFactor: 'mobile' | 'tablet' | 'desktop'; utm?: any; referrer?: string | null; pageUrl?: string | null } {
	const ip = getClientIp(req)
	const ua = (req.headers['user-agent'] as string) || ''
	const device = detectDeviceFromUA(ua)
	const bodyMeta = (req.body && req.body.meta) || {}
	const utm = bodyMeta.utm || null
	const utmSource: string | null = (utm?.source as string) || null
	const referrerHeader: string | null = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || null
	const source = classifySource({ referrer: referrerHeader, utmSource })
	// Country via Google headers if available (Cloud Run/Functions sometimes set x-appengine-country)
	const gaeCountry = (req.headers['x-appengine-country'] as string) || ''
	const country = gaeCountry && gaeCountry !== 'ZZ' ? gaeCountry.toUpperCase() : null
	const platformOS = detectPlatformOS(ua)
	const formFactor = detectFormFactor(ua)
	const pageUrl: string | null = (bodyMeta.pageUrl as string) || null
	return { ip, device, source, country, platformOS, formFactor, utm, referrer: referrerHeader, pageUrl }
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
function validateGeminiResponse(obj: any): boolean {
	if (typeof obj !== 'object' || obj == null) {
		console.warn('Validation failed: not an object or null')
		return false
	}
	
	const checks = ['skinCondition','hairCondition','physicalCondition','mentalCondition']
	
	// Valid procedure IDs for strict validation
	const validProcedures = new Set([
		'breathing-exercises', 'cardio-boost', 'cleanse-hydrate', 'cycling', 'dance-it-out', 
		'deep-hydration', 'deep-nourishment', 'evening-stretch', 'exfoliate', 'face-massage',
		'gratitude-exercises', 'heat-protection', 'learn-grow', 'lip-eye-care', 'mindful-meditation',
		'mood-check-in', 'morning-stretch', 'positive-affirmations', 'post-color-care', 'posture-fix',
		'scalp-detox', 'scalp-massage', 'social-media-detox', 'spf-protection', 'strength-training',
		'stress-relief', 'swimming-time', 'talk-it-out', 'trim-split-ends', 'wash-care',
		'yoga-flexibility', 'beard-shave-care', 'hair-loss-support', 'leave-in-care', 'night-care-routine'
	])
	
	for (const k of checks) {
		if (typeof obj[k] !== 'object') {
			console.warn(`Validation failed: ${k} is not an object:`, typeof obj[k])
			return false
		}
		
		if (typeof obj[k].score !== 'number') {
			console.warn(`Validation failed: ${k}.score is not a number:`, typeof obj[k].score, obj[k].score)
			return false
		}
		
		if (!Array.isArray(obj[k].recommendations)) {
			console.warn(`Validation failed: ${k}.recommendations is not an array:`, typeof obj[k].recommendations)
			return false
		}
		
		// Validate that all recommended procedures are in our valid set
		for (const rec of obj[k].recommendations) {
			if (typeof rec !== 'string') {
				console.warn(`Validation failed: recommendation is not a string:`, typeof rec, rec)
				return false
			}
					if (!validProcedures.has(rec)) {
							console.warn(`Invalid procedure recommendation filtered: ${rec}`)
							// Filter invalid entries instead of failing
							obj[k].recommendations = obj[k].recommendations.filter((r: string) => typeof r === 'string' && validProcedures.has(r))
					}
				}
				// Ensure non-empty defaults if nothing left after filtering
				if (!Array.isArray(obj[k].recommendations) || obj[k].recommendations.length === 0) {
					const defaults: Record<string,string[]> = {
						skinCondition: ['cleanse-hydrate','deep-hydration'],
						hairCondition: ['wash-care','deep-nourishment'],
						physicalCondition: ['morning-stretch','cardio-boost'],
						mentalCondition: ['mindful-meditation','breathing-exercises']
					}
					const dk = (k as keyof typeof defaults)
					obj[k].recommendations = defaults[dk]
		}
	}
	
	console.log('Validation passed for Gemini response')
	// Validate optional recommendedSchedule array
	try {
		const sched = obj['recommendedSchedule']
		if (typeof sched !== 'undefined') {
			if (!Array.isArray(sched)) {
				console.warn('Validation: recommendedSchedule is not an array – dropping')
				delete obj['recommendedSchedule']
			} else {
				const allowedIds = new Set([
					'breathing-exercises', 'cardio-boost', 'cleanse-hydrate', 'cycling', 'dance-it-out',
					'deep-hydration', 'deep-nourishment', 'evening-stretch', 'exfoliate', 'face-massage',
					'gratitude-exercises', 'heat-protection', 'learn-grow', 'lip-eye-care', 'mindful-meditation',
					'mood-check-in', 'morning-stretch', 'positive-affirmations', 'post-color-care', 'posture-fix',
					'scalp-detox', 'scalp-massage', 'social-media-detox', 'spf-protection', 'strength-training',
					'stress-relief', 'swimming-time', 'talk-it-out', 'trim-split-ends', 'wash-care',
					'yoga-flexibility', 'beard-shave-care', 'hair-loss-support', 'leave-in-care', 'night-care-routine'
				])
				const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))
				const isHHMM = (s: string) => /^\d{2}:\d{2}$/.test(s)
				// Normalize 12h time strings like "7pm", "7:30 PM" to HH:MM (24h) and infer period
				const to24h = (raw: any): { time: string | null; inferredPeriod: 'Morning'|'Afternoon'|'Evening'|null } => {
					if (typeof raw !== 'string') return { time: null, inferredPeriod: null }
					const s = raw.trim()
					if (isHHMM(s)) {
						const hh = Number(s.slice(0,2))
						if (!Number.isFinite(hh)) return { time: s, inferredPeriod: null }
						if (hh >= 5 && hh < 12) return { time: s, inferredPeriod: 'Morning' }
						if (hh >= 12 && hh < 17) return { time: s, inferredPeriod: 'Afternoon' }
						return { time: s, inferredPeriod: 'Evening' }
					}
					const m = s.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?|am|pm)\s*$/i)
					if (m) {
						let h = Number(m[1])
						const mm = typeof m[2] === 'string' && m[2] ? Number(m[2]) : 0
						const ap = (m[3] || '').toLowerCase()
						if (ap.startsWith('p') && h < 12) h += 12
						if (ap.startsWith('a') && h === 12) h = 0
						const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
						const hhmm = `${pad(Math.max(0, Math.min(23, h)))}:${pad(Math.max(0, Math.min(59, mm)))}`
						const inferred: 'Morning'|'Afternoon'|'Evening' = ((): any => {
							if (h >= 5 && h < 12) return 'Morning'
							if (h >= 12 && h < 17) return 'Afternoon'
							return 'Evening'
						})()
						return { time: hhmm, inferredPeriod: inferred }
					}
					return { time: null, inferredPeriod: null }
				}
				const normPeriod = (raw: any, fallbackFromTime: 'Morning'|'Afternoon'|'Evening'|null): 'Morning'|'Afternoon'|'Evening'|null => {
					const v = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
					if (!v) return fallbackFromTime
					if (v === 'morning' || v === 'am') return 'Morning'
					if (v === 'afternoon' || v === 'midday' || v === 'noon') return 'Afternoon'
					if (v === 'evening' || v === 'pm' || v === 'night' || v === 'late evening') return 'Evening'
					return fallbackFromTime
				}
				// Merge duplicate ids to aggregate multiple times per day
				const merged = new Map<string, any>()
				for (const it of sched) {
					if (!it || typeof it !== 'object') continue
					const id = String((it as any).id || '')
					if (!allowedIds.has(id)) continue
					let repeat = String((it as any).repeat || 'Daily') as any
					if (!['Daily','Weekly','Monthly'].includes(repeat)) repeat = 'Daily'
					const weeklyInterval = clamp(Number((it as any).weeklyInterval ?? 1), 1, 12)
					const weeklyDaysSrc = Array.isArray((it as any).weeklyDays) ? (it as any).weeklyDays : []
					const weeklyDays = weeklyDaysSrc
						.map((d: any) => Number(d))
						.filter((d: number) => Number.isFinite(d) && d >= 0 && d <= 6)
					const monthlyDaysSrc = Array.isArray((it as any).monthlyDays) ? (it as any).monthlyDays : []
					const monthlyDays = monthlyDaysSrc
						.map((d: any) => Number(d))
						.filter((d: number) => Number.isFinite(d) && d >= 1 && d <= 31)
					const allDay = Boolean((it as any).allDay ?? true)
					const rawTime = (it as any).time
					let time: string | null = null
					let inferredFromTime: 'Morning'|'Afternoon'|'Evening'|null = null
					if (!allDay && typeof rawTime === 'string') {
						if (isHHMM(rawTime)) {
							time = rawTime
							const hh = Number(rawTime.slice(0,2))
							inferredFromTime = (hh >= 5 && hh < 12) ? 'Morning' : (hh >= 12 && hh < 17) ? 'Afternoon' : 'Evening'
						} else {
							const cv = to24h(rawTime)
							time = cv.time
							inferredFromTime = cv.inferredPeriod
						}
					}
					const timePeriod = normPeriod((it as any).timePeriod, inferredFromTime)
					const note = typeof (it as any).note === 'string' ? (it as any).note : undefined

					if (repeat === 'Weekly' && weeklyDays.length === 0) continue
					if (repeat === 'Monthly' && monthlyDays.length === 0) continue

					const existing = merged.get(id)
					if (!existing) {
						const base: any = { id, repeat, weeklyInterval, weeklyDays, monthlyDays, allDay, time: null, timePeriod: null, note, times: [] as { time: string, timePeriod: 'Morning'|'Afternoon'|'Evening' }[] }
						if (!allDay && time && timePeriod) base.times.push({ time, timePeriod })
						merged.set(id, base)
					} else {
						// Reconcile: keep the first repeat/days; warn on conflicts but don't override
						if (allDay) {
							existing.allDay = true
							existing.times = []
							existing.time = null
							existing.timePeriod = null
						} else if (time && timePeriod && !existing.allDay) {
							const existsPair = existing.times.some((t: any) => t.time === time && t.timePeriod === timePeriod)
							if (!existsPair && existing.times.length < 3) existing.times.push({ time, timePeriod })
						}
					}
				}

				const filtered = Array.from(merged.values())
				if (filtered.length) {
					// For back-compat fill single fields from first time if present
					for (const item of filtered) {
						if (!item.allDay && Array.isArray(item.times) && item.times.length > 0) {
							item.time = item.times[0].time
							item.timePeriod = item.times[0].timePeriod
						}
					}
					obj['recommendedSchedule'] = filtered.slice(0, 7)
				} else {
					delete obj['recommendedSchedule']
				}
			}
		}
	} catch (e) {
		console.warn('Validation: error processing recommendedSchedule:', (e as any)?.message || e)
		delete obj['recommendedSchedule']
	}

	return true
}

// Build complete analysis model with server-calculated values
function buildCompleteAnalysis(geminiResponse: any, answers: any): AIAnalysisModel {
	// Calculate BMI on server
	const calculatedBMI = calculateBMI(
		answers.Height, 
		answers.HeightUnit || 'cm', 
		answers.Weight, 
		answers.WeightUnit || 'kg'
	)
	
	// Get BMI info
	const bmiInfo = getBMIInfo(calculatedBMI, answers.Gender || 0)
	
	// Calculate BMS strictly as the average of the four Gemini scores (skin, hair, physical, mental)
	const geminiScores = [
		geminiResponse.skinCondition?.score || 5,
		geminiResponse.hairCondition?.score || 5,
		geminiResponse.physicalCondition?.score || 5,
		geminiResponse.mentalCondition?.score || 5
	]
	const bmsScore = Math.round((geminiScores.reduce((a, b) => a + b, 0) / geminiScores.length) * 10) / 10
	
	// Get BMS info
	const bmsInfo = getBMSInfo(bmsScore)
	
	return {
		bmi: calculatedBMI,
		bmiCategory: bmiInfo.category,
		bmiDescription: bmiInfo.description,
		bmiImageId: bmiInfo.imageId,
		skinCondition: geminiResponse.skinCondition,
		hairCondition: geminiResponse.hairCondition,
		physicalCondition: geminiResponse.physicalCondition,
		mentalCondition: geminiResponse.mentalCondition,
		bmsScore: bmsScore,
		bmsCategory: bmsInfo.category,
		bmsDescription: bmsInfo.description,
		recommendedSchedule: Array.isArray(geminiResponse.recommendedSchedule) ? geminiResponse.recommendedSchedule as RecommendedScheduleItem[] : []
	}
}

// Safe response sender - prevents double-send errors
function sendResponse(res: any, statusCode: number, data: any, responseSent: { value: boolean }) {
	if (responseSent.value) {
		console.warn('[Response] Attempt to send response when already sent:', { statusCode, hasData: !!data })
		return
	}
	responseSent.value = true
	try {
		// If heartbeat already started streaming, just write data
		if (res.headersSent) {
			console.log('[Response] Headers already sent (heartbeat), appending data')
			res.write('\n' + JSON.stringify(data))
			res.end()
		} else {
			// Normal response
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(JSON.stringify(data))
		}
	} catch (err) {
		console.warn('[Response] Error sending response:', err)
	}
}

function sendErrorResponse(res: any, statusCode: number, message: string, responseSent: { value: boolean }) {
	if (responseSent.value) {
		console.warn('[Response] Attempt to send error when already sent:', { statusCode, message })
		return
	}
	responseSent.value = true
	try {
		// If heartbeat already started streaming, just write error
		const errorData = { error: message }
		if (res.headersSent) {
			console.log('[Response] Headers already sent (heartbeat), appending error')
			res.write('\n' + JSON.stringify(errorData))
			res.end()
		} else {
			// Normal response
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(JSON.stringify(errorData))
		}
	} catch (err) {
		console.warn('[Response] Error sending error response:', err)
	}
}

// Forced deployment on Oct 10, 2025
export const analyzeUserData = onRequest({
	maxInstances: 10,
	timeoutSeconds: 60, // Reduced from 120s to 60s - faster timeout detection with heartbeat updates
	cors: true,
}, async (req, res) => {
	// Track if response has been sent to prevent double-send errors
	const responseSent = { value: false }
	
	// Add security headers
	addSecurityHeaders(res)
	if (req.method !== 'POST') { sendErrorResponse(res, 405, 'Method not allowed', responseSent); return }
	try {
		// Start heartbeat logging for long-running operation
		// Logs progress every 15s (client can parse logs if needed)
		// DISABLED: startHeartbeat writes to response stream which prevents proper JSON response
		// startHeartbeat(res, { intervalMs: 15000, maxDurationMs: 50000 })

		// Circuit breaker: check if API is experiencing too many failures
		if (isCircuitBreakerOpen()) {
			console.warn('[CircuitBreaker] Rejecting request - circuit breaker is open')
			sendErrorResponse(res, 503, 'The analysis service is temporarily unavailable. Please try again in a few moments.', responseSent)
			return
		}

		// Rate limiting: 10 requests per minute per IP
		const xffHeader = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xffHeader?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rateLimitKey = `analyzeUser_${clientIp}`
		const isAllowed = await checkRateLimit(rateLimitKey, 10, 60000)
		if (!isAllowed) {
			stopHeartbeat()
			sendErrorResponse(res, 429, 'Too many requests. Please try again later.', responseSent)
			return
		}
		await incrementRateLimit(rateLimitKey, 60000)

		const body = req.body
		const { userId, sessionId, events, answers, photoUrls } = body || {}
		if (!userId) { 
			stopHeartbeat()
			sendErrorResponse(res, 400, 'userId required', responseSent)
			return 
		}

		// Validate and preprocess user answers
		updateHeartbeat('validating', 10, 'Validating your answers...')
		const validationResult = validateUserAnswers(answers)
		if (!validationResult.isValid) {
			console.error('[Validation] Input validation failed:', validationResult.errors)
			stopHeartbeat()
			sendErrorResponse(res, 400, 'Invalid input data: ' + validationResult.errors.join(', '), responseSent)
			return
		}
		if (validationResult.warnings.length > 0) {
			console.warn('[Validation] Input warnings:', validationResult.warnings)
		}

		// Check cache for similar analysis
		updateHeartbeat('caching', 15, 'Checking for existing analysis...')
		const cacheKey = generateCacheKey(answers)
		if (cacheKey) {
			const cached = await getCachedAnalysis(cacheKey)
			if (cached) {
				console.log('[Cache] Returning cached analysis')
				await incrementCacheHit(cacheKey)
				recordRequest(true)
				stopHeartbeat()
				sendResponse(res, 200, { analysis: cached, fromCache: true }, responseSent)
				return
			}
		}

		// Extract traffic meta for session doc (ip/device/source)
		updateHeartbeat('preprocessing', 20, 'Processing your profile...')
		const meta = extractTrafficMetaSync(req)

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
		// Only include essential user answers, not the full event log to reduce prompt size
		
		// Optimize user data by extracting only key values with descriptive field names
		function optimizeUserData(answers: any) {
			if (!answers || typeof answers !== 'object') return {}
			
			const optimized: any = {}
			
			// Helper function to safely extract text from objects or arrays
			function extractText(value: any): string {
				if (!value) return ''
				if (typeof value === 'string') return value
				if (typeof value === 'number') return value.toString()
				if (Array.isArray(value)) {
					// For arrays, filter for active items first, then extract their titles
					const activeItems = value.filter(item => {
						if (typeof item === 'object' && item !== null) {
							// Look for active items (isActive: true)
							return item.isActive === true
						}
						return true // Keep non-object items
					})
					
					if (activeItems.length === 0) {
						// If no active items, return empty string instead of all items
						return ''
					}
					
					return activeItems.map(item => {
						if (typeof item === 'string') return item
						if (typeof item === 'object' && item !== null) {
							// Extract meaningful text from object properties - prioritize title
							return item.title || item.text || item.label || item.name || item.value || item.id || ''
						}
						return String(item)
					}).filter(Boolean).join(', ')
				}
				if (typeof value === 'object' && value !== null) {
					// For single objects, check if it has isActive property
					if ('isActive' in value && value.isActive !== true) {
						return '' // Skip inactive items
					}
					// Extract text from object properties - prioritize title
					return value.title || value.text || value.label || value.name || value.value || value.id || ''
				}
				return String(value)
			}
			
			// Extract key fields with clear, descriptive names
			if (answers.Age) optimized.user_age = answers.Age
			if (answers.Gender) optimized.user_gender = answers.Gender
			
			// Calculate BMI on server instead of sending raw height/weight
			const calculatedBMI = calculateBMI(
				answers.Height, 
				answers.HeightUnit || 'cm', 
				answers.Weight, 
				answers.WeightUnit || 'kg'
			)
			if (calculatedBMI !== null) {
				optimized.calculated_bmi = calculatedBMI
			}
			
			// Work environment - descriptive
			if (answers.WorkEnvironment) optimized.work_environment = extractText(answers.WorkEnvironment)
			
			// Skin data - clear context
			if (answers.SkinType) optimized.skin_type = extractText(answers.SkinType)
			if (answers.SkinProblems) {
				const skinProblems = extractText(answers.SkinProblems)
				if (skinProblems) optimized.skin_problems = skinProblems
			}
			
			// Hair data - clear context  
			if (answers.HairType) optimized.hair_type = extractText(answers.HairType)
			if (answers.HairProblems) {
				const hairProblems = extractText(answers.HairProblems)
				if (hairProblems) optimized.hair_problems = hairProblems
			}
			
			// Physical activities - descriptive
			if (answers.PhysicalActivities) {
				const activities = extractText(answers.PhysicalActivities)
				if (activities) optimized.physical_activities = activities
			}
			if (answers.ActivityFrequency) {
				const frequency = extractText(answers.ActivityFrequency)
				if (frequency) optimized.activity_frequency = frequency
			}
			
			// Diet - clear context
			if (answers.Diet) {
				const diet = extractText(answers.Diet)
				if (diet) optimized.diet_preferences = diet
			}
			
			// Sleep - descriptive times and derived hours (from UI)
			if (answers.EndDay) optimized.sleep_time = extractText(answers.EndDay)
			if (answers.WakeUp) optimized.wake_up_time = extractText(answers.WakeUp)
			if ((answers as any).sleepHours) {
				optimized.sleep_hours = (answers as any).sleepHours
			}
			
			// Mental state - clear descriptive names
			if (answers.Mood) optimized.current_mood = extractText(answers.Mood)
			if (answers.EnergyLevel) optimized.daily_energy_level = answers.EnergyLevel
			if (answers.Stress) optimized.stress_level = extractText(answers.Stress)
			if (answers.Focus) optimized.focus_ability = extractText(answers.Focus)
			if (answers.Procrastination) optimized.procrastination_tendency = extractText(answers.Procrastination)
			
			return optimized
		}
		
		const optimizedAnswers = optimizeUserData(answers)
		// Keep photo URLs for potential future image analysis
		const optimizedPhotos = photoUrls || {}
		
		// Log the optimized data to debug the "[object Object]" issue
		console.log('Optimized user data:', JSON.stringify(optimizedAnswers, null, 2))
		console.log('Raw answers sample:', {
			SkinProblems: answers?.SkinProblems,
			HairProblems: answers?.HairProblems,
			PhysicalActivities: answers?.PhysicalActivities
		})
		
		// Define available procedure IDs for recommendations - STRICT VALIDATION
		const availableProcedures = [
			'breathing-exercises', 'cardio-boost', 'cleanse-hydrate', 'cycling', 'dance-it-out', 
			'deep-hydration', 'deep-nourishment', 'evening-stretch', 'exfoliate', 'face-massage',
			'gratitude-exercises', 'heat-protection', 'learn-grow', 'lip-eye-care', 'mindful-meditation',
			'mood-check-in', 'morning-stretch', 'positive-affirmations', 'post-color-care', 'posture-fix',
			'scalp-detox', 'scalp-massage', 'social-media-detox', 'spf-protection', 'strength-training',
			'stress-relief', 'swimming-time', 'talk-it-out', 'trim-split-ends', 'wash-care',
			'yoga-flexibility', 'beard-shave-care', 'hair-loss-support', 'leave-in-care', 'night-care-routine'
		]
		
				const basePrompt = `You are an AI assistant that MUST return ONLY valid JSON. NO other text allowed.

CRITICAL RULES:
1. ONLY return a JSON object matching this exact schema
2. For ALL recommendations arrays, you MUST ONLY use these exact procedure IDs: ${JSON.stringify(availableProcedures)}
3. NEVER create new procedure names or IDs
4. Choose 1-3 procedure IDs per condition that match user's specific needs
5. If uncertain, prefer common procedures like 'cleanse-hydrate', 'mindful-meditation', 'morning-stretch'
6. DO NOT calculate BMI or BMS - the server handles these calculations
7. ALSO return a top-level field "recommendedSchedule" with 4-7 items describing a weekly schedule. Use ONLY allowed procedure IDs, no duplicates.
8. Schedules must be realistic for the user's day: prefer Morning near wake_up_time, Evening near end_day. If you choose exact time, use HH:MM 24h format.
9. Gender-aware: avoid 'beard-shave-care'/'hair-loss-support' for females; avoid 'leave-in-care'/'night-care-routine' for males unless clearly supported.
10. If uncertain, use simple defaults: 'cleanse-hydrate' Daily Morning, 'spf-protection' Daily Morning, 'mindful-meditation' Daily Evening, 'exfoliate' Weekly.

Required JSON schema: ${JSON.stringify({
						skinCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
						hairCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
						physicalCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
						mentalCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
						recommendedSchedule: [
							{
								id: '<one-of-allowed-procedure-ids>',
								repeat: 'one-of: Daily|Weekly|Monthly',
								weeklyInterval: 'number >= 1',
								weeklyDays: '[numbers 0..6] required if Weekly',
								monthlyDays: '[numbers 1..31] required if Monthly',
								allDay: 'boolean',
								timePeriod: 'one-of: Morning|Afternoon|Evening|null',
								time: 'HH:MM or empty when allDay is true',
								note: 'short practical tip string'
							}
						]
				})}

User profile: ${JSON.stringify(optimizedAnswers)}`

		// Log prompt size optimization
		const originalPromptSize = JSON.stringify(answers || {}).length + JSON.stringify(photoUrls || {}).length
		const optimizedPromptSize = JSON.stringify(optimizedAnswers).length + JSON.stringify(optimizedPhotos).length
		const photoCount = optimizedPhotos ? Object.keys(optimizedPhotos).length : 0
		console.log(`Prompt optimization: ${originalPromptSize} → ${optimizedPromptSize} chars (${Math.round((1 - optimizedPromptSize/originalPromptSize) * 100)}% reduction)`)
		console.log(`Full prompt size: ${basePrompt.length} characters`)
		console.log(`Photos to analyze: ${photoCount} images`)

		// Helper to call Gemini once with the given prompt and optional images
		async function callGemini(promptText: string, photoUrls?: any) {
			const parts: any[] = [{ text: promptText }]
			
			// Helper: basic MIME type detection from URL/path (best-effort)
			function guessMimeType(u: string): string {
				try {
					const lower = (u || '').toLowerCase()
					if (lower.endsWith('.png')) return 'image/png'
					if (lower.endsWith('.webp')) return 'image/webp'
					if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic'
					if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.includes('=media&token=')) return 'image/jpeg'
				} catch {}
				return 'image/jpeg'
			}

			// Helper: download image from Firebase Storage URL and return buffer
			async function downloadImageBuffer(url: string): Promise<Buffer> {
				try {
					// Try to parse as Firebase Storage URL
					const response = await axios.get(url, {
						responseType: 'arraybuffer',
						timeout: 10000
					})
					return Buffer.from(response.data)
				} catch (err) {
					console.error('Failed to download image:', err)
					throw new Error(`Failed to download image from ${url}`)
				}
			}

			// Try to add images, but continue without them if they cause issues
			let imageCount = 0
			const MAX_IMAGES = 3
			if (photoUrls && typeof photoUrls === 'object') {
				for (const [, url] of Object.entries(photoUrls)) {
					if (typeof url === 'string' && url.trim()) {
						try {
							// Download image from storage and encode as base64
							console.log('Downloading image for Gemini Vision API...')
							
							const buffer = await downloadImageBuffer(url)
							const base64 = buffer.toString('base64')
							const mime = guessMimeType(url)
							
							console.log(`Image downloaded: ${mime}, ${buffer.length} bytes`)
							
							// Use inline_data for base64-encoded images (Gemini Vision API supports this)
							parts.push({
								inline_data: {
									mime_type: mime,
									data: base64
								}
							})
							imageCount++
							if (imageCount >= MAX_IMAGES) {
								console.log(`Image cap reached: processed ${imageCount} images (max ${MAX_IMAGES})`)
								break
							}
						} catch (error) {
							console.warn('Failed to process image URL:', url, error)
							// Continue without this image
						}
					}
				}
			}
			
			console.log(`Sending request to Gemini with ${parts.length - 1} images (${imageCount} processed successfully)`)
			
			const contents = [{ parts }]
			
			const resp = await axios.post(
				'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
				{ contents },
				{ headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: 90000 }
			)
			return resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text
		}

		// Try primary call then one retry with an explicit 'Return JSON only' reminder
		let generated: any = null
		let parsed: any = null

		// Helper: sanitize Gemini text output and parse JSON safely
		function sanitizeGeminiText(text: string): string {
			if (typeof text !== 'string') return ''
			let t = text.trim()
			// Prefer fenced block content if present
			const fenced = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
			if (fenced && typeof fenced[1] === 'string') {
				return fenced[1].trim()
			}
			// Strip simple leading/trailing fences if they exist
			if (t.startsWith('```')) {
				t = t.replace(/^```(?:json)?/i, '').trim()
			}
			if (t.endsWith('```')) {
				t = t.slice(0, -3).trim()
			}
			// Extract from first { to last } to avoid any prefix/suffix text
			const start = t.indexOf('{')
			const end = t.lastIndexOf('}')
			if (start !== -1 && end !== -1 && end > start) {
				return t.slice(start, end + 1)
			}
			return t
		}

		function tryParseGeminiJSON(raw: any): any {
			if (raw && typeof raw === 'object') return raw
			if (typeof raw !== 'string') return null
			const cleaned = sanitizeGeminiText(raw)
			try {
				return JSON.parse(cleaned)
			} catch (e) {
				console.error('Failed to parse cleaned Gemini text as JSON:', e, '\
Cleaned text:\n', cleaned)
				return null
			}
		}

		// Use retryWithBackoff for Gemini API calls with exponential backoff
		updateHeartbeat('analyzing', 35, 'Analyzing with AI...')
		try {
			console.log('Attempting Gemini call with retry mechanism...')
			
			generated = await retryWithBackoff(
				async () => {
					const result = await callGemini(basePrompt, optimizedPhotos)
					return result
				},
				{
					maxRetries: 4,
					initialDelayMs: 500,
					maxDelayMs: 8000,
					backoffMultiplier: 2,
				},
				{ userId, sessionId }
			)
			
			console.log('Gemini raw response:', generated)
			
			if (typeof generated === 'string' || (generated && typeof generated === 'object')) {
				parsed = tryParseGeminiJSON(generated)
				if (parsed) {
					console.log('Parsed JSON successfully')
					recordRequest(true)
				}
			}

			if (!parsed) {
				console.log('First attempt failed, retrying with explicit JSON instruction...')
				// Retry with an explicit instruction to return JSON only and a short schema example
				const retryPrompt = basePrompt + ' ONLY return the JSON object. Example format: {"skinCondition":{"score":7,"explanation":"...","recommendations":["cleanse-hydrate"]},"hairCondition":{"score":6,"explanation":"...","recommendations":["wash-care"]},"physicalCondition":{"score":8,"explanation":"...","recommendations":["morning-stretch"]},"mentalCondition":{"score":7,"explanation":"...","recommendations":["mindful-meditation"]}}'
				
				const retryResp = await retryWithBackoff(
					async () => {
						const result = await callGemini(retryPrompt, optimizedPhotos)
						return result
					},
					{
						maxRetries: 3,
						initialDelayMs: 1000,
						maxDelayMs: 6000,
						backoffMultiplier: 2,
					},
					{ userId, sessionId }
				)
				
				console.log('Retry response:', retryResp)
				
				if (typeof retryResp === 'string' || (retryResp && typeof retryResp === 'object')) {
					parsed = tryParseGeminiJSON(retryResp)
					if (parsed) {
						console.log('Retry parsed successfully')
						recordRequest(true)
					}
				}
			}
		} catch (e: any) {
			console.error('Gemini request failed after all retries:', e)
			recordRequest(false) // Record failure for circuit breaker
			
			// Log the detailed error response from Gemini API
			if (e?.response?.data) {
				console.error('Gemini API error response:', JSON.stringify(e.response.data, null, 2))
				
				// If the error is about unsupported file URI, try without images (no retries for this)
				if (e.response.data?.error?.message?.includes('Unsupported file uri')) {
					console.log('File URI error detected, attempting text-only analysis...')
					try {
						const textOnlyPrompt = basePrompt + ' Note: Analysis based on text data only (no images provided).'
						generated = await callGemini(textOnlyPrompt, null)
						console.log('Text-only Gemini response:', generated)
						// Extra safety: show sanitized JSON for debugging
						if (typeof generated === 'string') {
							const sanitized = sanitizeGeminiText(generated)
							console.log('Sanitized text-only JSON candidate:', sanitized.slice(0, 500))
						}
						
						if (typeof generated === 'string' || (generated && typeof generated === 'object')) {
							parsed = tryParseGeminiJSON(generated)
							if (parsed) {
								console.log('Text-only parsed successfully')
								recordRequest(true)
							}
						}
					} catch (textOnlyError) {
						console.error('Text-only request also failed:', textOnlyError)
						recordRequest(false)
						parsed = null
					}
				}
			}
			
			if (!parsed) {
				parsed = null
			}
		}

		// Enhanced validation with detailed logging
		const isValidResponse = validateGeminiResponse(parsed)
		console.log('Validation result:', isValidResponse, 'for response:', parsed)

		// If the parsed object is invalid, do NOT use a fallback by default so users are not misled.
		// The frontend will handle the error gracefully and allow retry or support contact.
		// Can be overridden by setting GEMINI_ALLOW_FALLBACK=true (not recommended for production).
		const allowFallback = (process.env.GEMINI_ALLOW_FALLBACK || 'false').toLowerCase() === 'true'
		console.log('Allow fallback:', allowFallback)
		
		if (!parsed || !isValidResponse) {
			console.error('Gemini returned invalid or unparsable response', { generated, parsed, isValidResponse })
			recordRequest(false)
			
			// Try Claude API fallback if enabled
			if (isClaudeFallbackEnabled()) {
				console.log('[Fallback] Attempting Claude API fallback...')
				updateHeartbeat('analyzing', 50, 'Using alternative AI model...')
				
				try {
					const claudeResult = await callClaudeAnalysis(
						optimizedAnswers,
						basePrompt
					)
					
					if (claudeResult) {
						console.log('[Fallback] Claude analysis successful')
						recordRequest(true)
						const completeAnalysis = buildCompleteAnalysis(claudeResult, answers)
						
						// Save with fallback flag
						const docRef = db.collection('users').doc(userId).collection('analysis').doc()
						await docRef.set({ 
							createdAt: admin.firestore.FieldValue.serverTimestamp(), 
							model: completeAnalysis,
							usedClaudeFallback: true
						})
						
						// Save to cache if key available
						if (cacheKey && completeAnalysis) {
							await saveCacheAnalysis(cacheKey, completeAnalysis).catch(err => {
								console.warn('[Cache] Failed to save Claude fallback to cache:', err)
							})
						}
						
						updateHeartbeat('finalizing', 95, 'Finalizing results...')
						stopHeartbeat()
						sendResponse(res, 200, { analysis: completeAnalysis, usedFallback: true }, responseSent)
						return
					}
				} catch (claudeError) {
					console.error('[Fallback] Claude API also failed:', claudeError)
				}
			}
			
			// Claude didn't work either or not enabled, return error
			if (!allowFallback) {
				// Return an error to the client so the UI can surface it—no silent fallback.
				stopHeartbeat()
				sendErrorResponse(res, 502, 'Our analysis service encountered a temporary issue. Please retry in a moment.', responseSent)
				return
			}
			
			// If explicitly enabled, create fallback Gemini response (ONLY for testing, not production)
			const fallbackGeminiResponse = {
				skinCondition: { score: 6, explanation: 'Analysis in progress. Your results will be ready shortly.', recommendations: ['cleanse-hydrate','deep-hydration'] },
				hairCondition: { score: 6, explanation: 'Analysis in progress. Your results will be ready shortly.', recommendations: ['wash-care','deep-nourishment'] },
				physicalCondition: { score: 6, explanation: 'Analysis in progress. Your results will be ready shortly.', recommendations: ['morning-stretch','cardio-boost'] },
				mentalCondition: { score: 6, explanation: 'Analysis in progress. Your results will be ready shortly.', recommendations: ['mindful-meditation','breathing-exercises'] }
			}
			
			console.log('Using fallback response due to Gemini validation failure (TESTING MODE)')
			
			// Build complete analysis with fallback data
			const fallback = buildCompleteAnalysis(fallbackGeminiResponse, answers)
			const ref = await db.collection('users').doc(userId).collection('analysis').doc()
			await ref.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: fallback, raw: generated || null })
			
			console.log('Fallback analysis created:', fallback)
			stopHeartbeat()
			sendResponse(res, 200, { analysis: fallback }, responseSent)
			return
		}

		// Valid parsed response from Gemini — build complete analysis and persist
		console.log('Building complete analysis from valid Gemini response')
		const completeAnalysis = buildCompleteAnalysis(parsed, answers)
		console.log('Complete analysis built:', {
			bmi: completeAnalysis.bmi,
			bmiCategory: completeAnalysis.bmiCategory,
			bmsScore: completeAnalysis.bmsScore,
			bmsCategory: completeAnalysis.bmsCategory
		})
		
		const docRef = db.collection('users').doc(userId).collection('analysis').doc()
		await docRef.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: completeAnalysis })

		// Save analysis to cache for future similar queries
		if (cacheKey && completeAnalysis) {
			await saveCacheAnalysis(cacheKey, completeAnalysis).catch(err => {
				console.warn('[Cache] Failed to save analysis to cache:', err)
				// Non-critical, don't fail the request
			})
		}

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
				const updates: Record<string, any> = { endTime: now }
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
				if (!data.utm && (meta as any).utm) (updates as any).utm = (meta as any).utm
				if (!data.referrer && (meta as any).referrer) (updates as any).referrer = (meta as any).referrer
				if (!data.pageUrl && (meta as any).pageUrl) (updates as any).pageUrl = (meta as any).pageUrl
				await sessionDocRef.update(updates)
			}
		}

		updateHeartbeat('finalizing', 95, 'Finalizing results...')
		stopHeartbeat()
		sendResponse(res, 200, { analysis: completeAnalysis }, responseSent)
		return
	} catch (e: any) {
		console.error('analyzeUserData error', e)
		stopHeartbeat()
		sendErrorResponse(res, 500, e?.message || 'internal', responseSent)
		return
	}
})

// Face++ live upload endpoint: accepts multipart/form-data with images in any format/size,
// normalizes them to JPEG and calls Face++ using image_base64 to avoid public URLs.
export const skinAnalysisUpload = onRequest({
	maxInstances: 10,
	timeoutSeconds: 90,
	cors: true,
	secrets: [FACEPLUS_API_KEY, FACEPLUS_API_SECRET],
}, async (req, res) => {
	addSecurityHeaders(res)
	if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
	try {
		// Rate limit
		const xff = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xff?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rlKey = `skinAnalysisUpload_${clientIp}`
		const allowed = await checkRateLimit(rlKey, 6, 60000)
		if (!allowed) { res.status(429).json({ error: 'Too many requests. Please try again later.' }); return }
		await incrementRateLimit(rlKey, 60000)

		const apiKey = process.env.FACEPLUS_API_KEY || process.env.FACEPP_API_KEY
		const apiSecret = process.env.FACEPLUS_API_SECRET || process.env.FACEPP_API_SECRET
		if (!apiKey || !apiSecret) { res.status(500).json({ error: 'Face++ credentials not configured' }); return }

		// Parse multipart form
		const bb = new Busboy({ headers: req.headers, limits: { fileSize: 15 * 1024 * 1024, files: 3, fields: 10 } })
		const files: Record<string, { buffer: Buffer; filename?: string; mime?: string }> = {}
		const fields: Record<string, string> = {}

		await new Promise<void>((resolve, reject) => {
			bb.on('file', (name: string, file: NodeJS.ReadableStream, info: any) => {
				const chunks: Buffer[] = []
				const { filename, mimeType } = info || {}
				file.on('data', (d: Buffer) => { chunks.push(d) })
				file.on('limit', () => reject(new Error('File too large')))
				file.on('end', () => {
					files[name] = { buffer: Buffer.concat(chunks), filename, mime: mimeType }
				})
			})
			bb.on('field', (name: string, val: string) => { fields[name] = val })
			bb.on('error', reject)
			bb.on('finish', resolve)
			req.pipe(bb)
		})

		const main = files['file'] || files['image'] || null
		const left = files['leftSideFile'] || null
		const right = files['rightSideFile'] || null
		const return_maps = fields['return_maps']
		const return_marks = fields['return_marks']

		if (!main) { res.status(400).json({ error: 'Missing file (expected field name "file")' }); return }

		async function normalizeToJpegBase64(input: Buffer): Promise<string> {
			// Lazy-load sharp to avoid heavy native module initialization during deploy-time analysis
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const sharp: any = require('sharp')
			try {
				const out = await sharp(input, { failOnError: false })
					.rotate()
					.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
					.jpeg({ quality: 85, mozjpeg: true })
					.toBuffer()
				return out.toString('base64')
			} catch (e) {
				// Fallback: try minimal decode to PNG then to JPEG
				try {
					const png = await sharp(input, { failOnError: false }).rotate().png().toBuffer()
					const jpg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer()
					return jpg.toString('base64')
				} catch {
					// Last resort: return original (may fail at Face++)
					return input.toString('base64')
				}
			}
		}

		const main64 = await normalizeToJpegBase64(main.buffer)
		const left64 = left ? await normalizeToJpegBase64(left.buffer) : null
		const right64 = right ? await normalizeToJpegBase64(right.buffer) : null

		const fd = new FormData()
		fd.append('api_key', apiKey)
		fd.append('api_secret', apiSecret)
		fd.append('image_base64', main64)
		if (left64) fd.append('left_side_image_base64', left64)
		if (right64) fd.append('right_side_image_base64', right64)
		if (return_maps) fd.append('return_maps', return_maps)
		if (return_marks) fd.append('return_marks', return_marks)

		const url = 'https://api-cn.faceplusplus.com/facepp/v1/skinanalyze_pro'
		const resp = await axios.post(url, fd, { headers: fd.getHeaders(), timeout: 90000 })
		const data = resp?.data || {}

		const normalized = {
			faceRect: data?.face_rect || data?.face_rectangle || null,
			scoreInfo: data?.score_info || null,
			result: data?.result || null,
			maps: {
				red_area: data?.red_area || null,
				brown_area: data?.brown_area || null,
			},
			marks: {
				acne: data?.acne_mark || null,
				melanin: data?.melanin_mark || null,
				wrinkle: data?.wrinkle_mark || null,
				dark_circle_outline: data?.dark_circle_outline || null,
			},
			timeUsed: data?.time_used || null,
		}

		res.status(200).json({ ok: true, normalized, raw: data })
	} catch (e: any) {
		console.error('skinAnalysisUpload error', e?.response?.data || e?.message || e)
		const status = e?.response?.status || 500
		const details = e?.response?.data || { error: e?.message }
		res.status(status).json({ ok: false, error: 'Face++ upload request failed', details })
	}
})

export const saveOnboardingSession = onRequest(async (req, res) => {
	// Real-time onboarding session event logging - v2
	// Add security headers
	addSecurityHeaders(res)
	// CORS handling: allow browser clients to POST from different origins.
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.set('Access-Control-Allow-Headers', 'Content-Type')
	if (req.method === 'OPTIONS') { res.status(204).send(''); return }
	if (req.method !== 'POST') { res.status(405).send({ error: 'Method not allowed' }); return }
	try {
		// Rate limiting: 30 requests per minute per IP
		const xffHeader2 = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xffHeader2?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rateLimitKey = `saveSession_${clientIp}`
		const isAllowed = await checkRateLimit(rateLimitKey, 30, 60000)
		if (!isAllowed) {
			res.status(429).json({ error: 'Too many requests. Please try again later.' })
			return
		}
		await incrementRateLimit(rateLimitKey, 60000)

		const body = req.body
		const { sessionId, events, userId } = body || {}
		if (!sessionId) { res.status(400).send({ error: 'sessionId required' }); return }

		// Extract traffic meta once per incoming event batch
		const meta = extractTrafficMetaSync(req)

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
			const base: any = {
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
				formFactor: meta.formFactor,
				utm: meta.utm || null,
				referrer: meta.referrer || null,
				pageUrl: meta.pageUrl || null,
			}
			try {
				if (!base.country && base.ip) {
					const geo = await geoLookup(base.ip)
					if (geo) base.country = geo
				}
			} catch {}
			await docRef.set(base)
		} else {
			// Update existing
			const updates: Record<string, any> = { endTime: now }
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
			if (!data.utm && meta.utm) updates.utm = meta.utm
			if (!data.referrer && meta.referrer) updates.referrer = meta.referrer
			if (!data.pageUrl && meta.pageUrl) updates.pageUrl = meta.pageUrl

			// Geo lookup fallback for country
			try {
				const ip = (data.ip as string) || meta.ip || null
				if (!('country' in data) && !updates.country && ip) {
					const geo = await geoLookup(ip)
					if (geo) updates.country = geo
				}
			} catch {}

			// Compute quiz progress metrics
			try {
				const currentEvents: any[] = Array.isArray(data.events) ? data.events : []
				const incoming: any[] = Array.isArray(sanitizedEvents) ? sanitizedEvents : []
				const all = [...currentEvents, ...incoming]
				const answered = all.filter(e => e && e.eventName === 'answerChanged').length
				const stepsCompleted = all.filter(e => e && e.eventName === 'stepCompleted').length
				const lastStep = all.reduce((max, e) => typeof e?.step === 'number' ? Math.max(max, e.step) : max, -1)
				updates.progress = {
					answered,
					stepsCompleted,
					lastStep,
					updatedAt: now,
				}
			} catch {}
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
export const processPayment = onRequest({ secrets: [STRIPE_SECRET_KEY] }, async (req, res) => {
	// Add security headers
	addSecurityHeaders(res)
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.set('Access-Control-Allow-Headers', 'Content-Type')
	if (req.method === 'OPTIONS') { res.status(204).send(''); return }
	if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

	try {
		// Rate limiting: 5 requests per minute per IP
		const xffHeader3 = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xffHeader3?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rateLimitKey = `payment_${clientIp}`
		const isAllowed = await checkRateLimit(rateLimitKey, 5, 60000)
		if (!isAllowed) {
			res.status(429).json({ error: 'Too many requests. Please try again later.' })
			return
		}
		await incrementRateLimit(rateLimitKey, 60000)

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
				// Fire CAPI AddPaymentInfo server-side for PRB path
				await sendMetaCapiEvent({
					eventName: 'AddPaymentInfo',
					value: amount / 100,
					currency,
					email: undefined,
					clientIp: clientIp,
					userAgent: (req.headers['user-agent'] as string) || null,
					eventSourceUrl: req.headers.referer as string || null,
					eventId: intent.id,
				})
			res.status(200).json({ id: intent.id, clientSecret: intent.client_secret, status: intent.status, nextAction: intent.next_action || null }); return
		}

		// Create only; client confirms with Elements/card fields if desired (not implemented here)
			const intent = await stripe.paymentIntents.create(params)
			// Fire CAPI AddPaymentInfo for card fallback when intent created (user proceeded to payment form)
			await sendMetaCapiEvent({
				eventName: 'AddPaymentInfo',
				value: amount / 100,
				currency,
				email: undefined,
				clientIp: clientIp,
				userAgent: (req.headers['user-agent'] as string) || null,
				eventSourceUrl: req.headers.referer as string || null,
				eventId: intent.id,
			})
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
export const stripeWebhook = onRequest({ secrets: [STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY] }, async (req, res) => {
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
							if (event.type === 'payment_intent.succeeded') {
								// Try to capture email and send Purchase via CAPI
								const receiptEmail = (intent.receipt_email || (intent as any).charges?.data?.[0]?.billing_details?.email || null) as string | null
								await sendMetaCapiEvent({
									eventName: 'Purchase',
									value: amount ? amount / 100 : undefined,
									currency: (currency as string) || undefined,
									email: receiptEmail,
									clientIp: null,
									userAgent: null,
									eventSourceUrl: null,
									eventId: pid,
								})
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
	// Add security headers
	addSecurityHeaders(res)
	try {
		if (req.method !== 'POST') {
			res.status(405).send('Method Not Allowed')
			return
		}

		// Rate limiting: 20 requests per minute per IP
		const xffHeader4 = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xffHeader4?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rateLimitKey = `uploadPhoto_${clientIp}`
		const isAllowed = await checkRateLimit(rateLimitKey, 20, 60000)
		if (!isAllowed) {
			res.status(429).json({ error: 'Too many requests. Please try again later.' })
			return
		}
		await incrementRateLimit(rateLimitKey, 60000)

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

		// Generate a signed URL that provides temporary access to the file
		// This works with the new Service Account Token Creator permissions
		const [signedUrl] = await file.getSignedUrl({
			action: 'read',
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
		})

		res.status(200).json({
			success: true,
			url: signedUrl,
			path: storagePath,
		})
	} catch (e: any) {
		console.error('uploadPhoto error', e)
		res.status(500).json({ error: 'Upload failed', details: e.message })
	}
})

/**
 * Periodic health check for Gemini API reliability
 * Call this via Cloud Scheduler every 10 minutes
 * Example: curl -X POST https://us-central1-beauty-planner-26cc0.cloudfunctions.net/healthCheck
 */
export const healthCheck = onRequest(async (req, res) => {
	addSecurityHeaders(res)
	
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' })
		return
	}

	try {
		console.log('[HealthCheck] Starting periodic health check...')
		
		// Run comprehensive health check
		await periodicHealthCheck()
		
		// Get current metrics
		const metrics = await getAPIHealthMetrics()
		
		console.log('[HealthCheck] Health check completed successfully')
		res.status(200).json({
			status: 'ok',
			message: 'Health check completed',
			metrics,
			timestamp: new Date().toISOString(),
		})
	} catch (error: any) {
		console.error('[HealthCheck] Health check failed:', error)
		res.status(500).json({
			status: 'error',
			message: 'Health check failed',
			error: error?.message,
		})
	}
})

/**
 * Get current API health metrics (monitoring endpoint)
 * Returns real-time API health statistics
 */
export const getHealthMetrics = onRequest(async (req, res) => {
	addSecurityHeaders(res)
	
	// Require authentication in production
	const authToken = req.headers.authorization?.replace('Bearer ', '')
	if (!authToken && process.env.NODE_ENV === 'production') {
		res.status(401).json({ error: 'Unauthorized' })
		return
	}

	try {
		const metrics = await getAPIHealthMetrics()
		
		if (!metrics) {
			res.status(204).json({ message: 'No metrics available yet' })
			return
		}

		// Calculate health score (0-100)
		let healthScore = metrics.successRate
		
		// Penalize high latency
		if (metrics.averageLatencyMs > 35000) {
			healthScore -= 20
		} else if (metrics.averageLatencyMs > 20000) {
			healthScore -= 10
		}

		// Penalize high fallback usage
		if (metrics.totalRequests > 0) {
			const fallbackRate = (metrics.claudeFallbackUsed / metrics.totalRequests) * 100
			if (fallbackRate > 5) {
				healthScore -= 15
			}
		}

		// Circuit breaker penalty
		if (metrics.circuitBreakerOpen) {
			healthScore -= 50
		}

		const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy'

		res.status(200).json({
			status: healthStatus,
			healthScore: Math.max(0, Math.min(100, healthScore)),
			metrics,
			timestamp: new Date().toISOString(),
		})
	} catch (error: any) {
		console.error('[Metrics] Failed to get metrics:', error)
		res.status(500).json({
			status: 'error',
			message: 'Failed to retrieve metrics',
			error: error?.message,
		})
	}
})

// Face++ skin analysis proxy (server-side) to keep secrets safe and normalize requests
export const skinAnalysis = onRequest({
	maxInstances: 10,
	timeoutSeconds: 60,
	cors: true,
	secrets: [FACEPLUS_API_KEY, FACEPLUS_API_SECRET],
}, async (req, res) => {
	addSecurityHeaders(res)
	try {
		if (req.method !== 'POST') {
			res.status(405).json({ error: 'Method not allowed' })
			return
		}

		// Simple rate limit per IP
		const xff = req.headers['x-forwarded-for'] as string | undefined
		const clientIp = (xff?.split(',')?.[0]?.trim()) || (typeof req.ip === 'string' ? req.ip : undefined) || 'unknown'
		const rlKey = `skinAnalysis_${clientIp}`
		const allowed = await checkRateLimit(rlKey, 8, 60000)
		if (!allowed) { res.status(429).json({ error: 'Too many requests. Please try again later.' }); return }
		await incrementRateLimit(rlKey, 60000)

		const { imageUrl, imageBase64, return_maps, return_marks, leftSideImageUrl, rightSideImageUrl } = req.body || {}
		if (!imageUrl && !imageBase64) {
			res.status(400).json({ error: 'Provide imageUrl or imageBase64' })
			return
		}

		const apiKey = process.env.FACEPLUS_API_KEY || process.env.FACEPP_API_KEY
		const apiSecret = process.env.FACEPLUS_API_SECRET || process.env.FACEPP_API_SECRET
		if (!apiKey || !apiSecret) {
			res.status(500).json({ error: 'Face++ credentials not configured' })
			return
		}

		const fd = new FormData()
		fd.append('api_key', apiKey)
		fd.append('api_secret', apiSecret)
		// Primary input
		if (imageBase64) {
			fd.append('image_base64', imageBase64)
		} else if (imageUrl) {
			fd.append('image_url', imageUrl)
		}
		// Optional side images
		if (leftSideImageUrl) fd.append('left_side_image_url', leftSideImageUrl)
		if (rightSideImageUrl) fd.append('right_side_image_url', rightSideImageUrl)
		// Optional outputs
		if (return_maps) fd.append('return_maps', return_maps)
		if (return_marks) fd.append('return_marks', return_marks)

		// Face++ pro endpoint (CN cluster per doc excerpt); adjust to global if needed
		const url = 'https://api-cn.faceplusplus.com/facepp/v1/skinanalyze_pro'
		const resp = await axios.post(url, fd, { headers: fd.getHeaders(), timeout: 60000 })
		const data = resp?.data || {}

		// Normalize a compact subset commonly needed by UI; still return full under raw
		const normalized = {
			faceRect: data?.face_rect || data?.face_rectangle || null,
			scoreInfo: data?.score_info || null,
			result: data?.result || null,
			maps: {
				red_area: data?.red_area || null,
				brown_area: data?.brown_area || null,
			},
			marks: {
				acne: data?.acne_mark || null,
				melanin: data?.melanin_mark || null,
				wrinkle: data?.wrinkle_mark || null,
				dark_circle_outline: data?.dark_circle_outline || null,
			},
			timeUsed: data?.time_used || null,
		}

		res.status(200).json({ ok: true, normalized, raw: data })
	} catch (e: any) {
		console.error('skinAnalysis error', e?.response?.data || e?.message || e)
		const status = e?.response?.status || 500
		const details = e?.response?.data || { error: e?.message }
		res.status(status).json({ ok: false, error: 'Face++ request failed', details })
	}
})

