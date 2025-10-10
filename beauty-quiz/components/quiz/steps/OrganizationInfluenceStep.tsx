'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const influences = [
  "Family", "Friends", "Work", "Social Media", "News", "Health"
]

export default function OrganizationInfluenceStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleInfluence = (influence: string) => {
    const newInfluences = answers.Influence.includes(influence)
      ? answers.Influence.filter((i) => i !== influence)
      : [...answers.Influence, influence]
    setAnswer('Influence', newInfluences)
  }

  return (
    <OnboardingStep
      title="What influences your sense of organization and planning the most?"
      subtitle="Select all that apply."
      condition={answers.Influence.length > 0}
    >
      <div className="flex flex-wrap gap-2 py-1">
        {influences.map((influence) => (
          <button
            key={influence}
            onClick={() => handleToggleInfluence(influence)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              answers.Influence.includes(influence)
                ? 'border-primary bg-primary bg-opacity-10 text-primary'
                : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
            }`}
          >
            {influence}
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


