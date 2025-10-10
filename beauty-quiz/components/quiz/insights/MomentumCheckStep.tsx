'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore, ActivityItem, DietItem } from '@/store/quizStore'

const getMomentumProfile = (activities: ActivityItem[], diet: DietItem[], mood: string) => {
  const activityCount = activities?.filter(a => a.isActive).length || 0
  const dietCount = diet?.filter(d => d.isActive).length || 0
  
  let momentumLevel = 'balanced'
  let title = 'Balanced Momentum'
  let description = 'Steady progress with room for growth'
  let color = 'from-blue-400/60 to-cyan-300/40'
  let icon = '⚖️'
  let score = 6
  
  if (activityCount >= 4 && dietCount >= 3) {
    momentumLevel = 'high'
    title = 'Momentum Master'
    description = 'You\'re firing on all cylinders!'
    color = 'from-emerald-400/60 to-green-300/40'
    icon = '🚀'
    score = 9
  } else if (activityCount <= 1 && dietCount <= 1) {
    momentumLevel = 'starting'
    title = 'Fresh Start'
    description = 'Ready to build momentum from the ground up'
    color = 'from-orange-400/60 to-yellow-300/40'
    icon = '🌱'
    score = 3
  } else if (activityCount >= 3 && dietCount <= 1) {
    momentumLevel = 'active'
    title = 'Movement Focused'
    description = 'Great activity level, let\'s add nutrition'
    color = 'from-purple-400/60 to-indigo-300/40'
    icon = '💪'
    score = 7
  } else if (activityCount <= 1 && dietCount >= 3) {
    momentumLevel = 'nutrition'
    title = 'Nutrition First'
    description = 'Solid nutrition foundation, ready for movement'
    color = 'from-rose-400/60 to-pink-300/40'
    icon = '🥗'
    score = 6
  }

  const moodMessages = {
    great: 'Your positive energy is contagious!',
    good: 'Steady and optimistic - perfect for building habits.',
    okay: 'Neutral energy - we\'ll create gentle momentum boosts.',
    bad: 'We\'ll focus on small wins to lift your spirits.',
    terrible: 'Gentle care first - we\'ll rebuild your energy slowly.'
  }

  return {
    level: momentumLevel,
    title,
    description,
    color,
    icon,
    score,
    moodMessage: moodMessages[mood as keyof typeof moodMessages] || moodMessages.okay,
    activityCount,
    dietCount
  }
}

export default function MomentumCheckStep() {
  const { answers } = useQuizStore()
  
  const momentumProfile = useMemo(() => 
    getMomentumProfile(
      answers.PhysicalActivities || [], 
      answers.Diet || [], 
      answers.Mood || 'okay'
    ), 
    [answers.PhysicalActivities, answers.Diet, answers.Mood]
  )

  return (
    <OnboardingStep
      title="Momentum Check"
      subtitle={momentumProfile.title}
      buttonText="Keep Moving"
      condition
    >
      <div className="space-y-6 text-left">
        {/* Main Momentum Card */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-8 shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated Background */}
          <motion.div
            className={`absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br ${momentumProfile.color}`}
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
          
          {/* Momentum Pulse Lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-20 bg-primary/40 rounded-full"
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              style={{
                left: `${15 + i * 10}%`,
                top: '50%',
                transformOrigin: 'center'
              }}
            />
          ))}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
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
                  {momentumProfile.icon}
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-2xl font-bold text-text-primary mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {momentumProfile.title}
                  </motion.h3>
                  <motion.p 
                    className="text-text-secondary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {momentumProfile.description}
                  </motion.p>
                </div>
              </div>
              
              {/* Momentum Score */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.6, type: "spring", stiffness: 200 }}
              >
                <div className="text-4xl font-bold text-primary mb-1">
                  {momentumProfile.score}/10
                </div>
                <div className="text-sm text-text-secondary">Momentum Score</div>
              </motion.div>
            </div>
            
            {/* Mood Message */}
            <motion.p 
              className="text-center text-text-secondary leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {momentumProfile.moodMessage}
            </motion.p>
          </div>
        </motion.div>

        {/* Activity & Diet Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Activities */}
          <motion.div 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                🏃‍♀️
              </motion.div>
              <div>
                <h4 className="text-lg font-semibold text-text-primary">Activities</h4>
                <p className="text-sm text-text-secondary">{momentumProfile.activityCount} selected</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(answers.PhysicalActivities || []).slice(0, 4).map((activity, index) => (
                  <motion.span
                    key={activity.id}
                    className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 1.3 + (index * 0.1), 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {activity.title.replace(/_/g, ' ')}
                  </motion.span>
                ))}
                {(answers.PhysicalActivities || []).length > 4 && (
                  <span className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium">
                    +{(answers.PhysicalActivities || []).length - 4} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Diet */}
          <motion.div 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl"
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                🥗
              </motion.div>
              <div>
                <h4 className="text-lg font-semibold text-text-primary">Diet</h4>
                <p className="text-sm text-text-secondary">{momentumProfile.dietCount} selected</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(answers.Diet || []).slice(0, 4).map((item, index) => (
                  <motion.span
                    key={item.id}
                    className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 1.4 + (index * 0.1), 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {item.title.replace(/_/g, ' ')}
                  </motion.span>
                ))}
                {(answers.Diet || []).length > 4 && (
                  <span className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium">
                    +{(answers.Diet || []).length - 4} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Momentum Visualization */}
        <motion.div 
          className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 text-center">Your Momentum Flow</h4>
          
          <div className="flex items-center justify-between">
            {/* Starting Point */}
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
                🎯
              </div>
              <span className="text-xs text-text-secondary">Goals</span>
            </motion.div>

            {/* Momentum Flow */}
            <motion.div 
              className="flex-1 flex justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${momentumProfile.color}`}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* End Point */}
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg">
                ✨
              </div>
              <span className="text-xs text-text-secondary">Results</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  )
}

