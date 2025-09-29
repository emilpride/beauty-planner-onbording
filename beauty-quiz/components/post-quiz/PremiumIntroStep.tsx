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
    router.push('/procedures/0')
  }

  return (
    <div className="relative min-h-screen flex items-end justify-center px-4 pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent dark:from-primary/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-44">
          <Image
            src={`/images/on_boarding_images/onboarding_img_4${assistant === 'max' ? '_max' : ''}.png`}
            alt="Assistant"
            width={180}
            height={180}
            className="object-contain drop-shadow-[0_28px_40px_rgba(76,45,130,0.25)]"
            priority
          />
        </div>

        <div className="rounded-3xl border border-border-subtle/70 bg-surface px-6 pt-32 pb-8 shadow-elevated backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            <header className="text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Premium intro</p>
              <h1 className="mt-2 text-2xl font-bold text-text-primary leading-tight">
                Let's Create Your Schedule
              </h1>
              <p className="mt-3 text-base text-text-secondary leading-relaxed">
                Our users save an average of 12 hours a year. Imagine what you could do with that time when everything is organized for you.
              </p>
            </header>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckIcon />
                <p className="text-base text-text-primary/90">
                  We'll transform your answers into a guided procedure plan tailored to your lifestyle and pace.
                </p>
              </div>

              <hr className="border-border-subtle/60" />

              <div className="flex items-start gap-3">
                <CheckIcon />
                <p className="text-base text-text-primary/90">
                  Receive a smart calendar that keeps you on track with reminders and progress checkpoints.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated"
          >
            Let's Go
          </button>
        </div>
      </div>
    </div>
  )
}
