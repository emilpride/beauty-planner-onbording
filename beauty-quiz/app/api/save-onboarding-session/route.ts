import { NextResponse } from 'next/server'

const TARGET_URL =
  process.env.SAVE_ONBOARDING_URL ||
  process.env.NEXT_PUBLIC_SAVE_ONBOARDING_URL ||
  'https://us-central1-beauty-planner-26cc0.cloudfunctions.net/saveOnboardingSession'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const upstreamResponse = await fetch(TARGET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await upstreamResponse.text()
    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: 'Upstream saveOnboardingSession failed',
          status: upstreamResponse.status,
          body: text,
        },
        { status: upstreamResponse.status }
      )
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json'
    return new NextResponse(text || '{}', {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentType },
    })
  } catch (error: any) {
    console.error('save-onboarding-session API route error', error)
    return NextResponse.json(
      {
        error: 'Failed to save onboarding session',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
