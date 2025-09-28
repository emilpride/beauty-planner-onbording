import { Suspense } from 'react'
import PremiumIntroStep from '@/components/post-quiz/PremiumIntroStep'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function PremiumIntroPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Suspense fallback={
          <div className="min-h-screen bg-light-container flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <PremiumIntroStep />
        </Suspense>
      </div>
    </div>
  )
}
