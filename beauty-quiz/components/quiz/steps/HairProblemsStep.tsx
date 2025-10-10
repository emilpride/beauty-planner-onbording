'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const problems = [
  { id: "hair-loss", title: "Hair Loss" },
  { id: "dandruff", title: "Dandruff" },
  { id: "dryness", title: "Dryness" },
  { id: "split-ends", title: "Split Ends" },
  { id: "frizz", title: "Frizz" },
  { id: "oiliness", title: "Oiliness" },
  { id: "lack-volume", title: "Lack of Volume" },
  { id: "no_problems", title: "No problems" },
  { id: "ai_analyze", title: "Let AI Analyze" }
]

export default function HairProblemsStep() {
  const { answers, setAnswer, currentStep, nextStep, setTransitioning } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleToggleProblem = (problemId: string) => {
    if (problemId === 'no_problems' || problemId === 'ai_analyze') {
      const newProblems = answers.HairProblems.map(p => ({ ...p, isActive: p.id === problemId }))
      setAnswer('HairProblems', newProblems)
    } else {
      const newProblems = answers.HairProblems.map(p => 
        p.id === problemId ? { ...p, isActive: !p.isActive } : 
        (p.id === 'no_problems' || p.id === 'ai_analyze') ? { ...p, isActive: false } : p
      )
      setAnswer('HairProblems', newProblems)
    }
  }

  const handleSkip = () => {
    if (hasTransitioned.current) return
    
    const newProblems = answers.HairProblems.map(p => ({ ...p, isActive: false }))
    setAnswer('HairProblems', newProblems)
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
      condition={answers.HairProblems?.some(p => p.isActive) ?? false}
      skip={true}
      skipText="Skip"
      onSkip={handleSkip}
    >
      <div className="flex flex-wrap gap-2 py-1">
        {problems.map((problem) => {
          const isSelected = answers.HairProblems.find(p => p.id === problem.id)?.isActive || false
          return (
            <button
              key={problem.id}
              onClick={() => handleToggleProblem(problem.id)}
              className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
                isSelected
                  ? 'border-primary bg-primary bg-opacity-10 text-primary'
                  : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              {problem.title}
            </button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}

