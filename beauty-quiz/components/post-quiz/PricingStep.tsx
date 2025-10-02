'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import dynamic from 'next/dynamic'
const StripeExpressPay = dynamic(() => import('../payments/StripeExpressPay'), { ssr: false })
// import PhonePreview from '../ui/PhonePreview'

interface PlanOption {
  id: string
  label: string
  periodLabel: string
  total: number
  perDay: number
  originalTotal?: number
  originalPerDay?: number
  billingWeeks: number
  description: string
  tag?: string
  savingLabel?: string
  sellingPoints: string[]
}

interface FeatureItem {
  id: string
  label: string
  gradient: string
  iconSrc: string
  description: string
}
const plans: PlanOption[] = [
  {
    id: '1w',
    label: '1-Week Trial',
    periodLabel: '4-week plan',
    total: 17.77,
    perDay: 2.54,
    originalTotal: 21.99,
    originalPerDay: 2.99,
    billingWeeks: 1,
    description: 'Try premium features for a week.',
    sellingPoints: ['Full access for 7 days', 'Cancel anytime'],
  },
  {
    id: '4w',
    label: '4-Week Plan',
    periodLabel: '4-week plan',
    total: 38.95,
    perDay: 1.39,
    originalTotal: 44.95,
    originalPerDay: 1.59,
    billingWeeks: 4,
    description: 'Most popular balance of value and flexibility.',
    tag: 'Most popular',
    sellingPoints: ['Great value', 'Flexible commitment'],
  },
  {
    id: '12w',
    label: '12-Week Plan',
    periodLabel: '12-week plan',
    total: 94.85,
    perDay: 1.13,
    originalTotal: 119.85,
    originalPerDay: 1.39,
    billingWeeks: 12,
    description: 'Best daily price for long-term progress.',
    savingLabel: 'Best value',
    sellingPoints: ['Lowest per-day price', 'Stay consistent'],
  },
]

const features: FeatureItem[] = [
  {
    id: 'assistant',
    label: 'Personal AI assistant',
    gradient: 'from-[#FFC0F7] to-[#E7D0FF]',
    iconSrc: '/images/icons/assistant.png',
    description: 'Daily reminders, tailored tweaks, and expert-backed answers.',
  },
  {
    id: 'tracking',
    label: 'Unlimited activity tracking',
    gradient: 'from-[#FCE092] to-[#FFEFC5]',
    iconSrc: '/images/icons/list_tick.svg',
    description: 'Keep every treatment, product, and result in one smart log.',
  },
  {
    id: 'planning',
    label: 'Smart routine planning',
    gradient: 'from-[#F4C2EF] to-[#FFE4FE]',
    iconSrc: '/custom-icons/misc/clock.svg',
    description: 'Personalised schedules with gentle nudges to stay consistent.',
  },
  {
    id: 'reports',
    label: 'Advanced progress reports',
    gradient: 'from-[#C4F0EE] to-[#CFFFFD]',
    iconSrc: '/custom-icons/misc/progress.svg',
    description: 'Visual recaps that highlight improvements and what to refine.',
  },
  {
    id: 'analysis',
    label: 'AI beauty analysis',
    gradient: 'from-[#FFB4B6] to-[#FFC9CA]',
    iconSrc: '/custom-icons/misc/analysis.svg',
    description: 'Evidence-based insights powered by your routines and check-ins.',
  },
  {
    id: 'calendar',
    label: 'Personalised treatment calendar',
    gradient: 'from-[#A0F3A0] to-[#CFFFCF]',
    iconSrc: '/custom-icons/misc/calendar.svg',
    description: 'Sync appointments and at-home care with helpful reminders.',
  },
  {
    id: 'motivation',
    label: 'Achievements & motivation',
    gradient: 'from-[#F4D0C2] to-[#FFE8DF]',
    iconSrc: '/custom-icons/misc/achievement.svg',
    description: 'Celebrate milestones and keep your glow goals top-of-mind.',
  },
  {
    id: 'adfree',
    label: 'Ad-free experience',
    gradient: 'from-[#CFC2F4] to-[#ECE6FF]',
    iconSrc: '/custom-icons/misc/ad_free.svg',
    description: 'Focus on your progress without distractions or noise.',
  },
]

const COUNTDOWN_SECONDS = 7 * 60
export default function PricingStep() {
  const router = useRouter()
  const setAnswer = useQuizStore((state) => state.setAnswer)

  const [selectedPlan, setSelectedPlan] = useState<string>('4w')
  const [promoCode, setPromoCode] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [discountOffered, setDiscountOffered] = useState(false)
  const [discountActive, setDiscountActive] = useState(true)

  const selectedPlanLabel = useMemo(() => plans.find((plan) => plan.id === selectedPlan)?.label ?? '4-Week Plan', [selectedPlan])

  const handleComplete = () => {
    setAnswer('selectedPlan', selectedPlan)
    setAnswer('subscriptionPlan', selectedPlan)
    setAnswer('paymentCompleted', true)
    router.push('/success')
  }

  const handleOpenPayment = () => setShowPayment(true)

  const handleRequestClose = () => {
    if (!discountOffered) {
      setDiscountOffered(true)
      return
    }

    setShowPayment(false)
    setDiscountOffered(false)
  }

  return (
    <div className="relative min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-12">
      <BackgroundDecor />
      <div className="relative mx-auto flex w-full max-w-[1040px] flex-col gap-10">
  <TopTimerRow totalSeconds={COUNTDOWN_SECONDS} onExpire={() => { setDiscountActive(false); setDiscountOffered(false); }} />

        <div className="space-y-10">
          <TrustSignals />

          {/* 'See your app' section removed per request */}

          <Divider label="Pick your access" />
          <PlansPanel selectedPlan={selectedPlan} onSelect={setSelectedPlan} discountActive={discountActive} />

          <div className="flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={handleOpenPayment}
              className="relative inline-flex min-w-[260px] items-center justify-center rounded-full bg-primary px-10 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_20px_36px_rgba(124,92,203,0.28)] focus:outline-none focus:ring-4 focus:ring-primary/30"
              aria-label="Get my plan"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30" aria-hidden></span>
              Get my plan
            </button>
            <DynamicBillingNotice selectedPlanId={selectedPlan} />
          </div>

          <Divider label="Membership perks" />
          <FeaturesGrid items={features} />

          <TestimonialStrip />

          <Divider label="Questions" />
          <FAQSection />
        </div>
      </div>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            key="payment-modal"
            selectedPlanId={selectedPlan}
            discountActive={discountActive}
            discountOffered={discountOffered}
            promoCode={promoCode}
            onPromoChange={setPromoCode}
            onClose={handleRequestClose}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PlansPanel({ selectedPlan, onSelect, discountActive }: { selectedPlan: string; onSelect: (id: string) => void; discountActive: boolean }) {
  return (
    <div id="plans" className="grid gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 scroll-mt-24">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} active={plan.id === selectedPlan} discountActive={discountActive} onSelect={() => onSelect(plan.id)} />
      ))}
    </div>
  )
}

function PlanCard({ plan, active, onSelect, discountActive }: { plan: PlanOption; active: boolean; onSelect: () => void; discountActive: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex h-full flex-col rounded-2xl sm:rounded-3xl border pl-12 pr-4 py-4 sm:px-5 sm:py-6 text-left transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white ${
        active
          ? 'border-primary bg-surface shadow-[0_18px_38px_rgba(124,92,203,0.18)]'
          : 'border-border-subtle bg-surface shadow-sm hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(91,69,136,0.14)]'
      }`}
    >
      {/* Mobile radio on the left center */}
      <span
        className={`sm:hidden absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          active ? 'border-primary bg-primary' : 'border-[#D6D9EE] bg-transparent'
        }`}
        aria-hidden
      >
        {active && <CheckIcon className="h-3.5 w-3.5 text-white" />}
      </span>
      {plan.tag && (
        <div className="pointer-events-none absolute -top-4 sm:-top-5 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-full bg-primary px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-white shadow-[0_8px_16px_rgba(124,92,203,0.24)]">
            {plan.tag}
          </div>
        </div>
      )}
      {/* Mobile layout */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-semibold leading-tight text-text-primary">{plan.label}</p>
          <div className="text-right leading-none">
            {discountActive && plan.originalPerDay && (
              <div className="text-[11px] text-text-secondary line-through opacity-70">{`$${plan.originalPerDay.toFixed(2)}`}</div>
            )}
            <div className="text-[22px] font-extrabold tracking-tight text-text-primary">{`$${plan.perDay.toFixed(2)}`}</div>
            <div className="text-[10px] text-text-secondary">per day</div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            {plan.periodLabel}
          </span>
          <div className="text-right text-text-secondary">
            {discountActive && plan.originalTotal && (
              <div className="text-[11px] line-through opacity-70">{`$${plan.originalTotal.toFixed(2)}`}</div>
            )}
            <div className="text-xs font-semibold text-text-primary">{`$${plan.total.toFixed(2)}`}</div>
          </div>
        </div>
        <div className="border-t border-border-subtle" />
      </div>

      {/* Desktop / tablet layout */}
      <div className="hidden sm:block">
          <div className="space-y-3 sm:space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-2xl font-semibold leading-tight text-text-primary">{plan.label}</p>
              <span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                {plan.periodLabel}
              </span>
            </div>
            <span
              className={`hidden sm:inline-flex mt-1 h-6 w-6 items-center justify-center rounded-full border-2 ${active ? 'border-primary bg-primary' : 'border-[#D6D9EE] bg-transparent'}`}
              aria-hidden
            >
              {active && <CheckIcon className="h-4 w-4 text-white" />}
            </span>
          </div>
          <div className="space-y-0.5 text-right text-text-secondary">
            {discountActive && plan.originalTotal && (
              <p className="text-xs line-through opacity-70">{`$${plan.originalTotal.toFixed(2)}`}</p>
            )}
            <p className="text-sm font-semibold text-text-primary">{`$${plan.total.toFixed(2)}`}</p>
          </div>
          <div className="border-t border-border-subtle" />
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              {discountActive && plan.originalPerDay && (
                <span className="text-base text-text-secondary line-through opacity-70">{`$${plan.originalPerDay.toFixed(2)}`}</span>
              )}
              <div className="text-[34px] font-extrabold leading-none tracking-tight text-text-primary">{`$${plan.perDay.toFixed(2)}`}</div>
            </div>
            <div className="pb-1 text-sm text-text-secondary">per day</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.sellingPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold text-text-primary">
                <MiniCheckIcon className="h-3.5 w-3.5 text-[#2BAE70]" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

// GuaranteeBanner removed per request

// Removed HeroHeader and PaymentMethodsRow as requested

function FAQSection() {
  const items = [
    { q: 'When will I be charged?', a: 'You will not be charged today. If you keep premium past the 7‑day trial, you will be charged based on your selected plan.' },
    { q: 'Can I cancel anytime?', a: 'Yes. You can cancel anytime from settings with a single tap and you will keep access until the end of the current period.' },
    { q: 'Do you offer refunds?', a: 'Absolutely. If you are not in love within 30 days, we will refund you in full. Just contact support from the app.' },
  ]
  return (
    <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface">
      {items.map((item, idx) => (
        <FAQItem key={idx} question={item.q} answer={item.a} defaultOpen={idx === 0} />
      ))}
    </div>
  )
}

function FAQItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-text-primary">{question}</span>
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${open ? 'rotate-45 border-[#7C5CCB] text-[#7C5CCB]' : 'border-border-subtle text-text-secondary'} transition`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4 text-sm text-text-secondary"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StickyMobileCTA({ selectedPlanId, onClick, discountActive }: { selectedPlanId: string; onClick: () => void; discountActive: boolean }) {
  const plan = plans.find((p) => p.id === selectedPlanId) ?? plans[0]
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle/60 bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-3">
        <div className="text-left">
          {discountActive ? (
            <p className="text-xs text-text-secondary">Limited-time discount</p>
          ) : (
            <p className="text-xs text-text-secondary">Offer ended</p>
          )}
          <p className="text-sm font-semibold text-text-primary">{plan.label} • {`$${plan.perDay.toFixed(2)}`}/day</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#A385E9] via-[#7C5CCB] to-[#6B50C5] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(124,92,203,0.28)]"
          aria-label="Start 7-day free trial"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function DynamicBillingNotice({ selectedPlanId }: { selectedPlanId: string }) {
  const plan = plans.find((p) => p.id === selectedPlanId) ?? plans[0]
  const everyLabel = plan.billingWeeks === 1 ? '1 week' : `${plan.billingWeeks} weeks`
  return (
    <div className="mt-2 max-w-3xl rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-xs text-text-secondary">
      Without cancellation, before the selected plan ends, you accept that Beauty Mirror will automatically charge
      <span className="mx-1 font-semibold text-text-primary">${plan.total.toFixed(2)}</span>
      every <span className="font-semibold text-text-primary">{everyLabel}</span> until I cancel. Cancel online via the account page on the website or app.
    </div>
  )
}

function TopTimerRow({ totalSeconds, onExpire }: { totalSeconds: number; onExpire?: () => void }) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds)
  const [compact, setCompact] = useState(false)
  const normalRef = useRef<HTMLDivElement | null>(null)
  const [normalH, setNormalH] = useState<number>(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          onExpire?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [totalSeconds, onExpire])
  useEffect(() => {
    const measure = () => {
      if (normalRef.current) {
        setNormalH(normalRef.current.getBoundingClientRect().height)
      }
    }
    const onScroll = () => setCompact(window.scrollY > 180)
    measure()
    onScroll()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')
  const handleClick = () => {
    const el = document.getElementById('plans')
    if (!el) return
    // Compute offset to keep header/timer visible after scroll
    const fixedBar = document.querySelector('[data-compact-timer]') as HTMLElement | null
    const offset = fixedBar ? fixedBar.getBoundingClientRect().height + 16 : 96
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
  const expired = secondsRemaining <= 0
  return (
    <>
      {/* Normal bar in flow */}
      <div ref={normalRef} className="mx-auto w-[min(92vw,1040px)] px-0">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-sm ${compact ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">{expired ? 'Offer ended' : 'Discount is reserved for:'}</span>
            <div className="flex items-center gap-3">
              <TimerUnit value={minutes} label="minutes" compact={false} />
              <span className="text-[22px] font-extrabold leading-none text-primary">:</span>
              <TimerUnit value={seconds} label="seconds" compact={false} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(124,92,203,0.28)] hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            Get my plan
          </button>
        </motion.div>
      </div>

      {/* Compact fixed bar */}
      {compact && (
  <div className="fixed inset-x-0 top-2 z-50" data-compact-timer>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mx-auto w-[min(92vw,1040px)] px-0"
          >
            <div className="flex w-full items-center justify-center gap-4 rounded-2xl border border-border-subtle/70 bg-surface px-3 py-2 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <TimerUnit value={minutes} label="minutes" compact={true} />
                <span className="text-base font-extrabold leading-none text-primary">:</span>
                <TimerUnit value={seconds} label="seconds" compact={true} />
              </div>
              <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(124,92,203,0.28)] hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                Get my plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

function TimerUnit({ value, label, compact }: { value: string; label: string; compact: boolean }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className={`${compact ? 'text-xl' : 'text-[28px]'} font-extrabold tracking-tight text-primary`}>{value}</span>
      <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} uppercase tracking-widest text-text-secondary`}>{label}</span>
    </div>
  )
}
function FeaturesGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((feature) => (
        <FeatureRow key={feature.id} feature={feature} />
                ))}
              </div>
  )
}

function FeatureRow({ feature }: { feature: FeatureItem }) {
  return (
  <div className="flex h-full items-start gap-4 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-[0_12px_24px_rgba(86,63,140,0.08)]">
      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
        <Image src={feature.iconSrc} alt={feature.label} width={28} height={28} className="h-7 w-7 object-contain" />
      </div>
      <div className="space-y-1">
  <p className="text-sm font-semibold text-text-primary">{feature.label}</p>
  <p className="text-xs text-text-secondary leading-relaxed">{feature.description}</p>
      </div>
    </div>
  )
}

function TrustSignals() {
  return (
      <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-3">
      <TrustPill title="Expert crafted" description="Designed alongside dermatologists and estheticians." />
      <TrustPill title="Cancel anytime" description="Pause or switch plans without losing progress." />
      <TrustPill title="30-day money‑back guarantee" description="Not delighted? Get a full refund within 30 days. No questions asked." />
    </div>
  )
}

function TrustPill({ title, description }: { title: string; description: string }) {
  return (
  <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-[0_10px_22px_rgba(102,76,167,0.08)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface shadow-[0_8px_16px_rgba(134,108,203,0.12)]">
        <MiniCheckIcon className="h-4 w-4 text-[#2BAE70]" />
      </div>
      <div className="space-y-1">
  <p className="text-sm font-semibold text-text-primary">{title}</p>
  <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
  <span className="flex-1 border-t border-border-subtle" />
  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">{label}</span>
  <span className="flex-1 border-t border-border-subtle" />
            </div>
  )
}

function TestimonialStrip() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border-subtle bg-surface px-5 py-5 shadow-[0_18px_34px_rgba(108,83,173,0.12)] sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center">
        <Image src="/images/reviews/users.png" alt="Happy users" width={160} height={40} className="h-10 w-auto" />
      </div>
      <div className="space-y-1 text-left">
        <p className="text-sm font-semibold text-text-primary">Trusted by 25,000+ glowing members</p>
        <p className="text-xs text-text-secondary">“I finally stay consistent and my skin has never felt healthier.” — Amelia, 3 months in</p>
      </div>
    </div>
  )
}
interface PaymentModalProps {
  selectedPlanId: string
  discountOffered: boolean
  discountActive: boolean
  promoCode: string
  onPromoChange: (value: string) => void
  onClose: () => void
  onComplete: () => void
}

function PaymentModal({ selectedPlanId, discountOffered, discountActive, promoCode, onPromoChange, onClose, onComplete }: PaymentModalProps) {
  const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0]
  const basePerDay = plan.perDay
  const discountedPerDay = (basePerDay * 0.9)
  const displayPrice = discountActive && discountOffered ? `$${discountedPerDay.toFixed(2)}/day` : `$${basePerDay.toFixed(2)}/day`
  const periodPriceLabel = `Regular ${plan.billingWeeks}-week price`

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        className="relative mx-4 w-full max-w-[768px] rounded-3xl bg-white px-6 py-6 shadow-[0_32px_64px_rgba(0,0,0,0.24)] sm:px-8 sm:py-8"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
      >
        <button type="button" onClick={onClose} className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xl text-text-primary/70 hover:text-text-primary" aria-label="Close">
          ×
        </button>

        <h3 className="mb-6 text-center text-2xl font-bold text-text-primary sm:text-3xl">Complete your checkout</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left: Order Summary */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-5">
            <p className="mb-2 text-sm font-semibold text-text-primary">Your Order Summary</p>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-text-secondary">{periodPriceLabel}</span>
              <span className="font-medium text-text-primary">${plan.total.toFixed(2)}</span>
            </div>
            <div className="my-2 h-px w-full bg-border-subtle" />
            <div className="flex items-center justify-between py-2 text-base font-bold text-text-primary">
              <span>Total today:</span>
              <span>${plan.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="flex flex-col">
            <StripeExpressPay amountCents={Math.round(plan.total * 100)} currency="usd" label="Total" onSuccess={onComplete} />
            <div className="relative my-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              <span className="flex-1 h-px bg-border-subtle" />
              <span>or pay with a card</span>
              <span className="flex-1 h-px bg-border-subtle" />
            </div>
            <PaymentBrandsRow />
            <label className="mb-3 text-xs font-medium text-text-secondary">
              Card number
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="mt-1 w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#A0D8CC] focus:outline-none focus:ring-2 focus:ring-[#C4E9E0]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-text-secondary">
                Expiry date
                <input type="text" placeholder="MM/YY" className="mt-1 w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#A0D8CC] focus:outline-none focus:ring-2 focus:ring-[#C4E9E0]" />
              </label>
              <label className="text-xs font-medium text-text-secondary">
                Security code
                <input type="text" placeholder="CVV" className="mt-1 w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#A0D8CC] focus:outline-none focus:ring-2 focus:ring-[#C4E9E0]" />
              </label>
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#33A476] px-5 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(51,164,118,0.28)]"
            >
              <span className="text-lg">🔒</span> CONTINUE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function BackgroundDecor() {
  return (
    <>
      <span className="pointer-events-none absolute -top-[220px] left-1/2 z-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,139,226,0.22),_transparent_70%)]" />
      <span className="pointer-events-none absolute bottom-[-180px] right-[-140px] z-0 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(124,92,203,0.18),_transparent_65%)]" />
    </>
  )
}



function PaymentMethodsMini() {
  return (
    <div className="flex items-center gap-2 opacity-90">
  <Image src="/icons/payment_methods/apple-pay.png" alt="Apple Pay" width={44} height={20} className="h-5 w-auto" />
  <Image src="/icons/payment_methods/google-pay.png" alt="Google Pay" width={44} height={20} className="h-5 w-auto" />
    </div>
  )
}

function PaymentBrandsRow() {
  const brands = [
    { key: 'visa', light: '/icons/payment_methods/visa_light.svg', dark: '/icons/payment_methods/visa_dark.svg' },
    { key: 'mastercard', light: '/icons/payment_methods/mastercard_light.svg', dark: '/icons/payment_methods/mastercard_dark.svg' },
    { key: 'maestro', light: '/icons/payment_methods/maestro_light.svg', dark: '/icons/payment_methods/maestro_dark.svg' },
    { key: 'amex', light: '/icons/payment_methods/american-express_light.svg', dark: '/icons/payment_methods/american-express_dark.svg' },
    { key: 'diners', light: '/icons/payment_methods/diners-club_light.svg', dark: '/icons/payment_methods/diners-club_dark.svg' },
    { key: 'discover', light: '/icons/payment_methods/discover_light.svg', dark: '/icons/payment_methods/discover_dark.svg' },
  ]
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-4 sm:gap-5 opacity-95">
      {brands.map((b) => (
        <span key={b.key} className="inline-flex items-center">
          <Image src={b.light} alt={b.key} width={56} height={24} className="h-6 w-auto dark:hidden" />
          <Image src={b.dark} alt={b.key} width={56} height={24} className="hidden h-6 w-auto dark:block" />
        </span>
      ))}
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4 text-[#6F54A8]'} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.5l1.8 4.6 4.7 1.3-4.7 1.3-1.8 4.6-1.8-4.6-4.7-1.3 4.7-1.3L10 1.5z" opacity="0.7" />
      <path d="M5.5 9.3l0.9 2.3 2.4 0.6-2.4 0.6-0.9 2.3-0.9-2.3-2.4-0.6 2.4-0.6 0.9-2.3z" opacity="0.5" />
      <path d="M15.2 11.1l0.9 2.2 2.3 0.5-2.3 0.5-0.9 2.2-0.8-2.2-2.3-0.5 2.3-0.5 0.8-2.2z" opacity="0.4" />
    </svg>
  )
}

function MiniCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4 text-[#2BAE70]'} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.5 4.5l-5.3 6-2.7-2.8" />
    </svg>
  )
}


function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4 text-white'} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M16.707 5.293a1 1 0 00-1.414-1.414L8.5 10.672 5.707 7.879a1 1 0 10-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7.5-7.5z" />
    </svg>
  )
}


function PromoIcon() {
  return (
    <svg className="h-4 w-4 text-[#7C5CCB]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5a2 2 0 012-2h6l1 2h3a2 2 0 012 2v6a2 2 0 01-2 2h-6l-1-2H5a2 2 0 01-2-2V5z" />
      <path d="M11 7l-4 4" />
      <path d="M7.5 7.5h.01" />
      <path d="M12.5 12.5h.01" />
    </svg>
  )
}










