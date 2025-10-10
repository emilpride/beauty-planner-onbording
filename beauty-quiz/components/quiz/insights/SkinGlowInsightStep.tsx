'use client'

import { useEffect, useMemo, useState } from 'react'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore, ProblemItem } from '@/store/quizStore'

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
        heading: 'Hydration',
        from: '#FFD8E8',
        to: '#D8C7FF',
        ring: 'rgba(216, 199, 255, 0.35)',
      }
    case 'oily':
      return {
        heading: 'Balance',
        from: '#D9F7FF',
        to: '#7AD0FF',
        ring: 'rgba(122, 208, 255, 0.35)',
      }
    case 'combination':
      return {
        heading: 'Zones',
        from: '#FFE7C2',
        to: '#FFB27F',
        ring: 'rgba(255, 178, 127, 0.35)',
      }
    case 'normal':
      return {
        heading: 'Glow',
        from: '#D8FFE6',
        to: '#8EFFB7',
        ring: 'rgba(142, 255, 183, 0.35)',
      }
    default:
      return {
        heading: 'AI Scan',
        from: '#C5D9FF',
        to: '#E6F0FF',
        ring: 'rgba(122, 160, 255, 0.35)',
      }
  }
}

const getPriorityList = (skinProblems: ProblemItem[]) => {
  if (!skinProblems || skinProblems.length === 0) {
    return ['Keep hydration steady', 'Lock SPF habit', 'Pulse weekly glow boosters']
  }
  const priorities: string[] = []
  if (skinProblems.some(p => p.isActive && p.title === 'acne')) priorities.push('Stagger actives & calming layers')
  if (skinProblems.some(p => p.isActive && p.title === 'pigmentation')) priorities.push('Introduce brightening combos')
  if (skinProblems.some(p => p.isActive && p.title === 'sensitised')) priorities.push('Rebuild barrier with cushion layers')
  if (skinProblems.some(p => p.isActive && p.title === 'dullness')) priorities.push('Add enzyme polish + hydration')
  if (priorities.length < 3) priorities.push('Weekly check-ins to track progress')
  return priorities.slice(0, 3)
}

export default function SkinGlowInsightStep() {
  const { answers } = useQuizStore()

  const tone = useMemo(() => getSkinTone(answers.SkinType), [answers.SkinType])
  const priorities = useMemo(
    () => getPriorityList(answers.SkinProblems || []),
    [answers.SkinProblems],
  )

  // Mount flag to trigger CSS transitions (ring/bar fills)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Compute a simple Glow score and 3 compact metrics for a balanced, informative UI
  const { score, metrics } = useMemo(() => {
    const probs = answers.SkinProblems || []
    let base = 72
    switch (answers.SkinType) {
      case 'normal': base = 82; break
      case 'combination': base = 76; break
      case 'oily': base = 70; break
      case 'dry': base = 66; break
      default: base = 74; break
    }
    const penalties = (
      (probs.some(p => p.isActive && p.title === 'acne') ? 8 : 0) +
      (probs.some(p => p.isActive && p.title === 'pigmentation') ? 6 : 0) +
      (probs.some(p => p.isActive && p.title === 'sensitised') ? 10 : 0) +
      (probs.some(p => p.isActive && p.title === 'dullness') ? 5 : 0)
    )
    const finalScore = Math.max(30, Math.min(92, base - penalties))

    // Metrics: Hydration, Balance (oil), Calmness (sensitivity)
    let hydration = 70, balance = 70, calm = 70
    if (answers.SkinType === 'dry') hydration -= 12
    if (answers.SkinType === 'oily') balance -= 10
    if (probs.some(p => p.isActive && p.title === 'sensitised')) calm -= 18
    if (probs.some(p => p.isActive && p.title === 'dullness')) hydration -= 6
    if (probs.some(p => p.isActive && p.title === 'acne')) balance -= 12
    hydration = Math.max(20, Math.min(95, hydration))
    balance = Math.max(20, Math.min(95, balance))
    calm = Math.max(20, Math.min(95, calm))

    return { score: finalScore, metrics: { hydration, balance, calm } }
  }, [answers.SkinType, answers.SkinProblems])

  return (
    <OnboardingStep title="Skin care matters" subtitle="Personalized guidance from AI — right after the quiz" buttonText="Continue" centerContent>
      {/* Brand Aurora animation (no assessments) */}
      <div className="w-full flex items-center justify-center py-2">
        <div className="relative w-full max-w-[320px] aspect-square select-none" aria-hidden="true">
          {/* Soft backdrop */}
          <div className="absolute inset-0 rounded-3xl" style={{ background: '#F0F4FF' }} />

          {/* Aurora blobs using brand colors */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ filter: 'blur(40px)' }}>
            <div
              className="absolute rounded-full"
              style={{
                width: '70%', height: '70%', left: '-10%', top: '0%',
                background: 'radial-gradient(60% 60% at 50% 50%, #8A60FF 0%, rgba(138,96,255,0) 70%)',
                animation: 'floatA 16s ease-in-out infinite',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: '65%', height: '65%', right: '-8%', top: '20%',
                background: 'radial-gradient(60% 60% at 50% 50%, #53E5FF 0%, rgba(83,229,255,0) 70%)',
                animation: 'floatB 18s ease-in-out infinite',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: '60%', height: '60%', left: '15%', bottom: '-10%',
                background: 'radial-gradient(60% 60% at 50% 50%, #FF99CC 0%, rgba(255,153,204,0) 70%)',
                animation: 'floatC 20s ease-in-out infinite',
              }}
            />
          </div>

          {/* Subtle conic shimmer */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ maskImage: 'radial-gradient(70% 70% at 50% 50%, black 60%, transparent 100%)' }}>
            <div
              className="absolute inset-0 rounded-3xl opacity-30"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.3), rgba(255,255,255,0) 60%)',
                animation: 'spinBrand 24s linear infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Concise, compliant copy (no superiority claims) */}
      <p className="mt-2 text-center text-sm text-text-secondary">
        Consistent, gentle care makes a real difference. Right after the quiz, our trained AI will prepare
        personalized suggestions informed by a large body of peer‑reviewed research — fast and approachable.
      </p>
      <p className="mt-1 text-center text-xs text-text-tertiary">
        Not medical advice. For medical concerns, consult a qualified professional.
      </p>

      <style jsx>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(12%, -6%) scale(1.03); }
          66% { transform: translate(-6%, 8%) scale(0.98); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-10%, 6%) scale(1.04); }
          66% { transform: translate(8%, -6%) scale(0.99); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(6%, 10%) scale(0.97); }
          66% { transform: translate(-8%, -4%) scale(1.02); }
        }
        @keyframes spinBrand {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </OnboardingStep>
  )
}
