'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, useReducedMotion } from 'framer-motion'
import { useRef, useEffect, useMemo } from 'react'
import { useQuizStore } from '@/store/quizStore'

export default function RegularCareResultsStep() {
  const router = useRouter()
  const { analysis: aiModel, answers } = useQuizStore()

  const handlePricePlans = () => {
    router.push('/payment')
  }

  // ---- BMI helpers (mirrors CurrentConditionAnalysisStep) ----
  const BMI_CATEGORIES = [
    { id: 'severely-underweight', range: [0, 15.9], imageLevel: 1 },
    { id: 'underweight',          range: [16.0, 18.4], imageLevel: 1 },
    { id: 'healthy',              range: [18.5, 24.9], imageLevel: 2 },
    { id: 'overweight',           range: [25.0, 29.9], imageLevel: 3 },
    { id: 'obese-class1',         range: [30.0, 34.9], imageLevel: 4 },
    { id: 'obese-class2',         range: [35.0, 39.9], imageLevel: 5 },
    { id: 'obese-class3',         range: [40.0, 100],  imageLevel: 5 },
  ] as const

  const parseNumber = (value?: string | null) => {
    if (!value) return null
    const normalised = value.replace(/[^0-9.,]/g, '').replace(',', '.')
    const parsed = Number(normalised)
    return Number.isFinite(parsed) ? parsed : null
  }

  const parseHeight = (heightValue?: string | null, unit?: 'cm' | 'ft&in' | null): number | null => {
    if (!heightValue) return null
    const u = unit || 'cm'
    if (u === 'cm') {
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

  const parseWeight = (weightValue?: string | null, unit?: 'kg' | 'lbs' | null): number | null => {
    const numeric = parseNumber(weightValue || '')
    if (!numeric) return null
    return (unit || 'kg') === 'kg' ? numeric : numeric * 0.453592
  }

  const heightMeters = useMemo(
    () => parseHeight(answers?.Height, (answers?.HeightUnit as any) || 'cm'),
    [answers?.Height, answers?.HeightUnit]
  )
  const weightKg = useMemo(
    () => parseWeight(answers?.Weight, (answers?.WeightUnit as any) || 'kg'),
    [answers?.Weight, answers?.WeightUnit]
  )
  const bmiValue = useMemo(() => {
    const v = (aiModel as any)?.bmi
    if (typeof v === 'number' && Number.isFinite(v)) return Number(v)
    if (heightMeters && weightKg) {
      const calculated = weightKg / (heightMeters * heightMeters)
      return Number.isFinite(calculated) ? parseFloat(calculated.toFixed(1)) : null
    }
    return null
  }, [aiModel, heightMeters, weightKg])

  const bmiCategory = useMemo(() => {
    if (!bmiValue) return BMI_CATEGORIES[1]
    return (
      BMI_CATEGORIES.find((cat) => bmiValue >= cat.range[0] && bmiValue <= cat.range[1]) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
    )
  }, [bmiValue])

  // Keep gender mapping consistent across app: 2 = female, else male
  const genderPrefix = (answers as any)?.Gender === 2 ? 'female' : 'male'
  const bmiImages = useMemo(() => {
    const current = `/images/on_boarding_images/bmi_${genderPrefix}_${bmiCategory.imageLevel}.png`
    const target = `/images/on_boarding_images/bmi_${genderPrefix}_2.png` // ideal healthy
    return { current, target }
  }, [genderPrefix, bmiCategory])

  // ----- BMS values (from Current Condition Analysis) -----
  const clamp10 = (v: number) => Math.min(10, Math.max(0, v))
  const baseBms = useMemo(() => {
    const v = (aiModel as any)?.bmsScore
    return clamp10(typeof v === 'number' && Number.isFinite(v) ? Number(v) : 6)
  }, [aiModel])
  const baseBmsInt = Math.round(baseBms)
  const bmsPlus10 = clamp10(baseBms * 1.1)
  const bmsPlus10Int = Math.round(bmsPlus10)
  const bmsPlus30 = clamp10(baseBms * 1.3)
  const bmsPlus30Int = Math.round(bmsPlus30)
  // For r=30: circumference ≈ 188.495... keep in sync with existing 188.4
  const CIRC = 2 * Math.PI * 30
  const dash = (val: number) => `${(val / 10) * CIRC} ${CIRC}`

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: 'Start using the app:',
      description: 'Get personalized routines for skin, hair, fitness & self-care.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      title: 'Stay consistent with your routine:',
      description: 'Automatic reminders help you build healthy habits.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Complete daily self-care rituals:',
      description: 'Follow your plan to nurture beauty & well-being.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: 'Unlock achievements & stay motivated:',
      description: 'Reach new milestones as you stick to your routine.',
    },
  ]

  const struggles = [
    'Struggle to stay consistent with self-care',
    'Forget important skincare, haircare, or wellness steps',
    'No clear way to track your beauty habits',
  ]

  const solutions = [
    'Follow a structured beauty & wellness routine effortlessly',
    'Get reminders to keep up with your personalized plan',
    'See your completed routines and progress over time',
    'Unlock achievements and stay inspired',
  ]

  const benefitsRef = useRef<HTMLDivElement | null>(null)
  const strugglesRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.3 })
  const strugglesInView = useInView(strugglesRef, { once: true, amount: 0.3 })

  // Vertical timeline progress (scroll-driven)
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress: timelineProgress } = useScroll({ container: scrollContainerRef, target: timelineRef, offset: ['start 0.85', 'end 0.15'] })
  const progressHeight = useTransform(timelineProgress, [0, 1], ['0%', '100%'])

  // Motion values for graphs
  const pathLength = useMotionValue(0)
  const bioPathLength = useMotionValue(0)
  const lifePathLength = useMotionValue(0)
  const withoutAppX = useTransform(pathLength, [0, 1], [65, 315])
  const withoutAppY = useTransform(pathLength, [0, 1], [200, 170])
  const withAppX = useTransform(pathLength, [0, 1], [65, 315])
  const withAppY = useTransform(pathLength, [0, 1], [200, 80])

  useEffect(() => {
    const animation = animate(pathLength, 1, {
      duration: 2,
      ease: 'easeInOut',
      delay: 0.5,
    })
    return animation.stop
  }, [pathLength])

  useEffect(() => {
    const a = animate(bioPathLength, 1, { duration: 2, ease: 'easeInOut', delay: 0.3 })
    return a.stop
  }, [bioPathLength])

  useEffect(() => {
    const a = animate(lifePathLength, 1, { duration: 2.2, ease: 'easeInOut', delay: 0.4 })
    return a.stop
  }, [lifePathLength])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 140,
        damping: 16,
      },
    },
  };

  const testimonials = [
    { name: 'Emily', image: '/images/reviews/review_1.png', text: 'This service is a real find! Thanks for the accuracy and professionalism!' },
    { name: 'Aisha', image: '/images/reviews/review_2.png', text: "I'm stoked! The results have been a source of inspiration." },
    { name: 'Mira', image: '/images/reviews/review_3.png', text: 'The plan keeps me consistent—real results.' },
    { name: 'Lisa', image: '/images/reviews/review_4.png', text: 'The planning feature is amazing! My routine is perfectly organized now.' },
    { name: 'Sofia', image: '/images/reviews/review_5.png', text: "Finally found the perfect beauty routine planner! It's so easy to follow." },
    { name: 'Anna', image: '/images/reviews/review_6_old_woman.png', text: 'My beauty routine has never been this organized! Love the planning tools.' },
    // New short American English reviews
    { name: 'Chloe', image: '/images/reviews/review_4.png', text: 'Planning made it click—quick wins and real results.' },
    { name: 'Jasmine', image: '/images/reviews/review_5.png', text: 'So easy to stick with—my routine finally feels effortless.' },
    { name: 'Noah', image: '/images/reviews/review_6_man.png', text: 'Clean UI, smart reminders—results showed up fast.' },
    { name: 'Evelyn', image: '/images/reviews/review_6_old_woman.png', text: 'Simple plan, big payoff. Loving the glow-up.' },
  ];

  // Carousel constants and motion
  // Use precise stride: 141 card width + 10 gap (gap-2.5)
  const STRIDE = 151;
  const nCards = testimonials.length;
  const totalWidth = STRIDE * nCards;
  const x = useMotionValue(-totalWidth);
  const draggingRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const dprRef = useRef<number>(1);
  useEffect(() => {
    dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const speed = 12; // px/sec auto drift to the left

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!draggingRef.current && !reducedMotion) {
        const current = x.get();
        const nextRaw = current - speed * dt;
        const dpr = dprRef.current;
        const next = Math.round(nextRaw * dpr) / dpr;
        x.set(next);
        const curr = x.get();
        // normalize into [-2*totalWidth, 0]
        if (curr < -2 * totalWidth) x.set(curr + totalWidth);
        if (curr > 0) x.set(curr - totalWidth);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalWidth, x, reducedMotion]);

  // Timeline item component
  const TimelineItem = ({ title, description, icon, index, rootRef }: { title: string; description: string; icon: React.ReactNode; index: number; rootRef: React.RefObject<HTMLDivElement | null> }) => {
    const itemRef = useRef<HTMLLIElement | null>(null);
    const itemInView = useInView(itemRef, { root: rootRef as any, amount: 0.3, margin: '-10% 0% -10% 0%', once: false });

    return (
      <li ref={itemRef} className="relative grid grid-cols-[36px_1fr] gap-3">
        <div className="relative">
          {/* Burst effect */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(163,133,233,0.35), rgba(163,133,233,0.0))',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={itemInView ? { opacity: 1, scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          />
          <div className="w-9 h-9 rounded-full bg-surface-muted/80 ring-1 ring-border-subtle/50 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-text-primary leading-tight">{title}</h4>
          <p className="text-sm text-text-secondary leading-tight">{description}</p>
        </div>
      </li>
    );
  };

  return (
    <motion.div
      className="w-full h-[100dvh] bg-surface flex flex-col overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="max-w-md mx-auto p-6 pb-28 space-y-6">
          {/* Header */}
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-text-primary mb-3">Regular Care = Better Results!</h1>
            <p className="text-text-secondary">
              On average, our users improve their well-being by 30% within the first month!
            </p>
          </motion.div>

          {/* Progress Graph - unified width (BMS clarity) */}
          <motion.div
            className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--color-card-muted), 1) 0%, rgba(var(--color-primary), 0.08) 100%)',
            }}
            variants={itemVariants}
          >
            {/* Legend: clarify it's BMS with/without app */}
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-5 rounded" style={{ background: 'linear-gradient(90deg, #2AEA5C, #84DE54)' }} />
                <span className="text-xs text-text-secondary">BMS with app</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-5 rounded" style={{ background: 'linear-gradient(90deg, #FFA64D, #FE6C6C)' }} />
                <span className="text-xs text-text-secondary">BMS without app</span>
              </div>
            </div>
            <div className="relative w-full aspect-[350/270]">
              <svg viewBox="0 0 350 270" className="absolute inset-0 w-full h-full">
                <defs>
                <linearGradient id="withAppGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#84DE54" />
                    <stop offset="100%" stopColor="#2AEA5C" />
                  </linearGradient>
                {/* Light theme gradient for "without app" */}
                <linearGradient id="withoutAppGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFA64D" />
                  <stop offset="100%" stopColor="#FE6C6C" />
                </linearGradient>
                {/* Dark theme gradient for "without app" with brighter tones */}
                <linearGradient id="withoutAppGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFC46B" />
                  <stop offset="100%" stopColor="#FF7A7A" />
                </linearGradient>
                {/* Soft glow for dark theme visibility */}
                <filter id="glowDark" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="verticalBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="1.04%" stopColor="rgba(111, 221, 141, 0)" />
                  <stop offset="28.13%" stopColor="#2BAE70" />
                  <stop offset="66.67%" stopColor="#FE464B" />
                  <stop offset="98.44%" stopColor="rgba(254, 108, 108, 0)" />
                  </linearGradient>
                </defs>

              {/* Vertical Bar (decorative) */}
              <motion.rect 
                x="260" y="40" width="70" height="190" 
                fill="url(#verticalBarGradient)" 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.25, scaleY: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />

              {/* Y Axis (BMS 0-10) */}
              <line x1="40" y1="50" x2="40" y2="230" stroke="#B3D2E8" strokeWidth="2" />
              {([0,2,4,6,8,10] as const).map((tick, i) => {
                const y = 230 - i * 20; // 0..10 step 2
                return (
                  // @ts-ignore - inline SVG mapping okay
                  <g key={tick}>
                    <line x1="36" y1={y} x2="40" y2={y} stroke="#B3D2E8" strokeWidth="2" />
                    <text x="30" y={y + 4} textAnchor="end" fill="#69798E" fontWeight="600" fontSize="11">{tick}</text>
                  </g>
                )
              })}
              <text x="18" y="140" transform="rotate(-90 18 140)" textAnchor="middle" fill="#476B9A" fontWeight="700" fontSize="12">BMS (0–10)</text>

              {/* Axis Line */}
              <line x1="20" y1="230" x2="330" y2="230" stroke="#B3D2E8" strokeWidth="2" />
              <circle cx="35" cy="230" r="5" fill="#7798C3" />
              <circle cx="315" cy="230" r="5" fill="#7798C3" />
              <text x="35" y="250" textAnchor="middle" fill="#69798E" fontWeight="600" fontSize="16">Today</text>
              <text x="315" y="250" textAnchor="middle" fill="#69798E" fontWeight="600" fontSize="16">30 Days</text>

              {/* Graph Lines */}
              {/* Without app line - light theme */}
              <motion.path 
                className="dark:hidden"
                d="M 65 200 C 150 220, 200 200, 315 170" 
                stroke="url(#withoutAppGradientLight)" strokeWidth="3" fill="none" 
                style={{ pathLength }}
              />
              {/* Without app line - dark theme with glow */}
              <motion.path 
                className="hidden dark:block"
                d="M 65 200 C 150 220, 200 200, 315 170" 
                stroke="url(#withoutAppGradientDark)" strokeWidth="4" fill="none" filter="url(#glowDark)"
                style={{ pathLength }}
              />
              {/* With app line - light theme */}
              <motion.path 
                className="dark:hidden"
                d="M 65 200 C 150 220, 200 100, 315 80" 
                stroke="url(#withAppGradient)" strokeWidth="3" fill="none" 
                style={{ pathLength }}
              />
              {/* With app line - dark theme with glow */}
              <motion.path 
                className="hidden dark:block"
                d="M 65 200 C 150 220, 200 100, 315 80" 
                stroke="url(#withAppGradient)" strokeWidth="4" fill="none" filter="url(#glowDark)"
                style={{ pathLength }}
              />

              {/* Line Labels */}
              {/* Light theme label */}
              <text className="dark:hidden" x="190" y="195" textAnchor="middle" fill="#333333" fontWeight="600" fontSize="13">BMS without app</text>
              {/* Dark theme label with brighter color for contrast */}
              <text className="hidden dark:block" x="190" y="195" textAnchor="middle" fill="#FFC46B" fontWeight="700" fontSize="13">BMS without app</text>
              <text x="190" y="60" textAnchor="middle" fill="#476B9A" fontWeight="700" fontSize="14">BMS with app</text>

              {/* Score Circles */}
              <motion.g 
                style={{ x: withoutAppX, y: withoutAppY }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <circle r="34" fill="#F0D1C8" />
                <circle r="30" fill="none" stroke="#84DE54" strokeWidth="6" strokeDasharray={dash(bmsPlus10)} transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#3C7C1A">
                  {bmsPlus10Int}<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </motion.g>

              <motion.g 
                style={{ x: withAppX, y: withAppY }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <circle r="34" fill="#F9FAFF" />
                <circle r="30" fill="none" stroke="#2AEA5C" strokeWidth="6" strokeDasharray={dash(bmsPlus30)} transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#187348">
                  {bmsPlus30Int}<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </motion.g>

              {/* Static 5/10 circle at the start - light */}
              <g transform="translate(65, 200)" className="dark:hidden">
                <circle r="34" fill="#FFF2E5" />
                <circle r="30" fill="none" stroke="#FFA64D" strokeWidth="6" strokeDasharray={dash(baseBms)} transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#DA7C1D">
                  {baseBmsInt}<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </g>
              {/* Static 5/10 circle at the start - dark with glow */}
              <g transform="translate(65, 200)" className="hidden dark:block" filter="url(#glowDark)">
                <circle r="34" fill="#3A2A22" />
                <circle r="30" fill="none" stroke="#FF7A4D" strokeWidth="7" strokeDasharray={dash(baseBms)} transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#FFC46B">
                  {baseBmsInt}<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </g>

              {/* Triangles */}
              <motion.text 
                x="315" y="115" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 0,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              <motion.text 
                x="315" y="130" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 0.5,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              <motion.text 
                x="315" y="145" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 1,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              </svg>
            </div>
          </motion.div>

        {/* Life Expectancy Projection - Bar Chart (moved under BMS) */}
        <motion.div
          className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft"
          style={{ background: 'linear-gradient(135deg, rgba(var(--color-card-muted), 1) 0%, rgba(var(--color-primary), 0.06) 100%)' }}
          variants={itemVariants}
        >
          {(() => {
            const maxYears = 100
            // Derive chronological age
            const parseAge = (): number => {
              const a = (answers as any)?.Age
              if (typeof a === 'number' && Number.isFinite(a)) return Math.max(0, Math.min(120, a))
              const bd = (answers as any)?.BirthDate
              if (typeof bd === 'string' && bd) {
                const d = new Date(bd)
                if (!isNaN(d.getTime())) {
                  const now = new Date()
                  let age = now.getFullYear() - d.getFullYear()
                  const m = now.getMonth() - d.getMonth()
                  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
                  return Math.max(0, Math.min(120, age))
                }
              }
              return 30 // fallback if no age available
            }
            const age = parseAge()
            // Sex 1=female, 0=male, 2=unspecified -> assume male baseline
            const isFemale = (answers as any)?.Gender === 1
            // Simple baseline life expectancy by sex (can be refined per region)
            const baseLifeExpectancy = isFemale ? 84 : 80
            const remaining = Math.max(0, baseLifeExpectancy - age)

            // Enhancement tied to BMS uplift: base -> +30%
            const baseBms = (() => {
              const v = (aiModel as any)?.bmsScore
              if (typeof v === 'number' && Number.isFinite(v)) return Math.min(10, Math.max(0, Number(v)))
              return 6
            })()
            const bmsPlus30 = Math.min(10, baseBms * 1.3)
            const uplift = Math.max(0, bmsPlus30 - baseBms) // up to ~3
            // Map uplift to percent on remaining years: base 8% + up to +4%
            const enhancementPct = Math.min(0.12, 0.08 + (uplift / 10) * 0.04)
            // Slight decay without structured plan
            const decayPct = 0.02

            const clampTot = (v: number) => Math.min(maxYears, Math.max(age, v))
            const baselineYears = clampTot(baseLifeExpectancy)
            const withAppYears = clampTot(baseLifeExpectancy + remaining * enhancementPct)
            const withoutAppYears = clampTot(baseLifeExpectancy - remaining * decayPct)
            // Display as integers only
            const baselineYearsInt = Math.round(baselineYears)
            const withAppYearsInt = Math.round(withAppYears)
            const withoutAppYearsInt = Math.round(withoutAppYears)

            const SCALE = 0.94
            const h = (years: number) => `${(years / maxYears) * 100 * SCALE}%`
            const shownEnhPct = Math.round(enhancementPct * 100)
            return (
              <>
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-text-primary mb-1">Life Expectancy Enhancement</h4>
                  <div className="text-2xl font-bold text-text-primary">+{shownEnhPct}%</div>
                </div>

                {/* Horizontal bar chart (stacked) */}
                <div className="w-full space-y-4 mb-4">
                  {/* Baseline (expected total lifespan) */}
                  <div className="w-full">
                    <div className="text-xs text-text-secondary mb-1">Baseline</div>
                    <div className="w-full h-8 rounded-r-full rounded-l-sm bg-border-subtle/30 relative overflow-visible">
                      <motion.div
                        className="h-8 rounded-r-full rounded-l-sm relative shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
                        style={{ width: h(baselineYears), backgroundImage: 'linear-gradient(90deg, rgba(138,96,255,0.95) 0%, rgba(163,133,233,0.75) 100%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: h(baselineYears) }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-primary">{baselineYearsInt} yrs</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* With App (enhanced total lifespan) */}
                  <div className="w-full">
                    <div className="text-xs text-text-secondary mb-1">With App</div>
                    <div className="w-full h-8 rounded-r-full rounded-l-sm bg-border-subtle/30 relative overflow-visible">
                      <motion.div
                        className="h-8 rounded-r-full rounded-l-sm relative shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
                        style={{ width: h(withAppYears), backgroundImage: 'linear-gradient(90deg, rgba(46,125,50,0.95) 0%, rgba(111,221,141,0.85) 100%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: h(withAppYears) }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                      >
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-primary">{withAppYearsInt} yrs</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Without App (no structured plan) */}
                  <div className="w-full">
                    <div className="text-xs text-text-secondary mb-1">Without App</div>
                    <div className="w-full h-8 rounded-r-full rounded-l-sm bg-border-subtle/30 relative overflow-visible">
                      <motion.div
                        className="h-8 rounded-r-full rounded-l-sm relative shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
                        style={{ width: h(withoutAppYears), backgroundImage: 'linear-gradient(90deg, rgba(255,166,77,0.95) 0%, rgba(254,108,108,0.85) 100%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: h(withoutAppYears) }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-primary">{withoutAppYearsInt} yrs</div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #8A60FF, #A385E9)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">Current lifestyle baseline</span>
                    <span className="text-sm font-semibold text-text-primary">{baselineYearsInt} yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #6ED682, #A385E9)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">With beauty & wellness app</span>
                    <span className="text-sm font-semibold text-text-primary">{withAppYearsInt} yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #FF8A50, #8A60FF)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">Without structured care</span>
                    <span className="text-sm font-semibold text-text-primary">{withoutAppYearsInt} yrs</span>
                  </div>
                </div>
              </>
            )
          })()}
        </motion.div>

        {/* Age Snapshot - Bar Chart (Current, Biological, With App) — moved under BMS */}
        <motion.div
          className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft mt-6"
          style={{ background: 'linear-gradient(135deg, rgba(var(--color-card-muted), 1) 0%, rgba(var(--color-primary), 0.06) 100%)' }}
          variants={itemVariants}
        >
          {(() => {
            const maxYears = 100
            // Derive chronological age
            const parseAge = (): number => {
              const a = (answers as any)?.Age
              if (typeof a === 'number' && Number.isFinite(a)) return Math.max(0, Math.min(120, a))
              const bd = (answers as any)?.BirthDate
              if (typeof bd === 'string' && bd) {
                const d = new Date(bd)
                if (!isNaN(d.getTime())) {
                  const now = new Date()
                  let age = now.getFullYear() - d.getFullYear()
                  const m = now.getMonth() - d.getMonth()
                  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
                  return Math.max(0, Math.min(120, age))
                }
              }
              return 30
            }
            const currentAge = Math.round(parseAge())
            // Biological age based on BMS (lower BMS -> older biological age)
            // zero point near BMS=6 (neutral), ~1.2 years per point deviation
            const bioDelta = Math.round((6 - baseBms) * 1.2)
            const maxBio = 100
            const rawBiological = Math.min(maxBio, Math.max(14, currentAge + bioDelta))
            // Ensure Biological is always slightly above Current
            const biologicalAge = Math.max(currentAge + 1, rawBiological)
            // Projected biological age with app (using BMS +30%)
            const projBms = Math.min(10, baseBms * 1.3)
            const projBioDelta = Math.round((6 - projBms) * 1.2)
            const rawWithApp = Math.min(maxBio, Math.max(14, currentAge + projBioDelta))
            // Ensure With App is always slightly below Current
            const withAppAge = Math.max(14, Math.min(currentAge - 1, rawWithApp))
            // Slight height boost to raise bars visually
            const h = (years: number) => `${Math.min((years / maxYears) * 100 * 1.3, 100)}%`
            return (
              <>
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-text-primary mb-1">Age Snapshot</h4>
                  <div className="text-sm text-text-secondary">Lower is better (biological)</div>
                </div>

                <div className="relative w-full h-56 mb-4">
                  {/* Grid lines */}
                  <div className="absolute inset-0 z-0">
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <div key={percent} className="absolute w-full border-b border-dashed border-border-subtle/20" style={{ bottom: `${percent}%` }} />
                    ))}
                  </div>

                  {/* Bars container */}
                  <div className="absolute inset-0 flex items-end justify-center gap-10 px-8 z-10">
                    {/* Bar 1: Current (Chronological) */}
                    <div className="flex items-end justify-center flex-1 max-w-[88px] h-full">
                      <motion.div
                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                        style={{ background: 'linear-gradient(180deg, rgba(138,96,255,0.95) 0%, rgba(163,133,233,0.75) 100%)' }}
                        initial={{ height: 0, transformOrigin: 'bottom' }}
                        animate={{ height: h(currentAge), transformOrigin: 'bottom' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{Math.round(currentAge)} yrs</div>
                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                      </motion.div>
                    </div>

                    {/* Bar 2: Biological (current) */}
                    <div className="flex items-end justify-center flex-1 max-w-[88px] h-full">
                      <motion.div
                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                        style={{ background: 'linear-gradient(180deg, rgba(255,138,80,0.95) 0%, rgba(138,96,255,0.25) 100%)' }}
                        initial={{ height: 0, transformOrigin: 'bottom' }}
                        animate={{ height: h(biologicalAge), transformOrigin: 'bottom' }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{Math.round(biologicalAge)} yrs</div>
                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                      </motion.div>
                    </div>

                    {/* Bar 3: With App (projected biological) */}
                    <div className="flex items-end justify-center flex-1 max-w-[88px] h-full">
                      <motion.div
                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                        style={{ background: 'linear-gradient(180deg, rgba(110,214,130,0.95) 0%, rgba(138,96,255,0.35) 100%)' }}
                        initial={{ height: 0, transformOrigin: 'bottom' }}
                        animate={{ height: h(withAppAge), transformOrigin: 'bottom' }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{Math.round(withAppAge)} yrs</div>
                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Bar captions */}
                <div className="px-8 grid grid-cols-3 gap-10 -mt-2 mb-2">
                  <div className="text-xs text-text-secondary text-center">Current</div>
                  <div className="text-xs text-text-secondary text-center">Biological</div>
                  <div className="text-xs text-text-secondary text-center">With App</div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #8A60FF, #A385E9)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">Current chronological age</span>
                    <span className="text-sm font-semibold text-text-primary">{Math.round(currentAge)} yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #FF8A50, #8A60FF)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">Current biological age</span>
                    <span className="text-sm font-semibold text-text-primary">{Math.round(biologicalAge)} yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #6ED682, #A385E9)' }}></div>
                    <span className="text-sm text-text-secondary flex-1">Biological age with app</span>
                    <span className="text-sm font-semibold text-text-primary">{Math.round(withAppAge)} yrs</span>
                  </div>
                </div>
              </>
            )
          })()}
        </motion.div>

          {/* Before/After Images - unified width */}
          <motion.div 
            className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft" style={{ backgroundColor: 'rgb(var(--color-card-muted))' }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* User's Current Result */}
              <motion.div
                className="text-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="relative w-36 h-52 sm:w-40 sm:h-56 mx-auto">
                  <Image
                    src={bmiImages.current}
                    alt="User's current BMI result"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="text-sm text-text-secondary font-medium mt-2">You now</div>
              </motion.div>
              
              {/* Arrow */}
              <motion.div
                className="flex items-center justify-center self-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                  <Image
                    src="/images/content/improvement_arrow.png"
                    alt="Improvement arrow"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </motion.div>

              {/* Target Goal */}
              <motion.div
                className="text-center"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="relative w-36 h-52 sm:w-40 sm:h-56 mx-auto">
                  <Image
                    src={bmiImages.target}
                    alt="Target goal BMI"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="text-sm text-text-secondary font-medium mt-2">You healthy</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Motivational Text */}
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-text-primary text-lg">
              The more consistently you follow your routine, the better your beauty level becomes. See the difference for yourself!
            </p>
          </motion.div>

          {/* Benefits as a vertical timeline (stabilized) */}
          <motion.div 
            className="space-y-4" 
            ref={benefitsRef as any}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.25, once: true }}
          >
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-text-primary">Noticeable Improvements In One Month:</h3>
            </div>
            <div ref={timelineRef} className="relative py-1">
              {/* Background track */}
              <div className="absolute left-[18px] top-0 bottom-0 w-[3px] rounded-full bg-primary/10 overflow-hidden">
                {/* Shimmer */}
                <motion.div
                  className="absolute left-0 right-0 h-8"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(var(--color-primary),0.22) 50%, rgba(255,255,255,0.0) 100%)' }}
                  animate={{ top: ['-2rem', '100%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              {/* Foreground progress line with moving cap */}
              <motion.div
                className="absolute left-[18px] top-0 w-[3px] rounded-full"
                style={{ height: progressHeight, background: 'linear-gradient(180deg, #A385E9 0%, rgba(163,133,233,0.4) 100%)' }}
              >
                <motion.span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
                  style={{ background: 'radial-gradient(circle, #A385E9 0%, rgba(163,133,233,0.5) 60%, rgba(163,133,233,0) 70%)' }}
                  animate={{ scale: [0.9, 1.1, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
              <ul className="space-y-7">
                {benefits.map((benefit, index) => (
                  <TimelineItem key={index} title={benefit.title} description={benefit.description} icon={benefit.icon} index={index} rootRef={scrollContainerRef} />
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Struggles vs Solutions - fixed icon sizes */}
          <motion.div 
            className="bg-surface-muted/80 rounded-xl p-6" 
            ref={strugglesRef as any}
            initial={{ opacity: 0, y: 50 }}
            animate={strugglesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Struggles Column */}
              <motion.div className="space-y-4" initial={{ x: -50, opacity: 0 }} animate={strugglesInView ? { x: 0, opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
                <h4 className="font-bold text-center text-text-primary">Your Struggles</h4>
                {struggles.map((struggle, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-surface-muted/80 ring-1 ring-border-subtle/50 text-text-primary flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </div>
                    <span className="text-text-primary leading-tight">{struggle}</span>
                  </div>
                ))}
              </motion.div>
              {/* Solutions Column */}
              <motion.div className="space-y-4" initial={{ x: 50, opacity: 0 }} animate={strugglesInView ? { x: 0, opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
                <h4 className="font-bold text-center text-text-primary">Our Solutions</h4>
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white ring-1 ring-primary/25 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text-primary leading-tight">{solution}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Testimonials with infinite drag loop */}
          <motion.div className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing" variants={itemVariants}>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10" style={{background: 'linear-gradient(90deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)'}} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10" style={{background: 'linear-gradient(270deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)'}} />
            <motion.div
              className="flex flex-row items-start gap-2.5"
              style={{ width: 'max-content', x, willChange: 'transform', transform: 'translateZ(0)' }}
              drag="x"
              dragConstraints={{ left: -2 * totalWidth, right: 0 }}
              dragElastic={0.04}
              onDragStart={() => (draggingRef.current = true)}
              onDragEnd={() => {
                draggingRef.current = false;
                const val = x.get();
                if (val > 0) {
                  x.set(val - totalWidth);
                } else if (val < -2 * totalWidth) {
                  x.set(val + totalWidth);
                }
              }}
            >
              {[0, 1, 2].map((copy) => (
                <div key={`copy-${copy}`} className="flex flex-row items-start gap-2.5">
                  {testimonials.map((review, index) => (
                    <div key={`${copy}-${index}`} className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none" style={{ width: '141px', height: '298px' }}>
                      <Image src={review.image} alt={`User review ${review.name}`} width={125} height={125} className="w-full h-auto object-cover flex-none rounded-md pointer-events-none" draggable={false} />
                      <div className="flex flex-row items-center gap-1 flex-none">
                        <span className="font-bold text-sm text-text-primary">{review.name}</span>
                        <div className="flex items-center gap-1">
                          <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                        </div>
                      </div>
                      <div className="flex-none self-stretch border border-border-subtle/60" />
                      <div className="flex flex-row items-center gap-2 flex-none">
                        <div className="flex flex-row items-start flex-none">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05"><path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/></svg>
                          ))}
                        </div>
                        <span className="text-xs text-text-secondary">5.0 rating</span>
                      </div>
                      <p className="flex-none self-stretch text-sm text-text-primary" style={{ fontWeight: 500 }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Biological Age Progress chart removed per request */}

          {/* CTA or footer can remain */}
        </div>
      </div>
      {/* Fixed Bottom Button */}
      <motion.div 
        className="fixed inset-x-0 bottom-0 bg-surface p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 pointer-events-none"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto">
          <motion.button 
            onClick={handlePricePlans}
            className="w-full bg-primary text-white py-3.5 rounded-xl text-lg font-semibold pointer-events-auto"
            whileHover={{ scale: 1.05, backgroundColor: 'rgb(var(--color-primary))' }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: ['0px 0px 0px rgba(163, 133, 233, 0)', '0px 0px 20px rgba(163, 133, 233, 0.7)', '0px 0px 0px rgba(163, 133, 233, 0)'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            Get App Access
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
