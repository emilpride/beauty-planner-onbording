'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'sedentary', label: 'Sedentary', description: 'Mainly sitting' },
  { id: 'active', label: 'Active', description: 'Walks and light activity' },
  { id: 'sports', label: 'Sports', description: 'Regular workouts' },
]

export default function LifestyleStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="How would you describe your lifestyle?"
      subtitle="This helps us understand your daily activity levels."
      condition={answers.lifestyle !== ''}
    >
      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('lifestyle', option.id as 'sedentary' | 'active' | 'sports')}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.lifestyle === option.id
                ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <p className="text-lg font-semibold text-text-primary">{option.label}</p>
            <p className="text-sm text-text-secondary">{option.description}</p>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


