'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'

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
  <TopTimerRow totalSeconds={COUNTDOWN_SECONDS} />

        <div className="space-y-10">
          <TrustSignals />

          <GuaranteeBanner />

          <Divider label="Pick your access" />
          <PlansPanel selectedPlan={selectedPlan} onSelect={setSelectedPlan} />

          <div className="flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={handleOpenPayment}
              className="relative inline-flex min-w-[260px] items-center justify-center rounded-full bg-[#F07CA3] px-10 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_20px_36px_rgba(240,124,163,0.35)] focus:outline-none focus:ring-4 focus:ring-[#F7C1D4]"
              aria-label="Get my plan"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#F07CA3]/30" aria-hidden></span>
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
            discountOffered={discountOffered}
            promoCode={promoCode}
            onPromoChange={setPromoCode}
            onClose={handleRequestClose}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      {!showPayment && (
        <StickyMobileCTA selectedPlanId={selectedPlan} onClick={handleOpenPayment} />
      )}
    </div>
  )
}

function PlansPanel({ selectedPlan, onSelect }: { selectedPlan: string; onSelect: (id: string) => void }) {
  return (
    <div id="plans" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} active={plan.id === selectedPlan} onSelect={() => onSelect(plan.id)} />
      ))}
    </div>
  )
}

function PlanCard({ plan, active, onSelect }: { plan: PlanOption; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex h-full flex-col rounded-3xl border px-5 py-6 text-left transition focus:outline-none focus:ring-2 focus:ring-[#F07CA3] focus:ring-offset-2 focus:ring-offset-white ${
        active
          ? 'border-[#F07CA3] bg-surface shadow-[0_18px_38px_rgba(240,124,163,0.25)]'
          : 'border-border-subtle bg-surface shadow-sm hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(91,69,136,0.14)]'
      }`}
    >
      {plan.tag && (
        <div className="pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-full bg-[#F07CA3] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(240,124,163,0.35)]">
            {plan.tag}
          </div>
        </div>
      )}
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xl font-semibold leading-tight text-text-primary">{plan.label}</p>
            <span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {plan.periodLabel}
            </span>
          </div>
          <span
            className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? 'border-[#F07CA3] bg-[#F07CA3]' : 'border-[#D6D9EE] bg-transparent'}`}
            aria-hidden
          >
            {active && <CheckIcon className="h-4 w-4 text-white" />}
          </span>
        </div>
        <div className="space-y-0.5 text-right text-text-secondary">
          {plan.originalTotal && (
            <p className="text-xs line-through opacity-70">${'{'}plan.originalTotal.toFixed(2){'}'}</p>
          )}
          <p className="text-sm font-semibold text-text-primary">${'{'}plan.total.toFixed(2){'}'}</p>
        </div>
        <div className="border-t border-border-subtle" />
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            {plan.originalPerDay && (
              <span className="text-base text-text-secondary line-through opacity-70">${'{'}plan.originalPerDay.toFixed(2){'}'}</span>
            )}
            <div className="text-[34px] font-extrabold leading-none tracking-tight text-text-primary">${'{'}plan.perDay.toFixed(2){'}'}</div>
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
    </button>
  )
}

function GuaranteeBanner() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 text-center sm:flex-row sm:justify-between">
      <div className="flex items-center gap-3 text-text-primary">
        <svg className="h-6 w-6 text-[#2BAE70]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3.6 9.6-8 10-4.4-.4-8-5-8-10V6l8-4z" opacity=".4" />
          <path d="M8.5 12.5l2.2 2.2 4.8-4.8" />
        </svg>
        <div className="text-left">
          <p className="text-sm font-semibold">30-day money‑back guarantee</p>
          <p className="text-xs text-text-secondary">Not delighted? Get a full refund within 30 days. No questions asked.</p>
        </div>
      </div>
      <div className="text-xs text-text-secondary">No hidden fees • Cancel anytime • Instant access</div>
    </div>
  )
}

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

function StickyMobileCTA({ selectedPlanId, onClick }: { selectedPlanId: string; onClick: () => void }) {
  const plan = plans.find((p) => p.id === selectedPlanId) ?? plans[0]
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle/60 bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-xs text-text-secondary">Start free for 7 days</p>
          <p className="text-sm font-semibold text-text-primary">{plan.label} • ${'{'}plan.perDay.toFixed(2){'}'}/day</p>
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

function TopTimerRow({ totalSeconds }: { totalSeconds: number }) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds)
  useEffect(() => {
    const id = window.setInterval(() => setSecondsRemaining((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => window.clearInterval(id)
  }, [totalSeconds])
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')
  const handleClick = () => {
    const el = document.getElementById('plans')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-sm sm:flex-row">
      <div className="flex items-end gap-3">
        <span className="text-sm font-semibold text-text-primary">Discount is reserved for:</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-extrabold leading-none text-[#F07CA3]">{minutes}</span>
          <span className="text-[22px] font-extrabold leading-none text-[#F07CA3]">:</span>
          <span className="text-[28px] font-extrabold leading-none text-[#F07CA3]">{seconds}</span>
          <div className="ml-2 flex gap-4 text-[11px] uppercase tracking-widest text-text-secondary">
            <span>minutes</span>
            <span>seconds</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full bg-[#F07CA3] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(240,124,163,0.35)] hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[#F7C1D4]"
      >
        Get my plan
      </button>
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
    <div className="grid gap-3 sm:grid-cols-3">
      <TrustPill title="Expert crafted" description="Designed alongside dermatologists and estheticians." />
      <TrustPill title="Cancel anytime" description="Pause or switch plans without losing progress." />
      <TrustPill title="Money-back promise" description="Full refund within 30 days if you are not in love." />
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
  promoCode: string
  onPromoChange: (value: string) => void
  onClose: () => void
  onComplete: () => void
}

function PaymentModal({ selectedPlanId, discountOffered, promoCode, onPromoChange, onClose, onComplete }: PaymentModalProps) {
  const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0]
  const basePerDay = plan.perDay
  const discountedPerDay = (basePerDay * 0.9)
  const displayPrice = discountOffered ? `$${discountedPerDay.toFixed(2)}/day` : `$${basePerDay.toFixed(2)}/day`

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[520px] rounded-3xl bg-surface px-6 py-8 shadow-[0_28px_60px_rgba(43,33,76,0.25)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <button type="button" onClick={onClose} className="absolute right-6 top-6 text-text-secondary transition hover:text-text-primary" aria-label="Close payment modal">
          ×
        </button>
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
              Secure checkout
              </span>
            <h3 className="text-2xl font-bold text-text-primary">Start your free trial</h3>
            <p className="text-sm text-text-secondary">
              Activate premium access instantly. No charge until your 7-day trial finishes.
            </p>
            </div>
            
          <div className="space-y-3 rounded-2xl bg-surface-muted px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-text-primary">{plan.label} plan</p>
                <p className="text-xs text-text-secondary">After trial: {displayPrice} (${plan.total.toFixed(2)} total)</p>
              </div>
              {discountOffered && (
                <span className="rounded-full bg-[#E5FBF0] px-3 py-1 text-xs font-semibold text-[#2BAE70]">
                  Extra 10% off applied
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.sellingPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-primary">
                  <MiniCheckIcon className="h-3.5 w-3.5 text-[#2BAE70]" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          {!discountOffered && (
            <div className="rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3 text-xs text-text-secondary">
              Thinking of leaving? Close this window and we will sweeten the deal with an extra 10% off.
            </div>
          )}

          <form className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Full name
                <input type="text" placeholder="Amelia Reid" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Email address
                <input type="email" placeholder="amelia@example.com" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Card number
              <input type="text" placeholder="1234 5678 9012 3456" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Expiry
                <input type="text" placeholder="MM/YY" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                CVC
                <input type="text" placeholder="123" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Country
                <input type="text" placeholder="United Kingdom" className="mt-1 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Promo code
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm shadow-sm focus-within:border-[#9B87D5] focus-within:ring-2 focus-within:ring-[#C9B8F5]">
              <input
                value={promoCode}
                  onChange={(event) => onPromoChange(event.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 outline-none"
                />
                <button type="button" className="text-xs font-semibold text-[#7C5CCB]">Apply</button>
              </div>
            </label>
          </form>

          <div className="space-y-3 text-left">
            <button
              type="button"
              onClick={onComplete}
              className="w-full rounded-2xl bg-gradient-to-r from-[#A385E9] via-[#7C5CCB] to-[#6B50C5] py-3 text-base font-semibold text-white shadow-[0_20px_36px_rgba(124,92,203,0.28)] transition hover:shadow-[0_22px_40px_rgba(124,92,203,0.32)]"
            >
              Confirm membership
            </button>
            <p className="text-xs text-text-secondary">
              We will email you before your trial ends. Cancel anytime with one tap.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <MiniCheckIcon className="h-4 w-4 text-[#2BAE70]" />
                Encrypted checkout - 30-day money-back guarantee.
              </div>
              <PaymentMethodsMini />
            </div>
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










