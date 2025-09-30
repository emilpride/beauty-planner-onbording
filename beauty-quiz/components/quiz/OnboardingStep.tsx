'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

interface OnboardingStepProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  condition?: boolean
  onNext?: () => void
  onDisabledTap?: () => void
  buttonText?: string
  skip?: boolean
  skipText?: string
  onSkip?: () => void
  centerContent?: boolean
  hideButton?: boolean
  onExitAnimation?: () => void
  onBackAnimation?: () => void
}

export default function OnboardingStep({
  title,
  subtitle,
  children,
  condition = true,
  onNext,
  onDisabledTap,
  buttonText = 'Next',
  skip = false,
  skipText = 'Skip',
  onSkip,
  centerContent = false,
  hideButton = false,
  onExitAnimation,
  onBackAnimation,
}: OnboardingStepProps) {
  const router = useRouter()
  const { nextStep, currentStep } = useQuizStore()

  const handleNext = () => {
    if (condition) {
      if (onNext) {
        onNext()
      }

      if (onExitAnimation) {
        onExitAnimation()
      }

      setTimeout(() => {
        const nextStepIndex = currentStep + 1
        router.push(`/quiz/${nextStepIndex}`)
        nextStep()
      }, 500)
    } else if (onDisabledTap) {
      onDisabledTap()
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      const nextStepIndex = currentStep + 1
      router.push(`/quiz/${nextStepIndex}`)
      nextStep()
    }
  }

  return (
    <div className={`h-full flex flex-col p-4 ${centerContent ? 'justify-center' : ''}`}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-1 mb-3">
          <h1 className="text-xl font-bold text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-medium text-text-secondary leading-relaxed whitespace-pre-line">
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </div>

      {!hideButton && (
        <div className="pt-4 flex-shrink-0">
          <button
            onClick={handleNext}
            disabled={!condition}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
              condition
                ? 'bg-primary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-text-secondary cursor-not-allowed'
            }`}
          >
            {buttonText}
          </button>

          {skip && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-3 px-6 text-text-secondary font-medium hover:text-text-primary transition-colors duration-200"
            >
              {skipText}
            </button>
          )}
        </div>
      )}

      {hideButton && skip && (
        <div className={`${centerContent ? 'pt-6' : 'mt-auto pt-4'}`}>
          <button
            onClick={handleSkip}
            className="w-full py-3 px-6 text-text-secondary font-medium hover:text-text-primary transition-colors duration-200"
          >
            {skipText}
          </button>
        </div>
      )}
    </div>
  )
}
