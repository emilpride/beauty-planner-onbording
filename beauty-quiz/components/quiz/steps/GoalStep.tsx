'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

const goals = [
  { text: "Build Healthy Activities", image: '/icons/misc/goal_img_1.png' },
  { text: "Boost Productivity", image: '/icons/misc/goal_img_2.png' },
  { text: "Achieve Personal Goals", image: '/icons/misc/goal_img_3.png' },
  { text: "Manage Stress & Anxiety", image: '/icons/misc/goal_img_4.png' },
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
      title="What Do You Want To Achieve With Beauty Mirror?"
      subtitle="Your aspirations guide our efforts to support and empower you on your journey. Select all that apply."
      condition={answers.goals.length > 0}
    >
      <div className="space-y-4 px-4">
        {goals.map((goal) => (
          <button
            key={goal.text}
            onClick={() => handleToggleGoal(goal.text)}
            className={`
              w-full p-4 rounded-xl flex items-center transition-all duration-200 text-left border-2
              ${
                answers.goals.includes(goal.text)
                  ? 'border-primary bg-white shadow-sm'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            <Image src={goal.image} alt={goal.text} width={32} height={32} className="mr-4" />
            <span className="text-base font-semibold text-text-primary">{goal.text}</span>
          </button>
        ))}
      </div>
    </OnboardingStep>
  )
}
