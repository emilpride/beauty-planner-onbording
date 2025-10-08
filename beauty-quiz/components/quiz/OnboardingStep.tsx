'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

interface OnboardingStepProps {
  title: React.ReactNode
  subtitle?: string
  children: React.ReactNode
  condition?: boolean
  onNext?: () => void
  onDisabledTap?: () => void
  buttonText?: string
  skip?: boolean
  skipText?: string
  onSkip?: () => void
  centerContent?: boolean
  hideButton?: boolean
  onExitAnimation?: () => void
  onBackAnimation?: () => void
  // When true, the inner content will fill the available space between the header and footer
  // without introducing an inner scroll (children should manage their own layout to fit).
  fillContent?: boolean
  // Compact header/padding to reduce empty space on steps with dense content
  compact?: boolean
}

export default function OnboardingStep({
  title,
  subtitle,
  children,
  condition = true,
  onNext,
  onDisabledTap,
  buttonText = 'Next',
  skip = false,
  skipText = 'Skip',
  onSkip,
  centerContent = false,
  hideButton = false,
  onExitAnimation,
  onBackAnimation,
  fillContent = false,
  compact = false,
}: OnboardingStepProps) {
  const router = useRouter()
  const { nextStep, currentStep, setTransitioning } = useQuizStore()
  
  // Estimate footer height so content area can auto-size and only scroll when needed
  // Main button ~64-72px + paddings (pt-4) => ~100-110px; skip adds ~64-76px
  const footerHeightPx = hideButton
    ? (skip ? 72 : 0)
    : (skip ? 176 : 112)
  // Outer padding is p-4 (32px total vertical) or p-3 (24px) when compact
  const outerPaddingPx = compact ? 24 : 32

  const handleNext = () => {
    if (condition) {
      if (onNext) {
        onNext()
      }

      if (onExitAnimation) {
        onExitAnimation()
      }
      // Signal transition; navigation will be immediate here.
      setTransitioning(true)
      const nextStepIndex = currentStep + 1
      router.push(`/quiz/${nextStepIndex}`)
      nextStep()
    } else if (onDisabledTap) {
      onDisabledTap()
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      const nextStepIndex = currentStep + 1
      setTransitioning(true)
      router.push(`/quiz/${nextStepIndex}`)
      nextStep()
    }
  }


  return (
    <div className={`flex flex-col ${compact ? 'p-3' : 'p-4'} ${centerContent ? 'justify-center' : ''}`}>
      <div
        className={`${fillContent ? 'overflow-hidden flex flex-col' : 'overflow-y-auto scrollbar-hide'}`}
        style={{
          // Cap or set the text area so it neatly fits under the character and above the footer
          // Use 100svh to avoid iOS dynamic toolbar hiding the footer
          ...(fillContent
            ? { height: `calc(100svh - var(--card-top, 42dvh) - var(--footer-h, ${footerHeightPx}px) - var(--safe-bottom, 0px) - ${outerPaddingPx}px)` }
            : { maxHeight: `calc(100svh - var(--card-top, 42dvh) - var(--footer-h, ${footerHeightPx}px) - var(--safe-bottom, 0px) - ${outerPaddingPx}px)` }),
          ['--footer-h' as any]: `${footerHeightPx}px`,
          // Safe area for devices with a home indicator (iOS)
          ['--safe-bottom' as any]: 'env(safe-area-inset-bottom)'
        }}
      >
  <div className={`${compact ? 'space-y-0.5 mb-2' : 'space-y-1 mb-3'} mt-0 min-w-0`}>
          <h1
            className="font-bold text-text-primary leading-tight break-words whitespace-pre-line [overflow-wrap:anywhere] [hyphens:auto] [-webkit-hyphens:auto] text-lg sm:text-xl"
            style={{
              // Provide graceful scaling on extra narrow devices
              fontSize: compact ? 'clamp(0.95rem, 4vw, 1.15rem)' : 'clamp(1rem, 4.5vw, 1.25rem)'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`${compact ? 'text-[12px] leading-snug' : 'text-sm leading-relaxed'} font-medium text-text-secondary whitespace-pre-line m-0 break-words [overflow-wrap:anywhere]`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`m-0 p-0 ${fillContent ? 'flex-1' : ''}`}>{children}</div>
      </div>

      {!hideButton && (
        <div
          className="pt-4 flex-shrink-0 bg-surface border-t border-border-subtle relative z-30"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <button
            onClick={handleNext}
            disabled={!condition}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
              condition
                ? 'bg-primary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-text-secondary cursor-not-allowed'
            }`}
          >
            {buttonText}
          </button>

          {skip && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-3 px-6 text-text-secondary font-medium hover:text-text-primary transition-colors duration-200"
            >
              {skipText}
            </button>
          )}
        </div>
      )}

      {hideButton && skip && (
        <div
          className={`${centerContent ? 'pt-6' : 'mt-auto pt-4'} bg-surface`}
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <button
            onClick={handleSkip}
            className="w-full py-3 px-6 text-text-secondary font-medium hover:text-text-primary transition-colors duration-200"
          >
            {skipText}
          </button>
        </div>
      )}
    </div>
  )
}
