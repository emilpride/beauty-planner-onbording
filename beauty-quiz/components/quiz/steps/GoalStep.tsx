'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

const goals = [
  { text: "Skin", image: '/icons/misc/goal_img_1.png' },
  { text: "Hair", image: '/icons/misc/goal_img_2.png' },
  { text: "Well-being", image: '/icons/misc/goal_img_3.png' },
  { text: "Body", image: '/icons/misc/goal_img_4.png' },
]

export default function GoalStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleGoal = (goal: string) => {
    const newGoals = answers.goals.includes(goal)
      ? answers.goals.filter((g) => g !== goal)
      : [...answers.goals, goal]
    setAnswer('goals', newGoals)
  }

  return (
    <OnboardingStep
      title="What do you want to achieve with Beauty Mirror?"
      subtitle="Your aspirations guide our efforts to support and empower you on your journey. Select all that apply."
      condition={answers.goals.length > 0}
    >
      <div className="space-y-4">
        {goals.map((goal) => (
          <button
            key={goal.text}
            onClick={() => handleToggleGoal(goal.text)}
            className={`w-full p-4 border-2 rounded-xl flex items-center transition-all duration-200 ${
              answers.goals.includes(goal.text)
                ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <Image src={goal.image} alt={goal.text} width={40} height={40} className="mr-4" />
            <span className="text-lg font-semibold text-text-primary">{goal.text}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}
