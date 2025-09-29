'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const options = [
  { id: 'rarely', label: 'Rarely' },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'often', label: 'Often' },
  { id: 'always', label: 'Always' },
]

export default function StressStep() {
  const { answers, setAnswer, currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (optionId: string) => {
    if (hasTransitioned.current) return
    
    setAnswer('stressLevel', optionId as any)
    hasTransitioned.current = true
    

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }


  useEffect(() => {

    setAnswer('stressLevel', '')
    hasTransitioned.current = false
    
    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title="How often do you feel stressed?"
      subtitle="Stress can impact skin, hair, and overall well-being."
      hideButton={true}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
              answers.stressLevel === option.id
                ? 'border-primary bg-primary bg-opacity-15 shadow-lg'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-text-primary">{option.label}</p>
              </div>
              {answers.stressLevel === option.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}

