'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const sleepVisuals = {
  '<6': {
    title: 'Quick Boost Mode',
    message: 'Short nights detected. We will weave in micro recovery blocks so you recharge without losing momentum.',
    accent: 'from-rose-400/60 to-orange-300/40',
  },
  '6-7': {
    title: 'Almost Balanced',
    message: 'You are close to the sweet spot. We will schedule light resets before and after intense days.',
    accent: 'from-amber-300/60 to-lime-300/40',
  },
  '7-8': {
    title: 'Well-Timed Rest',
    message: 'Consistent sleep is a superpower. Expect more advanced skin and body boosters to build on your rhythm.',
    accent: 'from-emerald-300/60 to-sky-300/40',
  },
  '8-9': {
    title: 'Deep Recharge',
    message: 'Your rest window is ideal. We will layer energising morning rituals to match your high recovery levels.',
    accent: 'from-sky-300/60 to-indigo-300/40',
  },
  '>9': {
    title: 'Extended Restorative Mode',
    message: 'Plenty of rest logged. We can introduce gentle activation blocks to keep energy bright through the day.',
    accent: 'from-indigo-300/60 to-purple-400/40',
  },
} as const

const pulseTransition = {
  repeat: Infinity,
  ease: 'easeInOut',
}

export default function SleepRhythmInsightStep() {
  const { answers } = useQuizStore()

  const visual = useMemo(() => {
    if (!answers.sleepHours || !(answers.sleepHours in sleepVisuals)) {
      return {
        title: 'Tracking Your Rest',
        message: 'We will monitor your sleep pattern and adjust routines to keep your energy smooth.',
        accent: 'from-primary/40 to-secondary-50',
      }
    }
    return sleepVisuals[answers.sleepHours as keyof typeof sleepVisuals]
  }, [answers.sleepHours])

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
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.9, 1.05, 0.9] }}
            transition={{ ...pulseTransition, duration: 7 }}
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
              <motion.span
                className="absolute inset-0 rounded-full border border-primary/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.25, 0.6] }}
                transition={{ ...pulseTransition, duration: 6 }}
              />
              <motion.span
                className="absolute inset-2 rounded-full border border-primary/20"
                animate={{ scale: [1, 0.9, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ ...pulseTransition, duration: 8, delay: 0.6 }}
              />
              <div className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white shadow-soft">
                <span className="text-xs uppercase tracking-[0.3em]">Avg</span>
                <span className="text-2xl font-semibold">
                  {answers.sleepHours && answers.sleepHours !== '' ? answers.sleepHours.replace('>', '>').replace('<', '<') : '?'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em]">hours</span>
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
      </div>
    </OnboardingStep>
  )
}