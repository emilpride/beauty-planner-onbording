'use client'

import { useMemo } from 'react'
import { motion, type Variants, easeOut } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { getActivityMeta } from '@/components/procedures/activityMeta'

type BaseScores = { skin: number; hair: number; physic: number; mental: number }

type CareReco = {
  id: string
  name: string
  iconPath: string
  primary: string
  surface: string
  freq: string
  description: string
  category: 'Skin' | 'Hair' | 'Physical health' | 'Mental Wellness'
}

const ACTIVITY_CATEGORY: Record<string, CareReco['category']> = {
  'cleanse-hydrate': 'Skin',
  'deep-hydration': 'Skin',
  'exfoliate': 'Skin',
  'face-massage': 'Skin',
  'lip-eye-care': 'Skin',
  'spf-protection': 'Skin',
  'wash-care': 'Hair',
  'deep-nourishment': 'Hair',
  'scalp-detox': 'Hair',
  'heat-protection': 'Hair',
  'scalp-massage': 'Hair',
  'trim-split-ends': 'Hair',
  'post-color-care': 'Hair',
  'morning-stretch': 'Physical health',
  'cardio-boost': 'Physical health',
  'strength-training': 'Physical health',
  'yoga-flexibility': 'Physical health',
  'dance-it-out': 'Physical health',
  'swimming-time': 'Physical health',
  'cycling': 'Physical health',
  'posture-fix': 'Physical health',
  'evening-stretch': 'Physical health',
  'mindful-meditation': 'Mental Wellness',
  'breathing-exercises': 'Mental Wellness',
  'gratitude-exercises': 'Mental Wellness',
  'mood-check-in': 'Mental Wellness',
  'learn-grow': 'Mental Wellness',
  'social-media-detox': 'Mental Wellness',
  'positive-affirmations': 'Mental Wellness',
  'talk-it-out': 'Mental Wellness',
  'stress-relief': 'Mental Wellness',
}

const RECO_FREQ: Record<string, string> = {
  'cleanse-hydrate': 'Daily, AM & PM',
  'deep-hydration': '1–2x/week',
  'exfoliate': '2–3x/week',
  'face-massage': '2x/week',
  'lip-eye-care': 'Daily',
  'spf-protection': 'Daily, AM',
  'wash-care': '2–4x/week',
  'deep-nourishment': '1x/week',
  'scalp-detox': '1–2x/month',
  'heat-protection': 'As needed, before styling',
  'scalp-massage': '2–3x/week',
  'trim-split-ends': 'Every 6–8 weeks',
  'post-color-care': 'After coloring',
  'morning-stretch': 'Daily, AM',
  'cardio-boost': '3x/week',
  'strength-training': '2–3x/week',
  'yoga-flexibility': '2–3x/week',
  'dance-it-out': '1–2x/week',
  'swimming-time': '1–2x/week',
  'cycling': '1–3x/week',
  'posture-fix': 'Daily, 5–10 min',
  'evening-stretch': 'Daily, PM',
  'mindful-meditation': 'Daily, 5–10 min',
  'breathing-exercises': 'Daily, 3–5 min',
  'gratitude-exercises': 'Daily',
  'mood-check-in': 'Daily',
  'learn-grow': '2–3x/week',
  'social-media-detox': '1 day/week',
  'positive-affirmations': 'Daily',
  'talk-it-out': 'Weekly',
  'stress-relief': 'As needed',
}

const RECO_DESC: Record<string, string> = {
  'cleanse-hydrate': 'Gentle cleanse followed by hydrating serum or moisturizer.',
  'deep-hydration': 'Replenish moisture with masks or rich creams.',
  'exfoliate': 'Remove dead cells to smooth texture and boost glow.',
  'face-massage': 'Improve microcirculation and relieve tension.',
  'lip-eye-care': 'Targeted hydration for delicate areas.',
  'spf-protection': 'Broad-spectrum SPF to protect and prevent aging.',
  'wash-care': 'Cleanse and condition for healthy, manageable hair.',
  'deep-nourishment': 'Deep conditioners and oils to restore strength.',
  'scalp-detox': 'Clarify buildup to balance the scalp.',
  'heat-protection': 'Shield hair from hot tools and UV.',
  'scalp-massage': 'Stimulate roots and promote circulation.',
  'trim-split-ends': 'Keep ends neat and prevent breakage.',
  'post-color-care': 'Seal color and maintain shine.',
  'morning-stretch': 'Wake up muscles and joints for the day.',
  'cardio-boost': 'Elevate heart rate and improve endurance.',
  'strength-training': 'Build lean muscle and support metabolism.',
  'yoga-flexibility': 'Mobility, balance, and mindful breathing.',
  'dance-it-out': 'Fun cardio and coordination boost.',
  'swimming-time': 'Low-impact, full-body conditioning.',
  'cycling': 'Cardio and leg strength outdoors or indoors.',
  'posture-fix': 'Short drills to align and support posture.',
  'evening-stretch': 'Wind down and reduce stiffness before sleep.',
  'mindful-meditation': 'Calm the mind and lower stress.',
  'breathing-exercises': 'Reset with simple breathwork breaks.',
  'gratitude-exercises': 'Positive reflection to lift mood.',
  'mood-check-in': 'Track and understand daily mood shifts.',
  'learn-grow': 'Skill-building and mental stimulation.',
  'social-media-detox': 'Reduce overwhelm and reclaim time.',
  'positive-affirmations': 'Reinforce a constructive mindset.',
  'talk-it-out': 'Express and process emotions with support.',
  'stress-relief': 'Quick tools to release tension when needed.',
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut, staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function RecommendedCare({ baseScores }: { baseScores: BaseScores }) {
  const router = useRouter()
  const { answers } = useQuizStore()

  const recommendedCare = useMemo<CareReco[]>(() => {
    const selected = Array.isArray(answers.SelectedActivities) ? answers.SelectedActivities : []
    const picks: string[] = [...selected]

    const categoryPriority = (
      Object.entries({ skin: baseScores.skin, hair: baseScores.hair, physic: baseScores.physic, mental: baseScores.mental })
        .sort((a, b) => a[1] - b[1])
        .map(([k]) => k)
    ) as Array<'skin' | 'hair' | 'physic' | 'mental'>

    const byCategory: Record<'skin'|'hair'|'physic'|'mental', string[]> = {
      skin: ['cleanse-hydrate','spf-protection','exfoliate','deep-hydration','face-massage','lip-eye-care'],
      hair: ['wash-care','heat-protection','deep-nourishment','scalp-massage','trim-split-ends','scalp-detox'],
      physic: ['morning-stretch','cardio-boost','strength-training','yoga-flexibility','posture-fix','evening-stretch','cycling'],
      mental: ['mindful-meditation','breathing-exercises','gratitude-exercises','stress-relief','mood-check-in','positive-affirmations','learn-grow']
    }

    for (const cat of categoryPriority) {
      for (const id of byCategory[cat]) {
        if (picks.length >= 6) break
        if (!picks.includes(id)) picks.push(id)
      }
      if (picks.length >= 6) break
    }

    return picks.slice(0, 6).map((id) => {
      const meta = getActivityMeta(id)
      const category = ACTIVITY_CATEGORY[id] ?? 'Skin'
      return {
        id,
        name: meta.name,
        iconPath: meta.iconPath,
        primary: meta.primary,
        surface: meta.surface,
        freq: RECO_FREQ[id] ?? 'Weekly',
        description: RECO_DESC[id] ?? 'Helpful routine to improve your results.',
        category,
      }
    })
  }, [answers.SelectedActivities, baseScores.skin, baseScores.hair, baseScores.physic, baseScores.mental])

  // Group by category for clearer structure
  const grouped = useMemo(() => {
    const entries: Array<{ title: string; key: CareReco['category']; items: CareReco[] }> = [
      { title: 'Physical', key: 'Physical health', items: [] },
      { title: 'Mental', key: 'Mental Wellness', items: [] },
      { title: 'Skin', key: 'Skin', items: [] },
      { title: 'Hair', key: 'Hair', items: [] },
    ]
    for (const r of recommendedCare) {
      const group = entries.find(e => e.key === r.category)
      if (group) group.items.push(r)
    }
    // Trim empty groups
    return entries.filter(g => g.items.length)
  }, [recommendedCare])

  return (
    <motion.section
      className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <motion.h3 className="text-lg font-semibold text-text-primary mb-1">Recommended Care</motion.h3>
      <motion.p className="text-sm text-text-secondary mb-4">Based on your current results, here’s what we suggest next.</motion.p>

      <div className="space-y-6">
        {grouped.map((group) => (
          <motion.div key={group.key} variants={itemVariants}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-[0.18em]">{group.title}</h4>
              <span className="text-xs text-text-secondary">{group.items.length} recos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.items.map((r) => (
                <motion.div
                  key={r.id}
                  className="rounded-2xl border shadow-soft p-4 flex items-start gap-3"
                  style={{ borderColor: r.primary, background: r.surface }}
                  variants={itemVariants}
                >
                  <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: r.primary }}>
                    {r.iconPath ? (
                      <Image src={r.iconPath} alt={`${r.name} icon`} width={28} height={28} />
                    ) : (
                      <span className="text-white font-semibold">{r.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-text-primary leading-tight">{r.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/90 text-text-primary border border-white/70 dark:bg-surface/80">{r.freq}</span>
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">{r.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => router.push('/signup')}
        className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        Set Up My Care Plan
      </motion.button>
    </motion.section>
  )
}
