'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const types = [
  "Straight", "Wavy", "Curly", "Coily"
]

export default function HairTypeStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="What is your hair type?"
      subtitle="Select the type that best describes your hair."
      condition={answers.hairType !== ''}
    >
      <div className="space-y-3">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setAnswer('hairType', type)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.hairType === type
                ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <span className="text-lg font-semibold text-text-primary">{type}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


