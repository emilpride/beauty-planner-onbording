'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const options = [
  { id: 'great', label: 'Great' },
  { id: 'good', label: 'Good' },
  { id: 'okay', label: 'Okay' },
  { id: 'bad', label: 'Bad' },
  { id: 'terrible', label: 'Terrible' },
]

export default function MoodStep() {
  const { answers, setAnswer, currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (moodId: string) => {
    if (hasTransitioned.current) return
    
    setAnswer('mood', moodId as any)
    hasTransitioned.current = true
    

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }


  useEffect(() => {

    setAnswer('mood', '')
    hasTransitioned.current = false
    
    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title="How are you feeling today?"
      subtitle="Your mood can be an important indicator of your overall well-being."
      condition={answers.mood !== ''}
      hideButton={true}
    >
      <div className="flex justify-around items-center py-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-300 ${
              answers.mood === option.id 
                ? 'transform scale-110 bg-primary bg-opacity-10' 
                : 'opacity-60 hover:opacity-100 hover:bg-gray-50'
            }`}
          >
            <span className={`text-2xl font-bold ${answers.mood === option.id ? 'text-primary' : 'text-text-secondary'}`}>{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}

