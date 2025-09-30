'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

export default function AIResultsStep() {
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(-1) // -1 means no question
  const [answers, setAnswers] = useState<Array<'yes' | 'no'>>([])
  const router = useRouter()
  const { nextStep, currentStep } = useQuizStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const questionStops = [22, 55, 82] // when to pause and ask
  const questions = [
    'Do you smoke?',
    'Do you drink alcohol?',
    'Do you have kids?'
  ]

  const startTimer = () => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1, 100)

        // If next crosses a stop and we have remaining questions, pause
        const nextStop = questionStops[answers.length] // next expected stop index
        if (!paused && answers.length < questionStops.length && next >= nextStop) {
          // Pause exactly at the stop
          clearIntervalSafe()
          setPaused(true)
          setQuestionIndex(answers.length)
          return nextStop
        }

        if (next >= 100) {
          clearIntervalSafe()
          // Small delay for UX and then navigate
          setTimeout(() => {
            nextStep()
            // Go directly to CurrentConditionAnalysis page
            router.push('/quiz/35')
          }, 600)
          return 100
        }
        return next
      })
    }, 80)
  }

  const clearIntervalSafe = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (!paused && questionIndex === -1) {
      startTimer()
    }
    return () => clearIntervalSafe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!paused && questionIndex === -1) {
      startTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, questionIndex])

  const getAnalysisMessage = () => {
    if (progress < 20) return 'Analyzing facial geometry...'
    if (progress < 40) return 'Assessing skin tone and texture...'
    if (progress < 60) return 'Identifying hair type and condition...'
    if (progress < 80) return 'Cross-referencing with lifestyle data...'
    if (progress < 100) return 'Generating personalized recommendations...'
    return 'Your personalized plan is ready!'
  }

  const answerQuestion = (ans: 'yes' | 'no') => {
    setAnswers((prev) => [...prev, ans])
    setPaused(false)
    setQuestionIndex(-1)
    // Resume timer; the effect above will restart it
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-background p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">AI Analysis in Progress</h1>
      <p className="text-text-secondary mb-8 text-center">
        Our AI is working its magic to create your unique beauty and wellness plan.
      </p>

      <div className="w-full max-w-sm">
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center font-semibold text-primary text-lg mb-4">{progress}%</p>
        <p className="text-center text-text-secondary h-10">{getAnalysisMessage()}</p>
      </div>

      {paused && questionIndex >= 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 rounded-full border border-border-subtle/60 bg-surface/95 dark:bg-surface/90 px-3 py-2 shadow-soft backdrop-blur-sm">
            <span className="text-sm font-medium text-text-primary">{questions[questionIndex]}</span>
            <div className="flex gap-1">
              <button
                onClick={() => answerQuestion('yes')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-semibold shadow-soft hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                Yes
              </button>
              <button
                onClick={() => answerQuestion('no')}
                className="px-3 py-1.5 rounded-full bg-gray-200 text-text-primary dark:bg-white/10 dark:text-white text-sm font-semibold hover:bg-gray-300 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


