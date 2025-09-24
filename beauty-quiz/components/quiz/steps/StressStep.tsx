'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'rarely', label: 'Rarely' },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'often', label: 'Often' },
  { id: 'always', label: 'Always' },
]

export default function StressStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="How often do you feel stressed?"
      subtitle="Stress can impact skin, hair, and overall well-being."
      condition={answers.stressLevel !== ''}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('stressLevel', option.id as any)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.stressLevel === option.id
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


