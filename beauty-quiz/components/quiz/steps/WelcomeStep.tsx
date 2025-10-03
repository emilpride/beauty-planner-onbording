'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

export default function WelcomeStep() {
  const { answers } = useQuizStore()
  const assistantName = answers.assistant === 2 ? 'Ellie' : 'Max'

  return (
    <OnboardingStep
      title={`Hi! I'm ${assistantName}, your personal AI assistant.`}
      subtitle={`I'm here to help you find your true beauty through the perfect balance of self-care, mental well-being, and physical health.

The information and recommendations provided by the Beauty Mirror app are for informational and educational purposes only. This app is not intended to be a substitute for professional medical advice, diagnosis, or treatment.`}
      buttonText="Let's Go"
      raiseByVh={25}
    >
      <div></div>
    </OnboardingStep>
  )
}
