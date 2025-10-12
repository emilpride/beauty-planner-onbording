'use client'

import { useMemo } from 'react'
import { motion, type Variants, easeOut } from 'framer-motion'
import Image from 'next/image'
import { getActivityMeta } from '@/components/procedures/activityMeta'

// Local catalog mappings (duplicated from RecommendedCare for now). TODO: centralize.
const ACTIVITY_CATEGORY: Record<string, 'Skin' | 'Hair' | 'Physical health' | 'Mental Wellness'> = {
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

// String normalization helpers to map Gemini free-text to our item IDs
const normalize = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')

// Build reverse index of ACTIVITY_META.names at runtime by requiring it here
// We can't import ACTIVITY_META directly (it exports), so we will fetch candidate IDs by simple heuristics + synonyms.
const NAME_TO_ID: Record<string, string> = {
  'cleanse and hydrate': 'cleanse-hydrate',
  'spf protection': 'spf-protection',
  'exfoliate': 'exfoliate',
  'deep hydration': 'deep-hydration',
  'face massage': 'face-massage',
  'lip and eye care': 'lip-eye-care',
  'wash and care': 'wash-care',
  'deep nourishment': 'deep-nourishment',
  'scalp detox': 'scalp-detox',
  'heat protection': 'heat-protection',
  'scalp massage': 'scalp-massage',
  'trim split ends': 'trim-split-ends',
  'post color care': 'post-color-care',
  'morning stretch': 'morning-stretch',
  'cardio boost': 'cardio-boost',
  'strength training': 'strength-training',
  'yoga flexibility': 'yoga-flexibility',
  'dance it out': 'dance-it-out',
  'swimming time': 'swimming-time',
  'cycling': 'cycling',
  'posture fix': 'posture-fix',
  'evening stretch': 'evening-stretch',
  'mindful meditation': 'mindful-meditation',
  'breathing exercises': 'breathing-exercises',
  'gratitude exercises': 'gratitude-exercises',
  'mood check in': 'mood-check-in',
  'learn and grow': 'learn-grow',
  'social media detox': 'social-media-detox',
  'positive affirmations': 'positive-affirmations',
  'talk it out': 'talk-it-out',
  'stress relief': 'stress-relief',
  // common synonyms
  'sunscreen': 'spf-protection',
  'spf': 'spf-protection',
  'hydrate': 'cleanse-hydrate',
  'hydration mask': 'deep-hydration',
  'hydration masks': 'deep-hydration',
  'mask hydration': 'deep-hydration',
  'exfoliation': 'exfoliate',
  'face massage lymphatic': 'face-massage',
}

type Source = 'Skin' | 'Hair' | 'Physical health' | 'Mental Wellness'
type RawReco = { label: string; source: Source }

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

export default function GeminiRecommendedCare({ aiModel }: { aiModel: any }) {
  const rawRecos: RawReco[] = useMemo(() => {
    const out: RawReco[] = []
    const pushAll = (arr: unknown, source: Source) => {
      if (Array.isArray(arr)) {
        for (const v of arr) {
          if (typeof v === 'string' && v.trim()) out.push({ label: v.trim(), source })
        }
      }
    }
    pushAll(aiModel?.skinCondition?.recommendations, 'Skin')
    pushAll(aiModel?.hairCondition?.recommendations, 'Hair')
    pushAll(aiModel?.physicalCondition?.recommendations, 'Physical health')
    pushAll(aiModel?.mentalCondition?.recommendations, 'Mental Wellness')
    return out
  }, [aiModel])

  const resolved = useMemo(() => {
    const seen = new Set<string>()
    return rawRecos.map((r) => {
      const key = normalize(r.label)
      const id = NAME_TO_ID[key] || NAME_TO_ID[key.replace(/ care$/, '')] || null
      const activityId = id ?? `custom-${key.replace(/\s+/g, '-')}`
      const meta = getActivityMeta(activityId, r.label)
      const category = ACTIVITY_CATEGORY[activityId] || r.source
      const freq = RECO_FREQ[activityId] || ''
      const description = RECO_DESC[activityId] || ''
      const dupKey = `${activityId}|${category}`
      if (seen.has(dupKey)) return null
      seen.add(dupKey)
      return { id: activityId, name: meta.name, iconPath: meta.iconPath, primary: meta.primary, surface: meta.surface, freq, description, category }
    }).filter(Boolean) as Array<{ id: string; name: string; iconPath: string; primary: string; surface: string; freq: string; description: string; category: Source }>
  }, [rawRecos])

  const grouped = useMemo(() => {
    const groups: Array<{ title: string; key: Source; items: typeof resolved }> = [
      { title: 'Skin', key: 'Skin', items: [] },
      { title: 'Hair', key: 'Hair', items: [] },
      { title: 'Physical', key: 'Physical health', items: [] },
      { title: 'Mental', key: 'Mental Wellness', items: [] },
    ]
    for (const rec of resolved) {
      const g = groups.find((x) => x.key === rec.category)
      if (g) g.items.push(rec)
    }
    return groups.filter((g) => g.items.length)
  }, [resolved])

  if (!resolved.length) return null

  return (
    <motion.section
      className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <motion.h3 className="text-lg font-semibold text-text-primary mb-1">Recommended Care</motion.h3>
      <motion.p className="text-sm text-text-secondary mb-4">Based on Gemini analysis, here’s your tailored plan.</motion.p>

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
                  key={`${group.key}:${r.id}`}
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
                    {r.freq && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/90 text-text-primary border border-white/70 dark:bg-surface/80">{r.freq}</span>
                      </div>
                    )}
                    {r.description && <p className="mt-2 text-xs text-text-secondary">{r.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
