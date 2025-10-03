'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const problems = [
  "Hair Loss", "Dandruff", "Dryness", "Split Ends",
  "Frizz", "Oiliness", "Lack of Volume"
]

export default function HairProblemsStep() {
  const { answers, setAnswer, currentStep, nextStep, setTransitioning } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleToggleProblem = (problem: string) => {
    const newProblems = answers.hairProblems.includes(problem)
      ? answers.hairProblems.filter((p) => p !== problem)
      : [...answers.hairProblems, problem]
    setAnswer('hairProblems', newProblems)
  }

  const handleOptionSelect = (option: string) => {
    if (hasTransitioned.current) return
    
    if (option === 'no_problems') {
      setAnswer('hairProblems', ['no_problems'])
    } else if (option === 'ai_analyze') {
      setAnswer('hairProblems', ['ai_analyze'])
    }
    
    hasTransitioned.current = true
    

    setTransitioning(true)
    nextStep()
    router.push(`/quiz/${currentStep + 1}`)
  }

  const handleSkip = () => {
    if (hasTransitioned.current) return
    
    setAnswer('hairProblems', [])
    hasTransitioned.current = true
    

    setTransitioning(true)
    nextStep()
    router.push(`/quiz/${currentStep + 1}`)
  }


  useEffect(() => {
    hasTransitioned.current = false
    
    return () => {
      hasTransitioned.current = false
    }
  }, [])

  return (
    <OnboardingStep
      title="Do you have any of these hair problems?"
      subtitle="Select all that apply."
      condition={answers.hairProblems.length > 0}
      skip={true}
      skipText="Skip"
      onSkip={handleSkip}
    >
      <div className="flex flex-wrap gap-2 py-1">
        {problems.map((problem) => (
          <button
            key={problem}
            onClick={() => handleToggleProblem(problem)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              answers.hairProblems.includes(problem)
                ? 'border-primary bg-primary bg-opacity-10 text-primary'
                : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
            }`}
          >
            {problem}
          </button>
        ))}
        
        {}
        <button
          onClick={() => handleOptionSelect('no_problems')}
          className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
            answers.hairProblems.includes('no_problems')
              ? 'border-primary bg-primary bg-opacity-10 text-primary'
              : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
          }`}
        >
          No problems
        </button>

        {}
        <button
          onClick={() => handleOptionSelect('ai_analyze')}
          className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
            answers.hairProblems.includes('ai_analyze')
              ? 'border-primary bg-primary bg-opacity-10 text-primary'
              : 'border-border-subtle/60 hover:border-primary/40 text-purple-500'
          }`}
        >
          Let AI Analyze
        </button>
      </div>
    </OnboardingStep>
  )
}

