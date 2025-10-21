'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import confettiAnimation from '@/public/images/animations/confetti.json'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import AnimatedBackground from '@/components/AnimatedBackground'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface BenefitChunk {
  text: string
  accent?: boolean
}

interface BenefitItem {
  id: string
  chunks: BenefitChunk[]
}

const benefitItems: BenefitItem[] = [
  {
    id: 'tracking',
    chunks: [
      { text: 'Unlimited', accent: true },
      { text: ' Activity tracking' },
    ],
  },
  {
    id: 'reports',
    chunks: [
      { text: 'Advanced progress ' },
      { text: 'tracking and reports', accent: true },
    ],
  },
  {
    id: 'customisation',
    chunks: [
      { text: 'Customization', accent: true },
      { text: ' options (themes, notifications)' },
    ],
  },
  {
    id: 'support',
    chunks: [
      { text: 'Customer priority ' },
      { text: 'support', accent: true },
    ],
  },
  {
    id: 'mood',
    chunks: [
      { text: 'Advanced ' },
      { text: 'mood stat', accent: true },
      { text: ' options' },
    ],
  },
  {
    id: 'adfree',
    chunks: [
      { text: 'Ad-free', accent: true },
      { text: ' experience' },
    ],
  },
]

const confettiDots = [
  { left: '6%', top: '8%', color: '#FEC1E3' },
  { left: '14%', top: '4%', color: '#C4D7FF' },
  { left: '24%', top: '10%', color: '#FFB6B9' },
  { left: '34%', top: '6%', color: '#FFDCA8' },
  { left: '44%', top: '8%', color: '#B2F2DD' },
  { left: '54%', top: '5%', color: '#FEC1E3' },
  { left: '64%', top: '9%', color: '#D6C7FF' },
  { left: '74%', top: '5%', color: '#FFE5A8' },
  { left: '84%', top: '7%', color: '#FFB6B9' },
  { left: '92%', top: '6%', color: '#B2F2DD' },
]

export default function SuccessPage() {
  const { answers } = useQuizStore()
  const router = useRouter()

  useEffect(() => {
    if (!answers.PaymentCompleted) {
      router.push('/payment')
    }
  }, [answers.PaymentCompleted, router])

  // Fire Meta Pixel Purchase on load (place before conditional return to avoid hook-order issues)
  useEffect(() => {
    if (!answers.PaymentCompleted) return
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        const planId = answers.SelectedPlan
        // Map plan to total from local definition (mirror PricingStep values)
        const planTotals: Record<string, number> = { '1w': 2.47, '4w': 6.99, '12w': 11.99 }
        const value = planTotals[planId as keyof typeof planTotals] ?? undefined
        window.fbq('track', 'Purchase', {
          value,
          currency: 'USD',
          content_ids: planId ? [planId] : undefined,
          content_type: 'product',
        })
      }
    } catch { /* noop */ }
  }, [answers.PaymentCompleted, answers.SelectedPlan])

  if (!answers.PaymentCompleted) {
    return null
  }

  // No extra actions on this screen; simple confirmation only

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen px-4 py-10 flex justify-center">
        <div className="w-full max-w-[430px]">
          <SuccessCard />
        </div>
      </div>
    </div>
  )
}

function SuccessCard() {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-white dark:bg-[#171621] shadow-[0_24px_60px_rgba(92,70,136,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <ConfettiLayer />
      <div className="relative flex flex-col items-center px-6 pt-12 pb-10">
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#DCD0FF] dark:bg-[#3C2D6B]" />
          <span className="absolute inset-[12%] rounded-full bg-[#BBA2F4] dark:bg-[#5C4688]" />
          <CrownIcon className="relative h-16 w-16 text-white" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-extrabold text-[#5C4688] dark:text-[#E8E6F5]">Congratulations!</h1>
          <p className="text-base font-medium text-[#7F84A9] dark:text-[#B5B8D2]">Welcome to the Premium experience!</p>
        </div>

        <div className="my-6 h-px w-full bg-[#EAEAEA]/90 dark:bg-white/10" />

        <div className="flex w-full flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold text-[#5C4688] dark:text-[#E8E6F5]">Benefits Unlocked:</h2>
          <ul className="w-full space-y-3">
            {benefitItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-left">
                <CheckIcon />
                <p className="text-base font-medium text-[#2F2C45] dark:text-[#D6D9F0]">
                  {item.chunks.map((chunk, index) => (
                    <span key={index} className={chunk.accent ? 'text-[#7C5CCB] dark:text-[#B59CFF]' : undefined}>
                      {chunk.text}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-6 h-px w-full bg-[#EAEAEA]/90 dark:bg-white/10" />

        <p className="text-sm leading-relaxed text-[#8C8FA8] dark:text-[#A2A6C7]">
          You've successfully upgraded and unlocked the full Beauty Mirror experience. Enjoy your exclusive benefits!
        </p>

        <div className="mt-6 w-full space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DCD0FF] dark:border-[#3C2D6B] bg-[#F4EBFF] dark:bg-[#221F33] px-4 py-3 font-semibold text-[#5C4688] dark:text-[#D8D6F0] transition hover:bg-[#E6DAFE] dark:hover:bg-[#2A2740]"
          >
            <AppleIcon />
            Continue in Apple App Store
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#CDEBDD] dark:border-[#275D45] bg-[#E6F9F0] dark:bg-[#0F1C18] px-4 py-3 font-semibold text-[#2BAE70] dark:text-[#9DDCBF] transition hover:bg-[#D3F1E3] dark:hover:bg-[#12231E]"
          >
            <GooglePlayIcon />
            Continue in Google Play
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D6D6F2] dark:border-[#3A3A59] bg-[#F2F2FF] dark:bg-[#1A1A28] px-4 py-3 font-semibold text-[#5C4688] dark:text-[#D6D6F2] transition hover:bg-[#E4E4FF] dark:hover:bg-[#222235]"
          >
            <GlobeIcon />
            Continue in Web version
          </button>
        </div>

        <p className="mt-4 text-xs text-[#8C8FA8] dark:text-[#A2A6C7] text-center">
          Use Beauty Mirror simultaneously on iOS, Android, and Web — your progress stays in sync everywhere.
        </p>
      </div>
    </div>
  )
}

function ConfettiLayer() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32">
      <div className="absolute inset-0 opacity-70">
        <Lottie animationData={confettiAnimation} loop autoplay />
      </div>
      {confettiDots.map((dot, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 rounded-full"
          style={{ left: dot.left, top: dot.top, backgroundColor: dot.color }}
        />
      ))}
    </div>
  )
}
// HomeIndicator removed

// CalendarIcon removed (no plan recap)

function CheckIcon() {
  return (
    <svg className="mt-1 h-5 w-5 text-[#7C5CCB] dark:text-[#B59CFF]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l4 4 10-10" />
    </svg>
  )
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M14 46h36l4-20-10 6-12-18-12 18-10-6 4 20z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.058-1.26 2.744-.84.676-1.784 1.024-2.832 1.045-.021-.118-.031-.263-.031-.436 0-1.099.42-2.007 1.26-2.724C14.342 1.1 15.291.75 16.344.75c.031.118.047.257.047.409Zm4.311 16.58c-.3.686-.657 1.312-1.072 1.878-.635.845-1.155 1.43-1.561 1.756-.623.567-1.292.854-2.007.86-.512 0-1.131-.145-1.857-.436-.727-.29-1.396-.435-2.008-.435-.645 0-1.331.145-2.06.435-.728.291-1.309.441-1.744.45-.688.028-1.373-.27-2.057-.894-.43-.36-.97-.973-1.62-1.84-.69-.918-1.258-1.984-1.703-3.196-.475-1.318-.713-2.598-.713-3.84 0-1.42.307-2.655.92-3.705.48-.851 1.12-1.522 1.919-2.01.799-.49 1.652-.736 2.557-.76.503 0 1.162.167 1.98.5.815.333 1.336.5 1.56.5.171 0 .72-.181 1.646-.544.882-.336 1.627-.475 2.235-.42 1.652.133 2.896.784 3.732 1.956-1.48.898-2.215 2.153-2.204 3.764.011 1.257.46 2.304 1.347 3.14.401.384.9.686 1.5.907-.12.346-.25.677-.39.99Z" />
    </svg>
  )
}

function GooglePlayIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.2 1.8A1.5 1.5 0 0 0 2.5 3v18a1.5 1.5 0 0 0 .7 1.3l.1.05a1.5 1.5 0 0 0 1.6-.08l11.3-8.04-11.3-8.06a1.5 1.5 0 0 0-1.6-.07l-.1.06Z" opacity=".8" />
      <path d="M16.4 13.32v-.64l-2.96 2.12 2.96 2.08a1.5 1.5 0 0 0 .85.27H21a1.5 1.5 0 0 0 1.5-1.5V10.36A1.5 1.5 0 0 0 21 8.86h-3.75a1.5 1.5 0 0 0-.85.27l-2.96 2.08 2.96 2.11Z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2.21 0 4.21.9 5.66 2.34C19.1 6.79 20 8.79 20 11s-.9 4.21-2.34 5.66C16.21 18.1 14.21 19 12 19s-4.21-.9-5.66-2.34C4.9 15.21 4 13.21 4 11s.9-4.21 2.34-5.66C7.79 3.9 9.79 3 12 3Z" />
      <path d="M6.5 6h11" />
      <path d="M6.5 16h11" />
      <path d="M12 3c1.66 2 2.5 4.67 2.5 8s-.84 6-2.5 8c-1.66-2-2.5-4.67-2.5-8s.84-6 2.5-8Z" />
    </svg>
  )
}





