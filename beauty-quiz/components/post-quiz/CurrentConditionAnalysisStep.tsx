'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import RecommendedCare from '@/components/post-quiz/RecommendedCare'
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

const CONDITION_COPY: Record<'skin' | 'hair' | 'physic' | 'mental', string> = {
  skin: 'Mostly clear with light dryness along the cheeks and an active T-zone. Weekly barrier-restoring masks keep hydration steady.',
  hair: 'Good density with subtle dryness at the ends. Twice-weekly hydration masks and scalp massage will balance moisture.',
  physic: 'Mobility is moderate. Low-impact cardio plus mobility sessions will rebuild endurance without stress.',
  mental: 'Mindset is generally positive with stress dips mid-week. Daily breathwork and gratitude check-ins keep energy even.',
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
  const { answers } = useQuizStore()
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [aiModel, setAiModel] = useState<any | null>(null)
  const [lastTriedAt, setLastTriedAt] = useState<number | null>(null)

  // Auto-trigger analysis when payment completed and images available (or skipped)
  useEffect(() => {
    const shouldRun = answers.PaymentCompleted && !aiModel && !loadingAnalysis
    const imagesReady = (
      (Boolean(answers.FaceImageUrl) || answers.FaceImageSkipped) &&
      (Boolean(answers.HairImageUrl) || answers.HairImageSkipped) &&
      (Boolean(answers.BodyImageUrl) || answers.BodyImageSkipped)
    )
    if (!shouldRun) return
    if (!imagesReady) return
    let mounted = true
    const run = async () => {
      try {
        setAnalysisError(null)
        setLoadingAnalysis(true)
        const payload = { userId: answers.Id, answers, photoUrls: { face: answers.FaceImageUrl, hair: answers.HairImageUrl, body: answers.BodyImageUrl } }
        const resp = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await resp.json()
        if (!mounted) return
        if (json?.analysis) {
          setAiModel(json.analysis)
        } else {
          setAnalysisError(json?.error || 'Unknown response')
        }
      } catch (e: any) {
        if (!mounted) return
        setAnalysisError(e?.message || 'Failed to analyze')
      } finally {
        if (!mounted) return
        setLoadingAnalysis(false)
        setLastTriedAt(Date.now())
      }
    }

    run()

    return () => { mounted = false }
  }, [answers.PaymentCompleted, answers.FaceImageUrl, answers.HairImageUrl, answers.BodyImageUrl, answers.FaceImageSkipped, answers.HairImageSkipped, answers.BodyImageSkipped, answers.Id, aiModel, loadingAnalysis])

  // Exposed action to manually retry the analysis (re-run the server call)
  const retryAnalysis = async () => {
    if (loadingAnalysis) return
    setAnalysisError(null)
    setLoadingAnalysis(true)
    try {
      const payload = { userId: answers.Id, answers, photoUrls: { face: answers.FaceImageUrl, hair: answers.HairImageUrl, body: answers.BodyImageUrl } }
      const resp = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await resp.json()
      if (json?.analysis) {
        setAiModel(json.analysis)
      } else {
        setAnalysisError(json?.error || 'Unknown response')
      }
    } catch (e: any) {
      setAnalysisError(e?.message || 'Failed to analyze')
    } finally {
      setLoadingAnalysis(false)
      setLastTriedAt(Date.now())
    }
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

  // Heuristic biological age estimate from lifestyle factors
  const { positiveFactors, negativeFactors, biologicalAgeTarget } = useMemo(() => {
    const pos: string[] = []
    const neg: string[] = []

    // Sleep
    if (answers.SleepDuration === '7-8') pos.push('7–8 hours of sleep')
    if (answers.SleepDuration === '<6') neg.push('Sleep deprivation (<6h)')

    // Activity / lifestyle
    if (answers.LifeStyle === 'active' || answers.LifeStyle === 'sports') pos.push('Active lifestyle')
    if (answers.LifeStyle === 'sedentary') neg.push('Sedentary routine')

    // Stress
    if (answers.Stress === 'rarely') pos.push('Low stress')
    if (answers.Stress === 'often' || answers.Stress === 'always') neg.push('High stress')

    // Physical activities selection
    if (answers.PhysicalActivities.some(a => a.isActive)) pos.push('Regular workouts')

    // Diet
    if (answers.Diet.some(d => d.isActive)) pos.push('Balanced diet')

    // Energy/mood small signals
    if (answers.EnergyLevel && answers.EnergyLevel >= 4) pos.push('Good energy')
    if (answers.Mood === 'terrible' || answers.Mood === 'bad') neg.push('Low mood')

    const base = chronologicalAge ?? 30
    const delta = Math.max(-5, Math.min(5, pos.length * -0.7 + neg.length * 0.8))
    const target = Math.max(0, Math.round(base + delta))

    return { positiveFactors: pos, negativeFactors: neg, biologicalAgeTarget: target }
  }, [answers.SleepDuration, answers.LifeStyle, answers.Stress, answers.PhysicalActivities, answers.Diet, answers.EnergyLevel, answers.Mood, chronologicalAge])

  // Animate biological age number
  const [bioAgeAnimated, setBioAgeAnimated] = useState(0)
  useEffect(() => {
    let raf: number | null = null
    const start = performance.now()
    const duration = 900
    const from = 0
    const to = biologicalAgeTarget
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
    if (biologicalAgeTarget <= chronologicalAge - 1) return '#33C75A' // younger -> green
    if (biologicalAgeTarget >= chronologicalAge + 1) return '#FF7D7E' // older -> red
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

  // BMI vertical gradient should match the provided reference (top warm -> bottom cool)
  const bmiGradient = useMemo(() => {
    return 'linear-gradient(180deg, #FF7D7E 0%, #FFA64D 20%, #FBF447 40%, #33C75A 60%, #53E5FF 80%, #0066CC 100%)'
  }, [])

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
          {/* Age summary block */}
          <motion.article 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft overflow-hidden relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
          >
            {/* Subtle decorative gradients */}
            <motion.div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #8A60FF 0%, transparent 60%)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div className="pointer-events-none absolute -bottom-14 -left-10 h-48 w-48 rounded-full blur-3xl opacity-15"
              style={{ background: 'radial-gradient(circle, #53E5FF 0%, transparent 60%)' }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 12, repeat: Infinity }}
            />

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                {/* Chronological age */}
                <motion.div 
                  className="rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-transparent border border-border-subtle/50"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">Chronological Age</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-bold text-text-primary leading-none">{chronologicalAge ?? '—'}</span>
                    <span className="mb-0.5 text-sm font-semibold text-text-secondary">yrs</span>
                  </div>
                </motion.div>

                {/* Biological age */}
                <motion.div 
                  className="rounded-2xl p-5 bg-gradient-to-br from-[#33C75A]/10 via-transparent to-transparent border border-border-subtle/50"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">Biological Age</p>
                  <div className="mt-2 flex items-end gap-2">
                    <motion.span 
                      className="text-4xl font-bold leading-none"
                      style={{ color: bioAgeColor }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {Math.round(bioAgeAnimated)}
                    </motion.span>
                    <span className="mb-0.5 text-sm font-semibold text-text-secondary">yrs</span>
                  </div>
                </motion.div>
              </div>

              {/* Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="rounded-2xl border border-border-subtle/60 p-4 bg-white/70 dark:bg-surface/80"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-text-primary">Positive Factors</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {positiveFactors.length > 0 ? (
                      positiveFactors.map((f, i) => (
                        <motion.span
                          key={f + i}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.05, duration: 0.25 }}
                        >
                          {f}
                        </motion.span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary">Нет данных</span>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  className="rounded-2xl border border-border-subtle/60 p-4 bg-white/70 dark:bg-surface/80"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <p className="text-sm font-semibold text-text-primary">Negative Factors</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {negativeFactors.length > 0 ? (
                      negativeFactors.map((f, i) => (
                        <motion.span
                          key={f + i}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/30"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.65 + i * 0.05, duration: 0.25 }}
                        >
                          {f}
                        </motion.span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary">Нет данных</span>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.article>
          <motion.article 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-sm font-semibold text-text-primary">Your BMI is:</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2 text-text-primary">
                <motion.span 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {bmi ? bmi.toFixed(1) : '–'}
                </motion.span>
                <motion.span 
                  className="text-sm font-semibold text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {bmiCategory.label}
                </motion.span>
              </div>
              <motion.p 
                className="mt-2 text-sm leading-relaxed text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {bmiCategory.description}
              </motion.p>

              {/* Analysis status message */}
              <div className="mt-4">
                {loadingAnalysis && (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                    <div>
                      <div className="text-sm font-medium text-text-primary">Analysis running…</div>
                      <div className="text-xs text-text-secondary">This may take a few seconds — results will appear below when ready.</div>
                    </div>
                  </div>
                )}

                {analysisError && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-rose-600">{analysisError}</div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => retryAnalysis()} className="rounded-md bg-primary px-3 py-1 text-sm font-semibold text-white">Retry</button>
                    </div>
                  </div>
                )}

                {!loadingAnalysis && !aiModel && !analysisError && lastTriedAt && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-text-secondary">No analysis found yet.</div>
                    <div>
                      <button type="button" onClick={() => retryAnalysis()} className="rounded-md border border-border-subtle px-3 py-1 text-sm">Refresh</button>
                    </div>
                  </div>
                )}

                {aiModel && <div className="mt-3 text-sm text-text-secondary"><p className="font-semibold">AI Analysis received — rendering personalized insights below.</p></div>}
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              {/* BMI Scale */}
              <motion.div 
                className="relative w-[36px] h-[344px]"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                {/* Background Track */}
                <div 
                  className="absolute w-[10px] h-[344px] left-[13px] top-0 rounded-full"
                  style={{ background: '#EBEDFC' }}
                />
                {/* Gradient Fill (category-aligned) */}
                <div 
                  className="absolute w-[18px] h-[344px] left-[9px] top-0 rounded-full"
                  style={{ background: bmiGradient }}
                />
                {/* Slider Handle */}
                <motion.div
                  className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  style={{ 
                    background: 'linear-gradient(180deg, #F2F2F2 0%, #E8E8E8 100%)',
                    left: 'calc(50% - 16px)',
                    top: '100%'
                  }}
                  animate={{ 
                    top: `${(1 - bmiPosition) * 100}%`,
                    transform: 'translateY(-50%)'
                  }}
                  transition={{ 
                    delay: 1.5,
                    duration: 2.0,
                    ease: "easeOut"
                  }}
                />
                </motion.div>

              {/* BMI Value - Between scale and image */}
              <motion.div 
                className="text-center"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <motion.div 
                  className="text-5xl font-semibold leading-none"
                  style={{ 
                    color: bmiNumberColor,
                    width: '90px',
                    height: '56px',
                    fontFamily: 'Raleway',
                    fontWeight: 600,
                    fontSize: '48px',
                    lineHeight: '56px'
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  {bmi ? bmiAnimated.toFixed(1) : '–'}
                </motion.div>
              </motion.div>
              
              {/* Person Image */}
              <motion.div 
                className="flex-shrink-0"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                {(() => {
                  const genderStr = typeof answers.Gender === 'string' ? answers.Gender : 'male'
                  return (
                <Image
                  src={getPersonImage(genderStr, bmiCategory)}
                  alt={`${genderStr} BMI ${bmi ? bmi.toFixed(1) : 'unknown'}`}
                  width={120}
                  height={200}
                  className="object-contain"
                />
                  )
                })()}
              </motion.div>
            </motion.div>
          </motion.article>

          {CONDITION_ORDER.map(({ id, title }, index) => {
            const aiForId = aiModel ? (
              id === 'skin' ? aiModel.skinCondition : id === 'hair' ? aiModel.hairCondition : id === 'physic' ? aiModel.physicalCondition : aiModel.mentalCondition
            ) : null
            const score = aiForId ? Number(aiForId.score) : baseScores[id]
            const explanation = aiForId ? aiForId.explanation : CONDITION_COPY[id]
            const scoreColor = score >= 7 ? '#33C75A' : score >= 4 ? '#FFA64D' : '#FF7D7E'
            return (
              <motion.article 
                key={id} 
                className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.6 + (index * 0.1), 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                  <CircularScore value={score} size={44} thickness={6} gradientId={`grad-${id}`} colors={[scoreColor, scoreColor, scoreColor]} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{explanation}</p>
                {aiForId && aiForId.recommendations && (
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

          <motion.article 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Beauty Mirror Score (BMS)</h2>
              <p className="mt-1 text-sm text-text-secondary">
                BMS is calculated by averaging scores from four categories—BMI, Skin, Hair, Fitness, and Mind—each rated on a scale from 0 to 10.
              </p>
            </div>
            
            {/* BMS Score Display (large number above scale) */}
            <motion.div 
              className="flex flex-col items-center justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <motion.div 
                className="font-semibold leading-none"
                style={{ fontSize: '48px', lineHeight: '56px', color: bmsColor }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.25, duration: 0.5 }}
              >
                {(aiModel ? Number(aiModel.bmsScore) : bmsAnimated).toFixed(1)}
              </motion.div>
              <motion.p 
                className="mt-2 text-sm font-semibold text-text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                Your BMS is: <span className="text-primary">Balanced</span>
              </motion.p>
              <motion.p 
                className="text-sm text-text-secondary mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                Keep up the consistent routine!
              </motion.p>
            </motion.div>

            {/* BMS Scale (animated fill and handle) */}
            <motion.div 
              className="relative w-full h-9 mb-6 overflow-visible"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              {/* Background Track */}
              <div 
                className="absolute w-full h-[18px] top-[9px] rounded-full"
                style={{ background: '#EBEDFC' }}
              />
              {/* Gradient Fill (animated width) */}
              <motion.div 
                className="absolute h-[18px] top-[9px] rounded-full"
                style={{ 
                  // Left red/orange -> right green (per reference)
                  background: 'linear-gradient(90deg, #FF7D7E 0%, #FFA64D 40%, #FBF447 60%, #33C75A 100%)',
                  width: '0%'
                }}
                animate={{ width: `${overallScore * 10}%` }}
                transition={{ delay: 2.3, duration: 1.2, ease: 'easeOut' }}
              />
              {/* Slider Handle */}
              <motion.div
                className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg"
                style={{ 
                  background: 'linear-gradient(180deg, #F2F2F2 0%, #E8E8E8 100%)',
                  top: '2px',
                  left: '0%'
                }}
                animate={{ 
                  left: `${overallScore * 10}%`,
                  transform: 'translateX(-50%)'
                }}
                transition={{ 
                  delay: 2.4,
                  duration: 1.5,
                  ease: "easeOut"
                }}
              />
            </motion.div>

          </motion.article>

          {/* Recommended Care (standalone block below) */}
          <RecommendedCare baseScores={{ skin: baseScores.skin, hair: baseScores.hair, physic: baseScores.physic, mental: baseScores.mental }} />
        </section>
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
