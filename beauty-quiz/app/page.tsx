'use client'

import { useState } from 'react'
import LoadingAnimation from '@/components/LoadingAnimation'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function Home() {
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)

  const handleLoadingComplete = () => {
    setShowLoadingAnimation(false)
    // Redirect to welcome carousel after loading
    window.location.href = '/welcome'
  }

  if (showLoadingAnimation) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <LoadingAnimation onComplete={handleLoadingComplete} duration={3000} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen bg-light-container flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}
