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
}: OnboardingStepProps) {
  const router = useRouter()
  const { nextStep, currentStep } = useQuizStore()

  const handleNext = () => {
    if (condition) {
      if (onNext) {
        onNext()
      }
      const nextStepIndex = currentStep + 1
      router.push(`/quiz/${nextStepIndex}`)
      nextStep()
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
    <div className={`h-full flex flex-col p-6 ${centerContent ? 'justify-center' : ''}`}>
      <div className="overflow-y-auto pb-4 scrollbar-hide">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base font-semibold text-text-secondary leading-relaxed whitespace-pre-line">
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </div>

      {!hideButton && (
        <div className={`${centerContent ? 'pt-6' : 'mt-auto pt-4'}`}>
          <button
            onClick={handleNext}
            disabled={!condition}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
              condition
                ? 'bg-primary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {buttonText}
          </button>

          {skip && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-3 px-6 text-gray-500 font-medium hover:text-gray-700 transition-colors duration-200"
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
            className="w-full py-3 px-6 text-gray-500 font-medium hover:text-gray-700 transition-colors duration-200"
          >
            {skipText}
          </button>
        </div>
      )}
    </div>
  )
}
