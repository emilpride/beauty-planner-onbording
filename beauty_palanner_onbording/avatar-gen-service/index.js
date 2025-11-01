// Minimal Cloud Run-ready avatar generation proxy
// - Accepts base64 selfie + prompt
// - Calls Google Generative Language API (Gemini 2.5 Flash) to produce a base64 image
// - Returns { imageBase64 } on success

import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as Sentry from '@sentry/node'
import { z } from 'zod'

const PORT = process.env.PORT || 8080
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GENERATIVE_LANGUAGE_API_KEY
const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 })
}

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(cors())
if (SENTRY_DSN) app.use(Sentry.Handlers.requestHandler())

const ReqSchema = z.object({
  imageBase64: z.string().min(100),
  prompt: z.string().min(1).max(4000),
  style: z.string().optional(),
  imageMimeType: z.string().default('image/jpeg').optional()
})

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }))

app.post('/generate', async (req, res) => {
  const start = Date.now()
  try {
    // Allow API key via header Authorization: Bearer <key> to mirror existing callers
    const headerAuth = (req.headers['authorization'] || '').toString().trim()
    if (headerAuth.toLowerCase().startsWith('bearer ')) {
      GEMINI_API_KEY = headerAuth.slice(7).trim() || GEMINI_API_KEY
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
    }
    const parsed = ReqSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    }
    const { imageBase64, prompt, style, imageMimeType } = parsed.data

    // Build a strict instruction for Gemini to respond with base64 PNG only
    const systemInstruction = [
      'You are an image-to-image stylization model. Transform the provided selfie into a single-frame, Pixar-style 3D avatar portrait.',
      'Keep likeness (facial structure, hair), keep roughly same pose and framing (head + shoulders), and use a clean neutral background.',
      'Output a single image as a base64-encoded PNG string ONLY. Do not include markdown, code fences, JSON, or any text besides the pure base64.',
      style ? `Apply style: ${style}` : '',
    ].filter(Boolean).join('\n')

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction + '\nUser prompt: ' + prompt },
            { inline_data: { mime_type: imageMimeType || 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        topK: 32,
        candidateCount: 1,
        maxOutputTokens: 8192
      }
    }

    const { data } = await axios.post(endpoint + `?key=${encodeURIComponent(GEMINI_API_KEY)}`, payload, {
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' }
    })

    // Try to extract base64 from the first candidate text
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || ''
    // Basic sanity: a PNG base64 often starts with iVBORw0K
    const b64 = (text || '').replace(/\s+/g, '')
    const looksLikeBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b64) && b64.length > 100
    if (!looksLikeBase64) {
      // Some models may embed base64 within markdown or text; try to extract the longest base64-like chunk
      const candidates = (text.match(/[A-Za-z0-9+/=]{100,}/g) || []).sort((a, b) => b.length - a.length)
      if (candidates[0]) {
        const candidate = candidates[0].replace(/\s+/g, '')
        if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(candidate)) {
          return res.status(200).json({ imageBase64: candidate, model: 'gemini-2.5-flash-image', elapsedMs: Date.now() - start })
        }
      }
      return res.status(502).json({ error: 'Model did not return a valid base64 image payload', model: 'gemini-2.5-flash-image', rawPreview: typeof text === 'string' ? text.slice(0, 200) : undefined })
    }

    return res.status(200).json({ imageBase64: b64, model: 'gemini-2.5-flash-image', elapsedMs: Date.now() - start })
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data || err?.message || 'internal'
    if (SENTRY_DSN) Sentry.captureException(err)
    console.error('Avatar generation error', message)
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: 'internal', details: typeof message === 'string' ? message : undefined })
  }
})

if (SENTRY_DSN) app.use(Sentry.Handlers.errorHandler())

app.listen(PORT, () => {
  console.log(`avatar-gen-service listening on :${PORT}`)
})
