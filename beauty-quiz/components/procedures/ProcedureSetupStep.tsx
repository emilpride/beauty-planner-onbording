'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'
import { getActivityMeta, FULL_WEEK } from './activityMeta'
import { getProceduresIconById } from './proceduresIconCatalog'

interface ActivitySetting {
  id: string
  name: string
  note: string
  repeat: 'Daily' | 'Weekly' | 'Monthly' | null
  allDay: boolean
  weekdays: number[]
  monthlyDays: number[]
  time: string
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | null
  endDate: boolean
  endType: 'date' | 'days'
  endDateValue: string
  endDaysValue: number
  remind: boolean
  // Reminders: quantity (1-60) + unit (seconds/minutes/hours/days/weeks/months/years)
  remindAmount: number
  remindUnit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
}

const createActivitySetting = (activityId: string, fallbackName?: string): ActivitySetting => {
  const meta = getActivityMeta(activityId, fallbackName)

  return {
    id: activityId,
    name: meta.name,
    note: '',
    repeat: null,
    allDay: true,
    weekdays: [],
    monthlyDays: [],
    time: '',
    timePeriod: null,
    endDate: false,
    endType: 'date',
    endDateValue: '',
    endDaysValue: 30,
    remind: false,
    remindAmount: 15,
    remindUnit: 'minutes',
  }
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const repeatOptions: Exclude<ActivitySetting['repeat'], null>[] = ['Daily', 'Weekly', 'Monthly']
const periodOptions: Exclude<ActivitySetting['timePeriod'], null>[] = ['Morning', 'Afternoon', 'Evening']
// Reminder controls
const remindAmountOptions = Array.from({ length: 60 }, (_, i) => i + 1)
const remindUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'] as const
const weeklyNumberLabels = [1, 2, 3, 4, 5, 6, 7]
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1)

const accentGradients = [
  'linear-gradient(135deg, rgba(163,133,233,0.18) 0%, rgba(188,202,247,0.35) 100%)',
  'linear-gradient(135deg, rgba(255,138,171,0.16) 0%, rgba(255,205,178,0.32) 100%)',
  'linear-gradient(135deg, rgba(255,232,146,0.22) 0%, rgba(255,247,205,0.38) 100%)',
]

const accentGlows = ['rgba(163,133,233,0.45)', 'rgba(255,152,152,0.45)', 'rgba(255,226,120,0.45)']

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
  if (!activity.repeat) return ''
  if (activity.repeat === 'Daily') {
    return 'Daily  -  Every day'
  }

  if (activity.repeat === 'Weekly') {
    // In Weekly mode, we interpret weekdays[0] as the index of the selected number (0..6 => 1..7)
    const count = activity.weekdays.length === 1 ? weeklyNumberLabels[activity.weekdays[0]] : 0
    return `Weekly  -  ${count} day${count === 1 ? '' : 's'} per week`
  }

  return `Monthly  -  ${activity.monthlyDays.length ? formatMonthlySummary(activity.monthlyDays) : 'Select dates'}`
}

const formatReminderSummary = (activity: ActivitySetting) => {
  if (!activity.remind) {
    return 'Reminders are turned off for now'
  }
  const amount = activity.remindAmount
  const unit = activity.remindUnit
  const singularMap: Record<ActivitySetting['remindUnit'], string> = {
    seconds: 'second',
    minutes: 'minute',
    hours: 'hour',
    days: 'day',
    weeks: 'week',
    months: 'month',
    years: 'year',
  }
  const unitLabel = amount === 1 ? singularMap[unit] : unit
  return `Reminds you ${amount} ${unitLabel} before the activity`
}
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9B8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        checked ? 'bg-[#8F74E5]' : 'bg-[#D8DAEE] dark:bg-white/20'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-surface dark:bg-white shadow transition-transform ${
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
          : 'border-border-subtle/60 text-text-primary hover:border-[#9E90D9]'
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
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-surface p-6 shadow-[0_32px_64px_rgba(36,23,78,0.25)]"
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
                    : 'text-text-primary hover:bg-[#ECE9FF]'
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
            className="rounded-full border border-border-subtle/60 px-5 py-2 text-sm font-medium text-text-primary transition hover:border-[#8F74E5] hover:text-[#8F74E5]"
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
      className="rounded-2xl border border-white/60 bg-surface/70 px-4 py-3 text-left shadow-[0_12px_24px_rgba(92,70,136,0.12)] backdrop-blur"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8C8FA9]">{label}</p>
      <p className="text-xl font-semibold text-[#4B3A78]">{value}</p>
      <p className="text-xs text-[#8C8FA9]">{detail}</p>
    </motion.div>
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
        if (activityIndex !== index) return activity

        if (repeat === 'Daily') {
          // Default to custom selection; "Everyday" toggle can select all.
          const weekdays = activity.weekdays
          return { ...activity, repeat, weekdays }
        }

        if (repeat === 'Weekly') {
          const weekdays = activity.weekdays
          return { ...activity, repeat, allDay: false, weekdays }
        }

        // Monthly
        const monthlyDaysSelection = activity.monthlyDays
        return { ...activity, repeat, allDay: false, monthlyDays: monthlyDaysSelection }
      }),
    )
    if (repeat === 'Monthly') {
      setOpenMonthlyModal({ index, days: activitySettings[index]?.monthlyDays || [] })
    }
  }

  const toggleWeekday = (activityIndex: number, dayIndex: number) => {
    setActivitySettings((prev) =>
      prev.map((activity, index) => {
        if (index !== activityIndex) {
          return activity
        }

        // Weekly: allow selecting only one day from 1..7
        if (activity.repeat === 'Weekly') {
          // Toggle the single selected day; allow clearing selection back to empty
          if (activity.weekdays.includes(dayIndex)) {
            return { ...activity, weekdays: [] }
          }
          return { ...activity, weekdays: [dayIndex] }
        }

        // Daily: toggle multiple days freely (but don't allow empty-only deselect if it would remove the last selected)
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
  const setPeriodAndTime = (idx: number, period: Exclude<ActivitySetting['timePeriod'], null>) => {
    const timeMap: Record<typeof period, string> = {
      Morning: '07:00',
      Afternoon: '13:00',
      Evening: '19:00',
    }
    updateActivity(idx, { timePeriod: period, time: timeMap[period], allDay: false })
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Scrollable content (hide scrollbar) */}
      <div className="mx-auto h-[100svh] w-full max-w-md overflow-y-auto scrollbar-hide">
        {/* Top bar */}
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-[140px]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)' }}>
          {activitySettings.map((activity, index) => {
          const override = activityMetaOverrides[activity.id]
          const meta = getActivityMeta(activity.id, override?.name ?? activity.name)
          const iconEntry = override?.iconId ? getProceduresIconById(override.iconId) : null
          const iconPath = iconEntry?.path ?? meta.iconPath
          const primaryColor = override?.primary ?? meta.primary
          const surfaceColor = override?.surface ?? meta.surface
          const displayName = override?.name ?? meta.name
            const isWeekly = activity.repeat === 'Weekly'
            const isMonthly = activity.repeat === 'Monthly'

            return (
              <div key={activity.id} className="mb-8">
              {/* Header pill */}
              <div
                className="flex items-center gap-3 rounded-[100px] px-3 py-2 shadow-sm"
                style={{ background: surfaceColor }}
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded-full" style={{ backgroundColor: primaryColor }}>
                  <div className="absolute inset-0 grid place-items-center">
                    <Image src={iconPath} alt={`${displayName} icon`} width={24} height={24} />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-medium leading-5 text-text-primary">{displayName}</p>
                    <p className="text-[12px] leading-5 text-text-secondary">
                      {activity.time ? formatTimeLabel(activity.time).replace(' ', '') : activity.allDay ? 'All day' : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-4">
                <div className="px-1 text-[14px] font-bold text-text-primary">Note</div>
                <div className="mt-2 rounded-[8px] border border-border-subtle bg-surface">
                  <textarea
                    value={activity.note}
                    onChange={(e) => updateActivity(index, { note: e.target.value })}
                    placeholder="Type the note here.."
                    className="h-[120px] w-full resize-none rounded-[8px] bg-transparent px-4 py-3 text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                  />
                </div>
              </div>

              {/* Repeat */}
              <div className="mt-4">
                <div className="px-1 text-[14px] font-bold text-text-primary">Repeat</div>
                <div className="mt-2 flex gap-2">
                  {repeatOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleRepeatChange(index, option)}
                      className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                        activity.repeat === option
                          ? 'bg-[#5C4688] text-white shadow'
                          : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {/* Monthly summary & picker (moved up under Repeat) */}
                {activity.repeat === 'Monthly' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setOpenMonthlyModal({ index, days: activity.monthlyDays })}
                      className="flex w-full items-center justify-between rounded-[12px] border border-border-subtle bg-surface px-4 py-3 text-left text-[14px] text-text-primary"
                    >
                      <span className="truncate">
                        {activity.monthlyDays.length
                          ? `Every month on ${[...activity.monthlyDays].sort((a, b) => a - b).join(', ')}`
                          : 'Every month on ...'}
                      </span>
                      <span className="grid h-8 w-8 place-items-center rounded-full text-text-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M8 7V5M16 7V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M4 11H20" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}

                {/* Weekly extra: On these days */}
                {activity.repeat === 'Weekly' && (
                  <div className="mt-3">
                    <div className="mb-2 px-1 text-[14px] font-bold text-text-primary">
                      {(() => {
                        const count = activity.weekdays.length === 1 ? weeklyNumberLabels[activity.weekdays[0]] : 0
                        return `${count} day${count === 1 ? '' : 's'} per week`
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {weeklyNumberLabels.map((num, dayIndex) => {
                        const isActive = activity.weekdays.includes(dayIndex)
                        return (
                          <button
                            type="button"
                            key={`weekly-${index}-${dayIndex}-${num}`}
                            onClick={() => toggleWeekday(index, dayIndex)}
                            className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                              isActive
                                ? 'bg-[#5C4688] text-white shadow'
                                : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Daily extra: On these days + Everyday */}
                {activity.repeat === 'Daily' && (
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between px-1 text-[14px] font-bold text-text-primary">
                      <span>On these days</span>
                      <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                        <span>Everyday</span>
                        <ToggleSwitch
                          checked={activity.weekdays.length === 7}
                          onChange={(value) =>
                            updateActivity(index, {
                              weekdays: value ? [...FULL_WEEK] : [],
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dayLabels.map((label, dayIndex) => {
                        const isActive = activity.weekdays.includes(dayIndex)
                        return (
                          <button
                            type="button"
                            key={`daily-${index}-${dayIndex}-${label}`}
                            onClick={() => toggleWeekday(index, dayIndex)}
                            className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                              isActive
                                ? 'bg-[#5C4688] text-white shadow'
                                : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Do It At (also for Monthly) */}
              <div className="mt-4">
                <div className="px-1 text-[14px] font-bold text-text-primary">Do it at</div>
                <div className="mt-2">
                  <div className="mb-2 flex items-center justify-end">
                    <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                      <span>All day</span>
                      <ToggleSwitch
                        checked={activity.allDay}
                        onChange={(value) =>
                          updateActivity(index, {
                            allDay: value,
                            time: value ? '' : activity.time || '07:00',
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={activity.time}
                      onChange={(e) => updateActivity(index, { time: e.target.value, allDay: !e.target.value ? activity.allDay : false })}
                      disabled={activity.allDay}
                      className={`w-full rounded-[8px] border border-border-subtle bg-surface px-4 py-3 pr-10 text-[15px] text-text-primary focus:outline-none ${
                        activity.allDay ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8V12L14.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {periodOptions.map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setPeriodAndTime(index, period)}
                        className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                          activity.timePeriod === period
                            ? 'bg-[#5C4688] text-white shadow'
                            : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* End Activity On */}
              <div className="mt-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[14px] font-bold text-text-primary">End Activity On</div>
                  <ToggleSwitch
                    checked={activity.endDate}
                    onChange={(value) => updateActivity(index, { endDate: value })}
                  />
                </div>

                {activity.endDate && (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      {(['date', 'days'] as ActivitySetting['endType'][]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateActivity(index, { endType: option })}
                          className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                            activity.endType === option
                              ? 'bg-[#5C4688] text-white shadow'
                              : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                          }`}
                        >
                          {option === 'date' ? 'Date' : 'Days'}
                        </button>
                      ))}
                    </div>

                    {activity.endType === 'date' ? (
                      <div className="mt-3">
                        <input
                          type="date"
                          value={activity.endDateValue}
                          onChange={(event) => updateActivity(index, { endDateValue: event.target.value })}
                          className="w-full rounded-[8px] border border-border-subtle bg-surface px-4 py-3 text-[15px] text-text-primary focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[14px] text-text-secondary">After</span>
                        <input
                          type="number"
                          min={1}
                          value={activity.endDaysValue}
                          onChange={(event) =>
                            updateActivity(index, {
                              endDaysValue: Number(event.target.value) || activity.endDaysValue,
                            })
                          }
                          className="w-24 rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[15px] text-text-primary focus:outline-none"
                        />
                        <span className="text-[14px] text-text-secondary">days</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Remind me */}
              <div className="mt-4">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[14px] font-bold text-text-primary">Remind me</div>
                  <ToggleSwitch
                    checked={activity.remind}
                    onChange={(value) => updateActivity(index, { remind: value })}
                  />
                </div>

                {activity.remind && (
                  <div className="mt-3">
                    <div className="px-1 text-[12px] font-medium text-text-secondary">Before activity</div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <select
                        value={activity.remindAmount}
                        onChange={(event) => updateActivity(index, { remindAmount: Number(event.target.value) })}
                        className="w-full rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[14px] text-text-primary focus:outline-none"
                      >
                        {remindAmountOptions.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <select
                        value={activity.remindUnit}
                        onChange={(event) =>
                          updateActivity(index, { remindUnit: event.target.value as ActivitySetting['remindUnit'] })
                        }
                        className="w-full rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[14px] text-text-primary focus:outline-none"
                      >
                        {remindUnits.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </div>
            )
          })}
        </div>
      </div>

      {/* Sticky Next */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[16px]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="pointer-events-auto w-full max-w-md px-4">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-[11px] bg-[#A385E9] py-[14px] text-center text-[13px] font-semibold text-white shadow-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* Monthly modal preserved (advanced) */}
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
