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

// Convert BMI to 0-10 scale for BMS calculation
function bmiToScore(bmi: number | null): number {
	if (bmi === null) return 5 // Default middle score
	
	if (bmi < 16) return 2
	if (bmi < 18.5) return 4
	if (bmi >= 18.5 && bmi < 25) return 9 // Healthy range gets high score
	if (bmi >= 25 && bmi < 30) return 6
	if (bmi >= 30 && bmi < 35) return 4
	return 2 // BMI >= 35
}

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
	
	// Calculate BMS as average of 4 Gemini scores + BMI score
	const geminiScores = [
		geminiResponse.skinCondition?.score || 5,
		geminiResponse.hairCondition?.score || 5,
		geminiResponse.physicalCondition?.score || 5,
		geminiResponse.mentalCondition?.score || 5
	]
	const bmiScore = bmiToScore(calculatedBMI)
	const bmsScore = Math.round(([...geminiScores, bmiScore].reduce((a, b) => a + b, 0) / 5) * 10) / 10
	
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
		bmsDescription: bmsInfo.description
	}
}

// Forced deployment on Oct 10, 2025
export const analyzeUserData = onRequest({
	maxInstances: 10,
	timeoutSeconds: 120, // Increased to 120 seconds to handle Gemini API delays
	cors: true,
}, async (req, res) => {
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
			
			// Sleep - descriptive times
			if (answers.SleepTime) optimized.sleep_time = extractText(answers.SleepTime)
			if (answers.WakeUpTime) optimized.wake_up_time = extractText(answers.WakeUpTime)
			
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

Required JSON schema: ${JSON.stringify({
			skinCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
			hairCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
			physicalCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] },
			mentalCondition: { score: 'number 0-10', explanation: 'string', recommendations: ['exact-procedure-ids-only'] }
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
			
			// Helper: normalize any Firebase Storage URL to a valid gs://bucket/path form
			function normalizeToGsUri(input: string): string {
				try {
					// Determine canonical default bucket
					const firebaseConfig = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : null
					const projectId = (firebaseConfig && firebaseConfig.projectId) || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'beauty-planner-26cc0'
					let defaultBucket = (admin.app().options as any)?.storageBucket || admin.storage().bucket().name || `${projectId}.appspot.com`
					// Canonicalize default bucket to appspot.com domain
					defaultBucket = defaultBucket.replace(/\.firebasestorage\.app$/i, '.appspot.com')
					let bucket = defaultBucket
					let path = ''
					let u = (input || '').trim()
					if (!u) return ''
					// Strip querystring early
					if (u.includes('?')) u = u.split('?')[0]

					if (u.startsWith('gs://')) {
						const rest = u.slice(5)
						const slash = rest.indexOf('/')
						if (slash === -1) {
							// Only bucket provided
							bucket = rest
							path = ''
						} else {
							const host = rest.slice(0, slash)
							path = rest.slice(slash + 1)
							// If host looks like a web domain (e.g., *.firebasestorage.app), discard and use default bucket
							if (/\.firebasestorage\.(?:app|googleapis\.com)$/i.test(host) || /\.storage\.googleapis\.com$/i.test(host)) {
								bucket = defaultBucket
							} else {
								bucket = host
							}
						}
					} else if (u.startsWith('http://') || u.startsWith('https://')) {
						// Handle common Firebase Storage URL formats
						// 1) https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>
						let m = u.match(/\/v0\/b\/([^/]+)\/o\/([^?]+)$/)
						if (!m) {
							// 2) https://storage.googleapis.com/download/storage/v1/b/<bucket>/o/<encodedPath>
							m = u.match(/download\/storage\/v1\/b\/([^/]+)\/o\/([^?]+)$/)
						}
						if (m) {
							bucket = m[1]
							path = decodeURIComponent(m[2])
						} else {
							// 3) https://storage.googleapis.com/<bucket>/<path>
							let m2 = u.match(/^https?:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/)
							if (m2) {
								bucket = m2[1]
								path = m2[2]
							} else {
								// 4) https://<bucket>.storage.googleapis.com/<path>
								let m3 = u.match(/^https?:\/\/([^/]+)\.storage\.googleapis\.com\/(.+)$/)
								if (m3) {
									bucket = m3[1]
									path = m3[2]
								} else {
									// 5) https://<project>.firebasestorage.app/<path> (not a gs-valid host) -> use default bucket
									const uObj = new URL(u)
									path = uObj.pathname.replace(/^\/+/, '')
									bucket = defaultBucket
								}
							}
						}
					} else {
						// Treat as storage path
						bucket = defaultBucket
						path = u.replace(/^\/+/, '')
					}

					// Canonicalize bucket to appspot.com
					bucket = bucket.replace(/\.firebasestorage\.app$/i, '.appspot.com')
					// Final tidy
					path = path.replace(/^\/+/, '')
					let gs = `gs://${bucket}/${path}`
					// Safety net: if anything above missed a firebasestorage.app host, force-rewrite here
					gs = gs.replace(/^gs:\/\/([^/]+)\.firebasestorage\.app\//i, 'gs://$1.appspot.com/')
					return gs
				} catch (err) {
					// Fallback – return as-is
					return input
				}
			}

			// Try to add images, but continue without them if they cause issues
			let imageCount = 0
			if (photoUrls && typeof photoUrls === 'object') {
				for (const [, url] of Object.entries(photoUrls)) {
					if (typeof url === 'string' && url.trim()) {
						try {
							// Normalize various Firebase Storage URL formats to a correct gs:// URI
							const gsUri = normalizeToGsUri(url)
							console.log('Using cleaned image URI:', gsUri)
							
							parts.push({
								file_data: {
									mime_type: 'image/jpeg',
									file_uri: gsUri
								}
							})
							imageCount++
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
			if (fenced) {
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
		try {
			console.log('Attempting Gemini call with images...')
			generated = await callGemini(basePrompt, optimizedPhotos)
			console.log('Gemini raw response:', generated)
			
			if (typeof generated === 'string' || (generated && typeof generated === 'object')) {
				parsed = tryParseGeminiJSON(generated)
				if (parsed) console.log('Parsed JSON successfully')
			}

			if (!parsed) {
				console.log('First attempt failed, retrying with explicit JSON instruction...')
				// Retry with an explicit instruction to return JSON only and a short schema example
				const retryPrompt = basePrompt + ' ONLY return the JSON object. Example format: {"skinCondition":{"score":7,"explanation":"...","recommendations":["cleanse-hydrate"]},"hairCondition":{"score":6,"explanation":"...","recommendations":["wash-care"]},"physicalCondition":{"score":8,"explanation":"...","recommendations":["morning-stretch"]},"mentalCondition":{"score":7,"explanation":"...","recommendations":["mindful-meditation"]}}'
				const retryResp = await callGemini(retryPrompt, optimizedPhotos)
				console.log('Retry response:', retryResp)
				
				if (typeof retryResp === 'string' || (retryResp && typeof retryResp === 'object')) {
					parsed = tryParseGeminiJSON(retryResp)
					if (parsed) console.log('Retry parsed successfully')
				}
			}
		} catch (e: any) {
			console.error('Gemini request failed with images:', e)
			
			// Log the detailed error response from Gemini API
			if (e?.response?.data) {
				console.error('Gemini API error response:', JSON.stringify(e.response.data, null, 2))
				
				// If the error is about unsupported file URI, try without images
				if (e.response.data?.error?.message?.includes('Unsupported file uri')) {
					console.log('File URI error detected, retrying without images...')
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
								if (parsed) console.log('Text-only parsed successfully')
							}
						} catch (textOnlyError) {
						console.error('Text-only request also failed:', textOnlyError)
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

		// If the parsed object is invalid, use a safe fallback by default so UX does not stall.
		// Can be disabled by setting GEMINI_ALLOW_FALLBACK=false.
		const allowFallback = (process.env.GEMINI_ALLOW_FALLBACK || 'true').toLowerCase() === 'true'
		console.log('Allow fallback:', allowFallback)
		
		if (!parsed || !isValidResponse) {
			console.error('Gemini returned invalid or unparsable response', { generated, parsed, isValidResponse })
			if (!allowFallback) {
				// Return an error to the client so the UI can surface it—no silent fallback.
				res.status(502).json({ error: 'Invalid response from Gemini. Please retry.' }); return
			}
			
			// Create fallback Gemini response
			const fallbackGeminiResponse = {
				skinCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['cleanse-hydrate','deep-hydration'] },
				hairCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['wash-care','deep-nourishment'] },
				physicalCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['morning-stretch','cardio-boost'] },
				mentalCondition: { score: 6, explanation: 'Insufficient data - default analysis.', recommendations: ['mindful-meditation','breathing-exercises'] }
			}
			
			console.log('Using fallback response due to Gemini validation failure')
			
			// Build complete analysis with fallback data
			const fallback = buildCompleteAnalysis(fallbackGeminiResponse, answers)
			const ref = await db.collection('users').doc(userId).collection('analysis').doc()
			await ref.set({ createdAt: admin.firestore.FieldValue.serverTimestamp(), model: fallback, raw: generated || null })
			
			console.log('Fallback analysis created:', fallback)
			res.status(200).json({ analysis: fallback }); return
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

		res.status(200).json({ analysis: completeAnalysis }); return
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

