'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const options = [
  { id: 'great', label: 'Great', emoji: '/icons/emojis/great_emoji.png' },
  { id: 'good', label: 'Good', emoji: '/icons/emojis/good_emoji.png' },
  { id: 'okay', label: 'Okay', emoji: '/icons/emojis/okay_emoji.png' },
  { id: 'bad', label: 'Bad', emoji: '/icons/emojis/bad_emoji.png' },
  { id: 'terrible', label: 'Terrible', emoji: '/icons/emojis/not_good_emoji.png' },
]

export default function MoodStep() {
  const { answers, setAnswer, currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (moodId: string) => {
    if (hasTransitioned.current) return

    setAnswer('mood', moodId as any)
    hasTransitioned.current = true

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }

  useEffect(() => {
    setAnswer('mood', '')
    hasTransitioned.current = false

    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title="How are you feeling today?"
      subtitle="Your mood can be an important indicator of your overall well-being."
      condition={answers.mood !== ''}
      hideButton={true}
    >
      <div className="flex justify-around items-center py-2">
        {options.map((option) => {
          const isSelected = answers.mood === option.id
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`flex flex-col items-center space-y-2 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                isSelected
                  ? 'scale-110 bg-primary/15 shadow-soft'
                  : 'opacity-70 bg-surface/70 hover:opacity-100 hover:bg-surface-muted'
              }`}
            >
              <div className="w-12 h-12 relative">
                <Image
                  src={option.emoji}
                  alt={option.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}
