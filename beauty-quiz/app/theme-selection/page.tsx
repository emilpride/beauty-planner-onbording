'use client'

import AnimatedBackground from '@/components/AnimatedBackground'
import { useTheme, type ThemeVariant } from '@/components/theme/ThemeProvider'
import { Moon, Sparkles, Sun } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const assistantPreview = {
  light: {
    image: '/images/on_boarding_images/onboarding_img_1.png',
    greeting: "Hi! I'm Ellie, Your Personal Assistant.",
    description:
      'I thrive in a bright, optimistic space. Let me guide you through a fresh and energetic wellness journey.',
  },
  dark: {
    image: '/images/on_boarding_images/onboarding_img_1_max.png',
    greeting: "Hey! I'm Max, Your Personal AI Coach.",
    description:
      'I keep things calm and focused. Choose a moody, immersive vibe for a grounded self-care experience.',
  },
} satisfies Record<ThemeVariant, { image: string; greeting: string; description: string }>

export default function ThemeSelectionPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTheme, setActiveTheme] = useState<ThemeVariant>(theme)
  const isDark = activeTheme === 'dark'

  useEffect(() => {
    setActiveTheme(theme)
  }, [theme])

  const preview = useMemo(() => assistantPreview[activeTheme], [activeTheme])

  const handleToggle = (nextTheme: ThemeVariant) => {
    setActiveTheme(nextTheme)
    setTheme(nextTheme)
  }

  const handleContinue = () => {
    router.push('/welcome')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-500">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl space-y-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle/60 bg-surface/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Personalize your experience
            </span>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Choose the mood that fits you best
            </h1>
            <p className="max-w-2xl text-base text-text-secondary sm:text-lg">
              Light or dark? Pick a theme to match your vibe. You can always switch it later from the settings menu.
            </p>
          </div>

          <div className="flex flex-col items-center gap-12">
            <motion.div
              layout
              className="relative flex h-24 w-full max-w-lg items-center justify-center rounded-full border border-border-subtle/80 bg-surface/80 px-4 text-text-secondary shadow-soft backdrop-blur"
            >
              <button
                type="button"
                onClick={() => handleToggle('light')}
                className={`z-10 flex flex-1 items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  isDark ? 'text-text-secondary/70' : 'text-text-primary'
                }`}
              >
                <Sun className="h-5 w-5" /> Light
              </button>
              <button
                type="button"
                onClick={() => handleToggle('dark')}
                className={`z-10 flex flex-1 items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  isDark ? 'text-text-primary' : 'text-text-secondary/70'
                }`}
              >
                Dark <Moon className="h-5 w-5" />
              </button>
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                className={`absolute top-2 bottom-2 w-[calc(50%-8px)] rounded-full bg-primary/15 shadow-elevated ${
                  isDark ? 'right-2' : 'left-2'
                }`}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative w-full overflow-hidden rounded-[32px] border border-border-subtle/70 bg-surface/90 px-6 py-10 shadow-elevated backdrop-blur sm:px-10"
              >
                <div className="absolute inset-x-0 -top-40 h-64 rounded-full bg-primary/20 blur-[120px]" />
                <div className="relative flex flex-col items-center gap-8 text-left md:flex-row md:items-end md:justify-between">
                  <div className="relative flex w-full max-w-xs items-center justify-center">
                    <div className="relative h-64 w-64">
                      <Image
                        src={preview.image}
                        alt={preview.greeting}
                        fill
                        priority
                        className="object-contain drop-shadow-[0_32px_60px_rgba(76,45,130,0.35)]"
                      />
                    </div>
                  </div>
                  <div className="flex w-full max-w-md flex-col gap-4 text-center md:text-left">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                        Preview
                      </p>
                      <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                        {preview.greeting}
                      </h2>
                    </div>
                    <p className="text-base text-text-secondary sm:text-lg">
                      {preview.description}
                    </p>
                    <button
                      onClick={handleContinue}
                      className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-soft transition-transform duration-200 hover:scale-[1.02] hover:shadow-elevated"
                    >
                      Continue with {activeTheme === 'light' ? 'Light' : 'Dark'} Mode
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
