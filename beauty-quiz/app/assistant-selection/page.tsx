'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
// Remove LoadingAnimation import as it's now on home page

export default function AssistantSelectionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  // Remove loading animation state as it's now on home page
  const [selectedAssistant, setSelectedAssistant] = useState<1 | 2>(1)
  const { hydrate, setAnswer } = useQuizStore()

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
    <div className="min-h-screen bg-light-container flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Choose your AI Assistant</h1>
        <p className="text-text-secondary mb-8">Personalize your journey from the start.</p>
        
        <div className="flex justify-center space-x-6 mb-8">
          <div 
            onClick={() => setSelectedAssistant(1)}
            className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 1 ? 'transform scale-105' : 'hover:scale-102 opacity-70'}`}
          >
            <div className={`w-32 h-32 rounded-full p-1 transition-all duration-300 ${selectedAssistant === 1 ? 'bg-primary' : 'bg-gray-200'}`}>
              <Image src="/images/content/choose_assistant_max.png" alt="Max" width={128} height={128} className="rounded-full" />
            </div>
            <p className="text-lg font-semibold text-text-primary mt-8">Max</p>
          </div>
          
          <div 
            onClick={() => setSelectedAssistant(2)}
            className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 2 ? 'transform scale-105' : 'hover:scale-102 opacity-70'}`}
          >
            <div className={`w-32 h-32 rounded-full p-1 transition-all duration-300 ${selectedAssistant === 2 ? 'bg-primary' : 'bg-gray-200'}`}>
               <Image src="/images/content/choose_assistant_ellie.png" alt="Ellie" width={128} height={128} className="rounded-full" />
            </div>
            <p className="text-lg font-semibold text-text-primary mt-8">Ellie</p>
          </div>
        </div>

        <button
          onClick={startQuiz}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : "Continue"}
        </button>
      </div>
    </div>
  )
}

