import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // In production, rely on Firebase Hosting rewrite to route /api/analyze
    // Only use local emulator URL during local development
    const isDev = process.env.NODE_ENV !== 'production'
    const fnUrl = isDev
      ? (process.env.ANALYZE_FN_URL || 'http://localhost:5001/beauty-planner-26cc0/us-central1/analyzeUserData')
      : 'https://quiz-beautymirror-app.web.app/api/analyze'
    const resp = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await resp.json()
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'analyze proxy error' }, { status: 500 })
  }
}
