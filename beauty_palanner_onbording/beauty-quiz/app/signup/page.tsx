'use client'

import SignUpStep from '@/components/post-quiz/SignUpStep'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function SignUpPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' as any }}>
      <AnimatedBackground />
      <div className="relative z-10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 12px, 12px)' }}>
        <SignUpStep />
      </div>
    </div>
  )
}
