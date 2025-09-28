'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'

interface PlanOption {
  id: string
  label: string
  original: string
  sale: string
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
      id: 'monthly',
    label: 'Monthly',
    original: '$0.63/day',
    sale: '$0.49/day',
    description: 'Flexible access billed each month - cancel anytime.',
    sellingPoints: ['Pause whenever you need to', 'Perfect for exploring premium tools'],
    },
    {
      id: '6month',
    label: '6 month',
    original: '$0.45/day',
    sale: '$0.38/day',
    description: 'Stay consistent with guidance crafted for six months.',
    tag: 'Most loved',
    savingLabel: 'Best value',
    sellingPoints: ['Weekly accountability nudges', 'Quarterly deep-dive progress reviews'],
    },
    {
      id: 'annual',
    label: 'Annual',
    original: '$0.38/day',
    sale: '$0.27/day',
    description: 'Unlock every feature for the lowest daily price.',
    savingLabel: 'Save 45%',
    sellingPoints: ['Priority access to new AI tools', 'Concierge onboarding session'],
  },
]

const features: FeatureItem[] = [
  {
    id: 'assistant',
    label: 'Personal AI assistant',
    gradient: 'from-[#FFC0F7] to-[#E7D0FF]',
    iconSrc: '/custom-icons/misc/ai.svg',
    description: 'Daily reminders, tailored tweaks, and expert-backed answers.',
  },
  {
    id: 'tracking',
    label: 'Unlimited activity tracking',
    gradient: 'from-[#FCE092] to-[#FFEFC5]',
    iconSrc: '/custom-icons/misc/activities_icon.svg',
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

  const [selectedPlan, setSelectedPlan] = useState<string>('6month')
  const [promoCode, setPromoCode] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [discountOffered, setDiscountOffered] = useState(false)

  const selectedPlanLabel = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan)?.label ?? '6 month',
    [selectedPlan],
  )

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
    <div className="relative min-h-screen bg-[#F6F3FF] px-4 py-10 sm:px-6 lg:px-12">
      <BackgroundDecor />
      <div className="relative mx-auto flex w-full max-w-[1180px] flex-col gap-10">
        <CountdownBanner totalSeconds={COUNTDOWN_SECONDS} />
        <HeroHeader />

        <div className="space-y-10">
          <TrustSignals />

          <Divider label="Pick your access" />
          <PlansPanel selectedPlan={selectedPlan} onSelect={setSelectedPlan} />

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
            <p className="text-sm text-[#7F84A9]">
              Try premium free for 7 days - cancel anytime before the trial ends with no charge.
            </p>
            <button
              type="button"
              onClick={handleOpenPayment}
              className="inline-flex min-w-[230px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#45C997] via-[#2BAE70] to-[#1D8A5A] px-8 py-3.5 text-base font-semibold text-white shadow-[0_24px_40px_rgba(43,174,112,0.3)] transition hover:shadow-[0_28px_48px_rgba(43,174,112,0.36)] focus:outline-none focus:ring-4 focus:ring-[#AEE7C5]/60"
            >
              Try free for 7 days
            </button>
      </div>

          <Divider label="Membership perks" />
          <FeaturesGrid items={features} />

          <TestimonialStrip />
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
    </div>
  )
}
function CountdownBanner({ totalSeconds }: { totalSeconds: number }) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 220)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')

  return (
    <motion.div
      className={compact ? 'fixed left-1/2 top-3 z-40 -translate-x-1/2' : 'sticky top-4 z-20'}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={
          compact
            ? 'flex items-center gap-2 rounded-full bg-gradient-to-r from-[#45C997] via-[#2BAE70] to-[#1D8A5A] px-4 py-1.5 text-white shadow-[0_16px_30px_rgba(43,174,112,0.28)]'
            : 'flex w-full max-w-[360px] items-center justify-between gap-2 rounded-full border border-[#E5DFFC] bg-white/90 px-4 py-2 text-[#2F2C45] shadow-[0_12px_24px_rgba(91,69,136,0.14)] backdrop-blur'
        }
      >
        {!compact && <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F54A8]">Offer ends soon</span>}
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#45C997] via-[#2BAE70] to-[#1D8A5A] px-3 py-1.5 text-white shadow-[0_10px_18px_rgba(43,174,112,0.3)]">
          <CountdownChunk label="min" value={minutes} />
          <span className="text-base font-bold">:</span>
          <CountdownChunk label="sec" value={seconds} />
                  </div>
                </div>
              </motion.div>
  )
}

function CountdownChunk({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-[1]">
      <span className="text-xl font-extrabold tracking-tight">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/70">{label}</span>
    </div>
  )
}
function PlansPanel({ selectedPlan, onSelect }: { selectedPlan: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      className={`flex h-full flex-col justify-between rounded-3xl border px-5 py-6 text-left transition focus:outline-none focus:ring-2 focus:ring-[#7C5CCB] focus:ring-offset-2 focus:ring-offset-white ${
        active
          ? 'border-[#7C5CCB] bg-white shadow-[0_18px_38px_rgba(124,92,203,0.2)]'
          : 'border-[#E1DCF5] bg-white shadow-sm hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(91,69,136,0.14)]'
      }`}
    >
      <div className="space-y-4">
        {plan.tag && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE68A] px-3 py-1 text-xs font-semibold text-[#5A4B0E]">
            <SparkleIcon className="h-4 w-4 text-[#5A4B0E]" />
            {plan.tag}
          </span>
        )}
        <div className="space-y-1">
          <p className="text-lg font-semibold text-[#4F3B7A]">{plan.label}</p>
          <p className="text-sm text-[#7F84A9]">{plan.description}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm font-semibold text-[#A0A4C5] line-through">{plan.original}</p>
          <p className="text-2xl font-bold text-[#7C5CCB]">{plan.sale}</p>
          {plan.savingLabel && (
            <span className="inline-block rounded-full bg-[#F0EAFF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#7C5CCB]">
              {plan.savingLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.sellingPoints.map((point) => (
            <span key={point} className="inline-flex items-center gap-1 rounded-full bg-[#F5F1FF] px-3 py-1 text-[11px] font-semibold text-[#6F54A8]">
              <MiniCheckIcon className="h-3.5 w-3.5 text-[#2BAE70]" />
              {point}
            </span>
              ))}
            </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#7C5CCB]">
        <span>
          {plan.sale.replace('/day', '')} billed {plan.id === 'monthly' ? 'monthly' : plan.id === '6month' ? 'every 6 months' : 'annually'}
        </span>
        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-[#7C5CCB]' : 'border-[#D6D9EE]'}`}>
          {active && <span className="h-2.5 w-2.5 rounded-full bg-[#7C5CCB]" />}
        </span>
      </div>
    </button>
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
    <div className="flex h-full items-start gap-4 rounded-2xl border border-[#E6E2FB] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(86,63,140,0.08)]">
      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
        <Image src={feature.iconSrc} alt={feature.label} width={28} height={28} className="h-7 w-7 object-contain" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#4F3B7A]">{feature.label}</p>
        <p className="text-xs text-[#8B8FB3] leading-relaxed">{feature.description}</p>
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
    <div className="flex items-start gap-3 rounded-2xl border border-[#EBE6FF] bg-[#F9F7FF] px-4 py-3 shadow-[0_10px_22px_rgba(102,76,167,0.08)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_8px_16px_rgba(134,108,203,0.12)]">
        <MiniCheckIcon className="h-4 w-4 text-[#2BAE70]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#4F3B7A]">{title}</p>
        <p className="text-xs text-[#8B8FB3] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="flex-1 border-t border-[#E7E4FB]" />
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8A82C0]">{label}</span>
      <span className="flex-1 border-t border-[#E7E4FB]" />
            </div>
  )
}

function TestimonialStrip() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[#ECE6FF] bg-gradient-to-r from-[#FFF6F2] via-[#F9F0FF] to-[#F1F5FF] px-5 py-5 shadow-[0_18px_34px_rgba(108,83,173,0.12)] sm:flex-row sm:items-center sm:gap-4">
                <div className="flex -space-x-2">
        {['/custom-icons/reviews/review_1.png', '/custom-icons/reviews/review_2.png', '/custom-icons/reviews/review_3.png'].map((src) => (
          <div key={src} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#DADAF8]">
            <Image src={src} alt="Member" width={40} height={40} className="h-full w-full object-cover" />
          </div>
                  ))}
                </div>
      <div className="space-y-1 text-left">
        <p className="text-sm font-semibold text-[#4F3B7A]">Trusted by 25,000+ glowing members</p>
        <p className="text-xs text-[#8B8FB3]">"I finally stay consistent and my skin has never felt healthier." - Amelia, 3 months in</p>
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
  const basePrice = parseFloat(plan.sale.replace(/[^0-9.]/g, ''))
  const discounted = (basePrice * 0.9).toFixed(2)
  const displayPrice = discountOffered ? `$${discounted}/day` : plan.sale

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#0B102066] backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[520px] rounded-3xl bg-white px-6 py-8 shadow-[0_28px_60px_rgba(43,33,76,0.25)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <button type="button" onClick={onClose} className="absolute right-6 top-6 text-[#A1A4C2] transition hover:text-[#5C4688]" aria-label="Close payment modal">
          ×
        </button>
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F3EBFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6F54A8]">
              Secure checkout
              </span>
            <h3 className="text-2xl font-bold text-[#43306C]">Start your free trial</h3>
            <p className="text-sm text-[#7F84A9]">
              Activate premium access instantly. No charge until your 7-day trial finishes.
            </p>
            </div>
            
          <div className="space-y-3 rounded-2xl bg-[#F8F5FF] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#4F3B7A]">{plan.label} plan</p>
                <p className="text-xs text-[#8B8FB3]">After trial: {displayPrice} ({plan.original.replace('/day', '')} regular)</p>
              </div>
              {discountOffered && (
                <span className="rounded-full bg-[#E5FBF0] px-3 py-1 text-xs font-semibold text-[#2BAE70]">
                  Extra 10% off applied
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.sellingPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6F54A8]">
                  <MiniCheckIcon className="h-3.5 w-3.5 text-[#2BAE70]" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          {!discountOffered && (
            <div className="rounded-2xl border border-[#FFD8A8] bg-[#FFF4E5] px-4 py-3 text-xs text-[#8A5A1F]">
              Thinking of leaving? Close this window and we will sweeten the deal with an extra 10% off.
            </div>
          )}

          <form className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
                Full name
                <input type="text" placeholder="Amelia Reid" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
                Email address
                <input type="email" placeholder="amelia@example.com" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
              Card number
              <input type="text" placeholder="1234 5678 9012 3456" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
                Expiry
                <input type="text" placeholder="MM/YY" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
                CVC
                <input type="text" placeholder="123" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
                Country
                <input type="text" placeholder="United Kingdom" className="mt-1 w-full rounded-xl border border-[#D6D9EE] px-3 py-2 text-sm text-[#4F3B7A] focus:border-[#9B87D5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]" />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A82C0]">
              Promo code
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#D6D9EE] bg-white px-3 py-2 text-sm shadow-sm focus-within:border-[#9B87D5] focus-within:ring-2 focus-within:ring-[#C9B8F5]">
              <input
                value={promoCode}
                  onChange={(event) => onPromoChange(event.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-transparent text-sm text-[#4F3B7A] outline-none"
                />
                <button type="button" className="text-xs font-semibold text-[#7C5CCB]">Apply</button>
              </div>
            </label>
          </form>

          <div className="space-y-3 text-left">
            <button
              type="button"
              onClick={onComplete}
              className="w-full rounded-2xl bg-gradient-to-r from-[#53D5A4] via-[#2BAE70] to-[#1D8A5A] py-3 text-base font-semibold text-white shadow-[0_20px_36px_rgba(43,174,112,0.28)] transition hover:shadow-[0_22px_40px_rgba(43,174,112,0.32)]"
            >
              Confirm membership
            </button>
            <p className="text-xs text-[#8B8FB3]">
              We will email you before your trial ends. Cancel anytime with one tap.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#7F84A9]">
              <MiniCheckIcon className="h-4 w-4 text-[#2BAE70]" />
              Encrypted checkout - 30-day money-back guarantee.
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
      <span className="pointer-events-none absolute -top-[220px] left-1/2 z-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,139,226,0.25),_transparent_70%)]" />
      <span className="pointer-events-none absolute bottom-[-180px] right-[-140px] z-0 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,196,224,0.22),_transparent_65%)]" />
    </>
  )
}

function HeroHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7E6CCB] via-[#9D88E2] to-[#FFC5E2] px-6 py-8 text-white shadow-[0_24px_60px_rgba(118,92,202,0.28)]"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Beauty Planner Premium</p>
          <h2 className="text-2xl font-bold leading-tight lg:text-3xl">Your routine, guided every step</h2>
          <p className="text-sm text-white/80 lg:max-w-xl">
            Join thousands of members who map their routines, stay accountable, and see visible results.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <RatingIcon />
            4.9/5 from 3,200+ members
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            Dermatologist-reviewed programmes
          </div>
        </div>
      </div>
    </motion.div>
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

function RatingIcon() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
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

function SecureIcon() {
  return (
    <svg className="h-5 w-5 text-[#6F54A8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1.8l8 3v5.2c0 5-3.4 9.6-8 10.8-4.6-1.2-8-5.8-8-10.8V4.8l8-3z" opacity="0.4" />
      <path d="M9.5 12.2l1.8 1.8 3.7-3.7" />
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










