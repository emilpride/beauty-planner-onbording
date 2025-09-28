'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import AnimatedBackground from '@/components/AnimatedBackground'
// Remove LoadingAnimation import as it's now on home page

export default function AssistantSelectionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  // Remove loading animation state as it's now on home page
  const [selectedAssistant, setSelectedAssistant] = useState<1 | 2>(1)
  const { hydrate, setAnswer } = useQuizStore()

  const animationStyles = `
    @keyframes moderate-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.75;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
    }
    .animate-moderate-pulse {
      animation: moderate-pulse 2.5s infinite ease-in-out;
    }
  `

  useEffect(() => {
    hydrate()
    setIsHydrated(true)
  }, [hydrate])

  const startQuiz = () => {
    setIsLoading(true)
    setAnswer('assistant', selectedAssistant)
    router.push('/assistant-welcome')
  }

  // Remove handleLoadingComplete as loading is now on home page

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-light-container flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Remove loading animation check as it's now on home page

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 relative z-10">
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.push('/welcome')}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-text-primary"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">Choose your AI Assistant</h1>
          <p className="text-text-secondary mb-8">Personalize your journey from the start.</p>
          
          <div className="flex justify-center space-x-6 mb-8">
            <div 
              onClick={() => setSelectedAssistant(1)}
              className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 1 ? 'transform scale-105' : 'hover:scale-102 opacity-70'}`}
            >
              <div className="w-32 h-32 relative flex items-center justify-center">
                {/* Blurred background circle */}
                {selectedAssistant === 1 && (
                  <div className="absolute inset-0 bg-primary rounded-full blur-2xl animate-moderate-pulse"></div>
                )}
                {/* Character Image container */}
                <div className={`w-full h-full rounded-full p-1 transition-colors duration-300 relative ${selectedAssistant === 1 ? 'bg-primary/30' : 'bg-gray-200'}`}>
                  <Image src="/images/content/choose_assistant_max.png" alt="Max" width={128} height={128} className="rounded-full" />
                </div>
              </div>
              <p className="text-lg font-semibold text-text-primary mt-8">Max</p>
            </div>
            
            <div 
              onClick={() => setSelectedAssistant(2)}
              className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 2 ? 'transform scale-105' : 'hover:scale-102 opacity-70'}`}
            >
              <div className="w-32 h-32 relative flex items-center justify-center">
                {/* Blurred background circle */}
                {selectedAssistant === 2 && (
                  <div className="absolute inset-0 bg-[#EC4899] rounded-full blur-2xl animate-moderate-pulse"></div>
                )}
                {/* Character Image container */}
                <div className={`w-full h-full rounded-full p-1 transition-colors duration-300 relative ${selectedAssistant === 2 ? 'bg-[#EC4899]/30' : 'bg-gray-200'}`}>
                   <Image src="/images/content/choose_assistant_ellie.png" alt="Ellie" width={128} height={128} className="rounded-full" />
                </div>
              </div>
              <p className="text-lg font-semibold text-text-primary mt-8">Ellie</p>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : "Continue"}
          </button>
        </div>
      </div>
    </>
  )
}

