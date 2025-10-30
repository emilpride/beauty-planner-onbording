'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import Image from 'next/image'

const CheckIcon = () => (
  <div className="w-5 h-5 flex-shrink-0 text-primary">
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <linearGradient id="premium-check-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A6EDA" />
          <stop offset="100%" stopColor="#DB75E0" />
        </linearGradient>
      </defs>
      <path fill="url(#premium-check-gradient)" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  </div>
)

export default function PremiumIntroStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assistant = searchParams.get('assistant') || 'ellie'
  const [loading, setLoading] = useState(false)

  const handleContinue = useCallback(() => {
    if (loading) return
    setLoading(true)
    // Try client-side navigation first
    try {
      router.push('/procedures/0')
    } catch (_) {
      // ignore
    }

    // Hard fallback: if something blocks navigation (PWA cache, router hiccup), force a full redirect shortly after
    const hardFallback = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.location.assign('/procedures/0')
        }
      } catch (_) {
        // noop
      }
    }, 1200)

    // Safety timeout to re-enable button if still not navigated after a while
    setTimeout(() => {
      clearTimeout(hardFallback)
      setLoading(false)
    }, 8000)
  }, [loading, router])

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-8 safe-area-inset">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent dark:from-primary/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />

  <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center overflow-visible">
        {/* Assistant image positioned behind the card */}
  <div className="pointer-events-none absolute inset-x-0 -top-40 sm:-top-48 md:-top-32 lg:-top-32 xl:-top-36 flex justify-center z-0">
          <Image
            src={`/images/on_boarding_images/onboarding_img_4${assistant === 'max' ? '_max' : ''}.png`}
            alt="Assistant"
            width={144}
            height={144}
            className="object-contain drop-shadow-[0_20px_30px_rgba(76,45,130,0.25)]"
            priority
          />
        </div>

  <div className="relative z-10 w-full rounded-3xl border border-border-subtle/70 bg-surface px-5 pt-6 pb-5 shadow-elevated backdrop-blur-sm mt-8 sm:mt-10 md:mt-12">
          <div className="flex flex-col gap-3">
            <header className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Premium intro</p>
              <h1 className="mt-1 text-lg font-bold text-text-primary leading-tight">
                Let's Create Your Schedule
              </h1>
              <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed">
                Our users save an average of 12 hours a year. Imagine what you could do with that time when everything is organized for you.
              </p>
            </header>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckIcon />
                <p className="text-[13px] text-text-primary/90">
                  We'll transform your answers into a guided procedure plan tailored to your lifestyle and pace.
                </p>
              </div>

              <hr className="border-border-subtle/60" />

              <div className="flex items-start gap-3">
                <CheckIcon />
                <p className="text-[13px] text-text-primary/90">
                  Receive a smart calendar that keeps you on track with reminders and progress checkpoints.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={loading}
            className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 flex items-center justify-center gap-2 ${loading ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:scale-[1.02] hover:shadow-elevated'}`}
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden="true" />
            )}
            {loading ? 'Loading...' : "Let's Go"}
          </button>
        </div>
      </div>
    </div>
  )
}
