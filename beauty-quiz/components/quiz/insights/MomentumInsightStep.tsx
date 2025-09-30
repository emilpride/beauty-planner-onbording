'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const moodCopy: Record<string, string> = {
  great: 'You are buzzing! We can inject higher-energy routines and weekly personal bests.',
  good: 'Steady and positive. We will mix energising blocks with restorative pauses to keep the rhythm.',
  okay: 'Neutral vibes. Expect gentle prompts that nudge you upward without overwhelming.',
  bad: 'We hear you. We will prioritise grounding rituals and micro wins to lift the day.',
  terrible: 'Time for softness. Expect calming care, breathwork, and optional check-ins.',
}

const getMomentumSummary = (activities: string[], diet: string[], mood: string) => {
  const activityCount = activities?.length || 0
  const dietCount = diet?.length || 0
  let headline = 'Balanced Momentum'
  let blurb = 'We will blend movement, mindful check-ins, and nutrition nudges so your routine never feels heavy.'

  if (activityCount >= 4 && dietCount >= 3) {
    headline = 'Performance Groove'
    blurb = 'Plenty of variety! We will sequence workouts and meals so you recover fast and stay inspired.'
  } else if (activityCount <= 1 && dietCount <= 1) {
    headline = 'Fresh Start'
    blurb = 'We will start with light pulses—quick stretches, hydration streaks, and mood boosts to build momentum.'
  } else if (activityCount >= 3 && dietCount <= 1) {
    headline = 'Fuel The Work'
    blurb = 'Great movement streak. We will add easy meal prep wins to keep your energy from dipping.'
  } else if (activityCount <= 1 && dietCount >= 3) {
    headline = 'Nourish & Activate'
    blurb = 'Nutrition looks solid. We will slot in 5-minute activations and posture resets to keep the body awake.'
  }

  return { headline, blurb }
}

export default function MomentumInsightStep() {
  const { answers } = useQuizStore()

  const summary = useMemo(
    () => getMomentumSummary(answers.physicalActivities, answers.diet, answers.mood),
    [answers.physicalActivities, answers.diet, answers.mood],
  )

  const moodMessage = answers.mood ? moodCopy[answers.mood] ?? moodCopy.okay : moodCopy.okay

  return (
    <OnboardingStep
      title="Energy Pulse"
      subtitle={summary.headline}
      buttonText="Let's keep going"
      condition
    >
      <div className="space-y-6 text-left">
        <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft">
          <motion.div
            className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary-50 blur-3xl"
            animate={{ rotate: [0, 12, -8, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          />
          <div className="relative space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Routine sync</p>
            <h3 className="text-lg font-semibold text-text-primary">{summary.headline}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{summary.blurb}</p>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border-subtle/60 bg-surface/95 p-5 shadow-soft sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Selected activities</p>
            <div className="flex flex-wrap gap-2 text-xs text-text-primary/80">
              {(answers.physicalActivities || []).slice(0, 6).map((activity) => (
                <span key={activity} className="rounded-full bg-primary/10 px-3 py-1">
                  {activity.replace(/_/g, ' ')}
                </span>
              )) || <span>No activities yet</span>}
              {answers.physicalActivities && answers.physicalActivities.length > 6 && (
                <span className="rounded-full bg-primary/10 px-3 py-1">+{answers.physicalActivities.length - 6}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Diet focus</p>
            <div className="flex flex-wrap gap-2 text-xs text-text-primary/80">
              {(answers.diet || []).length
                ? answers.diet.slice(0, 6).map((item) => (
                    <span key={item} className="rounded-full bg-primary/10 px-3 py-1">
                      {item.replace(/_/g, ' ')}
                    </span>
                  ))
                : <span>No diet choices yet</span>}
              {answers.diet && answers.diet.length > 6 && (
                <span className="rounded-full bg-primary/10 px-3 py-1">+{answers.diet.length - 6}</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Mood today</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{moodMessage}</p>
        </div>
      </div>
    </OnboardingStep>
  )
}