'use client'

import { useEffect, useState } from 'react'

export default function AIResultsStep() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 80) // Adjust timing for a smooth feel over ~8 seconds

    return () => clearInterval(timer)
  }, [])

  const getAnalysisMessage = () => {
    if (progress < 20) return "Analyzing facial geometry..."
    if (progress < 40) return "Assessing skin tone and texture..."
    if (progress < 60) return "Identifying hair type and condition..."
    if (progress < 80) return "Cross-referencing with lifestyle data..."
    if (progress < 100) return "Generating personalized recommendations..."
    return "Your personalized plan is ready!"
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-light-container p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">
        AI Analysis in Progress
      </h1>
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
        <p className="text-center font-semibold text-primary text-lg mb-4">
          {progress}%
        </p>
        <p className="text-center text-text-secondary h-10">
          {getAnalysisMessage()}
        </p>
      </div>

      {progress >= 100 && (
        <button
          // onClick={() => router.push('/plan')} // This will be the next step after the quiz
          className="mt-8 px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg animate-pulse"
        >
          View My Plan
        </button>
      )}
    </div>
  )
}


