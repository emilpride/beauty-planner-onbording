'use client'

import { useEffect, useState } from 'react'
import { motion, animate, useReducedMotion, useMotionValue, useTransform } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'

export default function StatisticStep() {
  const prefersReducedMotion = useReducedMotion()
  const TARGET = 87
  const [percentage, setPercentage] = useState(prefersReducedMotion ? TARGET : 0)
  const [showChart, setShowChart] = useState(prefersReducedMotion)
  const [celebrate, setCelebrate] = useState(prefersReducedMotion)

  // Motion value for smooth ring + number sync
  const progress = useMotionValue(prefersReducedMotion ? TARGET : 0)

  useEffect(() => {
    if (prefersReducedMotion) return
    // Smoothly animate to TARGET without overshoot
    const controls = animate(progress, TARGET, {
      duration: 1.1,
      ease: 'easeOut',
    })
    const unsub = progress.on('change', (v) => setPercentage(Math.round(v)))
    controls.then(() => {
      setShowChart(true)
      setCelebrate(true)
    })
    return () => {
      controls.stop?.()
      unsub()
    }
  }, [prefersReducedMotion, progress])

  // SVG ring geometry
  const size = 192 // tailwind w-48 h-48
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffsetMV = useTransform(progress, (v) => circumference * (1 - v / 100))

  return (
    <OnboardingStep
      title="87% of our users see results within the first week!"
      subtitle="You're on the right path — and your transformation could start even faster than you think. Let's continue building your personalized plan to achieve amazing results!"
      buttonText="Interesting!"
    >
      <div className="flex flex-col items-center space-y-8 py-8">
        {/* Percentage Ring */}
        <div className="relative w-48 h-48 flex items-center justify-center" aria-label={`Success rate ${percentage}%`}>
          {/* Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border-4 border-primary/20" />
          {/* SVG Progress */}
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={stroke}
              fill="none"
              opacity={0.8}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgb(var(--color-primary))"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffsetMV as unknown as number}
              initial={false}
              transition={{ duration: 0.2 }}
            />
          </svg>

          {/* Completion pulse */}
          {!prefersReducedMotion && celebrate && (
            <motion.div
              className="absolute inset-[-8px] rounded-full border-2 border-primary/30"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0.5, 0.2, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 0.8, times: [0, 0.7, 1] }}
            />
          )}

          {/* Center content (keep upright; no rotation) */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <motion.div
              className="text-6xl font-bold text-primary leading-none"
              key={percentage}
              initial={prefersReducedMotion ? false : { scale: 1.02, opacity: 0 }}
              animate={
                prefersReducedMotion
                  ? {}
                  : celebrate
                  ? { scale: [1, 1.08, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: celebrate ? 0.35 : 0.2, ease: 'easeOut' }}
            >
              {percentage}%
            </motion.div>
            <motion.div
              className="text-sm text-text-secondary mt-2"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Success Rate
            </motion.div>
          </div>
        </div>

        {/* Chart */}
        {showChart && (
          <motion.div
            className="w-full max-w-md"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-surface/50 rounded-2xl p-6 border border-border-subtle/30">
              <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                Weekly Progress
              </h3>

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
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.12, duration: 0.4 }}
                  >
                    <div className="w-16 text-sm text-text-secondary font-medium">
                      {item.day}
                    </div>
                    <div className="flex-1 bg-surface-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={prefersReducedMotion ? false : { width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{
                          delay: 0.25 + index * 0.12,
                          type: prefersReducedMotion ? 'tween' : 'spring',
                          stiffness: 140,
                          damping: 18,
                          mass: 0.6,
                          duration: prefersReducedMotion ? 0.5 : undefined,
                        }}
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

        {/* Credibility note */}
        <div className="text-xs text-text-secondary/80 text-center">
          Based on anonymized data from over 12,000 users
        </div>
      </div>
    </OnboardingStep>
  )
}
