'use client'

import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

const goals = [
  { id: 'healthy-activities', text: 'Build Healthy Activities', image: '/icons/misc/goal_img_1.png' },
  { id: 'boost-productivity', text: 'Boost Productivity', image: '/icons/misc/goal_img_2.png' },
  { id: 'personal-goals', text: 'Achieve Personal Goals', image: '/icons/misc/goal_img_3.png' },
  { id: 'manage-stress', text: 'Manage Stress & Anxiety', image: '/icons/misc/goal_img_4.png' },
  // Added extra options to nicely fill the grid without scroll
  { id: 'increase-longevity', text: 'Increase Longevity', image: '/icons/goals/longevity.png' },
  { id: 'reduce-biological-age', text: 'Reduce Biological Age', image: '/icons/goals/reduce biological age.png' },
  { id: 'improve-wellness-score', text: 'Improve Wellness Score', image: '/icons/goals/impruve wellness score.png' },
  { id: 'reduce-procrastination', text: 'Reduce Procrastination', image: '/icons/goals/Reduce Procrastination.png' },
]

export default function GoalStep() {
  const { answers, setAnswer } = useQuizStore()

  const handleToggleGoal = (goalId: string) => {
    const newGoals = answers.Goals.map(g => 
      g.id === goalId ? { ...g, isActive: !g.isActive } : g
    )
    setAnswer('Goals', newGoals)
  }

  return (
    <OnboardingStep
      title="What Do You Want To Achieve With Beauty Mirror?"
      subtitle="Your aspirations guide our efforts to support and empower you on your journey. Select all that apply."
      condition={answers.Goals?.some(g => g.isActive) ?? false}
      fillContent
      compact
    >
  {/* Fill available vertical space under the header and above the footer without scrolling, slightly more compact */}
  <div className="grid grid-cols-2 grid-rows-4 auto-rows-fr h-full gap-[6px] px-2 pb-2">
        {goals.map((goal, index) => {
          const isSelected = answers.Goals.find(g => g.id === goal.id)?.isActive || false
          return (
            <motion.button
              key={goal.text}
              onClick={() => handleToggleGoal(goal.id)}
              className={`relative px-3 py-3 rounded-lg h-full flex flex-col items-center justify-center gap-1.5 border-2 text-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
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
                <Image src={encodeURI(goal.image)} alt={goal.text} width={32} height={32} className="flex-shrink-0" />
              </div>
              <span 
                className={`text-[11px] sm:text-xs font-semibold leading-tight transition-all duration-200 ${
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


