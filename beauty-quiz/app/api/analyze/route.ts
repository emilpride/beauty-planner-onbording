import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const fnUrl = process.env.ANALYZE_FN_URL || 'http://localhost:5001/beauty-planner-26cc0/us-central1/analyzeUserData'
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
