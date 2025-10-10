'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const options = [
  { id: 'sedentary', label: 'Sedentary', description: 'Mainly sitting' },
  { id: 'active', label: 'Active', description: 'Walks and light activity' },
  { id: 'sports', label: 'Sports', description: 'Regular workouts' },
]

export default function LifestyleStep() {
  const { answers, setAnswer, currentStep, nextStep, setTransitioning } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (optionId: string) => {
    if (hasTransitioned.current) return

    setAnswer('LifeStyle', optionId as 'sedentary' | 'active' | 'sports')
    hasTransitioned.current = true
    setTransitioning(true)
    nextStep()
    router.push(`/quiz/${currentStep + 1}`)
  }

  useEffect(() => {
    setAnswer('LifeStyle', '')
    hasTransitioned.current = false

    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title="How would you describe your lifestyle?"
      subtitle="This helps us understand your daily activity levels."
      hideButton={true}
    >
      <div className="space-y-2 py-1">
        {options.map((option) => {
          const isSelected = answers.LifeStyle === option.id
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                isSelected
                  ? 'border-primary bg-surface shadow-soft'
                  : 'border-border-subtle/60 bg-surface-muted hover:border-primary/40 hover:bg-surface hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-base font-semibold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-text-secondary/80">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}


