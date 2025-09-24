'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const problems = [
  "Hair Loss", "Dandruff", "Dryness", "Split Ends",
  "Frizz", "Oiliness", "Lack of Volume"
]

export default function HairProblemsStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleProblem = (problem: string) => {
    const newProblems = answers.hairProblems.includes(problem)
      ? answers.hairProblems.filter((p) => p !== problem)
      : [...answers.hairProblems, problem]
    setAnswer('hairProblems', newProblems)
  }

  return (
    <OnboardingStep
      title="Do you have any of these hair problems?"
      subtitle="Select all that apply."
      condition={answers.hairProblems.length > 0}
    >
      <div className="flex flex-wrap gap-3">
        {problems.map((problem) => (
          <button
            key={problem}
            onClick={() => handleToggleProblem(problem)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              answers.hairProblems.includes(problem)
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


