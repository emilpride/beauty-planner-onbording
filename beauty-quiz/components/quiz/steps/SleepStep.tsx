'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: '<6', label: 'Less than 6 hours' },
  { id: '6-7', label: '6-7 hours' },
  { id: '7-8', label: '7-8 hours' },
  { id: '8-9', label: '8-9 hours' },
  { id: '>9', label: 'More than 9 hours' },
]

export default function SleepStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="How many hours of sleep do you get on average?"
      subtitle="Sleep is crucial for skin regeneration and overall well-being."
      condition={answers.sleepHours !== ''}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('sleepHours', option.id as any)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.sleepHours === option.id
                ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <span className="text-lg font-semibold text-text-primary">{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


