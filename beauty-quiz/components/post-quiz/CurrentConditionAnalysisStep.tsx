'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, type Variants, useInView } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import GeminiRecommendedCare from '@/components/post-quiz/GeminiRecommendedCare'
import BmsRing from '@/components/post-quiz/BmsRing'
import { useQuizStore } from '@/store/quizStore'

const BMI_CATEGORIES = [
  {
    id: 'severely-underweight',
    label: 'Severely Underweight',
    range: [0, 15.9],
    description: 'Very low weight. Medical supervision recommended for safe weight gain.', // Blue
    accent: '#0D47A1',
    imageLevel: 1,
  },
  {
    id: 'underweight',
    label: 'Underweight',
    range: [16.0, 18.4],
    description: 'Below the healthy range. Focus on nutrient-dense meals and light strength work.', // Light Blue
    accent: '#2196F3',
    imageLevel: 1,
  },
  {
    id: 'healthy',
    label: 'Normal Weight',
    range: [18.5, 24.9],
    description: 'Right on track. Balanced meals, hydration, and activity keep you here.', // Green
    accent: '#2E7D32',
    imageLevel: 2,
  },
  {
    id: 'overweight',
    label: 'Overweight',
    range: [25.0, 29.9],
    description: 'Slightly above normal. Mindful eating plus regular movement will help.', // Yellow
    accent: '#FFEB3B',
    imageLevel: 3,
  },
  {
    id: 'obese-class1',
    label: 'Obesity (Class I)',
    range: [30.0, 34.9],
    description: 'Increased risk of diabetes, high blood pressure, etc.', // Orange
    accent: '#FF9800',
    imageLevel: 4,
  },
  {
    id: 'obese-class2',
    label: 'Obesity (Class II)',
    range: [35.0, 39.9],
    description: 'High risk of serious health conditions.', // Red
    accent: '#E53935',
    imageLevel: 5,
  },
  {
    id: 'obese-class3',
    label: 'Obesity (Class III)',
    range: [40.0, 100],
    description: 'Very high risk. Medical advice strongly recommended.', // Burgundy
    accent: '#6A1B09',
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

// Discrete score color mapping based on provided scale screenshots:
// BMS / general 0-10 scale bands:
// 0–3 Red, 4–5 Orange, 6–7 Yellow, 8–10 Green (requested adjustment: 6 & 7 in yellow band)
const getBandColor = (score: number | null | undefined): string => {
  if (score == null || isNaN(score)) return '#999999'
  if (score <= 3) return '#FF4D4F'        // Red
  if (score <= 5) return '#FF9800'        // Orange
  if (score <= 7) return '#FBF447'        // Yellow (updated hex per provided reference)
  return '#33C75A'                        // Green
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
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const radius = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(value, 10))
  const progress = clamped / 10
  const [display, setDisplay] = useState(0)

  // Animate the numeric label from 0 to value when in view
  useEffect(() => {
    if (!inView) return
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
  }, [clamped, inView])

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0] ?? '#8A60FF'} />
            <stop offset="50%" stopColor={colors[1] ?? '#53E5FF'} />
            <stop offset="100%" stopColor={colors[2] ?? '#FF99CC'} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          className="dark:stroke-white/15"
          strokeWidth={thickness}
        />
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
          animate={inView ? { strokeDashoffset: circumference * (1 - progress) } : { strokeDashoffset: circumference }}
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
  // Scroll reveal variants
  const fadeSlide: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  }

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

  const bioAgeColor = useMemo(() => getBandColor(chronologicalAge ? 7 : 5), [chronologicalAge])

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

  // Prefer AI-provided BMI value for UI indicators if available
  const bmiValue = useMemo(() => {
    const v = aiModel?.bmi
    if (typeof v === 'number' && Number.isFinite(v)) return Number(v)
    return bmi
  }, [aiModel?.bmi, bmi])

  const bmiCategory = useMemo(() => {
    if (!bmiValue) return BMI_CATEGORIES[1]
    return (
      BMI_CATEGORIES.find((category) => bmiValue >= category.range[0] && bmiValue <= category.range[1]) ??
      BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
    )
  }, [bmiValue])

  const bmiPosition = useMemo(() => {
    if (!bmiValue) return 0.4
    const min = 15
    const max = 45
    return clamp((bmiValue - min) / (max - min), 0, 1)
  }, [bmiValue])

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
  // BMS value (prefer AI score, fallback to overallScore) + horizontal indicator position
  const bmsValue = useMemo(() => {
    const v = aiModel?.bmsScore
    if (typeof v === 'number' && Number.isFinite(v)) return Number(v)
    return overallScore
  }, [aiModel?.bmsScore, overallScore])
  const bmsPosition = useMemo(() => clamp(bmsValue / 10, 0, 1), [bmsValue])
  const [bmsAnimated, setBmsAnimated] = useState(0)
  const [bmsInView, setBmsInView] = useState(false)
  useEffect(() => {
    if (!bmsInView) return
    let raf: number | null = null
    const duration = 900
    const start = performance.now()
    const from = 0
    const to = bmsValue
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setBmsAnimated(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [bmsValue, bmsInView])
  // Compute BMS number color from horizontal gradient at current animated position
  const bmsColor = useMemo(() => getBandColor(bmsAnimated), [bmsAnimated])

  // bmsValue & bmsPosition moved above to satisfy ordering for effects

  // No BMI gradient/scale – we only show the numeric BMI returned by Gemini
  const bmiGradient = ''

  // colorAt helpers moved to module scope above

  // Compute BMI number color from gradient at the indicator position
  // Animate BMI number from 0 to target (aiModel.bmi) and derive color dynamically during the animation
  const [bmiAnimatedDisplay, setBmiAnimatedDisplay] = useState(0)
  const [bmiInView, setBmiInView] = useState(false)
  useEffect(() => {
    const target = (typeof aiModel?.bmi === 'number' && Number.isFinite(aiModel.bmi)) ? Number(aiModel.bmi) : null
    if (target == null || !bmiInView) {
      setBmiAnimatedDisplay(0)
      return
    }
    let raf: number | null = null
    const duration = 900
    const start = performance.now()
    const from = 0
    const to = target
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setBmiAnimatedDisplay(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [aiModel?.bmi, bmiInView])

  const bmiNumberColorAnimated = useMemo(() => {
    // Use BMI category accent color (see BMI_CATEGORIES accents updated below to match scale) instead of gradient mapping.
    return bmiCategory?.accent || '#33C75A'
  }, [bmiCategory])


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
              {/* BMI block */}
              <motion.article 
                className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                variants={fadeSlide}
                initial="hidden"
                whileInView="visible"
                viewport={{ amount: 0.5, once: true }}
                onViewportEnter={() => setBmiInView(true)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">Your BMI Is:</p>
                      <p className="text-sm font-semibold text-violet-600">{aiModel.bmiCategory || '—'}</p>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{aiModel.bmiDescription || ''}</p>
                    <div className="mt-3 flex items-center gap-6">
                      <div className="flex items-center gap-6">
                        {/* Gradient bar matches image height and sits left to image */}
                        <div
                          className="relative h-80 w-[22px] shrink-0 rounded-full"
                          style={{
                            width: '22px',
                            minWidth: '22px',
                            maxWidth: '22px',
                            background: 'linear-gradient(180deg,#FF7D7E 0%,#FFA64D 25%,#FBF447 50%,#33C75A 75%,#53E5FF 100%)'
                          }}
                        >
                          <motion.div
                            className="absolute left-1/2"
                            initial={{ top: '100%' }}
                            animate={{ top: `${(1 - bmiPosition) * 100}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{ transform: 'translate(-50%, -50%)' }}
                          >
                            <div className="w-8 h-8 rounded-full bg-white shadow-soft ring-1 ring-black/10" />
                          </motion.div>
                        </div>
                        {/* BMI number placed between bar and image */}
                        <span className="text-3xl font-bold" style={{ color: bmiNumberColorAnimated }}>
                          {Number.isFinite(bmiAnimatedDisplay) ? bmiAnimatedDisplay.toFixed(1) : '—'}
                        </span>
                        <img
                          src={getPersonImage(answers.Gender === 2 ? 'female' : 'male', bmiCategory)}
                          alt="BMI reference"
                          className="w-80 h-80 rounded-xl object-contain bg-white/80"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Four condition cards (score + explanation, no per-card recs) */}
              {CONDITION_ORDER.map(({ id, title }, index) => {
                const aiForId = id === 'skin' ? aiModel.skinCondition : id === 'hair' ? aiModel.hairCondition : id === 'physic' ? aiModel.physicalCondition : aiModel.mentalCondition
                if (!aiForId) return null
                const score = typeof aiForId.score === 'number' ? Number(aiForId.score) : null
                const scoreColor = score != null ? getBandColor(score) : getBandColor(null)
                const explanation = typeof aiForId.explanation === 'string' ? aiForId.explanation : ''
                return (
                  <motion.article 
                    key={id} 
                    className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                    variants={fadeSlide}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ amount: 0.4, once: true }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                      {score != null && <CircularScore value={score} size={44} thickness={6} gradientId={`grad-${id}`} colors={[scoreColor, scoreColor, scoreColor]} />}
                    </div>
                    {explanation && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{explanation}</p>}
                  </motion.article>
                )
              })}

              {/* BMS card with prominent number */}
              <motion.article 
                className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                variants={fadeSlide}
                initial="hidden"
                whileInView="visible"
                viewport={{ amount: 0.5, once: true }}
                onViewportEnter={() => setBmsInView(true)}
              >
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold text-text-primary">Beauty Mirror Score (BMS)</h2>
                </div>
                <div className="flex items-center justify-center">
                  <BmsRing
                    size={240}
                    thickness={28}
                    gapDeg={18}
                    overall={bmsInView ? bmsAnimated : 0}
                    scores={{
                      skin: aiModel?.skinCondition?.score ?? 6,
                      hair: aiModel?.hairCondition?.score ?? 6,
                      physic: aiModel?.physicalCondition?.score ?? 6,
                      mental: aiModel?.mentalCondition?.score ?? 6,
                    }}
                    icons={{
                      skin: '/icons/misc/skin.svg',
                      hair: '/icons/misc/hair.svg',
                      physic: '/icons/misc/physic.svg',
                      mental: '/icons/misc/psychology.svg',
                    }}
                    colors={{
                      skin: '#6EE7B7',     // teal/green for Skin
                      hair: '#60A5FA',     // blue for Hair
                      physic: '#FBBF24',   // amber/yellow for Physical
                      mental: '#F472B6',   // pink for Mental
                    }}
                  />
                </div>
              </motion.article>

              {/* Consolidated recommended care at bottom */}
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
              To The Activities
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
