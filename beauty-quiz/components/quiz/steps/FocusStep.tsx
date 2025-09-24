'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'always', label: 'Always' },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'rarely', label: 'Rarely' },
  { id: 'never', label: 'Never' },
]

export default function FocusStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="How would you rate your ability to focus?"
      subtitle="This helps in tailoring mindfulness and productivity exercises."
      condition={answers.focus !== ''}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('focus', option.id as any)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.focus === option.id
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


