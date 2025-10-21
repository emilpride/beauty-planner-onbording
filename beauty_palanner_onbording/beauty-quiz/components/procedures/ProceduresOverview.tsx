"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuizStore } from "@/store/quizStore"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const ProcedureCard = ({
  icon,
  title,
  description,
  accent,
}: {
  icon: string
  title: string
  description: string
  accent: string
}) => (
  <li className="flex gap-3 rounded-2xl border border-border-subtle/60 bg-surface/95 p-3 shadow-soft">
    <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ color: accent }}>
      {icon}
    </span>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs leading-relaxed text-text-secondary">{description}</p>
    </div>
  </li>
)

const procedureSteps = [
  {
    id: 0,
    title: "Choose Your Procedures",
    subtitle: "Pick the care blocks you want in your routine",
    illustration: "/images/procedures/choose.png",
    description:
      "We craft routines that blend daily habits with weekly boosters. Tell us what feels right for your schedule and lifestyle.",
    items: [
      {
        icon: "🧴",
        title: "Skin Treatments",
        description: "Cleansers, serums, and barrier support matched to your primary concerns.",
        accent: "#8A60FF",
      },
      {
        icon: "💇‍♀️",
        title: "Hair & Scalp Rituals",
        description: "Hydration, detox, and styling guidance to keep texture healthy.",
        accent: "#33C75A",
      },
      {
        icon: "🧘",
        title: "Mind & Body Rest",
        description: "Breathwork, stretching, and mindful breaks woven into your day.",
        accent: "#FFA64D",
      },
    ],
  },
  {
    id: 1,
    title: "Procedure Setup",
    subtitle: "Adjust timing, frequency, and reminders",
    illustration: "/images/procedures/setup.png",
    description:
      "You control how often each block repeats. Set morning boosts, evening wind-downs, and weekend resets.",
    items: [
      {
        icon: "🗓️",
        title: "Smart Scheduling",
        description: "Spacing routines so skin, hair, and body get recovery windows.",
        accent: "#53E5FF",
      },
      {
        icon: "📅",
        title: "Weekly Focus",
        description: "Highlight the themes you want to emphasise each week.",
        accent: "#33C75A",
      },
      {
        icon: "📝",
        title: "Routine Notes",
        description: "Drop in product names, coach tips, or self-reminders for future you.",
        accent: "#FBBE24",
      },
    ],
  },
  {
    id: 2,
    title: "Generating Your Schedule",
    subtitle: "We calculate the best flow",
    illustration: "/images/procedures/generating.png",
    description:
      "Our engine arranges your selections into a balanced calendar so high-intensity blocks never clash.",
    items: [
      {
        icon: "⚖️",
        title: "Balanced Load",
        description: "No more piling active serums or workouts on back-to-back days.",
        accent: "#FFA64D",
      },
      {
        icon: "🎯",
        title: "Goal Alignment",
        description: "Every block maps to the goals you set during onboarding.",
        accent: "#F75C7E",
      },
      {
        icon: "🧩",
        title: "Adaptive Slots",
        description: "We leave room for recovery, travel, or busy weeks.",
        accent: "#53E5FF",
      },
    ],
  },
  {
    id: 3,
    title: "Notifications",
    subtitle: "Decide how you want reminders",
    illustration: "/images/procedures/notifications.png",
    description:
      "Stay gently nudged without noise. Choose push, email, or silent mode.",
    items: [
      {
        icon: "🔔",
        title: "Daily Nudges",
        description: "Quick prompts when it's time for the next block.",
        accent: "#8A60FF",
      },
      {
        icon: "🗞️",
        title: "Weekly Digest",
        description: "A Sunday snapshot with the wins ahead.",
        accent: "#33C75A",
      },
      {
        icon: "🚫",
        title: "Do Not Disturb",
        description: "One tap pauses alerts when life gets full.",
        accent: "#FF8A4C",
      },
    ],
  },
  {
    id: 4,
    title: "Agreement",
    subtitle: "Review and confirm your personalised plan",
    illustration: "/images/procedures/agreement.png",
    description:
      "Make sure everything feels aligned. You can always tweak later from the dashboard.",
    items: [
      {
        icon: "📝",
        title: "Plan Summary",
        description: "Every routine block plus timing in one glance.",
        accent: "#33C75A",
      },
      {
        icon: "⚙️",
        title: "Adjustments",
        description: "Edit frequency or swap a block before signing.",
        accent: "#53E5FF",
      },
      {
        icon: "✅",
        title: "Consent",
        description: "We log your approval and unlock advanced insights.",
        accent: "#FFA64D",
      },
    ],
  },
  {
    id: 5,
    title: "Regular Care Results",
    subtitle: "See the compounding gains",
    illustration: "/images/procedures/results.png",
    description:
      "We show how consistency lifts your Beauty Mirror score across skin, hair, body, and mindset.",
    items: [
      {
        icon: "📈",
        title: "Score Growth",
        description: "Visualise wins as your Beauty Mirror score climbs.",
        accent: "#8A60FF",
      },
      {
        icon: "🏆",
        title: "Milestones",
        description: "Celebrate streaks and unlock premium care boosters.",
        accent: "#33C75A",
      },
      {
        icon: "✨",
        title: "Next Step Hints",
        description: "Tailored boosters to keep your routine feeling fresh.",
        accent: "#FBBE24",
      },
    ],
  },
]

interface ProceduresOverviewProps {
  currentStep: number
}

export default function ProceduresOverview({ currentStep }: ProceduresOverviewProps) {
  const { answers } = useQuizStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const activeCard = useMemo(
    () => procedureSteps.find((step) => step.id === currentStep) ?? procedureSteps[0],
    [currentStep],
  )
  const safeActiveCard = activeCard ?? procedureSteps[0]!

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-background px-5 pb-10 pt-8">
      <div className="space-y-1 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Procedures flow</p>
        <h1 className="text-2xl font-bold text-text-primary">Regular care, simplified</h1>
        <p className="text-sm text-text-secondary">
          {isHydrated
            ? `Hello ${answers.Name || 'there'}! Here�s how we transform your choices into a routine.`
            : 'Here�s how we transform your choices into a routine.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={safeActiveCard.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col gap-5 rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft md:flex-row"
        >
          <div className="md:w-1/2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">Step {safeActiveCard.id + 1} of {procedureSteps.length}</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{safeActiveCard.title}</h2>
            <p className="mt-3 text-sm text-text-secondary">{safeActiveCard.description}</p>
            <ul className="mt-5 space-y-3">
              {safeActiveCard.items.map((item) => (
                <ProcedureCard key={item.title} {...item} />
              ))}
            </ul>
          </div>
          <div className="md:w-1/2">
            <div className="flex h-full items-center justify-center rounded-3xl border border-border-subtle/60 bg-surface-muted/80 p-6 shadow-soft">
              <Image
                src={safeActiveCard.illustration}
                alt={safeActiveCard.title}
                width={260}
                height={260}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="grid gap-4 rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft md:grid-cols-3">
        {procedureSteps.map((step) => {
          const isActive = step.id === currentStep
          return (
            <div
              key={step.id}
              className={`flex h-full flex-col justify-between rounded-2xl border border-transparent bg-surface-muted/70 p-4 text-left transition hover:-translate-y-1 hover:border-primary/30 ${
                isActive ? 'border-primary/40 shadow-soft text-text-primary' : 'text-text-secondary'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Step {step.id + 1}</p>
              <h3 className="mt-3 text-sm font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed">{step.subtitle}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
