'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const sleepVisuals = {
  '<6': {
    title: 'Quick Boost Mode',
    message: 'Short nights detected. We will weave in micro recovery blocks so you recharge without losing momentum.',
    accent: 'from-rose-400/60 to-orange-300/40',
    score: 62,
    tips: [
      'Add a 10–15 min wind‑down before bed (no screens)',
      'Try a short breathing drill after lunch to reset cortisol',
      'Keep caffeine cut‑off at least 7 hours before sleep'
    ]
  },
  '6-7': {
    title: 'Almost Balanced',
    message: 'You are close to the sweet spot. We will schedule light resets before and after intense days.',
    accent: 'from-amber-300/60 to-lime-300/40',
    score: 74,
    tips: [
      'Fix a consistent bedtime window (±30 minutes)',
      'Dim lights 60 minutes before bed to nudge melatonin',
      'Keep wake time stable even on weekends'
    ]
  },
  '7-8': {
    title: 'Well-Timed Rest',
    message: 'Consistent sleep is a superpower. Expect more advanced skin and body boosters to build on your rhythm.',
    accent: 'from-emerald-300/60 to-sky-300/40',
    score: 86,
    tips: [
      'Expose eyes to daylight within 30 minutes after waking',
      'Light protein snack 2–3h before bed if hungry',
      'Keep bedroom cool: 17–19°C improves deep sleep'
    ]
  },
  '8-9': {
    title: 'Deep Recharge',
    message: 'Your rest window is ideal. We will layer energising morning rituals to match your high recovery levels.',
    accent: 'from-sky-300/60 to-indigo-300/40',
    score: 90,
    tips: [
      'Add 5–10 min mobility in the morning to boost alertness',
      'Short outdoor walk before noon for circadian alignment',
      'Avoid late naps (>20–30 min) to protect sleep pressure'
    ]
  },
  '>9': {
    title: 'Extended Restorative Mode',
    message: 'Plenty of rest logged. We can introduce gentle activation blocks to keep energy bright through the day.',
    accent: 'from-indigo-300/60 to-purple-400/40',
    score: 78,
    tips: [
      'Micro‑movement breaks every 60–90 minutes',
      '10 min brisk walk after meals to steady energy',
      'Keep afternoon light exposure high to avoid grogginess'
    ]
  },
} as const

const pulseTransition = {
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
}

export default function SleepRhythmInsightStep() {
  const { answers } = useQuizStore()
  const prefersReducedMotion = useReducedMotion()

  const visual = useMemo(() => {
    if (!answers.sleepHours || !(answers.sleepHours in sleepVisuals)) {
      return {
        title: 'Tracking Your Rest',
        message: 'We will monitor your sleep pattern and adjust routines to keep your energy smooth.',
        accent: 'from-primary/40 to-secondary-50',
        score: 72,
        tips: [
          'Keep a gentle pre‑sleep ritual (15–20 min)',
          'Aim for consistent wake time for a week',
          'Morning light exposure boosts circadian rhythm'
        ]
      }
    }
    return sleepVisuals[answers.sleepHours as keyof typeof sleepVisuals]
  }, [answers.sleepHours])

  // Radial score ring geometry
  const size = 112 // matches h-28 w-28
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - (visual as any).score / 100)

  return (
    <OnboardingStep
      title="Sleep Rhythm Check"
      subtitle={visual.title}
      buttonText="Let's keep going"
      condition
    >
      <div className="space-y-6 text-left">
        <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft">
          <motion.div
            className={`absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl bg-gradient-to-br ${visual.accent}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.55, 0.35], scale: [0.9, 1.05, 0.9] }}
            transition={prefersReducedMotion ? undefined : { ...pulseTransition, duration: 7 }}
          />
          <motion.div
            className="flex w-full items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="max-w-xs space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">Sleep Insights</p>
              <h3 className="text-lg font-semibold text-text-primary">{visual.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{visual.message}</p>
            </div>
            <div className="relative flex h-28 w-28 items-center justify-center">
              {/* Optional subtle pulses */}
              {!prefersReducedMotion && (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-full border border-primary/40"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.25, 0.5] }}
                    transition={{ ...pulseTransition, duration: 6 }}
                  />
                  <motion.span
                    className="absolute inset-2 rounded-full border border-primary/20"
                    animate={{ scale: [1, 0.92, 1], opacity: [0.45, 0.2, 0.45] }}
                    transition={{ ...pulseTransition, duration: 8, delay: 0.6 }}
                  />
                </>
              )}
              {/* Radial score ring */}
              <svg width={size} height={size} className="rotate-[-90deg]">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth={stroke}
                  fill="none"
                  opacity={0.4}
                />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#A385E9"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  initial={false}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[10px] uppercase tracking-[0.3em] text-text-secondary">Avg</span>
                <span className="text-xl font-semibold text-text-primary">
                  {answers.sleepHours ? answers.sleepHours : '?'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-text-secondary">hours</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-border-subtle/60 bg-surface/95 p-4 shadow-soft sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Bedtime window</p>
            <p className="text-sm font-semibold text-text-primary">{answers.endDayTime || 'Not set'} {answers.timeFormat === '24h' ? '' : answers.timeFormat}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Wake window</p>
            <p className="text-sm font-semibold text-text-primary">{answers.wakeUpTime || 'Not set'} {answers.timeFormat === '24h' ? '' : answers.timeFormat}</p>
          </div>
        </div>

        {/* Actionable tips tailored to rhythm */}
        <div className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary mb-2">Quick Tips</p>
          <ul className="space-y-2">
            {(visual as any).tips.slice(0, 3).map((tip: string, i: number) => (
              <motion.li
                key={i}
                className="flex items-start gap-2"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
              >
                <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">✓</span>
                <span className="text-sm text-text-primary leading-relaxed">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </OnboardingStep>
  )
}