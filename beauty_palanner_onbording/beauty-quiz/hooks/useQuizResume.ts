import { useEffect, useState } from 'react'
import { useQuizStore } from '@/store/quizStore'

export interface QuizResumeNotification {
  show: boolean
  stepsSaved: number
  progressText: string
}

/**
 * Hook to detect if quiz has been resumed from previous session
 * and provide user feedback about restored progress
 */
export function useQuizResume() {
  const [notification, setNotification] = useState<QuizResumeNotification>({
    show: false,
    stepsSaved: 0,
    progressText: '',
  })
  const [hasShown, setHasShown] = useState(false)

  const { currentStep, answers } = useQuizStore()

  useEffect(() => {
    // Only show notification once per session
    if (hasShown) return undefined

    // Check if there's persisted data and we're not on step 0 (first time)
    if (typeof window === 'undefined') return undefined

    try {
      const sessionFlagKey = 'beauty-quiz-resume-notice-shown-v1'
      // If we already showed it in this browser session, skip
      if (window.sessionStorage.getItem(sessionFlagKey) === '1') {
        setHasShown(true)
        return undefined
      }

      const stored = window.localStorage.getItem('beauty-quiz-storage-v2')
      if (!stored) {
        // No persisted data
        setHasShown(true)
        return undefined
      }

      const parsed = JSON.parse(stored)
      const persistedStep = parsed?.state?.currentStep ?? 0
      const persistedAnswers = parsed?.state?.answers

      // If user has made progress beyond first step, show resume notification
      // Also ensure we only show once per session and avoid repeating on every route change
      // Optionally, require that persisted progress is ahead of the current in-memory step
      const hasSomeAnswers = !!(persistedAnswers && Object.keys(persistedAnswers).length > 0)
      const shouldShow = persistedStep > 0 && hasSomeAnswers
      if (shouldShow) {
        const totalSteps = 33 // Match the totalSteps from store
        const progressPercent = Math.round((persistedStep / totalSteps) * 100)
        const stepText = persistedStep === 1 ? 'step' : 'steps'

        setNotification({
          show: true,
          stepsSaved: persistedStep,
          progressText: `Your progress from your last visit has been restored (${persistedStep} ${stepText} completed, ${progressPercent}% done)`,
        })

        setHasShown(true)
        // Mark as shown for this browser session
        try { window.sessionStorage.setItem(sessionFlagKey, '1') } catch {}

        // Auto-hide notification after 6 seconds
        const timeout = setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }))
        }, 6000)

        return () => clearTimeout(timeout)
      }

      setHasShown(true)
    } catch (error) {
      console.warn('Error checking quiz resume state:', error)
      setHasShown(true)
    }
    return undefined
  }, [hasShown])

  const dismiss = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  return { notification, dismiss }
}
