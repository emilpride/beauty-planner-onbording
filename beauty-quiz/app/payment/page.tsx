'use client'

import PricingStep from '@/components/post-quiz/PricingStep'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function PaymentPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <PricingStep />
      </div>
    </div>
  )
}
