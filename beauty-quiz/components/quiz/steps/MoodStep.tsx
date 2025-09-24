'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const options = [
  { id: 'great', label: 'Great', icon: '😄' },
  { id: 'good', label: 'Good', icon: '😊' },
  { id: 'okay', label: 'Okay', icon: '😐' },
  { id: 'bad', label: 'Bad', icon: '😟' },
  { id: 'terrible', label: 'Terrible', icon: '😢' },
]

export default function MoodStep() {
  const { answers, setAnswer } = useQuizStore()

  return (
    <OnboardingStep
      title="How are you feeling today?"
      subtitle="Your mood can be an important indicator of your overall well-being."
      condition={answers.mood !== ''}
    >
      <div className="flex justify-around items-center py-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setAnswer('mood', option.id as any)}
            className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-all duration-200 ${
              answers.mood === option.id ? 'transform scale-125' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-5xl">{option.icon}</span>
            <span className={`font-semibold ${answers.mood === option.id ? 'text-primary' : 'text-text-secondary'}`}>{option.label}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}


