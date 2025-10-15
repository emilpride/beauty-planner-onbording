"use client"

import Image from "next/image"
import { useMemo, useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useQuizStore } from "../../store/quizStore"
import { auth, saveUserToFirestore } from '@/lib/firebase'
import StripeExpressPay from "../payments/StripeExpressPay"

// Types
interface PlanOption {
  id: string
  label: string
  periodLabel: string
  total: number
  perDay: number
  billingWeeks: number
  description: string
  tag?: string
  savingLabel?: string
  sellingPoints: string[]
  originalTotal?: number
  originalPerDay?: number
}

interface FeatureItem {
  id: string
  label: string
  gradient: string
  iconSrc: string
  description: string
}

// Constants
const CURRENCY = "$"
const COUNTDOWN_SECONDS = 7 * 60

// Pricing data
// Requirements:
// - 4w shows original $9.99 crossed out and discounted $6.99 ($0.25/day shown)
// - 1w and 12w follow screenshot-like ratios and also show original vs discounted
//   1w original/day ≈ 1.414 × 4w original/day; ~30% discount for display
//   12w original/day ≈ 0.571 × 4w original/day; ~30% discount for display
const plans: PlanOption[] = [
  {
    id: "1w",
    label: "1-Week Trial",
    periodLabel: "1-WEEK PLAN",
    originalPerDay: 0.50, // 0.5042 → show $0.50
    originalTotal: 3.53,  // 3.529 → show $3.53
    perDay: 0.35,         // 30% off approx → show $0.35
    total: 2.47,          // show $2.47
    billingWeeks: 1,
    description: "Try premium features for a week.",
    sellingPoints: ["Full access for 7 days", "Cancel anytime"],
  },
  {
    id: "4w",
    label: "4-Week Plan",
    periodLabel: "4-WEEK PLAN",
    originalPerDay: 0.36, // 9.99 / 28 = 0.357 → show $0.36
    originalTotal: 9.99,  // crossed out
    perDay: 0.25,         // discounted (shows $0.25)
    total: 6.99,          // discounted (shows $6.99)
    billingWeeks: 4,
    description: "Most popular balance of value and flexibility.",
    tag: "Most popular",
    sellingPoints: ["Great value", "Flexible commitment"],
  },
  {
    id: "12w",
    label: "12-Week Plan",
    periodLabel: "12-WEEK PLAN",
    originalPerDay: 0.20, // 0.2039 → show $0.20
    originalTotal: 17.13, // 17.1257 → show $17.13
    perDay: 0.14,         // 30% off approx → show $0.14
    total: 11.99,         // show $11.99
    billingWeeks: 12,
    description: "Best daily price for long-term progress.",
    savingLabel: "Best value",
    sellingPoints: ["Lowest per-day price", "Stay consistent"],
  },
]

const features: FeatureItem[] = [
  {
    id: "assistant",
    label: "Personal AI assistant",
    gradient: "from-[#FFC0F7] to-[#E7D0FF]",
    iconSrc: "/images/icons/assistant.png",
    description: "Daily reminders, tailored tweaks, and expert-backed answers.",
  },
  {
    id: "tracking",
    label: "Unlimited activity tracking",
    gradient: "from-[#FCE092] to-[#FFEFC5]",
    iconSrc: "/images/icons/list_tick.svg",
    description: "Keep every treatment, product, and result in one smart log.",
  },
  {
    id: "planning",
    label: "Smart routine planning",
    gradient: "from-[#F4C2EF] to-[#FFE4FE]",
    iconSrc: "/custom-icons/misc/clock.svg",
    description: "Personalised schedules with gentle nudges to stay consistent.",
  },
  {
    id: "reports",
    label: "Advanced progress reports",
    gradient: "from-[#C4F0EE] to-[#CFFFFD]",
    iconSrc: "/custom-icons/misc/progress.svg",
    description: "Visual recaps that highlight improvements and what to refine.",
  },
  {
    id: "analysis",
    label: "AI beauty analysis",
    gradient: "from-[#FFB4B6] to-[#FFC9CA]",
    iconSrc: "/custom-icons/misc/analysis.svg",
    description: "Evidence-based insights powered by your routines and check-ins.",
  },
  {
    id: "calendar",
    label: "Personalised treatment calendar",
    gradient: "from-[#A0F3A0] to-[#CFFFCF]",
    iconSrc: "/custom-icons/misc/calendar.svg",
    description: "Sync appointments and at-home care with helpful reminders.",
  },
  {
    id: "motivation",
    label: "Achievements & motivation",
    gradient: "from-[#F4D0C2] to-[#FFE8DF]",
    iconSrc: "/custom-icons/misc/achievement.svg",
    description: "Celebrate milestones and keep your glow goals top-of-mind.",
  },
  {
    id: "adfree",
    label: "Ad-free experience",
    gradient: "from-[#CFC2F4] to-[#ECE6FF]",
    iconSrc: "/custom-icons/misc/ad_free.svg",
    description: "Focus on your progress without distractions or noise.",
  },
]

// Helper to compute display prices based on timer state
function computePrice(plan: PlanOption, discountActive: boolean) {
  const discountedPerDay = plan.perDay
  const discountedTotal = plan.total
  const originalPerDay = plan.originalPerDay ?? plan.perDay
  const originalTotal = plan.originalTotal ?? plan.total
  if (discountActive) {
    return {
      currentPerDay: discountedPerDay,
      currentTotal: discountedTotal,
      originalPerDay,
      originalTotal,
      showOriginal: !!plan.originalPerDay || !!plan.originalTotal,
    }
  }
  return {
    currentPerDay: originalPerDay,
    currentTotal: originalTotal,
    originalPerDay: undefined,
    originalTotal: undefined,
    showOriginal: false,
  }
}

export default function PricingStep() {
  const router = useRouter()
  const setAnswer = useQuizStore((state) => state.setAnswer)

  const [selectedPlan, setSelectedPlan] = useState<string>("4w")
  const [promoCode, setPromoCode] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [discountOffered, setDiscountOffered] = useState(false)
  const [discountActive, setDiscountActive] = useState(true)

  const selectedPlanLabel = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan)?.label ?? "4-Week Plan",
    [selectedPlan]
  )

  const handleComplete = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setAnswer("Id", currentUser.uid);
      setAnswer("Email", currentUser.email || "");
      setAnswer("ProfilePicture", currentUser.photoURL || "");
    }
    setAnswer("quizEndTime", new Date().toISOString());
    setAnswer("SelectedPlan", selectedPlan);
    setAnswer("PaymentCompleted", true);

    // Save to Firestore
    const answers = useQuizStore.getState().answers;
    await saveUserToFirestore(answers);
    // Fire-and-forget: trigger analyzeUserData after saving. Don't block navigation.
    try {
      const payload = { userId: answers.Id, answers, photoUrls: { face: answers.FaceImageUrl, hair: answers.HairImageUrl, body: answers.BodyImageUrl } }
      fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(e => console.warn('Analyze trigger failed', e))
    } catch (e) {
      console.warn('Failed to trigger analysis', e)
    }

    router.push("/success");
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

  // Prevent background scroll when the payment modal is open
  useEffect(() => {
    const htmlElement = document.documentElement
    const bodyElement = document.body

    if (showPayment) {
      htmlElement.classList.add('modal-open')
      bodyElement.classList.add('modal-open')
    } else {
      htmlElement.classList.remove('modal-open')
      bodyElement.classList.remove('modal-open')
    }

    return () => {
      htmlElement.classList.remove('modal-open')
      bodyElement.classList.remove('modal-open')
    }
  }, [showPayment])

  return (
    <div className="relative flex flex-col min-h-screen bg-transparent px-4 pt-10 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:px-6 md:pb-12 lg:px-12">
      <BackgroundDecor />
      <div className="relative mx-auto flex w-full max-w-[1040px] flex-col gap-10">
        <TopTimerRow
          totalSeconds={COUNTDOWN_SECONDS}
          onExpire={() => {
            setDiscountActive(false)
            setDiscountOffered(false)
          }}
        />

    <div className="space-y-6 md:space-y-10">
      {/* Big headline replacing trust section (moved below) */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
          Get your plan with a big discount and a 30-day money-back guarantee
        </h2>
      </div>

          <Divider label="Pick your access" />
          <PlansPanel
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            discountActive={discountActive}
          />

          <div className="flex flex-col items-center gap-3 text-center md:block">
            <button
              type="button"
              onClick={handleOpenPayment}
              className="relative inline-flex min-w-[260px] items-center justify-center rounded-full bg-primary px-10 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_20px_36px_rgba(124,92,203,0.28)] focus:outline-none focus:ring-4 focus:ring-primary/30"
              aria-label="Get my plan"
            >
              <span
                className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30"
                aria-hidden
              ></span>
              Get my plan
            </button>
            <DynamicBillingNotice selectedPlanId={selectedPlan} />
          </div>

          {/* Trust signals moved here, just before membership perks */}
          <TrustSignals />

          {/* Cross-platform availability block */}
          <PlatformAvailability />

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

      {/* Sticky mobile CTA disabled to match compact mock */}
      {false && !showPayment && (
        <StickyMobileCTA
          selectedPlanId={selectedPlan}
          onClick={handleOpenPayment}
          discountActive={discountActive}
        />
      )}
    </div>
  )
}

function TopTimerRow({ totalSeconds, onExpire }: { totalSeconds: number; onExpire?: () => void }) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds)
  const [compact, setCompact] = useState(false)
  const normalRef = useRef<HTMLDivElement | null>(null)

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
    const onScroll = () => setCompact(window.scrollY > 180)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')

  const handleClick = () => {
    const el = document.getElementById('plans')
    if (!el) return
    const fixedBar = document.querySelector('[data-compact-timer]') as HTMLElement | null
    const offset = fixedBar ? fixedBar.getBoundingClientRect().height + 16 : 96
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const expired = secondsRemaining <= 0

  return (
    <>
      <div ref={normalRef} className="mx-auto w-[min(92vw,1040px)] px-0">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-sm ${compact ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-text-primary">{expired ? 'Offer ended' : 'Discount is reserved for:'}</span>
            <div className="flex items-center gap-3">
              <TimerUnit value={minutes} label="minutes" compact={false} />
              <span className="text-[22px] font-extrabold leading-none text-primary">:</span>
              <TimerUnit value={seconds} label="seconds" compact={false} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(124,92,203,0.28)] hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            Get my plan
          </button>
        </motion.div>
      </div>

      {compact && (
        <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+8px)] z-50 pointer-events-none" data-compact-timer>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mx-auto w-[min(92vw,1040px)] px-0"
          >
            <div className="flex w-full items-center justify-center gap-4 rounded-2xl border border-border-subtle/70 bg-surface px-3 py-2 shadow-sm backdrop-blur pointer-events-auto">
              <div className="flex items-center gap-3">
                <TimerUnit value={minutes} label="minutes" compact={true} />
                <span className="text-base font-extrabold leading-none text-primary">:</span>
                <TimerUnit value={seconds} label="seconds" compact={true} />
              </div>
              <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(124,92,203,0.28)] hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
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

function PlansPanel({
  selectedPlan,
  onSelect,
  discountActive,
}: {
  selectedPlan: string
  onSelect: (id: string) => void
  discountActive: boolean
}) {
  return (
    <div
      id="plans"
      className="grid gap-1.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 scroll-mt-24 overflow-visible"
    >
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          active={plan.id === selectedPlan}
          discountActive={discountActive}
          onSelect={() => onSelect(plan.id)}
        />
      ))}
    </div>
  )
}

function PlanCard({
  plan,
  active,
  onSelect,
  discountActive,
}: {
  plan: PlanOption
  active: boolean
  onSelect: () => void
  discountActive: boolean
}) {
  const price = computePrice(plan, discountActive)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex h-full flex-col overflow-hidden sm:overflow-visible rounded-2xl sm:rounded-3xl border pl-8 pr-4 py-2.5 sm:px-5 sm:py-6 ${plan.tag ? 'sm:pt-8' : ''} text-left transition focus:outline-none ${
        active
          ? "border-2 border-primary bg-surface shadow-[0_12px_22px_rgba(124,92,203,0.16)]"
          : "border border-border-subtle bg-surface shadow-sm"
      }`}
    >
      {plan.tag && (
        <>
          {/* Mobile: full-width tag bar attached to card top */}
          <div className="sm:hidden pointer-events-none absolute top-0 left-0 right-0 z-10">
            <div className="w-full rounded-t-2xl bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white text-center shadow-[0_8px_16px_rgba(124,92,203,0.24)]">
              {plan.tag}
            </div>
          </div>
          {/* Desktop/tablet: centered pill (attached inside top edge) */}
          <div className="hidden sm:block pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full bg-primary px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-[0_8px_16px_rgba(124,92,203,0.24)]">
              {plan.tag}
            </div>
          </div>
        </>
      )}
  {/* Mobile layout */}
  <div className={`sm:hidden space-y-1.5 ${plan.tag ? 'pt-5' : ''}`}>
        {/* Floating price block (independent) */}
        <div className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 translate-x-[-8px] scale-[1.3] origin-top-right">
          <div className="text-right leading-none">
            {price.showOriginal && price.originalPerDay !== undefined && (
              <div className="text-[12px] text-text-secondary line-through opacity-70">{`${CURRENCY}${price.originalPerDay.toFixed(2)}`}</div>
            )}
            <div className="text-[24px] font-extrabold leading-none tracking-tight text-text-primary">{`${CURRENCY}${price.currentPerDay.toFixed(2)}`}</div>
            <div className="text-[10px] text-text-secondary">per day</div>
          </div>
        </div>
        {/* Header: only radio + label (price is floating overlay) */}
        <div className="flex items-center justify-start gap-2 pr-24">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                active ? 'border-primary bg-primary' : 'border-[#D6D9EE] bg-transparent'
              }`}
              aria-hidden
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
            </span>
            <p className="text-[15px] font-semibold leading-tight text-text-primary">{plan.label}</p>
          </div>
        </div>
        {/* Period pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            {plan.periodLabel}
          </span>
        </div>
        {/* Totals row under period: original -> discounted */}
        <div className="text-[11px] text-text-secondary">
          {price.showOriginal && price.originalTotal !== undefined && (
            <span className="line-through opacity-70 mr-2">{`${CURRENCY}${price.originalTotal.toFixed(2)}`}</span>
          )}
          <span className="mx-0.5">→</span>
          <span className="font-semibold text-text-primary">{`${CURRENCY}${price.currentTotal.toFixed(2)}`}</span>
        </div>
      </div>

      {/* Desktop / tablet layout */}
      <div className="hidden sm:block">
        <div className="space-y-3 sm:space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-2xl font-semibold leading-tight text-text-primary">
                {plan.label}
              </p>
              <span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                {plan.periodLabel}
              </span>
            </div>
            <span
              className={`hidden sm:inline-flex mt-1 h-6 w-6 items-center justify-center rounded-full border-2 ${
                active
                  ? "border-primary bg-primary"
                  : "border-[#D6D9EE] bg-transparent"
              }`}
              aria-hidden
            >
              {active && <CheckIcon className="h-4 w-4 text-white" />}
            </span>
          </div>
          <div className="space-y-0.5 text-right text-text-secondary">
            {price.showOriginal && price.originalTotal !== undefined && (
              <p className="text-xs line-through opacity-70">{`${CURRENCY}${price.originalTotal.toFixed(
                2
              )}`}</p>
            )}
            <p className="text-sm font-semibold text-text-primary">{`${CURRENCY}${price.currentTotal.toFixed(
              2
            )}`}</p>
          </div>
          <div className="border-t border-border-subtle" />
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              {price.showOriginal && price.originalPerDay !== undefined && (
                <span className="text-base text-text-secondary line-through opacity-70">{`${CURRENCY}${price.originalPerDay.toFixed(
                  2
                )}`}</span>
              )}
              <div className="text-[34px] font-extrabold leading-none tracking-tight text-text-primary">{`${CURRENCY}${price.currentPerDay.toFixed(
                2
              )}`}</div>
            </div>
            <div className="pb-1 text-sm text-text-secondary">per day</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.sellingPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold text-text-primary"
              >
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

function FAQSection() {
  const items = [
    {
      q: "When will I be charged?",
  a: "You won't be charged today. If you keep premium past the 7-day trial, your first payment will be charged automatically at the end of your trial for the plan you selected. You'll see the price before confirming, and we also send a reminder in the app so there are no surprises.",
    },
    {
      q: "Can I cancel anytime?",
  a: "Yes. You can cancel anytime from your account settings in the app or website with a single tap. You'll keep access to premium features until the end of your current billing period, with no penalties or hidden fees.",
    },
    {
      q: "Do you offer refunds?",
      a: "Absolutely. If you're not in love within 30 days, contact support from the app and we'll provide a full refund. We can also help you adjust your routine if you'd like to continue and get better results.",
    },
    {
      q: "What happens after my plan ends?",
      a: "Your plan renews automatically at the standard price shown during checkout. You'll get a reminder before renewal, and you can pause or cancel renewal anytime from settings.",
    },
    {
      q: "Which payment methods are supported?",
      a: "We support major cards (Visa, Mastercard, American Express), and Apple Pay/Google Pay where available. All payments are processed securely by Stripe.",
    },
  ]
  return (
    <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface">
      {items.map((item, idx) => (
        <FAQItem key={idx} question={item.q} answer={item.a} defaultOpen={idx === 0} />
      ))}
    </div>
  )
}

function FAQItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string
  answer: string
  defaultOpen?: boolean
}) {
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
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
            open
              ? "rotate-45 border-[#7C5CCB] text-[#7C5CCB]"
              : "border-border-subtle text-text-secondary"
          } transition`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
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

function StickyMobileCTA({
  selectedPlanId,
  onClick,
  discountActive,
}: {
  selectedPlanId: string
  onClick: () => void
  discountActive: boolean
}) {
  const plan = plans.find((p) => p.id === selectedPlanId) ?? plans[0]
  const price = computePrice(plan, discountActive)
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle/60 bg-surface/90 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0px)] backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-3">
        <div className="text-left">
          {discountActive ? (
            <p className="text-xs text-text-secondary">Limited-time discount</p>
          ) : (
            <p className="text-xs text-text-secondary">Offer ended</p>
          )}
          <p className="text-sm font-semibold text-text-primary">
            {plan.label} • {`${CURRENCY}${price.currentPerDay.toFixed(2)}`}/day
          </p>
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
  const everyLabel = plan.billingWeeks === 1 ? "1 week" : `${plan.billingWeeks} weeks`
  const { currentTotal } = computePrice(plan, false) // Always inform regular billing at full price
  return (
    <div className="mt-2 w-full max-w-3xl mx-auto text-center rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-xs sm:text-[13px] text-text-secondary">
      Without cancellation, before the selected plan ends, you accept that Beauty Mirror will automatically charge
      <span className="mx-1 font-semibold text-text-primary">{`${CURRENCY}${currentTotal.toFixed(2)}`}</span>
      every <span className="font-semibold text-text-primary">{everyLabel}</span> until I cancel. Cancel online via the account page on the website or app.
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
  const { currentTotal } = computePrice(plan, discountActive)
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
  className="relative mx-0 w-full max-w-[768px] rounded-t-3xl sm:rounded-3xl bg-white px-5 py-5 sm:px-8 sm:py-8 shadow-[0_32px_64px_rgba(0,0,0,0.24)] max-h-[85vh] sm:max-h-[88vh] overflow-y-auto scrollbar-none"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
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
              <span className="text-text-secondary">{`${plan.billingWeeks}-week price`}</span>
              <span className="font-medium text-text-primary">{`${CURRENCY}${currentTotal.toFixed(2)}`}</span>
            </div>
            <div className="my-2 h-px w-full bg-border-subtle" />
            <div className="flex items-center justify-between py-2 text-base font-bold text-text-primary">
              <span>Total today:</span>
              <span>{`${CURRENCY}${currentTotal.toFixed(2)}`}</span>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="flex flex-col">
            <StripeExpressPay amountCents={Math.round(currentTotal * 100)} currency="usd" label="Total" onSuccess={onComplete} />
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

function PaymentBrandsRow() {
  const brands = [
    { key: "visa", light: "/icons/payment_methods/visa_light.svg", dark: "/icons/payment_methods/visa_dark.svg" },
    { key: "mastercard", light: "/icons/payment_methods/mastercard_light.svg", dark: "/icons/payment_methods/mastercard_dark.svg" },
    { key: "maestro", light: "/icons/payment_methods/maestro_light.svg", dark: "/icons/payment_methods/maestro_dark.svg" },
    { key: "amex", light: "/icons/payment_methods/american-express_light.svg", dark: "/icons/payment_methods/american-express_dark.svg" },
    { key: "diners", light: "/icons/payment_methods/diners-club_light.svg", dark: "/icons/payment_methods/diners-club_dark.svg" },
    { key: "discover", light: "/icons/payment_methods/discover_light.svg", dark: "/icons/payment_methods/discover_dark.svg" },
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

function MiniCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4 text-[#2BAE70]"} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.5 4.5l-5.3 6-2.7-2.8" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4 text-white"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

// --- Missing helper sections ---
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="flex-1 border-t border-border-subtle" />
      <span className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">{label}</span>
      <span className="flex-1 border-t border-border-subtle" />
    </div>
  )
}

function FeaturesGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((feature) => (
        <FeatureRow key={feature.id} feature={feature} />
      ))}
    </div>
  )
}

function FeatureRow({ feature }: { feature: FeatureItem }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 rounded-2xl border border-border-subtle bg-surface p-3 sm:p-4 shadow-sm">
      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
        <Image src={feature.iconSrc} width={28} height={28} alt="" className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] sm:text-sm font-semibold text-text-primary line-clamp-1">{feature.label}</p>
        <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-2">{feature.description}</p>
      </div>
    </div>
  )
}

function TrustSignals() {
  return (
    <>
      {/* Mobile: ultra-compact chips */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center gap-1.5">
          <TrustChip label="Experts" ariaDesc="Designed alongside dermatologists and estheticians." />
          <TrustChip label="Secure" ariaDesc="Protected checkout with Stripe and Apple/Google Pay." />
          <TrustChip label="30d refund" ariaDesc="Not in love? Full refund within 30 days." />
        </div>
      </div>

      {/* Tablet/Desktop: detailed pills */}
      <div className="hidden sm:grid gap-3 sm:grid-cols-3">
        <TrustPill title="Expert crafted" description="Designed alongside dermatologists and estheticians." />
        <TrustPill title="Secure payments" description="Protected checkout with Stripe and Apple/Google Pay." />
  <TrustPill title="30-day guarantee" description="Not in love? Full refund within 30 days." />
      </div>
    </>
  )
}

function PlatformAvailability() {
  return (
    <div className="mt-2 sm:mt-3">
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
        {/* Headline */}
        <div className="text-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-text-primary">
            Use your plan anywhere
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Seamless on iPhone, Android, and the web — switch devices anytime.
          </p>
        </div>

        {/* Mobile: compact chips */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <PlatformChip
            icon={<PlatformIcon light="/custom-icons/platforms/android-icon-light.svg" dark="/custom-icons/platforms/android-icon-dark.svg" />}
            label="Android"
          />
          <PlatformChip
            icon={<PlatformIcon light="/custom-icons/platforms/apple-icon-light.svg" dark="/custom-icons/platforms/apple-icon-dark.svg" />}
            label="Apple"
          />
          <PlatformChip
            icon={<PlatformIcon light="/custom-icons/platforms/web-icon-light.svg" dark="/custom-icons/platforms/web-icon-dark.svg" />}
            label="Web"
          />
        </div>

        {/* sm+ : pill row */}
        <div className="hidden sm:flex items-center justify-center gap-3">
          <PlatformPill
            icon={<PlatformIcon light="/custom-icons/platforms/android-icon-light.svg" dark="/custom-icons/platforms/android-icon-dark.svg" size={22} />}
            label="Android"
          />
          <PlatformPill
            icon={<PlatformIcon light="/custom-icons/platforms/apple-icon-light.svg" dark="/custom-icons/platforms/apple-icon-dark.svg" size={22} />}
            label="Apple"
          />
          <PlatformPill
            icon={<PlatformIcon light="/custom-icons/platforms/web-icon-light.svg" dark="/custom-icons/platforms/web-icon-dark.svg" size={22} />}
            label="Web"
          />
        </div>
      </div>
    </div>
  )
}

function PlatformPill({ icon, label }: { icon: React.ReactNode | string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/50 px-4 py-2 shadow-sm">
      {typeof icon === 'string' ? (
        <Image src={icon} alt="" width={20} height={20} className="rounded-sm" />
      ) : (
        icon
      )}
      <span className="text-sm font-semibold text-text-primary">{label}</span>
    </div>
  )
}

function PlatformChip({ icon, label }: { icon: React.ReactNode | string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border-subtle bg-white/60 py-2">
      {typeof icon === 'string' ? (
        <Image src={icon} alt="" width={22} height={22} className="rounded-sm" />
      ) : (
        icon
      )}
      <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
    </div>
  )
}

function PlatformIcon({ light, dark, size = 22 }: { light: string; dark?: string; size?: number }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      {/* Light theme */}
      <Image src={light} alt="" width={size} height={size} className={`block ${dark ? 'dark:hidden' : ''}`} />
      {/* Dark theme (optional) */}
      {dark && (
        <Image src={dark} alt="" width={size} height={size} className="hidden dark:block" />
      )}
    </span>
  )
}

function TrustPill({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1 rounded-xl px-2 py-2 sm:flex-row sm:items-start sm:text-left sm:gap-3 sm:rounded-2xl sm:border sm:border-border-subtle sm:bg-surface sm:px-4 sm:py-3">
      <MiniCheckIcon className="mb-1 h-4 w-4 text-[#2BAE70] sm:mb-0 sm:mt-0.5" />
      <div className="min-w-0">
        <p className="text-[12px] leading-tight font-semibold text-text-primary sm:text-sm">{title}</p>
        <p className="hidden text-xs text-text-secondary sm:block">{description}</p>
      </div>
    </div>
  )
}

function TrustChip({ label, ariaDesc }: { label: string; ariaDesc: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-text-primary border border-border-subtle">
      <MiniCheckIcon className="h-3.5 w-3.5 text-[#2BAE70]" />
      <span>{label}</span>
  <span className="sr-only"> {ariaDesc}</span>
    </div>
  )
}

function TestimonialStrip() {
  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-4 sm:p-5 md:p-6 shadow-[0_18px_34px_rgba(108,83,173,0.12)]">
  <div className="grid items-start gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-[auto_auto_1fr]">
        {/* Square pill: Rating */}
  <div className="relative flex w-full aspect-square sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-primary/20 bg-surface-muted/50 p-2">
          <div className="text-center leading-tight">
            <div className="flex items-end justify-center gap-1 leading-none">
              <span className="text-2xl font-extrabold text-primary">4.9</span>
              <span className="text-sm font-semibold text-text-secondary">/5</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarSolid key={i} className="h-4 w-4 text-[#F6B100]" />
              ))}
            </div>
            <div className="mt-1 text-[10px] leading-none text-text-secondary">1k+ reviews</div>
          </div>
        </div>

        {/* Square pill: Users */}
  <div className="relative flex w-full aspect-square sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-primary/20 bg-surface-muted/50 p-2">
          <div className="text-center leading-tight">
            <p className="text-sm font-semibold text-text-primary leading-none">10k+ users</p>
            <div className="mt-2 flex items-center justify-center">
              <Image src="/images/reviews/users.png" alt="Users" width={88} height={24} className="h-6 w-auto" />
            </div>
          </div>
        </div>

  {/* Testimonial text */}
        <div className="min-w-0 col-span-2 sm:col-span-1">
          <p className="text-sm text-text-primary leading-relaxed text-center sm:text-left">
            “The routines and reminders keep me consistent. I saw real improvements in a few weeks.”
          </p>
          <span className="mt-1 block text-center sm:text-left text-xs text-text-secondary">Verified member</span>
        </div>
      </div>
    </div>
  )
}

function SocialProofPills() {
  return (
    <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
      {/* Rating pill */}
      <div className="rounded-2xl border border-primary/25 bg-surface px-4 py-4">
        <div className="flex items-end gap-2">
          <span className="text-[28px] sm:text-[32px] font-extrabold leading-none text-primary">4.9</span>
          <span className="text-base sm:text-lg font-semibold leading-none text-text-secondary">/5</span>
        </div>
        <div className="mt-2 flex items-center gap-1" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarSolid key={i} className="h-4 w-4 text-[#F6B100]" />
          ))}
        </div>
        <div className="mt-2 text-xs sm:text-sm text-text-secondary">1k+ reviews</div>
      </div>

      {/* Users pill */}
      <div className="rounded-2xl border border-primary/25 bg-surface px-4 py-4">
        <p className="text-sm font-semibold text-text-primary mb-2">10k+ users</p>
        <div className="flex items-center">
          <Image src="/images/reviews/users.png" alt="Users" width={140} height={36} className="h-9 w-auto" />
        </div>
      </div>
    </div>
  )
}

function StarSolid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className ?? "h-4 w-4 text-[#F6B100]"}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}










