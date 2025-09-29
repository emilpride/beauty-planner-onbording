'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'

export default function PrivacyStep() {
  return (
    <OnboardingStep
      title="We care about your privacy"
      subtitle="All the data you provide is anonymous and used only for statistical purposes. Your responses help us tailor the app to better suit your needs."
      buttonText="I Understand"
    >
      <div className="text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our privacy policy and terms of service.
        </p>
      </div>
    </OnboardingStep>
  )
}
