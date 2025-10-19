import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const isDev = process.env.NODE_ENV !== 'production'
    // In production call Cloud Function directly to avoid recursive rewrite
    const fnUrl = isDev
  ? (process.env['ANALYZE_FN_URL'] || 'http://localhost:5001/beauty-planner-26cc0/us-central1/analyzeUserData')
      : 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/analyzeUserData'

    const forwardedHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    try {
      const hdr = (name: string) => req.headers.get(name)
      const ua = hdr('user-agent')
      const ref = hdr('referer') || hdr('referrer')
      const ip = hdr('x-forwarded-for') || hdr('x-real-ip')
      if (ua) forwardedHeaders['user-agent'] = ua
      if (ref) forwardedHeaders['referer'] = ref
      if (ip) forwardedHeaders['x-forwarded-for'] = ip
    } catch {}

    const resp = await fetch(fnUrl, {
      method: 'POST',
      headers: forwardedHeaders,
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    const contentType = resp.headers.get('content-type') || 'application/json'
    return new NextResponse(text || '{}', {
      status: resp.status,
      headers: { 'Content-Type': contentType },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'analyze proxy error' }, { status: 500 })
  }
}
