/**
 * Claude API fallback for Gemini analysis
 * Used when Gemini fails repeatedly (after all retries exhausted)
 */

import axios from 'axios'

const CLAUDE_API_BASE = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022' // Latest stable model
const CLAUDE_API_TIMEOUT_MS = 45000 // 45 seconds

export interface ClaudeAnalysisRequest {
  userProfile: any
  prompt: string
}

export interface AnalysisResult {
  skinCondition: {
    score: number
    explanation: string
    recommendations: string[]
  }
  hairCondition: {
    score: number
    explanation: string
    recommendations: string[]
  }
  physicalCondition: {
    score: number
    explanation: string
    recommendations: string[]
  }
  mentalCondition: {
    score: number
    explanation: string
    recommendations: string[]
  }
}

/**
 * Call Claude API as fallback when Gemini fails
 * Returns same format as Gemini for seamless integration
 */
export async function callClaudeAnalysis(
  userProfile: any,
  prompt: string,
  apiKey?: string
): Promise<AnalysisResult | null> {
  // Get API key from env if not provided
  const claudeApiKey = apiKey || process.env.CLAUDE_API_KEY

  if (!claudeApiKey) {
    console.warn('[Claude] No API key provided, skipping Claude fallback')
    return null
  }

  try {
    console.log('[Claude] Calling Claude API as fallback...')

    const systemPrompt = `You are an AI assistant that MUST return ONLY valid JSON. NO other text allowed.

CRITICAL RULES:
1. ONLY return a JSON object matching this exact schema
2. For ALL recommendations arrays, use ONLY these exact procedure IDs: 
   ["breathing-exercises", "cardio-boost", "cleanse-hydrate", "cycling", "dance-it-out", 
    "deep-hydration", "deep-nourishment", "evening-stretch", "exfoliate", "face-massage",
    "gratitude-exercises", "heat-protection", "learn-grow", "lip-eye-care", "mindful-meditation",
    "mood-check-in", "morning-stretch", "positive-affirmations", "post-color-care", "posture-fix",
    "scalp-detox", "scalp-massage", "social-media-detox", "spf-protection", "strength-training",
    "stress-relief", "swimming-time", "talk-it-out", "trim-split-ends", "wash-care",
    "yoga-flexibility", "beard-shave-care", "hair-loss-support", "leave-in-care", "night-care-routine"]
3. NEVER create new procedure names or IDs
4. Choose 1-3 procedure IDs per condition that match the user's specific needs
5. If uncertain, prefer common procedures like 'cleanse-hydrate', 'mindful-meditation', 'morning-stretch'

Return this exact JSON schema:
{
  "skinCondition": {"score": 0-10, "explanation": "string", "recommendations": ["procedure-id"]},
  "hairCondition": {"score": 0-10, "explanation": "string", "recommendations": ["procedure-id"]},
  "physicalCondition": {"score": 0-10, "explanation": "string", "recommendations": ["procedure-id"]},
  "mentalCondition": {"score": 0-10, "explanation": "string", "recommendations": ["procedure-id"]}
}`

    const response = await axios.post(
      CLAUDE_API_BASE,
      {
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this user profile and return ONLY the JSON object matching the schema:\n\n${JSON.stringify(userProfile)}\n\n${prompt}`,
          },
        ],
      },
      {
        headers: {
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: CLAUDE_API_TIMEOUT_MS,
      }
    )

    // Extract text from Claude response
    const responseText = response.data?.content?.[0]?.text

    if (!responseText) {
      console.warn('[Claude] No text content in Claude response')
      return null
    }

    console.log('[Claude] Raw Claude response:', responseText)

    // Parse the response
    const parsed = parseClaudeResponse(responseText)

    if (!parsed) {
      console.error('[Claude] Failed to parse Claude response as valid JSON')
      return null
    }

    // Validate the response format
    if (!validateAnalysisFormat(parsed)) {
      console.error('[Claude] Claude response does not match expected format')
      return null
    }

    console.log('[Claude] Successfully parsed Claude analysis')
    return parsed
  } catch (error: any) {
    console.error('[Claude] Claude API call failed:', error.message)

    if (error.response?.data) {
      console.error('[Claude] Error response:', JSON.stringify(error.response.data, null, 2))
    }

    return null
  }
}

/**
 * Parse Claude response and extract JSON
 */
function parseClaudeResponse(text: string): AnalysisResult | null {
  try {
    // Try to extract JSON from text
    const cleaned = extractJSON(text)

    if (!cleaned) {
      return null
    }

    return JSON.parse(cleaned)
  } catch (error) {
    console.error('[Claude] Failed to parse response:', error)
    return null
  }
}

/**
 * Extract JSON from Claude response text
 */
function extractJSON(text: string): string | null {
  try {
    // Remove markdown code fences if present
    let cleaned = text.trim()

    // Check for fenced JSON block
    const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (fencedMatch?.[1]) {
      cleaned = fencedMatch[1].trim()
    }

    // Find first { and last }
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start !== -1 && end !== -1 && end > start) {
      return cleaned.slice(start, end + 1)
    }

    return null
  } catch (error) {
    console.error('[Claude] Failed to extract JSON:', error)
    return null
  }
}

/**
 * Validate that response matches expected analysis format
 */
function validateAnalysisFormat(obj: any): boolean {
  const conditions = ['skinCondition', 'hairCondition', 'physicalCondition', 'mentalCondition']

  for (const condition of conditions) {
    if (!obj[condition]) {
      console.warn(`[Claude] Missing ${condition}`)
      return false
    }

    const cond = obj[condition]

    // Check score
    if (typeof cond.score !== 'number' || cond.score < 0 || cond.score > 10) {
      console.warn(`[Claude] Invalid score for ${condition}: ${cond.score}`)
      return false
    }

    // Check explanation
    if (typeof cond.explanation !== 'string' || cond.explanation.length === 0) {
      console.warn(`[Claude] Invalid explanation for ${condition}`)
      return false
    }

    // Check recommendations
    if (!Array.isArray(cond.recommendations) || cond.recommendations.length === 0) {
      console.warn(`[Claude] Invalid recommendations for ${condition}`)
      return false
    }

    // Validate recommendation IDs
    const validIds = new Set([
      'breathing-exercises', 'cardio-boost', 'cleanse-hydrate', 'cycling', 'dance-it-out',
      'deep-hydration', 'deep-nourishment', 'evening-stretch', 'exfoliate', 'face-massage',
      'gratitude-exercises', 'heat-protection', 'learn-grow', 'lip-eye-care', 'mindful-meditation',
      'mood-check-in', 'morning-stretch', 'positive-affirmations', 'post-color-care', 'posture-fix',
      'scalp-detox', 'scalp-massage', 'social-media-detox', 'spf-protection', 'strength-training',
      'stress-relief', 'swimming-time', 'talk-it-out', 'trim-split-ends', 'wash-care',
      'yoga-flexibility', 'beard-shave-care', 'hair-loss-support', 'leave-in-care', 'night-care-routine'
    ])

    for (const rec of cond.recommendations) {
      if (!validIds.has(rec)) {
        console.warn(`[Claude] Invalid recommendation ID: ${rec}`)
        return false
      }
    }
  }

  return true
}

/**
 * Check if Claude fallback is enabled
 */
export function isClaudeFallbackEnabled(): boolean {
  return (process.env.FALLBACK_TO_CLAUDE || 'false').toLowerCase() === 'true' &&
         !!process.env.CLAUDE_API_KEY
}
