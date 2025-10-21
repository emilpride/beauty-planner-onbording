'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme, type ThemeVariant } from '@/components/theme/ThemeProvider'

export default function AssistantWelcomePage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const { answers, hydrate } = useQuizStore()
  const [webmSupported, setWebmSupported] = useState<boolean | null>(null)
  const { theme } = useTheme()
  const [effectiveTheme, setEffectiveTheme] = useState<ThemeVariant | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Removed full-screen flash overlay; we'll animate components in instead

  useEffect(() => {
    hydrate()
    setIsHydrated(true)
  }, [hydrate])

  // No full-screen overlay; rely on gentle component animations

  // Initialize theme from document to avoid flicker, then sync with provider
  useEffect(() => {
    try {
      const root = document.documentElement
      const initial: ThemeVariant = root.classList.contains('dark') ? 'dark' : 'light'
      setEffectiveTheme(initial)
    } catch {}
  }, [])

  useEffect(() => {
    if (theme) setEffectiveTheme(theme)
  }, [theme])

  // Detect WebM support to decide between video and image fallback
  useEffect(() => {
    try {
      const v = document.createElement('video')
      const result = typeof v.canPlayType === 'function' ? (v.canPlayType('video/webm; codecs="vp9, vorbis"') || v.canPlayType('video/webm')) : ''
      setWebmSupported(result === 'probably' || result === 'maybe')
    } catch (_) {
      setWebmSupported(false)
    }
  }, [])

  // Redirect to assistant selection if no assistant chosen yet (must be before any early returns)
  useEffect(() => {
    if (isHydrated && answers.assistant === 0) {
      router.replace('/assistant-selection')
    }
  }, [isHydrated, answers.assistant, router])

  if (!isHydrated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900 dark:bg-[#161a20] dark:text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-400/40 border-t-transparent rounded-full animate-spin dark:border-white/30" />
      </div>
    )
  }

  if (answers.assistant === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900 dark:bg-[#161a20] dark:text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-400/40 border-t-transparent rounded-full animate-spin dark:border-white/30" />
      </div>
    )
  }

  const isMax = answers.assistant === 1
  const assistantName = isMax ? 'Max' : 'Ellie'
  const assistantImage = isMax
    ? '/images/on_boarding_images/onboarding_img_1_max.png'
    : '/images/on_boarding_images/onboarding_img_1.png'

  const isDark = effectiveTheme === 'dark'
  const videoSrc = isMax
    ? `/animations/${isDark ? 'max-welcome-dark' : 'max-welcome-light'}.webm`
    : `/animations/${isDark ? 'ellie-welcome-dark' : 'ellie-welcome-light'}.webm`

  const handleContinue = () => {
    setIsLoading(true)
    router.push('/quiz/0')
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white text-neutral-900 dark:bg-[#161a20] dark:text-white transition-colors">
      <div
        className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-0 py-4 sm:px-6 sm:py-6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Back */}
  <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => router.push('/assistant-selection')}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 bg-black/5 text-black backdrop-blur hover:bg-black/10 transition-colors dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Media + Card wrapper */}
        <motion.div
          className="relative z-10 mb-0 sm:mb-2 flex flex-col items-center justify-center gap-4 -translate-y-[4vh] md:translate-y-0"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Media: framed only on desktop (circular) */}
          <motion.div
            className="relative bg-white dark:bg-[#161a20] md:rounded-full md:border md:border-black/10 md:dark:border-white/15 md:ring-1 md:ring-white/10 md:dark:ring-white/15 md:shadow-[0_20px_60px_rgba(0,0,0,0.28),0_0_80px_18px_rgba(255,255,255,0.08),0_0_140px_36px_rgba(255,255,255,0.06)] md:overflow-hidden w-screen sm:w-screen md:w-[18vw] md:aspect-square"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          >
            {webmSupported && effectiveTheme ? (
              <video
                key={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={assistantImage}
                className="relative z-10 h-auto w-screen sm:w-screen md:h-full md:w-full max-w-none object-contain md:object-cover md:object-top bg-white dark:bg-[#161a20]"
              >
                <source src={videoSrc} type="video/webm" />
              </video>
            ) : (
              <Image
                src={assistantImage}
                alt={assistantName}
                width={900}
                height={900}
                priority
                className="relative z-10 h-auto w-screen sm:w-screen md:h-full md:w-full max-w-none object-contain md:object-cover md:object-top bg-white dark:bg-[#161a20]"
              />
            )}

            {/* Mobile only: overlaid card slightly higher (66% from top) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[66%] w-full max-w-2xl text-center px-4 sm:px-6 z-30 md:hidden">
              <motion.div
                className="relative mx-auto w-full max-w-xl rounded-[42px] sm:rounded-[48px] border border-black/10 dark:border-white/20 shadow-[0_16px_60px_rgba(0,0,0,0.15)] px-4 py-4 sm:px-6 sm:py-6 backdrop-blur-[45px] bg-white/60 dark:bg-white/[0.01]"
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
              >
                {/* Light theme base */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[42px] sm:rounded-[48px] dark:hidden" style={{ background: 'rgba(0,0,0,0.03)' }} />
                {/* Dark theme base */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[42px] sm:rounded-[48px] hidden dark:block" style={{ background: 'rgba(84,84,84,0.1)' }} />
                {/* Inner soft rectangle */}
                <span aria-hidden className="pointer-events-none absolute rounded-[36px]" style={{ inset: 6, background: '#D9D9D9', filter: 'blur(3px)', opacity: 0.03 }} />
                {/* Elliptical overlay for depth */}
                <span aria-hidden className="pointer-events-none absolute rounded-[56px]" style={{ left: '-12.5%', right: '-26.5%', top: '-32.14%', bottom: '-32.14%', background: 'rgba(0,0,0,0.1)', backgroundBlendMode: 'overlay', backdropFilter: 'blur(4px)', opacity: 0.15 }} />
                {/* Multiply/plus-lighter subtle glows */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[42px] sm:rounded-[48px]" style={{ mixBlendMode: 'multiply', filter: 'blur(3px)', opacity: 0.16 }} />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[42px] sm:rounded-[48px]" style={{ mixBlendMode: 'plus-lighter', filter: 'blur(1px)', opacity: 0.18 }} />
                {/* Top highlight */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[42px] sm:rounded-[48px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)', opacity: 0.25 }} />

                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-black/70 backdrop-blur mb-3 sm:mb-4 dark:border-white/15 dark:bg-white/10 dark:text-white/75">
                  Meet your assistant
                </span>
                {/* Removed H1 title per request */}
                <p className="mt-1 sm:mt-2 text-sm text-neutral-700 dark:text-white/75 sm:text-base leading-relaxed">
                  I'm here to help you find your true beauty through the perfect balance of self‑care, mental well‑being, and physical health.
                </p>
                <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2 sm:gap-3 relative z-10">
                  <button onClick={handleContinue} disabled={isLoading} className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Loading...' : "Let's Go"}</button>
                  <button onClick={() => router.push('/assistant-selection')} className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white">Change assistant</button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop only: wide readable card below media (no title) */}
          <div className="hidden md:block w-full px-4 sm:px-6">
            <motion.div
              className="relative mx-auto w-full max-w-2xl rounded-[56px] border border-black/10 dark:border-white/20 shadow-[0_16px_60px_rgba(0,0,0,0.15)] px-6 py-6 backdrop-blur-[45px] bg-white/70 dark:bg-white/[0.03]"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[56px] dark:hidden" style={{ background: 'rgba(0,0,0,0.03)' }} />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[56px] hidden dark:block" style={{ background: 'rgba(84,84,84,0.1)' }} />
              <span aria-hidden className="pointer-events-none absolute rounded-[44px]" style={{ inset: 8, background: '#D9D9D9', filter: 'blur(3px)', opacity: 0.03 }} />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[56px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)', opacity: 0.25 }} />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black/70 backdrop-blur mb-4 dark:border-white/15 dark:bg-white/10 dark:text-white/75">Meet your assistant</span>
                {/* Title removed on desktop as requested */}
                <p className="mt-0 text-base text-neutral-700 dark:text-white/75 leading-relaxed">I'm here to help you find your true beauty through the perfect balance of self‑care, mental well‑being, and physical health.</p>
                <div className="mt-5 flex flex-col items-center gap-3">
                  <button onClick={handleContinue} disabled={isLoading} className="btn-primary px-10 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Loading...' : "Let's Go"}</button>
                  <button onClick={() => router.push('/assistant-selection')} className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white">Change assistant</button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
