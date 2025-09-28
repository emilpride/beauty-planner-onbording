
'use client'

import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

type TimelineIcon = 'check' | 'bell' | 'list' | 'star'

interface TimelineItem {
  icon: TimelineIcon
  title: string
  description: string
}

interface ComparisonItem {
  icon: 'minus' | 'check'
  text: string
}

interface Testimonial {
  name: string
  quote: string
  image: string
}

const TIMELINE: TimelineItem[] = [
  {
    icon: 'check',
    title: 'Start using the app',
    description: 'Get personalised routines for skin, hair, fitness and self-care.',
  },
  {
    icon: 'bell',
    title: 'Stay consistent with your routine',
    description: 'Automatic reminders help you build healthy habits.',
  },
  {
    icon: 'list',
    title: 'Complete daily self-care rituals',
    description: 'Follow your plan to nurture beauty and well-being.',
  },
  {
    icon: 'star',
    title: 'Unlock achievements and stay motivated',
    description: 'Reach new milestones as you stick to your routine.',
  },
]

const STRUGGLES: ComparisonItem[] = [
  { icon: 'minus', text: 'Struggle to stay consistent with self-care' },
  { icon: 'minus', text: 'Forget important skincare, haircare or wellness steps' },
  { icon: 'minus', text: 'No clear way to track your beauty habits' },
]

const WINS: ComparisonItem[] = [
  { icon: 'check', text: 'Follow a structured beauty and wellness routine effortlessly' },
  { icon: 'check', text: 'Get reminders to keep up with your personalised plan' },
  { icon: 'check', text: 'See your completed routines and progress over time' },
  { icon: 'check', text: 'Unlock achievements and stay inspired' },
]

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Emily',
    quote: 'This service is a real find! Thanks for the accuracy and professionalism!',
    image: '/images/reviews/review_1.png',
  },
  {
    name: 'Aisha',
    quote: 'I plan every procedure a month ahead now. No more guesswork and my clients notice the glow!',
    image: '/images/reviews/review_2.png',
  },
  {
    name: 'Mira',
    quote: 'Scheduling spa rituals inside the app keeps me consistent even during busy weeks.',
    image: '/images/reviews/review_3.png',
  },
  {
    name: 'Beatriz',
    quote: 'My facial appointments are perfectly spaced. Skin looks luminous and calm.',
    image: '/images/reviews/review_1.png',
  },
  {
    name: 'Sofia',
    quote: 'Love how the plan adapts around photoshoots. Beauty prep finally feels stress-free.',
    image: '/images/reviews/review_2.png',
  },
  {
    name: 'Harper',
    quote: 'Tracking laser sessions and aftercare steps is effortless. The routine practically runs itself.',
    image: '/images/reviews/review_3.png',
  },
]

const marqueeAnimation = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      duration: 26,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}
export default function RegularCareResultsStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gender = searchParams.get('gender') || 'female'
  const bmiValue = Number(searchParams.get('bmi')) || 24
  const idealBmi = gender === 'male' ? 22 : 20

  const currentBmiImage = useMemo(() => getBmiImage(gender, bmiValue), [gender, bmiValue])
  const idealBmiImage = useMemo(() => getBmiImage(gender, idealBmi), [gender, idealBmi])

  const timelineControls = useAnimation()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const timelineInView = useInView(timelineRef, { once: true, margin: '-60px 0px -60px 0px' })

  useEffect(() => {
    if (timelineInView) {
      timelineControls.start({ scaleY: 1, transition: { duration: 0.85, ease: 'easeOut' } })
    }
  }, [timelineControls, timelineInView])

  const handleContinue = () => {
    router.push('/pricing')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className='flex min-h-screen justify-center bg-[#F5F5F5] px-4 py-10 sm:px-6'
    >
      <div className='w-full max-w-md space-y-6'>
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className='rounded-3xl bg-white p-6 shadow-[0_24px_48px_rgba(92,70,136,0.12)]'
        >
          <header className='space-y-3 text-center text-[#5C4688]'>
            <h1 className='text-2xl font-bold'>Regular Care = Better Results!</h1>
            <p className='text-sm font-semibold text-[#969AB7]'>
              On average, our users improve their well-being by 30% within the first month of guided routines.
            </p>
          </header>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45 }}
            className='relative mt-5 overflow-hidden rounded-2xl bg-[#F7F6FF] p-5 shadow-[0_18px_44px_rgba(92,70,136,0.12)]'
          >
            <HeroChart />
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4 }}
            className='mt-5 space-y-4'
          >
            <div className='flex items-center justify-center gap-6'>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 320, damping: 20 }} className='flex flex-col items-center'>
                <Image src={currentBmiImage} alt='Current BMI' width={96} height={160} className='object-contain' />
                <span className='mt-2 text-xs font-semibold text-[#969AB7]'>Current - BMI {bmiValue}</span>
              </motion.div>
              <motion.div className='relative flex h-14 w-14 items-center justify-center' animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
                  <circle cx='32' cy='32' r='30' stroke='#A385E9' strokeOpacity='0.25' strokeWidth='3' />
                  <motion.path
                    d='M20 24 L44 32 L20 40'
                    stroke='#A385E9'
                    strokeWidth='4'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatType: 'mirror' }}
                  />
                </svg>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 320, damping: 20 }} className='flex flex-col items-center'>
                <Image src={idealBmiImage} alt='Ideal BMI' width={96} height={160} className='object-contain' />
                <span className='mt-2 text-xs font-semibold text-[#969AB7]'>Ideal - BMI {idealBmi}</span>
              </motion.div>
            </div>
            <p className='text-center text-sm font-semibold text-[#969AB7]'>
              The more consistently you follow your personalised plan, the faster you move into the healthy range.
            </p>
          </motion.section>

          <motion.section
            ref={timelineRef}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className='relative mt-6 overflow-hidden rounded-2xl bg-[#F7F6FF] p-6'
          >
            <div className='absolute left-[28px] top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-[#EBE3FF] via-[#F3EEFF] to-[#FFFFFF]' />
            <motion.div
              className='absolute left-[28px] top-6 bottom-6 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#8F74E5] via-[#B69CFF] to-[#D8CBFF]'
              initial={{ scaleY: 0 }}
              animate={timelineControls}
            />
            <h2 className='mb-6 text-lg font-bold text-[#5C4688]'>Noticeable improvements in one month</h2>
            <div className='space-y-6'>
              {TIMELINE.map((item, index) => (
                <motion.div
                  key={item.title}
                  className='relative pl-20'
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <div className='absolute left-8 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_10px_18px_rgba(92,70,136,0.14)]'>
                    {renderTimelineIcon(item.icon)}
                  </div>
                  <h3 className='text-sm font-semibold text-[#5C4688]'>{item.title}</h3>
                  <p className='text-sm text-[#5A5C71]'>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className='mt-6 grid grid-cols-2 gap-3'
          >
            <ComparisonCard title='Before Habitly' items={STRUGGLES} tone='neutral' />
            <ComparisonCard title='With Habitly' items={WINS} tone='positive' />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className='mt-6'
          >
            <div className='mb-3 flex items-center justify-between text-sm font-semibold text-[#5C4688]'>
              <span>Loved by our community</span>
              <span className='text-xs font-medium text-[#A385E9]'>Automatic stories</span>
            </div>
            <div className='relative overflow-hidden rounded-2xl bg-[#F8F7FF] p-2'>
              <motion.div
                className='flex cursor-grab gap-3'
                variants={marqueeAnimation}
                animate='animate'
                drag='x'
                dragConstraints={{ left: -TESTIMONIALS.length * 160, right: 0 }}
                whileTap={{ cursor: 'grabbing' }}
              >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((item, index) => (
                  <TestimonialCard key={`${item.name}-${index}`} testimonial={item} />
                ))}
              </motion.div>
            </div>
          </motion.section>

          <motion.button
            type='button'
            onClick={handleContinue}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            className='mt-6 w-full rounded-2xl bg-[#A385E9] py-3 text-base font-semibold text-white shadow-[0_18px_36px_rgba(163,133,233,0.3)] transition hover:bg-[#8F74E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9B8F5]'
          >
            Price Plans
          </motion.button>
        </motion.section>
      </div>
    </motion.div>
  )
}
function HeroChart() {
  return (
    <div className='relative h-[220px] w-full'>
      <svg viewBox='0 0 360 220' className='absolute inset-0' role='presentation'>
        <defs>
          <linearGradient id='withArea' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#34A853' stopOpacity='0.22' />
            <stop offset='100%' stopColor='#34A853' stopOpacity='0' />
          </linearGradient>
          <linearGradient id='withoutArea' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#FE6C6C' stopOpacity='0.22' />
            <stop offset='100%' stopColor='#FE6C6C' stopOpacity='0' />
          </linearGradient>
          <linearGradient id='withLine' x1='0' y1='1' x2='1' y2='0'>
            <stop offset='0%' stopColor='#1EB475' />
            <stop offset='100%' stopColor='#2AEA5C' />
          </linearGradient>
          <linearGradient id='withoutLine' x1='0' y1='1' x2='1' y2='0'>
            <stop offset='0%' stopColor='#FF7A7A' />
            <stop offset='100%' stopColor='#FE464B' />
          </linearGradient>
        </defs>
        <path d='M30 182 C 135 150, 220 70, 320 40 L 320 220 L 30 220 Z' fill='url(#withArea)' />
        <path d='M30 192 C 135 182, 220 160, 320 140 L 320 220 L 30 220 Z' fill='url(#withoutArea)' />
        <path d='M30 182 C 135 150, 220 70, 320 40' stroke='url(#withLine)' strokeWidth='6' fill='none' strokeLinecap='round' />
        <path d='M30 194 C 135 182, 220 160, 320 140' stroke='url(#withoutLine)' strokeWidth='6' fill='none' strokeLinecap='round' />
        <circle cx='30' cy='182' r='6' fill='#627CFF' />
        <circle cx='320' cy='40' r='6' fill='#627CFF' />
        <circle cx='320' cy='140' r='6' fill='#FF6B6B' />
      </svg>
      <ScoreBadge value='5/10' tone='#FFA64D' textClass='text-[#DA7C1D]' style={{ left: '18px', bottom: '60px' }} />
      <ScoreBadge value='6/10' tone='#7ED957' textClass='text-[#3C7C1A]' style={{ right: '118px', bottom: '78px' }} />
      <ScoreBadge value='8/10' tone='#2AEA5C' textClass='text-[#187348]' style={{ right: '18px', top: '18px' }} />
      <div className='absolute left-[118px] top-[52px] text-sm font-semibold text-[#476B9A]'>With app</div>
      <div className='absolute left-[140px] top-[120px] text-sm font-semibold text-[#333333]'>Without app</div>
      <div className='absolute left-[22px] bottom-[18px] text-xs font-semibold text-[#627CFF]'>Today</div>
      <div className='absolute right-[22px] bottom-[18px] text-xs font-semibold text-[#627CFF]'>30 Days</div>
      <div className='absolute right-[96px] top-[90px] flex flex-col gap-2 text-xs font-semibold text-white'>
        <ArrowIndicator index={0} />
        <ArrowIndicator index={1} />
        <ArrowIndicator index={2} />
      </div>
    </div>
  )
}

function ScoreBadge({ value, tone, textClass, style }: { value: string; tone: string; textClass: string; style: CSSProperties }) {
  return (
    <div
      className='absolute flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-[6px] bg-white shadow-[0_14px_28px_rgba(0,0,0,0.1)]'
      style={{ ...style, borderColor: tone }}
    >
      <span className={`text-xl font-bold ${textClass}`}>{value}</span>
    </div>
  )
}

function ArrowIndicator({ index }: { index: number }) {
  return (
    <motion.span
      className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[#6E7CA2]'
      animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1, 0.9] }}
      transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.25 }}
    >
      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='M12 5v14' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        <path d='M8 9l4-4 4 4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    </motion.span>
  )
}

function ComparisonCard({ title, items, tone }: { title: string; items: ComparisonItem[]; tone: 'neutral' | 'positive' }) {
  const wrapperClass =
    tone === 'positive'
      ? 'rounded-2xl border border-[#E5DFFC] bg-gradient-to-br from-white via-[#F9F6FF] to-white p-4 shadow-[0_12px_24px_rgba(163,133,233,0.12)]'
      : 'rounded-2xl bg-[#F7F6FF] p-4'

  return (
    <div className={wrapperClass}>
      <h3 className='mb-3 text-xs font-semibold uppercase tracking-wide text-[#8C8FA9]'>{title}</h3>
      <ul className='space-y-3 text-sm text-[#332B3C]'>
        {items.map((item) => (
          <li key={item.text} className='flex items-start gap-3'>
            {item.icon === 'check' ? <CheckBullet /> : <MinusBullet />}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className='w-40 shrink-0 rounded-2xl bg-white p-3 shadow-[0_12px_24px_rgba(92,70,136,0.08)]'>
      <div className='h-28 w-full overflow-hidden rounded-lg bg-[#ECEBFB]'>
        <Image src={testimonial.image} alt={testimonial.name} width={125} height={125} className='h-full w-full object-cover' />
      </div>
      <div className='mt-3 space-y-1 text-xs text-[#5C4688]'>
        <div className='flex items-center gap-2'>
          <strong className='text-sm'>{testimonial.name}</strong>
          <span className='flex items-center gap-1 text-[10px] text-[#A385E9]'>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
              <path d='M19 7l-9 9-5-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            Verified
          </span>
        </div>
        <span className='flex items-center gap-1 text-[#FABB05]'>
          {Array.from({ length: 5 }).map((_, index) => (
            <svg key={index} width='10' height='10' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
          ))}
          <span className='text-[10px] text-[#969AB7]'>5.0 rating</span>
        </span>
        <p className='text-[11px] text-[#333333]'>{testimonial.quote}</p>
      </div>
    </article>
  )
}

function CheckBullet() {
  return (
    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-[#A385E9]/15 text-[#A385E9]'>
      <svg width='14' height='14' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='M19 7l-9 9-5-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    </span>
  )
}

function MinusBullet() {
  return (
    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-[#E4E4E4] text-sm font-semibold text-[#818181]'>-</span>
  )
}

function renderTimelineIcon(icon: TimelineIcon) {
  if (icon === 'check') {
    return (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='M20 6l-11 11-5-5' stroke='#8F74E5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  }
  if (icon === 'bell') {
    return (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z' fill='#8F74E5' />
        <path d='M18 16a6 6 0 0 1-12 0c0-3.31 2.69-6 6-6s6 2.69 6 6Z' stroke='#8F74E5' strokeWidth='1.8' />
      </svg>
    )
  }
  if (icon === 'list') {
    return (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <rect x='7' y='6' width='11' height='2' rx='1' fill='#8F74E5' />
        <rect x='7' y='11' width='9' height='2' rx='1' fill='#8F74E5' />
        <rect x='7' y='16' width='7' height='2' rx='1' fill='#8F74E5' />
        <circle cx='4.5' cy='7' r='1.5' fill='#C2B4F8' />
        <circle cx='4.5' cy='12' r='1.5' fill='#C2B4F8' />
        <circle cx='4.5' cy='17' r='1.5' fill='#C2B4F8' />
      </svg>
    )
  }
  return (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 3l2.09 4.24L18 8l-3 2.92.71 4.12L12 13.77l-3.71 1.95L9 10.92 6 8l3.91-.76L12 3Z' fill='#8F74E5' />
    </svg>
  )
}

function getBmiImage(gender: string, value: number) {
  const suffix = gender === 'male' ? 'male' : 'female'
  const tier = value < 18 ? 1 : value < 21 ? 2 : value < 24 ? 3 : value < 27 ? 4 : 5
  return `/images/on_boarding_images/bmi_${suffix}_${tier}.png`
}

