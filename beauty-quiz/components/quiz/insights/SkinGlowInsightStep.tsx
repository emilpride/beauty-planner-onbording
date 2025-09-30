'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const skinTypeLabels: Record<string, string> = {
  dry: 'Dry',
  normal: 'Normal',
  oily: 'Oily',
  combination: 'Combination',
  ai_analyze: 'AI will analyse',
}

const getSkinTone = (type: string) => {
  switch (type) {
    case 'dry':
      return {
        heading: 'Hydration Focus',
        copy: 'We will layer humectants and ceramides, and dial down exfoliation to protect your barrier.',
        accent: 'from-[#FDE1FF]/60 to-[#C49CFF]/40',
      }
    case 'oily':
      return {
        heading: 'Balancing Act',
        copy: 'Expect mattifying serums paired with lightweight hydration. We will stagger actives to keep things calm.',
        accent: 'from-[#D9F7FF]/60 to-[#7AD0FF]/40',
      }
    case 'combination':
      return {
        heading: 'Zone Strategy',
        copy: 'Multi-masking, targeted serums, and alternating textures will keep both cheeks and T-zone balanced.',
        accent: 'from-[#FFF0D7]/60 to-[#FFB27F]/40',
      }
    case 'normal':
      return {
        heading: 'Maintain the Glow',
        copy: 'We will keep your routine polished with antioxidant boosts and gentle weekly resets.',
        accent: 'from-[#E4FFEA]/60 to-[#8EFFB7]/40',
      }
    default:
      return {
        heading: 'AI Scan Pending',
        copy: 'Once you upload photos we will auto-adjust products and cadence for each zone.',
        accent: 'from-primary/30 to-secondary-50',
      }
  }
}

const getPriorityList = (skinProblems: string[]) => {
  if (!skinProblems || skinProblems.length === 0) {
    return ['Keep hydration steady', 'Lock SPF habit', 'Pulse weekly glow boosters']
  }
  const priorities: string[] = []
  if (skinProblems.includes('acne')) priorities.push('Stagger actives & calming layers')
  if (skinProblems.includes('pigmentation')) priorities.push('Introduce brightening combos')
  if (skinProblems.includes('sensitised')) priorities.push('Rebuild barrier with cushion layers')
  if (skinProblems.includes('dullness')) priorities.push('Add enzyme polish + hydration')
  if (priorities.length < 3) priorities.push('Weekly check-ins to track progress')
  return priorities.slice(0, 3)
}

export default function SkinGlowInsightStep() {
  const { answers } = useQuizStore()

  const tone = useMemo(() => getSkinTone(answers.skinType), [answers.skinType])
  const priorities = useMemo(
    () => getPriorityList(answers.skinProblems || []),
    [answers.skinProblems],
  )

  return (
    <OnboardingStep
      title="Skin Snapshot"
      subtitle={tone.heading}
      buttonText="Sounds good"
      condition
    >
      <div className="space-y-6 text-left">
        <div className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft">
          <motion.div
            className={`absolute -left-20 -top-28 h-72 w-72 rounded-full blur-3xl bg-gradient-to-br ${tone.accent}`}
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.9, 1.05, 0.9] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          />
          <div className="relative space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Skin profile</p>
            <div className="flex flex-wrap items-baseline gap-3 text-text-primary">
              <span className="text-3xl font-bold">{skinTypeLabels[answers.skinType] || 'Pending'}</span>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Priority focus</span>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">{tone.copy}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-border-subtle/60 bg-surface/95 p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Top moves</p>
          <ul className="space-y-3">
            {priorities.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </OnboardingStep>
  )
}
