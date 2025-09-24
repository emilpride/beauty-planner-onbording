'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const problems = [
  "Acne", "Redness", "Blackheads", "Pores", "Wrinkles", 
  "Dark Circles", "Dryness", "Oiliness", "Dullness"
]

export default function SkinProblemsStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleProblem = (problem: string) => {
    const newProblems = answers.skinProblems.includes(problem)
      ? answers.skinProblems.filter((p) => p !== problem)
      : [...answers.skinProblems, problem]
    setAnswer('skinProblems', newProblems)
  }

  return (
    <OnboardingStep
      title="Do you have any of these skin problems?"
      subtitle="Select all that apply."
      condition={answers.skinProblems.length > 0}
    >
      <div className="flex flex-wrap gap-3">
        {problems.map((problem) => (
          <button
            key={problem}
            onClick={() => handleToggleProblem(problem)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              answers.skinProblems.includes(problem)
                ? 'border-primary bg-primary bg-opacity-10 text-primary'
                : 'border-gray-300 hover:border-primary text-text-primary'
            }`}
          >
            {problem}
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


