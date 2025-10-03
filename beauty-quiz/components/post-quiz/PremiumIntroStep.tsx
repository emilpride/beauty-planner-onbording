'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

  const handleContinue = () => {
    // Flow: Premium intro -> Procedures
    router.push('/procedures/0')
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-8 safe-area-inset">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent dark:from-primary/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />

      <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center">
        <div className="relative mb-2">
          <Image
            src={`/images/on_boarding_images/onboarding_img_4${assistant === 'max' ? '_max' : ''}.png`}
            alt="Assistant"
            width={120}
            height={120}
            className="object-contain drop-shadow-[0_20px_30px_rgba(76,45,130,0.25)]"
            priority
          />
        </div>

        <div className="relative z-10 w-full rounded-3xl border border-border-subtle/70 bg-surface px-5 pt-6 pb-5 shadow-elevated backdrop-blur-sm">
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
            className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated"
          >
            Let's Go
          </button>
        </div>
      </div>
    </div>
  )
}
