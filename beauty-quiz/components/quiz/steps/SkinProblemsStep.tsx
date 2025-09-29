'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const problems = [
  "Acne", "Redness", "Blackheads", "Pores", "Wrinkles", 
  "Dark Circles", "Dryness", "Oiliness", "Dullness"
]

export default function SkinProblemsStep() {
  const { answers, setAnswer, currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleToggleProblem = (problem: string) => {
    const newProblems = answers.skinProblems.includes(problem)
      ? answers.skinProblems.filter((p) => p !== problem)
      : [...answers.skinProblems, problem]
    setAnswer('skinProblems', newProblems)
  }

  const handleOptionSelect = (option: string) => {
    if (hasTransitioned.current) return
    
    if (option === 'no_problems') {
      setAnswer('skinProblems', ['no_problems'])
    } else if (option === 'ai_analyze') {
      setAnswer('skinProblems', ['ai_analyze'])
    }
    
    hasTransitioned.current = true
    

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }

  const handleSkip = () => {
    if (hasTransitioned.current) return
    
    setAnswer('skinProblems', [])
    hasTransitioned.current = true
    

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }


  useEffect(() => {
    hasTransitioned.current = false
    
    return () => {
      hasTransitioned.current = false
    }
  }, [])

  return (
    <OnboardingStep
      title="Do you have any of these skin problems?"
      subtitle="Select all that apply."
      condition={answers.skinProblems.length > 0}
      skip={true}
      skipText="Skip"
      onSkip={handleSkip}
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
        
        {}
        <button
          onClick={() => handleOptionSelect('no_problems')}
          className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
            answers.skinProblems.includes('no_problems')
              ? 'border-primary bg-primary bg-opacity-10 text-primary'
              : 'border-gray-300 hover:border-primary text-text-primary'
          }`}
        >
          No problems
        </button>

        {}
        <button
          onClick={() => handleOptionSelect('ai_analyze')}
          className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
            answers.skinProblems.includes('ai_analyze')
              ? 'border-primary bg-primary bg-opacity-10 text-primary'
              : 'border-gray-300 hover:border-primary text-purple-500'
          }`}
        >
          Let AI Analyze
        </button>
      </div>
    </OnboardingStep>
  )
}

