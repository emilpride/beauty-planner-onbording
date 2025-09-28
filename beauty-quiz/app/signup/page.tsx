'use client'

import SignUpStep from '@/components/post-quiz/SignUpStep'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <SignUpStep />
      </div>
    </div>
  )
}
