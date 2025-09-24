'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'office', label: 'Office' },
  { id: 'remote', label: 'Remote' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'jobless', label: 'Jobless' },
]

export default function WorkEnvironmentStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="What is your work environment?"
      subtitle="This helps us understand potential environmental factors."
      condition={answers.workEnvironment !== ''}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('workEnvironment', option.id as any)}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              answers.workEnvironment === option.id
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


