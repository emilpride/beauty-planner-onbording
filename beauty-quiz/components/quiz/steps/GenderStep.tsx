'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

interface GenderStepProps {
  onExitAnimation?: () => void
  onBackAnimation?: () => void
}

export default function GenderStep({ onExitAnimation, onBackAnimation }: GenderStepProps) {
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
      onExitAnimation={onExitAnimation}
      onBackAnimation={onBackAnimation}
    >
      <div className="flex justify-center gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => setAnswer('gender', option.id as 1 | 2)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`
                w-32 h-32 rounded-full overflow-hidden 
                border-4 transition-all duration-200 p-1
                ${
                  answers.gender === option.id
                    ? option.id === 1 ? 'border-blue-400' : 'border-pink-400'
                    : 'border-transparent'
                }
              `}
            >
              <div
                className={`w-full h-full rounded-full overflow-hidden ${
                  option.id === 1 ? 'bg-blue-300' : 'bg-pink-200'
                }`}
              >
                <Image
                  src={option.image}
                  alt={option.label}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </div>
            <span className="mt-4 text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </OnboardingStep>
  )
}
