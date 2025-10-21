'use client'

import WelcomeCarousel from '@/components/WelcomeCarousel'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <WelcomeCarousel />
      </div>
    </div>
  )
}
