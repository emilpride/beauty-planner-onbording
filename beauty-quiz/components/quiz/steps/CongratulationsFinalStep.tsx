'use client'

import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'

const benefits = [
  "Personalized daily routines",
  "AI-powered recommendations", 
  "Progress tracking & analytics",
  "24/7 expert support",
  "Exclusive premium content",
  "Advanced skin & hair analysis"
]

// Fixed positions and animations to prevent hydration mismatch
const confettiPositions = [
  { left: 6.5, top: 53, delay: 1.6, duration: 3.3 },
  { left: 1.3, top: 55.4, delay: 1.8, duration: 3.8 },
  { left: 7.2, top: 60.7, delay: 1.4, duration: 3.1 },
  { left: 13.7, top: 55.2, delay: 2.1, duration: 2.9 },
  { left: 10.1, top: 58.3, delay: 1.9, duration: 3.5 },
  { left: 4.8, top: 62.1, delay: 2.3, duration: 2.7 },
  { left: 9.3, top: 64.5, delay: 1.7, duration: 3.2 },
  { left: 15.2, top: 59.8, delay: 2.0, duration: 2.8 },
  { left: 3.1, top: 57.9, delay: 1.5, duration: 3.4 },
  { left: 11.6, top: 61.2, delay: 2.2, duration: 2.6 },
  { left: 8.4, top: 56.7, delay: 1.8, duration: 3.0 },
  { left: 5.7, top: 63.8, delay: 2.4, duration: 2.9 },
  { left: 12.9, top: 58.1, delay: 1.6, duration: 3.3 },
  { left: 2.5, top: 60.3, delay: 2.1, duration: 2.7 },
  { left: 14.1, top: 62.9, delay: 1.9, duration: 3.1 }
]

export default function CongratulationsFinalStep() {
  const { answers } = useQuizStore()
  const [visibleBenefits, setVisibleBenefits] = useState<number[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Animate benefits appearing one by one
    benefits.forEach((_, index) => {
      setTimeout(() => {
        setVisibleBenefits(prev => [...prev, index])
      }, (index + 1) * 500)
    })
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      {/* Confetti Animation */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPositions.map((position, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
                animationDelay: `${position.delay}s`,
                animationDuration: `${position.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Congratulations Text */}
        <h1 className="text-3xl font-bold text-[#5C4688] mb-4">
          Congratulations! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          You've successfully completed your beauty assessment and created your personalized routine!
        </p>

        {/* Unlocked Benefits */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-[#5C4688] mb-4">
            🎁 You've Unlocked:
          </h2>
          
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                  visibleBenefits.includes(index)
                    ? 'bg-green-50 border-l-4 border-green-500 opacity-100 transform translate-x-0'
                    : 'bg-gray-50 opacity-0 transform -translate-x-4'
                }`}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h3>
          <p className="text-purple-100 mb-4">
            Your personalized beauty routine is waiting for you!
          </p>
          <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-xl hover:bg-purple-50 transition-colors">
            Access Your Routine
          </button>
        </div>

        {/* Assistant Message */}
        {answers.assistant && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              💬 Your AI assistant is ready to guide you through your personalized routine!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}