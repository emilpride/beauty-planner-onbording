'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

const getPersonImage = (gender: string, bmiCategory: typeof BMI_CATEGORIES[0]) => {
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

const ScoreBadge = ({ value, accent = 'rgb(var(--color-primary))' }: { value: number; accent?: string }) => (
  <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
    <span className="h-8 w-8 rounded-full border-2 border-current/15 bg-white text-center leading-8 shadow-soft dark:bg-surface/90" style={{ color: accent }}>
      {value.toFixed(1)}
    </span>
    <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">/10</span>
  </div>
)

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
    if (!bmi) return 0.4
    const min = 15
    const max = 45
    return clamp((bmi - min) / (max - min), 0, 1)
  }, [bmi])

  const heightLabel = answers.height ? `${answers.height} ${answers.heightUnit === 'cm' ? 'cm' : 'ft & in'}` : 'Not provided'
  const weightLabel = answers.weight ? `${answers.weight} ${answers.weightUnit === 'kg' ? 'kg' : 'lbs'}` : 'Not provided'

  const baseScores: Record<string, number> = {
    skin: 6,
    hair: 9,
    physic: 6,
    mental: 6,
    overall: 7.2,
  }

  const overallScore = baseScores.overall

  const sliderGradient = 'linear-gradient(180deg, #0066CC 0%, #43B7FF 16.67%, #33C75A 33.33%, #FBF447 50%, #FFA64D 66.67%, #FF7D7E 83.33%, #8B0000 100%)'
  const barGradient = 'linear-gradient(90deg, #0066CC 0%, #43B7FF 16.67%, #33C75A 33.33%, #FBF447 50%, #FFA64D 66.67%, #FF7D7E 83.33%, #8B0000 100%)'

  return (
    <motion.div 
      className="relative bg-background min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/3 via-primary/1 to-transparent dark:from-primary/6 dark:via-primary/2 dark:to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-5 pb-12 pt-8">
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
                {/* Gradient Fill */}
                <div 
                  className="absolute w-[18px] h-[344px] left-[9px] top-0 rounded-full"
                  style={{ 
                    background: 'linear-gradient(180deg, #0066CC 0%, #43B7FF 16.67%, #33C75A 33.33%, #FBF447 50%, #FFA64D 66.67%, #FF7D7E 83.33%, #8B0000 100%)' 
                  }}
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
                    color: '#F8EF13',
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
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.3 }}
                  >
                    {bmi ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8, duration: 0.5 }}
                      >
                        {bmi.toFixed(1)}
                      </motion.span>
                    ) : '–'}
                  </motion.span>
                </motion.div>
              </motion.div>
              
              {/* Person Image */}
              <motion.div 
                className="flex-shrink-0"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                <Image
                  src={getPersonImage(answers.gender || 'male', bmiCategory)}
                  alt={`${answers.gender || 'male'} BMI ${bmi ? bmi.toFixed(1) : 'unknown'}`}
                  width={120}
                  height={200}
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </motion.article>

          {CONDITION_ORDER.map(({ id, title }, index) => {
            const score = baseScores[id]
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
                  <ScoreBadge value={score} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{CONDITION_COPY[id]}</p>
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
            
            {/* BMS Score Display */}
            <motion.div 
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <motion.div 
                className="text-6xl font-semibold leading-none mb-2"
                style={{ color: '#84DE54' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6, type: "spring", stiffness: 200 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                >
                  {overallScore.toFixed(1)}
                </motion.span>
              </motion.div>
              <motion.p 
                className="text-sm font-semibold text-text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              >
                Your BMS is: <span className="text-primary">Balanced</span>
              </motion.p>
              <motion.p 
                className="text-sm text-text-secondary mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                Keep up the consistent routine!
              </motion.p>
            </motion.div>

            {/* BMS Scale */}
            <motion.div 
              className="relative w-full h-9 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              {/* Background Track */}
              <div 
                className="absolute w-full h-[10px] top-[13px] rounded-full"
                style={{ background: '#EBEDFC' }}
              />
              {/* Gradient Fill */}
              <div 
                className="absolute w-full h-[18px] top-[9px] rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, #33C75A 0%, #84DE54 36.54%, #FFA64D 69.71%, #FF7D7E 100%)' 
                }}
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

            <motion.button
              type="button"
              onClick={() => router.push('/signup')}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              To The Activities
            </motion.button>
          </motion.article>
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
