'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

export default function GenderStep() {
  const { answers, setAnswer } = useQuizStore()

  const options = [
    { id: 1, label: 'Male', image: '/images/on_boarding_images/gender_male.png' },
    { id: 2, label: 'Female', image: '/images/on_boarding_images/gender_female.png' },
  ]

  return (
    <OnboardingStep
      title="Select Your Gender"
      subtitle="Let us know a bit about you!"
      condition={answers.gender !== 0}
    >
      <div className="flex justify-center gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => setAnswer('gender', option.id as 1 | 2)}
            className={`flex flex-col items-center cursor-pointer p-2 rounded-2xl transition-all duration-200 ${
              answers.gender === option.id
                ? 'bg-primary bg-opacity-20'
                : ''
            }`}
          >
            <div
              className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-200 ${
                answers.gender === option.id
                  ? 'border-primary'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={option.image}
                alt={option.label}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-4 text-lg font-semibold text-text-primary">
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </OnboardingStep>
  )
}
