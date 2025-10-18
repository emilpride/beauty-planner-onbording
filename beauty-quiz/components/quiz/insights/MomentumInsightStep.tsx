'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore, ActivityItem, DietItem } from '@/store/quizStore'

const moodCopy: Record<string, string> = {
  great: 'You are buzzing! We can inject higher-energy routines and weekly personal bests.',
  good: 'Steady and positive. We will mix energising blocks with restorative pauses to keep the rhythm.',
  okay: 'Neutral vibes. Expect gentle prompts that nudge you upward without overwhelming.',
  bad: 'We hear you. We will prioritise grounding rituals and micro wins to lift the day.',
  terrible: 'Time for softness. Expect calming care, breathwork, and optional check-ins.',
}

const getMomentumSummary = (activities: ActivityItem[], diet: DietItem[], mood: string) => {
  const activityCount = activities?.filter(a => a.isActive).length || 0
  const dietCount = diet?.filter(d => d.isActive).length || 0
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
    () => getMomentumSummary(answers.PhysicalActivities, answers.Diet, answers.Mood),
    [answers.PhysicalActivities, answers.Diet, answers.Mood],
  )

  const moodMessage = answers.Mood ? moodCopy[answers.Mood] ?? moodCopy.okay : moodCopy.okay

  return (
    <OnboardingStep
      title="Energy Pulse"
      subtitle={summary.headline}
      buttonText="Let's keep going"
      condition
    >

      <div className="space-y-6 text-left">
        {/* Animated Energy Pulse Background */}
  <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft min-h-[180px]">
          {/* Multiple animated pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary-50 blur-3xl"
              style={{ width: 260 + i*60, height: 260 + i*60, zIndex: 0, opacity: 0.5 - i*0.15 }}
              animate={{ scale: [1, 1.18 + i*0.08, 1], opacity: [0.4 - i*0.1, 0.7 - i*0.2, 0.4 - i*0.1] }}
              transition={{ duration: 2.5 + i, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}
          {/* Subtle rotating blurred ring */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/20"
            style={{ width: 180, height: 180, zIndex: 1, opacity: 0.25 }}
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />
          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-4 items-center">
            <div className="space-y-3">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >Routine sync</motion.p>
              <motion.h3
                className="text-lg font-semibold text-text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >{summary.headline}</motion.h3>
              <motion.p
                className="text-sm leading-relaxed text-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >{summary.blurb}</motion.p>
            </div>
            {/* Circular assistant image on the right */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-soft justify-self-end">
              <Image
                src={answers.assistant === 2
                  ? '/images/on_boarding_images/onboarding_img_physical_activities_ellie.png'
                  : '/images/on_boarding_images/onboarding_img_physical_activities_max.png'}
                alt="Assistant"
                fill
                className="object-cover object-center"
                sizes="80px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border-subtle/60 bg-surface/95 p-5 shadow-soft sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Selected activities</p>
            <div className="flex flex-wrap gap-2 text-xs text-text-primary/80">
              <AnimatePresence>
                {(() => {
                  const active = (answers.PhysicalActivities || []).filter(a => a?.isActive);
                  return active.slice(0, 6).map((activity, idx) => (
                  <motion.span
                    key={activity.id}
                    className="rounded-full bg-primary/10 px-3 py-1"
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.4, type: 'spring', stiffness: 180 }}
                  >
                    {activity.title.replace(/_/g, ' ')}
                  </motion.span>
                  ))
                })()}
              </AnimatePresence>
              {(() => {
                const activeLen = (answers.PhysicalActivities || []).filter(a => a?.isActive).length;
                return activeLen === 0;
              })() && (
                <motion.span
                  className="rounded-full bg-primary/10 px-3 py-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >No activities yet</motion.span>
              )}
              {(() => {
                const activeLen = (answers.PhysicalActivities || []).filter(a => a?.isActive).length;
                return activeLen > 6 ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1">+{activeLen - 6}</span>
                ) : null;
              })()}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Diet focus</p>
            <div className="flex flex-wrap gap-2 text-xs text-text-primary/80">
              <AnimatePresence>
                {(answers.Diet || []).filter(d => d?.isActive).length
                  ? (answers.Diet || []).filter(d => d?.isActive).slice(0, 6).map((item, idx) => (
                      <motion.span
                        key={item.id}
                        className="rounded-full bg-primary/10 px-3 py-1"
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        transition={{ delay: 0.2 + idx * 0.08, duration: 0.4, type: 'spring', stiffness: 180 }}
                      >
                        {item.title.replace(/_/g, ' ')}
                      </motion.span>
                    ))
                  : (
                    <motion.span
                      className="rounded-full bg-primary/10 px-3 py-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >No diet choices yet</motion.span>
                  )}
              </AnimatePresence>
              {(() => {
                const activeDietLen = (answers.Diet || []).filter(d => d?.isActive).length;
                return activeDietLen > 6 ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1">+{activeDietLen - 6}</span>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Removed Mood today block as requested */}
      </div>
    </OnboardingStep>
  )
}