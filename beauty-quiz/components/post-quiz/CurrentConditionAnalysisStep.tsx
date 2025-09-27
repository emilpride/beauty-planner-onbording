'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

const BMI_CATEGORIES = [
  {
    id: 'underweight',
    label: 'Underweight',
    range: [0, 18.4],
    description: 'Below the healthy range. Include nutrient-dense foods and strength training.',
    accent: '#43B7FF',
    textAccent: 'text-sky-500',
    imageIndex: 1,
  },
  {
    id: 'healthy',
    label: 'Healthy',
    range: [18.5, 24.9],
    description: 'Right on track. Maintain a balanced diet and regular activity.',
    accent: '#33C75A',
    textAccent: 'text-emerald-500',
    imageIndex: 2,
  },
  {
    id: 'overweight',
    label: 'Overweight',
    range: [25, 29.9],
    description: 'Slightly above normal. Focus on consistent movement and mindful eating.',
    accent: '#FBBE24',
    textAccent: 'text-amber-500',
    imageIndex: 3,
  },
  {
    id: 'obese',
    label: 'Obese',
    range: [30, 34.9],
    description: 'Higher than recommended. Prioritise coaching, nutrition, and stress support.',
    accent: '#FF8A4C',
    textAccent: 'text-orange-500',
    imageIndex: 4,
  },
  {
    id: 'severely-obese',
    label: 'Severely Obese',
    range: [35, 80],
    description: 'Work closely with health professionals for a gentle, sustainable plan.',
    accent: '#F75C7E',
    textAccent: 'text-rose-500',
    imageIndex: 5,
  },
] as const

const CONDITION_COPY: Record<string, string> = {
  skin: 'Skin is mostly clear with occasional dryness on the cheeks and oiliness around the T-zone. Keep hydration levels high and include weekly barrier-restoring masks.',
  hair: 'Scalp shows good density but some frizz and dryness at the ends. Hydrating masks and scalp massages two times a week will balance moisture.',
  physic: 'Body mobility is moderate. Light cardio with mobility-focused sessions will improve endurance while keeping joints happy.',
  mental: 'Overall mindset is positive, with short dips during stressful weeks. Daily gratitude journaling and breathwork will stabilise energy.',
}

const CONDITION_ORDER: Array<{ id: keyof typeof CONDITION_COPY; title: string; accent: string }> = [
  { id: 'skin', title: 'Skin Condition', accent: 'from-[#CFE7FF] to-[#A5C9FF]' },
  { id: 'hair', title: 'Hair Condition', accent: 'from-[#EAD9FF] to-[#CBB5FF]' },
  { id: 'physic', title: 'Physical Condition', accent: 'from-[#FFE7D6] to-[#FFC8AA]' },
  { id: 'mental', title: 'Mental Condition', accent: 'from-[#F9E6FF] to-[#E7C8FF]' },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

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

const ScoreDonut = ({
  value,
  accent = '#8A60FF',
}: {
  value: number
  accent?: string
}) => {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const progress = clamp(value / 10, 0, 1)
  const dashOffset = circumference * (1 - progress)
  const label = value.toFixed(1).replace(/\.0$/, '')

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#ECEBFF"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold text-text-primary">{label}</span>
      </div>
    </div>
  )
}

export default function CurrentConditionAnalysisStep() {
  const router = useRouter()
  const { answers } = useQuizStore()

  const heightMeters = useMemo(
    () => parseHeight(answers.height, answers.heightUnit),
    [answers.height, answers.heightUnit],
  )

  const weightKg = useMemo(
    () => parseWeight(answers.weight, answers.weightUnit),
    [answers.weight, answers.weightUnit],
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
    if (!bmi) return 0.5
    const min = 15
    const max = 40
    return clamp((bmi - min) / (max - min), 0, 1)
  }, [bmi])

  const bmiImageSrc = useMemo(() => {
    const gender = answers.gender === 2 ? 'female' : 'male'
    return `/images/onboarding/bmi_${gender}_${bmiCategory.imageIndex}.png`
  }, [answers.gender, bmiCategory.imageIndex])

  const heightUnitLabel = answers.heightUnit === 'cm' ? 'cm' : 'ft & in'
  const weightUnitLabel = answers.weightUnit === 'kg' ? 'kg' : 'lbs'

  const getConditionScore = (condition: keyof typeof CONDITION_COPY | 'overall') => {
    const baseScores: Record<string, number> = {
      skin: 6,
      hair: 9,
      physic: 6,
      mental: 6,
      overall: 7.2,
    }
    return baseScores[condition] ?? 7
  }

  const overallScore = getConditionScore('overall')

  const bmiGradient = 'linear-gradient(90deg, #43B7FF 0%, #33C75A 25%, #FBF447 50%, #FFA64D 75%, #FF7D7E 100%)'
  const bmiColumnGradient = 'linear-gradient(180deg, #FF7D7E 0%, #FFA64D 20%, #FBF447 45%, #33C75A 70%, #43B7FF 100%)'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F5F5]">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-r from-[#F4EBFF] via-[#E7E8FF] to-[#D1D9FF]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-12">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 rounded-3xl bg-white/70 px-6 py-5 shadow-[0_28px_60px_rgba(91,72,154,0.15)] backdrop-blur md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D8D8F3] bg-white text-[#5C4688] transition hover:bg-[#EFEAFE]"
              aria-label="Go back"
            >
              <span className="text-2xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#5C4688] md:text-3xl">
                Current Condition Analysis
              </h1>
              <p className="text-sm text-[#7777A0] md:text-base">
                Based on your photos and answers, here’s where you are today.
              </p>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/premium-intro')}
            className="inline-flex items-center justify-center rounded-full bg-[#A385E9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#A385E9]/30 transition hover:bg-[#9170e3]"
          >
            Explore Premium Insights
          </motion.button>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid gap-8 rounded-3xl bg-white p-8 shadow-[0_32px_72px_rgba(91,72,154,0.14)] lg:grid-cols-[1.4fr,0.9fr]"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#969AB7]">Your BMI</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#5C4688]">
                    {bmi ? bmi.toFixed(1) : '—'}
                  </span>
                  <span className={`text-lg font-semibold ${bmiCategory.textAccent}`}>
                    {bmiCategory.label}
                  </span>
                </div>
                <p className="mt-3 max-w-xl text-base text-[#6E6F92]">
                  {bmi ? bmiCategory.description : 'Add your height and weight to unlock a personalised BMI insight.'}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="relative flex h-44 w-40 shrink-0 items-end justify-center"
              >
                <Image
                  src={bmiImageSrc}
                  alt={`${bmiCategory.label} illustration`}
                  width={220}
                  height={220}
                  className="h-full w-auto object-contain"
                  priority
                />
                <div
                  className="absolute inset-x-6 -bottom-4 h-3 rounded-full"
                  style={{ background: bmiGradient }}
                >
                  <motion.span
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-lg"
                    animate={{ left: `${bmiPosition * 100}%`, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                  />
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-32 w-14 flex-col justify-end rounded-full p-1"
                  style={{ background: bmiColumnGradient }}
                >
                  <motion.div
                    className="w-full rounded-full bg-white shadow"
                    animate={{ height: bmi ? `${clamp(bmi, 16, 34) * 2}%` : '20%' }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  />
                </div>
                <div className="rounded-2xl bg-[#F7F8FF] px-5 py-3 text-sm text-[#5C4688]">
                  <p className="font-semibold">Height: {answers.height || '—'} {answers.height ? heightUnitLabel : ''}</p>
                  <p className="font-semibold">Weight: {answers.weight || '—'} {answers.weight ? weightUnitLabel : ''}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#E0E3FF] bg-[#F9F8FF] px-6 py-4 text-sm leading-relaxed text-[#6E6F92]">
                The colour bar shows how your BMI sits across the spectrum—from lean blues to warmer tones. Keep an eye on this gauge as you progress.
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-tr from-white via-white to-[#F2EDFF] p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#969AB7]">Beauty Mirror Score</p>
              <h2 className="mt-2 text-4xl font-bold text-[#5C4688]">{overallScore.toFixed(1)}</h2>
              <p className="mt-2 text-sm text-[#6E6F92]">
                Averaged from BMI, skin, hair, physical and mental scores. Balanced routines keep your BMS glowing.
              </p>
            </div>
            <div className="space-y-5">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: bmiGradient }}
                  animate={{ width: `${overallScore * 10}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
              </div>
              <div className="flex items-center gap-4">
                <ScoreDonut value={overallScore} accent="#A385E9" />
                <p className="text-sm text-[#6E6F92]">
                  Keep up the consistent routine! Pair your plan with hydration, movement, and mindful downtime.
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/procedures/1')}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#5C4688] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5C4688]/30 transition hover:bg-[#473574]"
            >
              To The Activities
            </motion.button>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {CONDITION_ORDER.map(({ id, title, accent }) => {
            const score = getConditionScore(id)
            const copy = CONDITION_COPY[id]
            return (
              <motion.div
                key={id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(91,72,154,0.12)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(91,72,154,0.18)]"
              >
                <div className={`absolute -right-20 top-0 h-48 w-48 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl transition group-hover:opacity-30`} />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#A39CC9]">Focus area</p>
                    <h3 className="text-xl font-semibold text-[#5C4688]">{title}</h3>
                    <p className="text-sm leading-relaxed text-[#6E6F92]">{copy}</p>
                  </div>
                  <ScoreDonut value={score} />
                </div>
              </motion.div>
            )
          })}
        </motion.section>
      </div>
    </div>
  )
}





