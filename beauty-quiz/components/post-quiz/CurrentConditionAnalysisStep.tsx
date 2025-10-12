'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import GeminiRecommendedCare from '@/components/post-quiz/GeminiRecommendedCare'
import { useQuizStore } from '@/store/quizStore'

const BMI_CATEGORIES = [
  {
    id: 'severely-underweight',
    label: 'Severely Underweight',
    range: [0, 15.9],
    description: 'Very low weight. Medical supervision recommended for safe weight gain.',
    accent: '#0066CC',
    imageLevel: 1,
  },
  {
    id: 'underweight',
    label: 'Underweight',
    range: [16.0, 18.4],
    description: 'Below the healthy range. Focus on nutrient-dense meals and light strength work.',
    accent: '#43B7FF',
    imageLevel: 1,
  },
  {
    id: 'healthy',
    label: 'Normal Weight',
    range: [18.5, 24.9],
    description: 'Right on track. Balanced meals, hydration, and activity keep you here.',
    accent: '#33C75A',
    imageLevel: 2,
  },
  {
    id: 'overweight',
    label: 'Overweight',
    range: [25.0, 29.9],
    description: 'Slightly above normal. Mindful eating plus regular movement will help.',
    accent: '#FBF447',
    imageLevel: 3,
  },
  {
    id: 'obese-class1',
    label: 'Obesity (Class I)',
    range: [30.0, 34.9],
    description: 'Increased risk of diabetes, high blood pressure, etc.',
    accent: '#FFA64D',
    imageLevel: 4,
  },
  {
    id: 'obese-class2',
    label: 'Obesity (Class II)',
    range: [35.0, 39.9],
    description: 'High risk of serious health conditions.',
    accent: '#FF7D7E',
    imageLevel: 5,
  },
  {
    id: 'obese-class3',
    label: 'Obesity (Class III)',
    range: [40.0, 100],
    description: 'Very high risk. Medical advice strongly recommended.',
    accent: '#8B0000',
    imageLevel: 5,
  },
] as const

// No static fallback copy – we only render data returned by Gemini
const CONDITION_COPY: Record<'skin' | 'hair' | 'physic' | 'mental', string> = {
  skin: '',
  hair: '',
  physic: '',
  mental: '',
}

const CONDITION_ORDER = [
  { id: 'skin' as const, title: 'Skin Condition' },
  { id: 'hair' as const, title: 'Hair Condition' },
  { id: 'physic' as const, title: 'Physical Condition' },
  { id: 'mental' as const, title: 'Mental Condition' },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const getPersonImage = (gender: string, bmiCategory: typeof BMI_CATEGORIES[number]) => {
  if (!bmiCategory) return '/images/on_boarding_images/bmi_male_2.png'
  
  const genderPrefix = gender === 'female' ? 'female' : 'male'
  return `/images/on_boarding_images/bmi_${genderPrefix}_${bmiCategory.imageLevel}.png`
}

const parseNumber = (value: string) => {
  if (!value) return null
  const normalised = value.replace(/[^0-9.,]/g, '').replace(',', '.')
  const parsed = Number(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

const parseHeight = (heightValue: string, unit: 'cm' | 'ft&in'): number | null => {
  if (!heightValue) return null
  if (unit === 'cm') {
    const numeric = parseNumber(heightValue)
    return numeric ? numeric / 100 : null
  }
  const match = heightValue.match(/(\d+)[^\d]+(\d+)?/)
  if (!match) return null
  const feet = Number(match[1])
  const inches = Number(match[2] ?? 0)
  const totalInches = feet * 12 + inches
  return totalInches * 0.0254
}

const parseWeight = (weightValue: string, unit: 'kg' | 'lbs'): number | null => {
  const numeric = parseNumber(weightValue)
  if (!numeric) return null
  return unit === 'kg' ? numeric : numeric * 0.453592
}

// ---- Color utilities (module scope) ----
const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`
}

const colorAt = (stops: { pos: number; color: string }[], t: number) => {
  const clampedT = Math.min(1, Math.max(0, t))
  let i = 0
  while (i < stops.length - 1 && clampedT > stops[i + 1].pos) i++
  const a = stops[i]
  const b = stops[Math.min(i + 1, stops.length - 1)]
  const span = b.pos - a.pos || 1
  const localT = span === 0 ? 0 : (clampedT - a.pos) / span
  const ca = hexToRgb(a.color)
  const cb = hexToRgb(b.color)
  const r = ca.r + (cb.r - ca.r) * localT
  const g = ca.g + (cb.g - ca.g) * localT
  const bch = ca.b + (cb.b - ca.b) * localT
  return rgbToHex(r, g, bch)
}

const ScoreBadge = ({ value, accent = 'rgb(var(--color-primary))' }: { value: number; accent?: string }) => (
  <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
    <span className="h-8 w-8 rounded-full border-2 border-current/15 bg-white text-center leading-8 shadow-soft dark:bg-surface/90" style={{ color: accent }}>
      {value.toFixed(1)}
    </span>
    <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">/10</span>
  </div>
)

function CircularScore({
  value,
  size = 48,
  thickness = 6,
  gradientId = 'grad-default',
  colors = ['#8A60FF', '#53E5FF', '#FF99CC'],
}: {
  value: number
  size?: number
  thickness?: number
  gradientId?: string
  colors?: [string, string, string] | string[]
}) {
  const radius = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(value, 10))
  const progress = clamped / 10
  const [display, setDisplay] = useState(0)

  // Animate the numeric label from 0 to value
  useEffect(() => {
    let raf: number | null = null
    const duration = 800
    const start = performance.now()
    const from = 0
    const to = clamped
    const tick = (t: number) => {
      const elapsed = t - start
      const p = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [clamped])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className="block">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0] ?? '#8A60FF'} />
            <stop offset="50%" stopColor={colors[1] ?? '#53E5FF'} />
            <stop offset="100%" stopColor={colors[2] ?? '#FF99CC'} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          className="dark:stroke-white/15"
          strokeWidth={thickness}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ transform: `rotate(-90deg)`, transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-text-primary">{display.toFixed(1)}</span>
      </div>
    </div>
  )
}

export default function CurrentConditionAnalysisStep() {
  const router = useRouter()
  const { answers, analysis: aiModel } = useQuizStore()

  // ---- Age computation ----
  const chronologicalAge = useMemo(() => {
    // Prefer birthDate if present; fallback to provided age
    if (answers.BirthDate) {
      const d = new Date(answers.BirthDate)
      if (!isNaN(d.getTime())) {
        const now = new Date()
        let age = now.getFullYear() - d.getFullYear()
        const m = now.getMonth() - d.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
        return Math.max(0, age)
      }
    }
    if (typeof answers.Age === 'number' && Number.isFinite(answers.Age)) return Math.max(0, Math.floor(answers.Age))
    return null
  }, [answers.BirthDate, answers.Age])

  // Remove heuristic biological age and factors – only Gemini data should be shown
  const positiveFactors: string[] = []
  const negativeFactors: string[] = []
  const biologicalAgeTarget = chronologicalAge ?? null

  // Animate biological age number
  const [bioAgeAnimated, setBioAgeAnimated] = useState(0)
  useEffect(() => {
    let raf: number | null = null
    const start = performance.now()
    const duration = 900
    const from = 0
      const to = typeof biologicalAgeTarget === 'number' ? biologicalAgeTarget : 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setBioAgeAnimated(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [biologicalAgeTarget])

  const bioAgeColor = useMemo(() => {
    if (chronologicalAge == null) return '#33C75A'
      if (typeof biologicalAgeTarget !== 'number') return '#33C75A'
      if (biologicalAgeTarget <= chronologicalAge - 1) return '#33C75A'
      if (biologicalAgeTarget >= chronologicalAge + 1) return '#FF7D7E'
    return '#FFA64D' // about the same -> amber
  }, [chronologicalAge, biologicalAgeTarget])

  const heightMeters = useMemo(
    () => null, // parseHeight(answers.Height, answers.HeightUnit || 'cm'),
    [answers.Height, answers.HeightUnit],
  )

  const weightKg = useMemo(
    () => null, // parseWeight(answers.Weight, answers.WeightUnit || 'kg'),
    [answers.Weight, answers.WeightUnit],
  )

  const bmi = useMemo(() => {
    if (!heightMeters || !weightKg) return null
    const calculated = weightKg / (heightMeters * heightMeters)
    return Number.isFinite(calculated) ? parseFloat(calculated.toFixed(1)) : null
  }, [heightMeters, weightKg])

  const bmiCategory = useMemo(() => {
    if (!bmi) return BMI_CATEGORIES[1]
    return (
      BMI_CATEGORIES.find((category) => bmi >= category.range[0] && bmi <= category.range[1]) ??
      BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
    )
  }, [bmi])

  const bmiPosition = useMemo(() => {
    if (!bmi) return 0.4
    const min = 15
    const max = 45
    return clamp((bmi - min) / (max - min), 0, 1)
  }, [bmi])

  // Animated BMI number and color based on category
  const [bmiAnimated, setBmiAnimated] = useState(0)
  useEffect(() => {
    if (!bmi) return
    let raf: number | null = null
    const duration = 900
    const start = performance.now()
    const from = 0
    const to = bmi
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setBmiAnimated(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [bmi])

   const heightLabel = answers.Height ? `${answers.Height} ${answers.HeightUnit === 'cm' ? 'cm' : 'ft & in'}` : 'Not provided'
   const weightLabel = answers.Weight ? `${answers.Weight} ${answers.WeightUnit === 'kg' ? 'kg' : 'lbs'}` : 'Not provided'

   const baseScores: Record<string, number> = {
    skin: 6,
    hair: 6,
    physic: 6,
    mental: 6,
    overall: 6,
  }

  const overallScore = baseScores.overall
  const [bmsAnimated, setBmsAnimated] = useState(0)
  useEffect(() => {
    let raf: number | null = null
    const duration = 900
    const start = performance.now()
    const from = 0
    const to = overallScore
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setBmsAnimated(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [overallScore])
  // Compute BMS number color from horizontal gradient at current animated position
  const bmsColor = useMemo(() => {
    const stops = [
      { pos: 0.0, color: '#FF7D7E' },
      { pos: 0.4, color: '#FFA64D' },
      { pos: 0.6, color: '#FBF447' },
      { pos: 1.0, color: '#33C75A' },
    ]
    const t = Math.min(1, Math.max(0, bmsAnimated / 10))
    return colorAt(stops, t)
  }, [bmsAnimated])

  // No BMI gradient/scale – we only show the numeric BMI returned by Gemini
  const bmiGradient = ''

  // colorAt helpers moved to module scope above

  // Compute BMI number color from gradient at the indicator position
  const bmiNumberColor = useMemo(() => {
    // Stops for the vertical BMI gradient (top=0 -> bottom=1)
    const stops = [
      { pos: 0.0, color: '#FF7D7E' },
      { pos: 0.2, color: '#FFA64D' },
      { pos: 0.4, color: '#FBF447' },
      { pos: 0.6, color: '#33C75A' },
      { pos: 0.8, color: '#53E5FF' },
      { pos: 1.0, color: '#0066CC' },
    ]
    // Handle is placed at top = (1 - bmiPosition)
    const t = 1 - bmiPosition
    return colorAt(stops, t)
  }, [bmiPosition])


  return (
    <motion.div 
      className="relative bg-background min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cohesive animated background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
      <motion.div
        className="pointer-events-none absolute -z-0 inset-0 overflow-hidden"
        initial={false}
      >
        <motion.div
          className="absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-30 dark:opacity-25"
          style={{ background: 'radial-gradient(circle, #8A60FF 0%, transparent 60%)' }}
          animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-32 -right-24 h-72 w-72 rounded-full blur-3xl opacity-25 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, #53E5FF 0%, transparent 60%)' }}
          animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full blur-3xl opacity-20 dark:opacity-15"
          style={{ background: 'radial-gradient(circle, #FF99CC 0%, transparent 60%)' }}
          animate={{ x: [0, 10, 0], y: [0, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-5 pb-20 pt-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
        <motion.header 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle/60 bg-surface shadow-soft text-text-primary"
            aria-label="Go back"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <div>
            <motion.p 
              className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Current Condition
            </motion.p>
            <motion.h1 
              className="text-xl font-bold text-text-primary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Analysis
            </motion.h1>
          </div>
        </motion.header>

        <section className="space-y-5">
            {aiModel && (
              <>
                {/* BMS from Gemini only */}
                <motion.article 
                  className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold text-text-primary">Beauty Mirror Score (BMS)</h2>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-5xl font-semibold text-text-primary">{Number(aiModel.bmsScore ?? 0).toFixed(1)}</span>
                  </div>
                </motion.article>

                {/* Gender-specific BMI illustration and number (Gemini-provided BMI only) */}
                {typeof aiModel.bmi === 'number' && (
                  <motion.article 
                    className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <img
                          src={`/images/on_boarding_images/bmi_${(answers.Gender === 2 ? 'female' : 'male')}_2.png`}
                          alt="BMI reference"
                          className="w-16 h-16 rounded-xl object-contain bg-white/80"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">BMI</p>
                        <p className="mt-1 text-3xl font-bold text-text-primary">{Number(aiModel.bmi).toFixed(1)}</p>
                      </div>
                    </div>
                  </motion.article>
                )}

                {/* Four conditions – show Gemini explanation and recos only */}
                {CONDITION_ORDER.map(({ id, title }, index) => {
                  const aiForId = id === 'skin' ? aiModel.skinCondition : id === 'hair' ? aiModel.hairCondition : id === 'physic' ? aiModel.physicalCondition : aiModel.mentalCondition
                  if (!aiForId) return null
                  const score = typeof aiForId.score === 'number' ? Number(aiForId.score) : null
                  const explanation = typeof aiForId.explanation === 'string' ? aiForId.explanation : ''
                  const scoreColor = score != null ? (score >= 7 ? '#33C75A' : score >= 4 ? '#FFA64D' : '#FF7D7E') : 'rgb(var(--color-primary))'
                  return (
                    <motion.article 
                      key={id} 
                      className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                        {score != null && <CircularScore value={score} size={44} thickness={6} gradientId={`grad-${id}`} colors={[scoreColor, scoreColor, scoreColor]} />}
                      </div>
                      {explanation && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{explanation}</p>}
                      {Array.isArray(aiForId.recommendations) && aiForId.recommendations.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-text-primary">Recommendations</p>
                          <ul className="list-disc list-inside text-sm text-text-secondary mt-2">
                            {aiForId.recommendations.map((r: string, i: number) => (
                              <li key={r + i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.article>
                  )
                })}

                {/* Gemini-derived Recommended Care with icons/colors/categories */}
                <GeminiRecommendedCare aiModel={aiModel} />
              </>
            )}
        </section>

        {/* Next button */}
        <div className="sticky bottom-0 left-0 right-0 mt-2">
          <div className="mx-auto max-w-2xl px-5 pb-5">
            <button
              onClick={() => router.push('/premium-intro')}
              className="w-full rounded-2xl bg-primary text-white py-3.5 text-base font-semibold shadow-soft hover:shadow-md active:scale-[0.99]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

type MetricProps = {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  )
}
