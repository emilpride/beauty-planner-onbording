'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'dry', label: 'Dry' },
  { id: 'normal', label: 'Normal' },
  { id: 'oily', label: 'Oily' },
  { id: 'combination', label: 'Combination' },
]

export default function SkinTypeStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="What is your skin type?"
      subtitle="Don't know? Let our AI analyze it for you in a later step."
      condition={answers.skinType !== ''}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('skinType', option.id as any)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.skinType === option.id
                ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <span className="text-lg font-semibold text-text-primary">{option.label}</span>
          </button>
        ))}
        <button
          onClick={() => setAnswer('skinType', 'ai_analyze')}
          className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
            answers.skinType === 'ai_analyze'
              ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <span className="text-lg font-semibold text-text-primary">Let AI Analyze</span>
        </button>
      </div>
    </OnboardingStep>
  )
}


