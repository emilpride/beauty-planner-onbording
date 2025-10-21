'use client'

import { useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'

export default function AIAnalysisIntroStep() {
  const { nextStep } = useQuizStore()

  useEffect(() => {

    const timer = setTimeout(() => {
      nextStep()
    }, 3000)

    return () => clearTimeout(timer)
  }, [nextStep])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Let me analyze your face, hair, and body
        </h1>
        <p className="text-lg text-text-secondary">
          I'll examine your photos to provide personalized recommendations
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  )
}
