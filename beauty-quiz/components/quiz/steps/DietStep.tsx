'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const diets = [
  "Balanced", "Vegetarian", "Vegan", "Keto", 
  "Paleo", "Pescatarian", "Gluten-Free", "Dairy-Free", "Anything"
]

export default function DietStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleDiet = (diet: string) => {
    const newDiets = answers.diet.includes(diet)
      ? answers.diet.filter((d) => d !== diet)
      : [...answers.diet, diet]
    setAnswer('diet', newDiets)
  }

  return (
    <OnboardingStep
      title="Do you follow any specific diet?"
      subtitle="Select all that apply."
      condition={answers.diet.length > 0}
    >
      <div className="flex flex-wrap gap-3">
        {diets.map((diet) => (
          <button
            key={diet}
            onClick={() => handleToggleDiet(diet)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              answers.diet.includes(diet)
                ? 'border-primary bg-primary bg-opacity-10 text-primary'
                : 'border-gray-300 hover:border-primary text-text-primary'
            }`}
          >
            {diet}
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


