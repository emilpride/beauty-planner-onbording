'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import LoadingAnimation from '@/components/LoadingAnimation'

export default function Home() {
  const router = useRouter()
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)

  const handleLoadingComplete = () => {
    setShowLoadingAnimation(false)
    router.push('/theme-selection')
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
      <div className="relative z-10 min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

