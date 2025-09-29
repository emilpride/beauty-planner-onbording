'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function AssistantWelcomePage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const { answers, hydrate } = useQuizStore()

  useEffect(() => {
    hydrate()
    setIsHydrated(true)
  }, [hydrate])

  if (!isHydrated) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (answers.assistant === 0) {
    router.push('/assistant-selection')
    return null
  }

  const isMax = answers.assistant === 1
  const assistantName = isMax ? 'Max' : 'Ellie'
  const assistantImage = isMax
    ? '/images/on_boarding_images/onboarding_img_1_max.png'
    : '/images/on_boarding_images/onboarding_img_1.png'

  const handleContinue = () => {
    router.push('/quiz/0')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="absolute top-8 left-6 z-20">
          <button
            onClick={() => router.push('/assistant-selection')}
            className="glass-button w-10 h-10 flex items-center justify-center"
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
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-end px-6 py-8">
          <div className="relative z-10">
            <Image
              src={assistantImage}
              alt={assistantName}
              width={240}
              height={240}
              className="rounded-full drop-shadow-[0_32px_60px_rgba(76,45,130,0.35)]"
              priority
            />
          </div>
        </div>

        <div className="px-8 pb-8 flex-shrink-0 -mt-16 relative z-20">
          <div className="bg-surface rounded-t-3xl px-6 pt-6 pb-8 max-w-sm mx-auto border border-border-subtle/70 shadow-elevated backdrop-blur">
            <h1 className="text-2xl font-bold text-text-primary mb-3 text-center">
              Hi! I'm {assistantName}, Your Personal AI Assistant
            </h1>

            <p className="text-text-secondary text-center text-base leading-relaxed mb-6">
              I'm here to help you find your true beauty through the perfect balance of self-care, mental well-being, and physical health.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Let's Go
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
