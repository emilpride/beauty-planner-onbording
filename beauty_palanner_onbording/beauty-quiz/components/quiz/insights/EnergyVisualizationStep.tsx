'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const getEnergyLevel = (sleepHours: string, energyLevel: number) => {
  const sleepNum = parseInt(sleepHours?.replace(/[^\d]/g, '') || '7')
  
  if (sleepNum >= 8 && energyLevel >= 4) {
    return {
      level: 'high',
      title: 'Peak Energy Flow',
      description: 'Your energy levels are perfectly aligned!',
      color: 'from-emerald-400 to-green-500',
      pulse: 'strong',
      message: 'Your sleep and energy are in perfect sync. We\'ll build on this momentum with energizing routines.'
    }
  } else if (sleepNum >= 7 && energyLevel >= 3) {
    return {
      level: 'good',
      title: 'Steady Energy',
      description: 'Good energy foundation to build upon.',
      color: 'from-blue-400 to-cyan-500',
      pulse: 'moderate',
      message: 'Solid energy base! We\'ll optimize your routines to maximize your natural rhythm.'
    }
  } else if (sleepNum < 6 || energyLevel <= 2) {
    return {
      level: 'low',
      title: 'Energy Recharge Mode',
      description: 'Time to focus on energy restoration.',
      color: 'from-orange-400 to-red-500',
      pulse: 'gentle',
      message: 'Let\'s prioritize gentle, restorative practices to rebuild your energy foundation.'
    }
  } else {
    return {
      level: 'moderate',
      title: 'Balanced Energy',
      description: 'Your energy has room to grow.',
      color: 'from-yellow-400 to-orange-500',
      pulse: 'steady',
      message: 'We\'ll create a personalized energy optimization plan tailored to your needs.'
    }
  }
}

export default function EnergyVisualizationStep() {
  const { answers } = useQuizStore()
  
  const energyProfile = useMemo(() => 
    getEnergyLevel(answers.SleepDuration, answers.EnergyLevel || 3), 
    [answers.SleepDuration, answers.EnergyLevel]
  )

  const pulseVariants = {
    strong: {
      scale: [1, 1.3, 1],
      opacity: [0.4, 0.8, 0.4],
      duration: 1.5
    },
    moderate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      duration: 2
    },
    gentle: {
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.4, 0.2],
      duration: 3
    },
    steady: {
      scale: [1, 1.15, 1],
      opacity: [0.3, 0.5, 0.3],
      duration: 2.5
    }
  }

  return (
    <OnboardingStep
      title="Energy Analysis"
      subtitle={energyProfile.title}
      buttonText="Continue"
      condition
    >
      <div className="space-y-6 text-left">
        {/* Energy Visualization */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-8 shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Central Energy Circle */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Outer Pulse Ring */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${energyProfile.color} opacity-30`}
                animate={pulseVariants[energyProfile.pulse as keyof typeof pulseVariants]}
                transition={{
                  duration: pulseVariants[energyProfile.pulse as keyof typeof pulseVariants].duration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: 200, height: 200, top: -100, left: -100 }}
              />
              
              {/* Middle Ring */}
              <motion.div
                className={`absolute inset-2 rounded-full bg-gradient-to-r ${energyProfile.color} opacity-50`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ width: 180, height: 180, top: -90, left: -90 }}
              />
              
              {/* Inner Core */}
              <motion.div
                className={`relative w-32 h-32 rounded-full bg-gradient-to-r ${energyProfile.color} flex items-center justify-center shadow-2xl`}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
              >
                <motion.div
                  className="text-white text-4xl font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {answers.EnergyLevel || '?'}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Energy Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              className="text-center p-4 rounded-xl bg-primary/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {answers.SleepDuration || '?'}
              </div>
              <div className="text-sm text-text-secondary">Hours Sleep</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 rounded-xl bg-primary/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {answers.EnergyLevel || '?'}/5
              </div>
              <div className="text-sm text-text-secondary">Energy Level</div>
            </motion.div>
          </div>

          {/* Energy Message */}
          <motion.p 
            className="text-center text-text-secondary leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {energyProfile.message}
          </motion.p>
        </motion.div>

        {/* Energy Flow Visualization */}
        <motion.div 
          className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 text-center">Your Energy Flow</h4>
          
          <div className="flex items-center justify-between">
            {/* Sleep */}
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-lg">
                😴
              </div>
              <span className="text-xs text-text-secondary">Sleep</span>
            </motion.div>

            {/* Energy Flow Arrows */}
            <motion.div 
              className="flex-1 flex justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${energyProfile.color}`}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Energy */}
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white text-lg">
                ⚡
              </div>
              <span className="text-xs text-text-secondary">Energy</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  )
}

