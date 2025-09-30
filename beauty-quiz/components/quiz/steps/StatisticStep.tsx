'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'

export default function StatisticStep() {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    // Animate percentage from 0 to 87
    const timer = setTimeout(() => {
      let current = 0
      const increment = 87 / 60 // 60 frames for smooth animation
      const interval = setInterval(() => {
        current += increment
        if (current >= 87) {
          setAnimatedPercentage(87)
          clearInterval(interval)
          setShowChart(true)
        } else {
          setAnimatedPercentage(Math.floor(current))
        }
      }, 16) // ~60fps

      return () => clearInterval(interval)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <OnboardingStep
      title="87% of our users see results within the first week!"
      subtitle="You're on the right path — and your transformation could start even faster than you think. Let's continue building your personalized plan to achieve amazing results!"
      buttonText="Interesting!"
    >
      <div className="flex flex-col items-center space-y-8 py-8">
        {/* Animated Percentage Circle */}
        <motion.div
          className="relative w-48 h-48 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
        >
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/30" />
          
          {/* Animated Progress Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-8 border-transparent"
            style={{
              background: `conic-gradient(from 0deg, #A385E9 0deg, #A385E9 ${(animatedPercentage / 100) * 360}deg, #E5E7EB ${(animatedPercentage / 100) * 360}deg, #E5E7EB 360deg)`,
              mask: 'radial-gradient(circle, transparent 60%, black 60%)',
              WebkitMask: 'radial-gradient(circle, transparent 60%, black 60%)'
            }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Percentage Text */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            <motion.div
              className="text-6xl font-bold text-primary"
              key={animatedPercentage}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {animatedPercentage}%
            </motion.div>
            <motion.div
              className="text-sm text-text-secondary mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Success Rate
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Chart */}
        {showChart && (
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="bg-surface/50 rounded-2xl p-6 border border-border-subtle/30">
              <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                Weekly Progress
              </h3>
              
              {/* Animated Bar Chart */}
              <div className="space-y-4">
                {[
                  { day: 'Day 1', percentage: 15, color: 'from-red-400 to-orange-400' },
                  { day: 'Day 3', percentage: 35, color: 'from-orange-400 to-yellow-400' },
                  { day: 'Day 5', percentage: 60, color: 'from-yellow-400 to-green-400' },
                  { day: 'Day 7', percentage: 87, color: 'from-green-400 to-primary' }
                ].map((item, index) => (
                  <motion.div
                    key={item.day}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                  >
                    <div className="w-16 text-sm text-text-secondary font-medium">
                      {item.day}
                    </div>
                    <div className="flex-1 bg-surface-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 1.2 + index * 0.2, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="w-12 text-sm text-text-primary font-semibold text-right">
                      {item.percentage}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </OnboardingStep>
  )
}
