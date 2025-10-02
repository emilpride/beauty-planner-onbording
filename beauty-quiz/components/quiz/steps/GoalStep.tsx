'use client'

import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

const goals = [
  { text: 'Build Healthy Activities', image: '/icons/misc/goal_img_1.png' },
  { text: 'Boost Productivity', image: '/icons/misc/goal_img_2.png' },
  { text: 'Achieve Personal Goals', image: '/icons/misc/goal_img_3.png' },
  { text: 'Manage Stress & Anxiety', image: '/icons/misc/goal_img_4.png' },
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
      // Make more room for the grid so all selected options remain visible
      cardTopDvH={38}
      contentMaxHeightAdjust={24}
    >
      <div className="grid grid-cols-2 gap-2 px-2 pb-2">
        {goals.map((goal, index) => {
          const isSelected = answers.goals.includes(goal.text)
          return (
            <motion.button
              key={goal.text}
              onClick={() => handleToggleGoal(goal.text)}
              className={`relative p-3 py-4 rounded-lg flex flex-col items-center gap-2 border-2 text-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md text-primary'
                  : 'border-border-subtle/60 bg-surface-muted hover:border-primary/40 hover:bg-surface hover:text-text-primary'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.3
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <div className={`transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}>
                <Image src={goal.image} alt={goal.text} width={36} height={36} className="flex-shrink-0" />
              </div>
              <span 
                className={`text-xs font-semibold leading-tight transition-all duration-200 ${
                  isSelected ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {goal.text}
              </span>
            </motion.button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}


