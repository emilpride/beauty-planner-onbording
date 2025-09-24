'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'

export default function PrivacyStep() {
  return (
    <OnboardingStep
      title="We care about your privacy"
      subtitle="All the data you provide is anonymous and used only for statistical purposes. Your responses help us tailor the app to better suit your needs."
      buttonText="I Understand"
    >
      <div className="text-center text-6xl mt-8">🔒</div>
      {/* TODO: Add a clickable "Read Privacy Policy" link that opens a modal */}
    </OnboardingStep>
  )
}
