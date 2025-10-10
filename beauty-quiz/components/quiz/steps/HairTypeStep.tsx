'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const types = [
  "Straight", "Wavy", "Curly", "Coily"
]

export default function HairTypeStep() {
  const { answers, setAnswer, currentStep, nextStep, setTransitioning } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (type: string) => {
    if (hasTransitioned.current) return
    
    setAnswer('HairType', type)
    hasTransitioned.current = true
    

    setTransitioning(true)
    nextStep()
    router.push(`/quiz/${currentStep + 1}`)
  }

  const handleSkip = () => {
    if (hasTransitioned.current) return
    
    setAnswer('HairType', '')
    hasTransitioned.current = true
    

    setTransitioning(true)
    nextStep()
    router.push(`/quiz/${currentStep + 1}`)
  }


  useEffect(() => {

    setAnswer('HairType', '')
    hasTransitioned.current = false
    
    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title="What is your hair type?"
      subtitle="Select the type that best describes your hair."
      condition={answers.HairType !== ''}
      hideButton={true}
      skip={true}
      skipText="Skip"
      onSkip={handleSkip}
    >
      <div className="space-y-2 py-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => handleOptionSelect(type)}
            className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
              answers.HairType === type
                ? 'border-primary bg-surface shadow-soft'
                : 'border-border-subtle/60 bg-surface-muted hover:border-primary/40 hover:bg-surface hover:text-text-primary'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-text-primary">{type}</p>
              </div>
              {answers.HairType === type && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
        <button
          onClick={() => handleOptionSelect('ai_analyze')}
          className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
            answers.HairType === 'ai_analyze'
              ? 'border-primary bg-surface shadow-soft'
              : 'border-border-subtle/60 bg-surface-muted hover:border-primary/40 hover:bg-surface hover:text-text-primary'
          }`}
        >
          <div>
            <p className="text-base font-semibold text-purple-500">Let AI Analyze</p>
          </div>
        </button>
      </div>
    </OnboardingStep>
  )
}



