'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'
import { getActivityMeta } from './activityMeta'
import { getIconById } from './iconCatalog'

interface ActivitySetting {
  id: string
  name: string
  note: string
  repeat: 'Daily' | 'Weekly' | 'Monthly'
  allDay: boolean
  weekdays: number[]
  monthlyDays: number[]
  time: string
  timePeriod: 'Morning' | 'Afternoon' | 'Evening'
  endDate: boolean
  endType: 'date' | 'days'
  endDateValue: string
  endDaysValue: number
  remind: boolean
  remindBefore: number
  remindBefore2: number
}

const createActivitySetting = (activityId: string, fallbackName?: string): ActivitySetting => {
  const meta = getActivityMeta(activityId, fallbackName)

  return {
    id: activityId,
    name: meta.name,
    note: '',
    repeat: 'Daily',
    allDay: true,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    monthlyDays: [],
    time: '',
    timePeriod: 'Morning',
    endDate: false,
    endType: 'date',
    endDateValue: '',
    endDaysValue: 30,
    remind: false,
    remindBefore: 15,
    remindBefore2: 5,
  }
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const repeatOptions: ActivitySetting['repeat'][] = ['Daily', 'Weekly', 'Monthly']
const periodOptions: ActivitySetting['timePeriod'][] = ['Morning', 'Afternoon', 'Evening']
const remindPrimaryOptions = [5, 10, 15, 30, 60]
const remindSecondaryOptions = [5, 10, 15, 30]
const weeklyNumberLabels = [1, 2, 3, 4, 5, 6, 7]
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1)

const accentGradients = [
  'linear-gradient(135deg, rgba(163,133,233,0.18) 0%, rgba(188,202,247,0.35) 100%)',
  'linear-gradient(135deg, rgba(255,138,171,0.16) 0%, rgba(255,205,178,0.32) 100%)',
  'linear-gradient(135deg, rgba(255,232,146,0.22) 0%, rgba(255,247,205,0.38) 100%)',
]

const accentGlows = ['rgba(163,133,233,0.45)', 'rgba(255,152,152,0.45)', 'rgba(255,226,120,0.45)']

const quickInsights = [
  {
    title: 'Start using the app',
    description: 'Get personalized routines for skin, hair, fitness & self-care.',
  },
  {
    title: 'Stay consistent with your routine',
    description: 'Automatic reminders help you build healthy habits.',
  },
  {
    title: 'Complete daily self-care rituals',
    description: 'Follow your plan to nurture beauty & well-being.',
  },
  {
    title: 'Unlock achievements & stay motivated',
    description: 'Reach new milestones as you stick to your routine.',
  },
]

const challengeList = [
  'Struggle to stay consistent with self-care',
  'Forget important skincare, haircare, or wellness steps',
  'No clear way to track your beauty habits',
]

const winHighlights = [
  'Follow a structured beauty & wellness routine effortlessly',
  'Get reminders to keep up with your personalized plan',
  'See your completed routines and progress over time',
  'Unlock achievements and stay inspired',
]

const testimonials = [
  {
    name: 'Emily',
    quote: 'This service is a real find! Thanks for the accuracy and professionalism!',
    rating: '5.0',
  },
  {
    name: 'Mira',
    quote: 'The reminders keep me on track and the routine finally feels easy to follow.',
    rating: '5.0',
  },
  {
    name: 'Sofia',
    quote: 'Loving the structure—my skincare and wellness steps now flow together.',
    rating: '5.0',
  },
]

const floatTransition = { duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
const pillSpring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }

const formatTimeLabel = (time: string) => {
  if (!time) {
    return '--:--'
  }

  const [hoursStr, minutesStr] = time.split(':')
  const hours = Number(hoursStr)

  if (Number.isNaN(hours)) {
    return '--:--'
  }

  const suffix = hours >= 12 ? 'PM' : 'AM'
  const normalized = hours % 12 === 0 ? 12 : hours % 12

  return `${normalized}:${minutesStr} ${suffix}`
}

const formatMonthlySummary = (days: number[]) => {
  if (!days.length) {
    return 'Select days of the month'
  }

  const sorted = [...days].sort((a, b) => a - b)
  return `Every month on ${sorted.join(', ')}`
}

const formatWeekdaySummary = (weekdays: number[]) => {
  if (!weekdays.length || weekdays.length === 7) {
    return 'Every day'
  }

  return weekdays.map((day) => weekdayNames[day]).join(', ')
}

const formatRepeatSummary = (activity: ActivitySetting) => {
  if (activity.repeat === 'Daily') {
    return 'Daily  -  Every day'
  }

  if (activity.repeat === 'Weekly') {
    return `Weekly  -  ${formatWeekdaySummary(activity.weekdays)}`
  }

  return `Monthly  -  ${activity.monthlyDays.length ? formatMonthlySummary(activity.monthlyDays) : 'Select dates'}`
}

const formatReminderSummary = (activity: ActivitySetting) => {
  if (!activity.remind) {
    return 'Reminders are turned off for now'
  }

  const primaryLabel = activity.remindBefore === 60 ? '1 hour' : `${activity.remindBefore} min`
  const secondaryLabel = `${activity.remindBefore2} min`
  return `Reminds you ${primaryLabel} & ${secondaryLabel} before the activity`
}
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9B8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        checked ? 'bg-[#8F74E5]' : 'bg-[#D8DAEE]'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface OptionPillProps {
  label: string
  active: boolean
  onClick: () => void
  highlightId: string
  activeColor?: string
  disabled?: boolean
}

const OptionPill = ({
  label,
  active,
  onClick,
  highlightId,
  activeColor = '#5C4688',
  disabled = false,
}: OptionPillProps) => {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={active}
      aria-disabled={disabled}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border px-0 py-0 text-sm font-medium transition ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${
        active
          ? 'border-transparent text-white shadow-[0_12px_24px_rgba(92,70,136,0.15)]'
          : 'border-[#D8DAEE] text-[#5C4688] hover:border-[#9E90D9]'
      }`}
    >
      <span className="relative z-10 px-5 py-2">{label}</span>
      {active && (
        <motion.span
          layoutId={highlightId}
          className="absolute inset-0"
          style={{ backgroundColor: activeColor }}
          transition={pillSpring}
        />
      )}
    </button>
  )
}

const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20163F]/60 px-4 backdrop-blur">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_32px_64px_rgba(36,23,78,0.25)]"
      >
        {children}
      </motion.div>
    </div>
  )
}

interface MonthlyDaysModalProps {
  open: boolean
  initialSelection: number[]
  onCancel: () => void
  onSave: (days: number[]) => void
}

const MonthlyDaysModal = ({ open, initialSelection, onCancel, onSave }: MonthlyDaysModalProps) => {
  const [selection, setSelection] = useState<number[]>(initialSelection)

  useEffect(() => {
    if (open) {
      setSelection(initialSelection)
    }
  }, [initialSelection, open])

  if (!open) {
    return null
  }

  const toggleDay = (day: number) => {
    setSelection((prev) => {
      if (prev.includes(day)) {
        return prev.filter((value) => value !== day)
      }
      return [...prev, day].sort((a, b) => a - b)
    })
  }

  return (
    <Modal onClose={onCancel}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#4B3A78]">Choose days of the month</h2>
          <p className="text-sm text-[#8C8FA9]">Tap the dates you want to include in this routine.</p>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
            <span key={label} className="text-xs font-semibold uppercase tracking-wide text-[#B4B7D4]">
              {label}
            </span>
          ))}
          {monthDays.map((day) => {
            const isSelected = selection.includes(day)
            return (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-[#5C4688] text-white shadow-[0_10px_20px_rgba(92,70,136,0.18)]'
                    : 'text-[#5C4688] hover:bg-[#ECE9FF]'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#D8DAEE] px-5 py-2 text-sm font-medium text-[#5C4688] transition hover:border-[#8F74E5] hover:text-[#8F74E5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selection)}
            className="rounded-full bg-[#A385E9] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(163,133,233,0.32)] transition hover:bg-[#8F74E5]"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface QuickStatProps {
  label: string
  value: string
  detail: string
  delay: number
}

const QuickStat = ({ label, value, detail, delay }: QuickStatProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left shadow-[0_12px_24px_rgba(92,70,136,0.12)] backdrop-blur"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8C8FA9]">{label}</p>
      <p className="text-xl font-semibold text-[#4B3A78]">{value}</p>
      <p className="text-xs text-[#8C8FA9]">{detail}</p>
    </motion.div>
  )
}

function InsightsPanel({ totalActivities, remindCount }: { totalActivities: number; remindCount: number }) {
  const reminderLabel = remindCount
    ? `${remindCount} reminder${remindCount === 1 ? '' : 's'} active`
    : 'Reminders off for now'

  return (
    <div className="flex flex-col gap-6">
      <motion.section
        initial={{ opacity: 0, translateY: 24 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
        className="overflow-hidden rounded-[32px] bg-[#F7F6FF] p-6 shadow-[0_20px_40px_rgba(92,70,136,0.12)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#4B3A78]">Regular care = better results!</h2>
            <p className="mt-1 text-sm text-[#8C8FA9]">
              Complete {totalActivities} tailored routine{totalActivities === 1 ? '' : 's'} to keep your glow consistent.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-[#5C4688] sm:inline-flex">
            {reminderLabel}
          </span>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {quickInsights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, translateY: 12 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.6 }}
              className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-[0_12px_20px_rgba(163,133,233,0.1)]"
            >
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#A385E9]/15 text-[#A385E9]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 8.33333L6.66667 11L12 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-[#4B3A78]">{item.title}</p>
                <p className="text-xs text-[#8C8FA9]">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, translateY: 24 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
        viewport={{ once: true, amount: 0.4 }}
        className="rounded-[32px] border border-[#E4E6F5] bg-white p-6 shadow-[0_20px_40px_rgba(92,70,136,0.08)]"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8C8FA9]">Why finish setup?</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            {challengeList.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#F1F0FA] px-4 py-3 text-sm text-[#4B3A78]">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8C8FA9]">−</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {winHighlights.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-[#E5DFFC] bg-gradient-to-r from-[#F9F6FF] to-white px-4 py-3 text-sm text-[#4B3A78] shadow-[0_12px_24px_rgba(163,133,233,0.12)]"
              >
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#A385E9]/15 text-[#A385E9]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 8.33333L6.66667 11L12 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, translateY: 24 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
        viewport={{ once: true, amount: 0.4 }}
        className="overflow-hidden rounded-[32px] border border-[#E4E6F5] bg-white p-6 shadow-[0_20px_40px_rgba(92,70,136,0.08)]"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#4B3A78]">Loved by early users</h3>
          <span className="text-xs text-[#B4B7D4]">Swipe to explore</span>
        </div>
        <div className="mt-4 overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: ['0%', '-6%', '0%'] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          >
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="min-w-[220px] max-w-[220px] rounded-2xl border border-[#F0EFF9] bg-[#FBF9FF] p-4 shadow-[0_12px_24px_rgba(92,70,136,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#4B3A78]">{item.name}</p>
                    <p className="text-xs text-[#A385E9]">Verified user</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FABB05]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 3.5l2.47 5.02 5.53.8-4 3.9.94 5.5L12 16.9l-4.94 2.82.94-5.5-4-3.9 5.53-.8L12 3.5z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#5C4688]">{item.quote}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
export default function ProcedureSetupStep() {
  const { answers, nextStep } = useQuizStore()
  const router = useRouter()

  const selectedActivities = answers.selectedActivities || []
  const activityMetaOverrides = answers.activityMetaOverrides || {}

  const [activitySettings, setActivitySettings] = useState<ActivitySetting[]>(() => {
    if (selectedActivities.length === 0) {
      return [createActivitySetting('default-1', 'Morning Skincare')]
    }

    return selectedActivities.map((activityId) => {
      const override = activityMetaOverrides[activityId]
      return createActivitySetting(activityId, override?.name)
    })
  })
  const [openMonthlyModal, setOpenMonthlyModal] = useState<{ index: number; days: number[] } | null>(null)

  useEffect(() => {
    if (selectedActivities.length === 0) {
      setActivitySettings([createActivitySetting('default-1', 'Morning Skincare')])
      return
    }

    setActivitySettings((prev) => {
      const existing = new Map(prev.map((activity) => [activity.id, activity]))
      return selectedActivities.map((activityId) => {
        const override = activityMetaOverrides[activityId]
        const existingActivity = existing.get(activityId)

        if (existingActivity) {
          if (override?.name && existingActivity.name !== override.name) {
            return { ...existingActivity, name: override.name }
          }
          return existingActivity
        }

        return createActivitySetting(activityId, override?.name)
      })
    })
  }, [selectedActivities, activityMetaOverrides])

  const updateActivity = (index: number, updates: Partial<ActivitySetting>) => {
    setActivitySettings((prev) =>
      prev.map((activity, activityIndex) => (activityIndex === index ? { ...activity, ...updates } : activity)),
    )
  }

  const handleRepeatChange = (index: number, repeat: ActivitySetting['repeat']) => {
    setActivitySettings((prev) =>
      prev.map((activity, activityIndex) => {
        if (activityIndex !== index) {
          return activity
        }

        if (repeat === 'Daily') {
          const weekdays = activity.weekdays.length ? activity.weekdays : [0, 1, 2, 3, 4, 5, 6]
          return { ...activity, repeat, allDay: true, weekdays }
        }

        if (repeat === 'Weekly') {
          const weekdays = activity.weekdays.length ? activity.weekdays : [1]
          return { ...activity, repeat, allDay: false, weekdays }
        }

        const monthlyDaysSelection = activity.monthlyDays.length ? activity.monthlyDays : []
        return { ...activity, repeat, allDay: false, monthlyDays: monthlyDaysSelection }
      }),
    )
  }

  const toggleWeekday = (activityIndex: number, dayIndex: number) => {
    setActivitySettings((prev) =>
      prev.map((activity, index) => {
        if (index !== activityIndex) {
          return activity
        }

        const isSelected = activity.weekdays.includes(dayIndex)

        if (isSelected && activity.weekdays.length === 1) {
          return activity
        }

        const nextDays = isSelected
          ? activity.weekdays.filter((day) => day !== dayIndex)
          : [...activity.weekdays, dayIndex].sort((a, b) => a - b)

        return { ...activity, weekdays: nextDays }
      }),
    )
  }

  const handleMonthlySave = (index: number, days: number[]) => {
    updateActivity(index, { monthlyDays: days.length ? days : [1] })
    setOpenMonthlyModal(null)
  }

  const handleContinue = () => {
    nextStep()
    router.push('/procedures/2')
  }

  const remindCount = useMemo(
    () => activitySettings.filter((activity) => activity.remind).length,
    [activitySettings],
  )

  const quickStats = useMemo(() => {
    const total = activitySettings.length
    const weeklyCount = activitySettings.filter((activity) => activity.repeat === 'Weekly').length
    const monthlyCount = activitySettings.filter((activity) => activity.repeat === 'Monthly').length
    const dailyCount = total - weeklyCount - monthlyCount
    const nextTimed = activitySettings.find((activity) => !activity.allDay && activity.time)
    const fallbackAllDay = activitySettings.find((activity) => activity.allDay)

    const nextValue = nextTimed
      ? formatTimeLabel(nextTimed.time)
      : fallbackAllDay
      ? 'All day flow'
      : 'Flexible'

    const nextDetail = nextTimed ? nextTimed.name : fallbackAllDay ? fallbackAllDay.name : 'Pick a slot whenever you like'

    const remindersLabel = remindCount
      ? `${remindCount} reminder${remindCount === 1 ? '' : 's'} active`
      : 'Reminders off for now'

    return [
      {
        label: 'Routines configured',
        value: total.toString(),
        detail: remindersLabel,
      },
      {
        label: 'Cadence mix',
        value: `${dailyCount} daily  -  ${weeklyCount} weekly`,
        detail: `${monthlyCount} monthly choice${monthlyCount === 1 ? '' : 's'}`,
      },
      {
        label: 'Next focus',
        value: nextValue,
        detail: nextDetail,
      },
    ]
  }, [activitySettings, remindCount])
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#5C4688]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-12">
        <motion.header
          initial={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-10 overflow-hidden rounded-[36px] bg-white px-6 py-8 shadow-[0_24px_48px_rgba(92,70,136,0.12)] sm:px-8"
        >
          <motion.div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(163,133,233,0.35) 0%, rgba(188,202,247,0.28) 100%)' }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 12, 0] }}
            transition={floatTransition}
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0E2F4] bg-white text-[#5C4688] transition hover:border-[#C0C4ED] hover:bg-[#F5F3FF]"
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 6L9 12L15 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A385E9]">Procedure Setup</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#4B3A78] sm:text-4xl">
                  Design your beauty routines
                </h1>
                <p className="mt-3 text-sm text-[#8C8FA9] sm:max-w-xl">
                  Craft a schedule that feels effortless. Tune cadence, reminders, and notes for each procedure so your
                  self-care flows naturally.
                </p>
              </div>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
              {quickStats.map((stat, index) => (
                <QuickStat key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} delay={index * 0.08} />
              ))}
            </div>
          </div>
        </motion.header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-8">
            {activitySettings.map((activity, index) => {
              const override = activityMetaOverrides[activity.id]
              const meta = getActivityMeta(activity.id, override?.name ?? activity.name)
              const iconEntry = override?.iconId ? getIconById(override.iconId) : null
              const iconPath = iconEntry?.path ?? meta.iconPath
              const primaryColor = override?.primary ?? meta.primary
              const surfaceColor = override?.surface ?? meta.surface
              const displayName = override?.name ?? meta.name
              const accentGradient = accentGradients[index % accentGradients.length]
              const accentGlow = accentGlows[index % accentGlows.length]
              const repeatSummary = formatRepeatSummary(activity)
              const reminderSummary = formatReminderSummary(activity)
              const displayTime = activity.allDay
                ? 'All day flow'
                : activity.time
                ? formatTimeLabel(activity.time)
                : 'Set time'
              const isWeekly = activity.repeat === 'Weekly'
              const isMonthly = activity.repeat === 'Monthly'
              const isDaily = activity.repeat === 'Daily'

              return (
                <motion.section
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ translateY: -4 }}
                  className="relative overflow-hidden rounded-[32px] border border-[#E4E6F5] bg-white shadow-[0_24px_48px_rgba(92,70,136,0.1)]"
                >
                  <motion.div
                    className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full"
                    style={{ background: accentGradient }}
                    animate={{ rotate: [0, 18, 0], scale: [1, 1.08, 1] }}
                    transition={floatTransition}
                  />
                  <motion.div
                    className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full blur-3xl"
                    style={{ backgroundColor: accentGlow }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
                    transition={floatTransition}
                  />
                  <div className="relative flex flex-col gap-8 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-col gap-4">
                        <div
                          className="rounded-[24px] border border-white/40 px-5 py-4 shadow-[0_18px_32px_rgba(92,70,136,0.08)]"
                          style={{ background: surfaceColor }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_20px_32px_rgba(0,0,0,0.12)]"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <motion.span
                                className="absolute inset-0 rounded-full"
                                animate={{ scale: [1, 1.09, 1] }}
                                transition={floatTransition}
                                style={{ backgroundColor: primaryColor, opacity: 0.25 }}
                              />
                              <Image src={iconPath} alt={`${displayName} icon`} width={30} height={30} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-[#4B3A78] md:text-xl">{displayName}</p>
                              <p className="text-sm text-[#5F6180]">{repeatSummary}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#8C8FA9]">
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ECEBFB] bg-white/80 px-4 py-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                              <path
                                d="M12 8V12L14.5 13.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {displayTime}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ECEBFB] bg-white/80 px-4 py-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                            {activity.timePeriod}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-[#ECEBFB] bg-white/60 px-5 py-4 text-sm text-[#5C4688] shadow-[0_16px_32px_rgba(92,70,136,0.08)] backdrop-blur">
                        <p className="font-semibold">At a glance</p>
                        <p className="mt-1 text-xs text-[#8C8FA9]">{reminderSummary}</p>
                      </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-[#4B3A78]">Personal note</span>
                          <textarea
                            value={activity.note}
                            onChange={(event) => updateActivity(index, { note: event.target.value })}
                            placeholder="Add a note about this activity"
                            className="min-h-[120px] rounded-2xl border border-[#D9DCEF] bg-[#FBFBFE] px-4 py-3 text-sm text-[#5C4688] placeholder:text-[#B4B7D4] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#4B3A78]">Repeat cadence</span>
                            <span className="text-xs font-medium text-[#8C8FA9]">{repeatSummary}</span>
                          </div>
                          <LayoutGroup id={`repeat-group-${activity.id}`}>
                            <div className="flex flex-wrap gap-2">
                              {repeatOptions.map((option) => (
                                <OptionPill
                                  key={option}
                                  label={option}
                                  active={activity.repeat === option}
                                  onClick={() => handleRepeatChange(index, option)}
                                  highlightId={`highlight-repeat-${activity.id}`}
                                  activeColor={primaryColor}
                                />
                              ))}
                            </div>
                          </LayoutGroup>

                          {(isDaily || isWeekly) && (
                            <div className="flex flex-wrap gap-2">
                              {dayLabels.map((label, dayIndex) => {
                                const isActive = activity.weekdays.includes(dayIndex)
                                return (
                                  <button
                                    type="button"
                                    key={label}
                                    onClick={() => toggleWeekday(index, dayIndex)}
                                    className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                                      isActive
                                        ? 'bg-[#5C4688] text-white shadow-[0_10px_20px_rgba(92,70,136,0.18)]'
                                        : 'border border-[#D8DAEE] bg-white text-[#5C4688] hover:border-[#8F74E5]'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {isWeekly && (
                            <div className="flex flex-wrap gap-2">
                              {weeklyNumberLabels.map((label) => (
                                <span
                                  key={label}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[#E0E2F4] text-xs font-semibold text-[#8C8FA9]"
                                >
                                  #{label}
                                </span>
                              ))}
                            </div>
                          )}

                          {isMonthly && (
                            <button
                              type="button"
                              onClick={() => setOpenMonthlyModal({ index, days: activity.monthlyDays })}
                              className="flex items-center justify-between rounded-2xl border border-[#D9DCEF] bg-[#FBFBFE] px-4 py-3 text-left text-sm font-medium text-[#4B3A78] transition hover:border-[#8F74E5]"
                            >
                              <span className="flex flex-col">
                                <span>{formatMonthlySummary(activity.monthlyDays)}</span>
                                <span className="text-xs font-normal text-[#8C8FA9]">Tap to edit dates</span>
                              </span>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M9 5L16 12L9 19"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E6F5] bg-[#FCFBFF] p-4 shadow-[0_16px_32px_rgba(92,70,136,0.08)]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#4B3A78]">All day activity</span>
                            <ToggleSwitch
                              checked={activity.allDay}
                              onChange={(value) =>
                                updateActivity(index, {
                                  allDay: value,
                                  time: value ? '' : activity.time || '08:00',
                                })
                              }
                            />
                          </div>
                          <p className="text-xs text-[#8C8FA9]">
                            Turn off to pick a specific time slot and time period.
                          </p>
                          {!activity.allDay && (
                            <div className="space-y-3">
                              <div className="relative">
                                <input
                                  type="time"
                                  value={activity.time}
                                  onChange={(event) => updateActivity(index, { time: event.target.value })}
                                  className="w-full rounded-2xl border border-[#D9DCEF] bg-white px-4 py-3 pr-12 text-sm text-[#5C4688] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                                />
                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8FA9]">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                                    <path
                                      d="M12 8V12L14.5 13.5"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </div>
                              <LayoutGroup id={`period-group-${activity.id}`}>
                                <div className="flex flex-wrap gap-2">
                                  {periodOptions.map((period) => (
                                    <OptionPill
                                      key={period}
                                      label={period}
                                      active={activity.timePeriod === period}
                                      onClick={() => updateActivity(index, { timePeriod: period })}
                                      highlightId={`highlight-period-${activity.id}`}
                                      activeColor="#8F74E5"
                                    />
                                  ))}
                                </div>
                              </LayoutGroup>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E6F5] bg-white p-4 shadow-[0_16px_32px_rgba(92,70,136,0.08)]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#4B3A78]">End activity</span>
                            <ToggleSwitch
                              checked={activity.endDate}
                              onChange={(value) => updateActivity(index, { endDate: value })}
                            />
                          </div>

                          {activity.endDate && (
                            <div className="flex flex-col gap-3">
                              <LayoutGroup id={`end-type-${activity.id}`}>
                                <div className="flex flex-wrap gap-2">
                                  {(['date', 'days'] as ActivitySetting['endType'][]).map((option) => (
                                    <OptionPill
                                      key={option}
                                      label={option === 'date' ? 'Date' : 'Days'}
                                      active={activity.endType === option}
                                      onClick={() => updateActivity(index, { endType: option })}
                                      highlightId={`highlight-end-${activity.id}`}
                                      activeColor="#A385E9"
                                    />
                                  ))}
                                </div>
                              </LayoutGroup>
                              {activity.endType === 'date' ? (
                                <input
                                  type="date"
                                  value={activity.endDateValue}
                                  onChange={(event) => updateActivity(index, { endDateValue: event.target.value })}
                                  className="w-full rounded-2xl border border-[#D9DCEF] bg-white px-4 py-3 text-sm text-[#5C4688] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                                />
                              ) : (
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    min={1}
                                    value={activity.endDaysValue}
                                    onChange={(event) =>
                                      updateActivity(index, {
                                        endDaysValue: Number(event.target.value) || activity.endDaysValue,
                                      })
                                    }
                                    className="w-24 rounded-2xl border border-[#D9DCEF] bg-white px-4 py-3 text-sm text-[#5C4688] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                                  />
                                  <span className="text-sm text-[#5C4688]">days</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E6F5] bg-white p-4 shadow-[0_16px_32px_rgba(92,70,136,0.08)]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#4B3A78]">Smart reminders</span>
                            <ToggleSwitch
                              checked={activity.remind}
                              onChange={(value) => updateActivity(index, { remind: value })}
                            />
                          </div>

                          {activity.remind && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#8C8FA9]">
                                  Before {activity.timePeriod}
                                </span>
                                <select
                                  value={activity.remindBefore}
                                  onChange={(event) => updateActivity(index, { remindBefore: Number(event.target.value) })}
                                  className="w-full rounded-2xl border border-[#D9DCEF] bg-white px-4 py-3 text-sm text-[#5C4688] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                                >
                                  {remindPrimaryOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option === 60 ? '1 hour' : `${option} minutes`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#8C8FA9]">
                                  Before activity
                                </span>
                                <select
                                  value={activity.remindBefore2}
                                  onChange={(event) => updateActivity(index, { remindBefore2: Number(event.target.value) })}
                                  className="w-full rounded-2xl border border-[#D9DCEF] bg-white px-4 py-3 text-sm text-[#5C4688] focus:border-[#8F74E5] focus:outline-none focus:ring-2 focus:ring-[#C9B8F5]/60"
                                >
                                  {remindSecondaryOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option} minutes
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, translateY: 8 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white/85 via-[#F7F3FF] to-white px-5 py-4 text-sm text-[#5C4688] shadow-[0_16px_32px_rgba(92,70,136,0.08)]"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#A385E9]/15 text-[#A385E9]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M12 6V13"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 10H16"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5 8.5C5 5.46243 7.46243 3 10.5 3H13.5C16.5376 3 19 5.46243 19 8.5V14.5C19 17.5376 16.5376 20 13.5 20H10.5C7.46243 20 5 17.5376 5 14.5V8.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </span>
                      <span>{reminderSummary}</span>
                    </motion.div>
                  </div>
                </motion.section>
              )
            })}

            <motion.div
              initial={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="sticky bottom-8 rounded-[32px] border border-[#E4E6F5] bg-white/80 px-6 py-6 shadow-[0_-12px_32px_rgba(92,70,136,0.08)] backdrop-blur"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[#4B3A78]">All set?</p>
                  <p className="text-sm text-[#8C8FA9]">We’ll move you to results once you’re happy with this flow.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center rounded-full bg-[#A385E9] px-8 py-4 text-base font-semibold text-white shadow-[0_16px_32px_rgba(163,133,233,0.32)] transition hover:bg-[#8F74E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C1B0F2] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </div>

          <InsightsPanel totalActivities={activitySettings.length} remindCount={remindCount} />
        </div>
      </div>

      <MonthlyDaysModal
        open={openMonthlyModal !== null}
        initialSelection={openMonthlyModal?.days || []}
        onCancel={() => setOpenMonthlyModal(null)}
        onSave={(days) => {
          if (openMonthlyModal) {
            handleMonthlySave(openMonthlyModal.index, days)
          }
        }}
      />
    </div>
  )
}
