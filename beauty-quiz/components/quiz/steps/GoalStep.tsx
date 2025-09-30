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
    >
      <div className="grid grid-cols-2 gap-2 px-2">
        {goals.map((goal, index) => {
          const isSelected = answers.goals.includes(goal.text)
          return (
            <motion.button
              key={goal.text}
              onClick={() => handleToggleGoal(goal.text)}
              className={`p-3 py-4 rounded-lg flex flex-col items-center gap-2 border-2 text-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                isSelected
                  ? 'border-primary bg-surface shadow-soft'
                  : 'border-border-subtle/60 bg-surface-muted hover:border-primary/40 hover:bg-surface hover:text-text-primary'
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              <motion.div
                animate={isSelected ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Image src={goal.image} alt={goal.text} width={36} height={36} className="flex-shrink-0" />
              </motion.div>
              <motion.span 
                className={`text-xs font-semibold leading-tight ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}
                animate={isSelected ? { 
                  color: ["rgb(107 114 128)", "rgb(163 133 233)", "rgb(163 133 233)"]
                } : {}}
                transition={{ duration: 0.3 }}
              >
                {goal.text}
              </motion.span>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}


