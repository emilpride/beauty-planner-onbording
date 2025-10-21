'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore, GoalItem } from '@/store/quizStore'

const personalityTypes = {
  'beauty-focused': {
    title: 'Beauty Enthusiast',
    description: 'You prioritize looking and feeling your best every day.',
    color: 'from-pink-400/60 to-rose-300/40',
    icon: '✨',
    traits: ['Detail-oriented', 'Self-care focused', 'Aesthetic-driven']
  },
  'health-focused': {
    title: 'Wellness Warrior',
    description: 'Your main goal is overall health and vitality.',
    color: 'from-emerald-400/60 to-teal-300/40',
    icon: '💪',
    traits: ['Health-conscious', 'Balanced approach', 'Long-term thinking']
  },
  'performance-focused': {
    title: 'Performance Seeker',
    description: 'You want to optimize your body for peak performance.',
    color: 'from-blue-400/60 to-indigo-300/40',
    icon: '🚀',
    traits: ['Goal-oriented', 'Results-driven', 'High-energy']
  },
  'balance-focused': {
    title: 'Harmony Seeker',
    description: 'You value balance between all aspects of wellness.',
    color: 'from-purple-400/60 to-violet-300/40',
    icon: '⚖️',
    traits: ['Balanced', 'Holistic', 'Mindful']
  }
}

const getPersonalityType = (goals: GoalItem[] | undefined, lifestyle: string) => {
  const safeGoals = Array.isArray(goals) ? goals : []
  const goalCount = safeGoals.filter((g) => g?.isActive).length || 0

  const titleIncludes = (goal: GoalItem | undefined, term: string) => {
    if (!goal || !goal.title) return false
    return goal.title.toLowerCase().includes(term)
  }

  if (safeGoals.some((goal) => goal?.isActive && (titleIncludes(goal, 'skin') || titleIncludes(goal, 'beauty')))) {
    return personalityTypes['beauty-focused']
  }

  if (safeGoals.some((goal) => goal?.isActive && (titleIncludes(goal, 'health') || titleIncludes(goal, 'fitness')))) {
    return personalityTypes['health-focused']
  }

  if (safeGoals.some((goal) => goal?.isActive && (titleIncludes(goal, 'energy') || titleIncludes(goal, 'performance')))) {
    return personalityTypes['performance-focused']
  }

  return personalityTypes['balance-focused']
}

export default function PersonalityInsightStep() {
  const { answers } = useQuizStore()
  
  const personality = useMemo(() => 
    getPersonalityType(answers.Goals, answers.LifeStyle), 
    [answers.Goals, answers.LifeStyle]
  )

  return (
    <OnboardingStep
      title="Your Wellness Profile"
      subtitle={personality.title}
      buttonText="Continue Journey"
      condition
    >
      <div className="space-y-6 text-left">
        {/* Main Insight Card */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-8 shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated Background */}
          <motion.div
            className={`absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br ${personality.color}`}
            animate={{ 
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Pulsing Rings */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-primary/20"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="text-6xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {personality.icon}
              </motion.div>
              <div>
                <motion.h3 
                  className="text-2xl font-bold text-text-primary mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {personality.title}
                </motion.h3>
                <motion.p 
                  className="text-text-secondary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {personality.description}
                </motion.p>
              </div>
            </div>
            
            {/* Personality Traits */}
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {personality.traits.map((trait, index) => (
                <motion.span
                  key={trait}
                  className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.9 + (index * 0.1), 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {trait}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Selected Goals Preview */}
        <motion.div 
          className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4">Your Selected Goals</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {(answers.Goals || []).map((goal, index) => (
              <motion.div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + (index * 0.1), duration: 0.4 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                <span className="text-sm font-medium text-text-primary">{goal.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  )
}

