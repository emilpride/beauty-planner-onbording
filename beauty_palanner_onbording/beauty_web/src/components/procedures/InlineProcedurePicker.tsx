"use client"

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ACTIVITY_META, FULL_WEEK, getActivityMeta } from '@/data/activityMeta'
import { getDefaultNote, type GenderKey } from '@/data/defaultActivityNotes'
import type { Activity } from '@/types/activity'
import { Select } from '@/components/common/Select'

type Repeat = 'Daily' | 'Weekly' | 'Monthly'
type RemindUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'

interface ActivityConfig {
  id: string
  name: string
  note: string
  repeat: Repeat | null
  weeklyInterval: number
  allDay: boolean
  weekdays: number[]
  monthlyDays: number[]
  // Multiple times support
  times: string[]
  periodOn: { Morning: boolean; Afternoon: boolean; Evening: boolean }
  endDate: boolean
  endType: 'date' | 'days'
  endDateValue: string
  endDaysValue: number
  remind: boolean
  remindAmount: number
  remindUnit: RemindUnit
}

const createActivityConfig = (activityId: string, fallbackName?: string, gender: GenderKey = 'unknown'): ActivityConfig => {
  const meta = getActivityMeta(activityId, fallbackName)
  return {
    id: activityId,
    name: meta.name,
    note: getDefaultNote(activityId, gender),
    repeat: null,
    weeklyInterval: 1,
    allDay: true,
    weekdays: [],
    monthlyDays: [],
    times: [],
    periodOn: { Morning: false, Afternoon: false, Evening: false },
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
const repeatOptions: Exclude<ActivityConfig['repeat'], null>[] = ['Daily', 'Weekly', 'Monthly']
const periodOptions: Array<'Morning' | 'Afternoon' | 'Evening'> = ['Morning', 'Afternoon', 'Evening']
const remindAmountOptions = Array.from({ length: 60 }, (_, i) => i + 1)
const remindUnits: RemindUnit[] = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1)

const categorize = (id: string) => {
  const key = id.toLowerCase()
  if (key.includes('cleanse') || key.includes('hydrat') || key.includes('exfoliat') || key.includes('face') || key.includes('lip') || key.includes('spf')) {
    return 'skin' as const
  }
  if (key.includes('wash') || key.includes('nourish') || key.includes('scalp') || key.includes('heat') || key.includes('trim') || key.includes('post-color') || key.includes('beard') || key.includes('hair')) {
    return 'hair' as const
  }
  if (key.includes('stretch') || key.includes('cardio') || key.includes('strength') || key.includes('yoga') || key.includes('dance') || key.includes('swimming') || key.includes('cycling') || key.includes('posture')) {
    return 'physical' as const
  }
  return 'mental' as const
}

// removed unused formatTimeLabel helper

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

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  expanded = false,
  className = '',
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  expanded?: boolean
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    if (!expanded && ref.current) {
      const el = ref.current
      el.style.height = '0px'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [value, expanded])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={
        `${className} ${expanded ? 'resize-y overflow-auto min-h-[120px]' : 'resize-none overflow-hidden'} ` +
        'w-full rounded-[8px] bg-transparent px-4 py-3 text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none'
      }
      style={expanded ? undefined : { height: 'auto' }}
    />
  )
}

export function InlineProcedurePicker({
  onSubmit,
  saving = false,
}: {
  onSubmit: (activities: Activity[]) => void | Promise<void>
  saving?: boolean
}) {
  const presets = useMemo(() => {
    const base = Object.keys(ACTIVITY_META).map((id) => ({ id, ...getActivityMeta(id) }))
    const grouped: Record<string, typeof base> = { skin: [], hair: [], physical: [], mental: [] }
    for (const item of base) {
      grouped[categorize(item.id)].push(item)
    }
    return grouped
  }, [])

  const [selected, setSelected] = useState<string[]>([])
  const [configs, setConfigs] = useState<Record<string, ActivityConfig>>({})
  const [search, setSearch] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})
  const [showTimeInput, setShowTimeInput] = useState<Record<string, boolean>>({})

  const toggle = (id: string, name: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id)
      if (exists) {
        return prev.filter((x) => x !== id)
      }
      setConfigs((c) => {
        if (c[id]) return c
        const base = createActivityConfig(id, name)
        // Onboarding-like defaults: Daily + Morning 07:00 preselected
        const withDefaults: ActivityConfig = {
          ...base,
          repeat: 'Daily',
          weekdays: [...FULL_WEEK],
          allDay: false,
          periodOn: { Morning: true, Afternoon: false, Evening: false },
          times: ['07:00'],
        }
        return { ...c, [id]: withDefaults }
      })
      return [...prev, id]
    })
  }

  const setConfig = <K extends keyof ActivityConfig>(id: string, key: K, value: ActivityConfig[K]) => {
    setConfigs((c) => ({ ...c, [id]: { ...(c[id] || ({} as ActivityConfig)), [key]: value } }))
  }

  const filteredIdsByCategory = (category: keyof typeof presets) => {
    const items = presets[category]
    const q = search.trim().toLowerCase()
    return !q ? items : items.filter((it) => it.name.toLowerCase().includes(q))
  }

  const mapToActivities = (cfg: ActivityConfig): Activity[] => {
    const meta = getActivityMeta(cfg.id)
    const category = categorize(cfg.id)
    let frequency: Activity['frequency'] = 'daily'
    if (cfg.repeat === 'Weekly') frequency = 'weekly'
    if (cfg.repeat === 'Monthly') frequency = 'monthly'

    const parseTime = (time: string) => {
      const [hStr, mStr] = time.split(':')
      return { hour: Number(hStr), minute: Number(mStr) }
    }

    const base = {
      id: '', // let caller assign uuid
      name: cfg.name || meta.name,
      category,
      categoryId: category,
      note: cfg.note,
      isRecommended: false,
      type: 'regular' as const,
      activeStatus: true,
      enabledAt: new Date(),
      frequency,
      selectedDays: frequency === 'weekly' ? cfg.weekdays : [],
      weeksInterval: frequency === 'weekly' ? cfg.weeklyInterval : 1,
      selectedMonthDays: frequency === 'monthly' ? cfg.monthlyDays : [],
      notifyBefore: cfg.remind ? `${cfg.remindAmount} ${cfg.remindUnit}` : '',
      color: meta.primary,
      lastModifiedAt: new Date(),
      endBeforeType: cfg.endDate ? cfg.endType : 'date',
      endBeforeUnit: cfg.endDate && cfg.endType === 'days' ? String(cfg.endDaysValue) : '',
      selectedEndBeforeDate: cfg.endDate && cfg.endType === 'date' && cfg.endDateValue ? new Date(cfg.endDateValue) : null,
    }

    if (cfg.allDay || cfg.times.length === 0) {
      return [{ ...base, time: null }]
    }
    return cfg.times.map((t) => ({ ...base, time: parseTime(t) }))
  }

  const [showGlobalErrors, setShowGlobalErrors] = useState<string[]>([])

  const validate = (cfg: ActivityConfig): { valid: boolean; errors: string[]; fields: Record<string, boolean> } => {
    const errors: string[] = []
    const fields: Record<string, boolean> = {}
    if (!cfg.repeat) {
      errors.push('Select frequency')
      fields.repeat = true
    }
    if (!cfg.allDay && cfg.times.length === 0) {
      errors.push('Add at least one time or enable All day')
      fields.times = true
    }
    if (cfg.repeat === 'Weekly' && cfg.weekdays.length === 0) {
      errors.push('Choose at least one weekday')
      fields.weekdays = true
    }
    if (cfg.repeat === 'Monthly' && cfg.monthlyDays.length === 0) {
      errors.push('Choose day(s) of month')
      fields.monthlyDays = true
    }
    return { valid: errors.length === 0, errors, fields }
  }

  const handleSubmit = async () => {
    const allErrors: string[] = []
    const acts: Activity[] = []
    for (const id of selected) {
      const cfg = configs[id]
      const { valid, errors } = validate(cfg)
      if (!valid) allErrors.push(`${cfg.name}: ${errors.join(', ')}`)
      else acts.push(...mapToActivities(cfg))
    }
    if (allErrors.length) {
      setShowGlobalErrors(allErrors)
      // scroll to first invalid
      document.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    await onSubmit(acts)
  }

  const handleRepeatChange = (id: string, repeat: ActivityConfig['repeat']) => {
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      if (repeat === 'Daily') {
        return { ...prev, [id]: { ...cfg, repeat, weekdays: [...FULL_WEEK] } }
      }
      if (repeat === 'Weekly') {
        return { ...prev, [id]: { ...cfg, repeat, allDay: false, weekdays: [], weeklyInterval: cfg.weeklyInterval || 1 } }
      }
      return { ...prev, [id]: { ...cfg, repeat, allDay: false, monthlyDays: cfg.monthlyDays } }
    })
  }

  const toggleWeekday = (id: string, dayIndex: number) => {
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      const isSelected = cfg.weekdays.includes(dayIndex)
      const nextDays = isSelected
        ? cfg.weekdays.filter((d) => d !== dayIndex)
        : [...cfg.weekdays, dayIndex].sort((a, b) => a - b)
      return { ...prev, [id]: { ...cfg, weekdays: nextDays } }
    })
  }

  const toggleMonthDay = (id: string, day: number) => {
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      const isSelected = cfg.monthlyDays.includes(day)
      const nextDays = isSelected
        ? cfg.monthlyDays.filter((d) => d !== day)
        : [...cfg.monthlyDays, day].sort((a, b) => a - b)
      return { ...prev, [id]: { ...cfg, monthlyDays: nextDays } }
    })
  }

  const periodDefault: Record<'Morning'|'Afternoon'|'Evening', string> = {
    Morning: '07:00',
    Afternoon: '13:00',
    Evening: '19:00',
  }
  const togglePeriod = (id: string, period: 'Morning'|'Afternoon'|'Evening') => {
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      const on = !cfg.periodOn[period]
      const nextTimes = new Set(cfg.times)
      if (on) nextTimes.add(periodDefault[period])
      else nextTimes.delete(periodDefault[period])
      return {
        ...prev,
        [id]: { ...cfg, allDay: false, periodOn: { ...cfg.periodOn, [period]: on }, times: Array.from(nextTimes).sort() },
      }
    })
  }

  const addCustomTime = (id: string, time: string) => {
    if (!time) return
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      const next = new Set(cfg.times)
      next.add(time)
      return { ...prev, [id]: { ...cfg, allDay: false, times: Array.from(next).sort() } }
    })
  }

  const removeTime = (id: string, time: string) => {
    setConfigs((prev) => {
      const cfg = prev[id]
      if (!cfg) return prev
      return { ...prev, [id]: { ...cfg, times: cfg.times.filter((t) => t !== time) } }
    })
  }

  const Section = ({ title, category }: { title: string; category: keyof typeof presets }) => {
    const items = filteredIdsByCategory(category)
    if (!items.length) return null

    return (
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-border-subtle">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {title} <span className="text-sm text-text-secondary">({items.length})</span>
        </h2>
        <div className="space-y-3">
          {items.map((it) => {
            const isSelected = selected.includes(it.id)
            const cfg = configs[it.id]
            return (
              <div
                key={it.id}
                className={`rounded-xl p-4 hover:shadow-md transition border ${selected.includes(it.id) ? 'border-border-subtle' : 'border-transparent'} ${!selected.includes(it.id) ? 'opacity-70 saturate-0' : ''}`}
                style={{ backgroundColor: it.surface }}
              >
                <button type="button" className="w-full flex items-center gap-3" onClick={() => toggle(it.id, it.name)}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: it.primary }}>
                    {it.iconPath ? <Image src={it.iconPath} alt="" width={28} height={28} /> : <span className="text-white font-semibold">{it.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-text-primary">{it.name}</div>
                    <div className="text-xs text-text-secondary">Click to {isSelected ? 'collapse' : 'configure'}</div>
                  </div>
                  {/* status circle */}
                  <div className="shrink-0">
                    {(() => {
                      const cfg = configs[it.id]
                      const valid = cfg ? validate(cfg).valid : false
                      return (
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? (valid ? 'bg-[#A385E9] border-[#A385E9] text-white' : 'border-[#A385E9]') : 'border-border-subtle'}`}>
                          {isSelected && valid ? '✓' : ''}
                        </div>
                      )
                    })()}
                  </div>
                </button>

                {isSelected && cfg && (
                  <div className="mt-4" data-invalid={!validate(cfg).valid}>
                    {/* Note */}
                    <div>
                      <div className="flex items-center justify-between px-1">
                        <div className="text-[14px] font-bold text-text-primary">Note</div>
                        <button
                          type="button"
                          onClick={() => setExpandedNotes((prev) => ({ ...prev, [it.id]: !prev[it.id] }))}
                          className="text-[12px] font-semibold text-text-secondary hover:text-text-primary"
                        >
                          {expandedNotes[it.id] ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      <div className="mt-2 rounded-[8px] border border-border-subtle bg-surface">
                        <AutoGrowTextarea
                          value={cfg.note}
                          onChange={(e) => setConfig(it.id, 'note', e.target.value)}
                          placeholder="Type the note here.."
                          expanded={!!expandedNotes[it.id]}
                        />
                      </div>
                    </div>

                    {/* Repeat */}
                    <div className="mt-4">
                      <div className={`px-1 text-[14px] font-bold ${!cfg.repeat && showGlobalErrors.length ? 'text-[#E53935]' : 'text-text-primary'}`}>Repeat</div>
                      <div className="mt-2 flex gap-2">
                        {repeatOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleRepeatChange(it.id, option)}
                            className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                              cfg.repeat === option
                                ? 'bg-[#5C4688] text-white shadow'
                                : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {/* Weekly days */}
                      {cfg.repeat === 'Weekly' && (
                        <div className="mt-3">
                          <div className="mb-2 flex items-center flex-wrap gap-2 px-1 text-[14px] font-bold text-text-primary">
                            <span>On these days</span>
                            <span className="text-text-secondary font-medium">every</span>
                            <input
                              type="number"
                              min={1}
                              max={7}
                              value={cfg.weeklyInterval}
                              onChange={(e) => setConfig(it.id, 'weeklyInterval', Math.min(7, Math.max(1, Number(e.target.value) || 1)))}
                              className="w-14 text-center rounded-[8px] border border-border-subtle bg-surface px-2 py-1 text-[14px] font-semibold text-text-primary focus:outline-none"
                            />
                            <span className="text-text-secondary font-medium">week{cfg.weeklyInterval > 1 ? 's' : ''}</span>
                          </div>
                          <div className={`flex flex-wrap gap-2 ${cfg.weekdays.length === 0 && showGlobalErrors.length ? 'ring-2 ring-[#E53935]/60 rounded-lg p-1 -m-1' : ''}`}>
                            {dayLabels.map((label, dayIndex) => {
                              const isActive = cfg.weekdays.includes(dayIndex)
                              return (
                                <button
                                  type="button"
                                  key={dayIndex}
                                  onClick={() => toggleWeekday(it.id, dayIndex)}
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

                      {/* Monthly days */}
                      {cfg.repeat === 'Monthly' && (
                        <div className="mt-3">
                          <div className="px-1 text-[14px] font-bold text-text-primary mb-2">Days of month</div>
                          <div className={`grid grid-cols-7 gap-2 text-center ${cfg.monthlyDays.length === 0 && showGlobalErrors.length ? 'ring-2 ring-[#E53935]/60 rounded-lg p-1 -m-1' : ''}`}>
                            {monthDays.map((day) => {
                              const isActive = cfg.monthlyDays.includes(day)
                              return (
                                <button
                                  type="button"
                                  key={day}
                                  onClick={() => toggleMonthDay(it.id, day)}
                                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                                    isActive
                                      ? 'bg-[#5C4688] text-white shadow'
                                      : 'text-text-primary bg-surface dark:bg-white/5'
                                  }`}
                                >
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Do it at */}
                    <div className="mt-4">
                      <div className={`px-1 text-[14px] font-bold ${(!cfg.allDay && cfg.times.length === 0 && showGlobalErrors.length) ? 'text-[#E53935]' : 'text-text-primary'}`}>Do it at</div>
                      <div className="mt-2">
                        <div className="mb-2 flex items-center justify-end">
                          <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                            <span>All day</span>
                            <ToggleSwitch
                              checked={cfg.allDay}
                              onChange={(value) => {
                                setConfigs((prev) => {
                                  const current = prev[it.id]
                                  if (!current) return prev
                                  return {
                                    ...prev,
                                    [it.id]: {
                                      ...current,
                                      allDay: value,
                                      times: value ? [] : current.times,
                                      periodOn: value ? { Morning: false, Afternoon: false, Evening: false } : current.periodOn,
                                    },
                                  }
                                })
                              }}
                            />
                          </label>
                        </div>
                        {/* Period toggles (multi-select) */}
                        <div className="mt-3 flex gap-2">
                          {periodOptions.map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => togglePeriod(it.id, period)}
                              className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                cfg.periodOn[period]
                                  ? 'bg-[#5C4688] text-white shadow'
                                  : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>

                        {/* Custom times via plus */}
                        <div className="mt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex flex-wrap gap-2">
                              {cfg.times.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1 text-[12px] font-semibold text-text-primary">
                                  {t}
                                  <button type="button" className="text-text-secondary hover:text-text-primary" onClick={() => removeTime(it.id, t)}>
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              disabled={cfg.allDay}
                              onClick={() => setShowTimeInput((s) => ({ ...s, [it.id]: true }))}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-primary ${cfg.allDay ? 'opacity-60 cursor-not-allowed' : 'hover:bg-surface-hover'}`}
                              aria-label="Add time"
                              title="Add time"
                            >
                              +
                            </button>
                            {showTimeInput[it.id] && !cfg.allDay && (
                              <input
                                autoFocus
                                type="time"
                                onBlur={() => setShowTimeInput((s) => ({ ...s, [it.id]: false }))}
                                onChange={(e) => {
                                  const v = e.target.value
                                  if (v) addCustomTime(it.id, v)
                                  setShowTimeInput((s) => ({ ...s, [it.id]: false }))
                                }}
                                className="w-40 rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[14px] text-text-primary focus:outline-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* End Activity On */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="text-[14px] font-bold text-text-primary">End Activity On</div>
                        <ToggleSwitch checked={cfg.endDate} onChange={(value) => setConfig(it.id, 'endDate', value)} />
                      </div>

                      {cfg.endDate && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            {(['date', 'days'] as ActivityConfig['endType'][]).map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setConfig(it.id, 'endType', option)}
                                className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                  cfg.endType === option
                                    ? 'bg-[#5C4688] text-white shadow'
                                    : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                                }`}
                              >
                                {option === 'date' ? 'Date' : 'Days'}
                              </button>
                            ))}
                          </div>

                          {cfg.endType === 'date' ? (
                            <div className="mt-3">
                              <input
                                type="date"
                                value={cfg.endDateValue}
                                onChange={(e) => setConfig(it.id, 'endDateValue', e.target.value)}
                                className="w-full rounded-[8px] border border-border-subtle bg-surface px-4 py-3 text-[15px] text-text-primary focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[14px] text-text-secondary">After</span>
                              <input
                                type="number"
                                min={1}
                                value={cfg.endDaysValue}
                                onChange={(e) => setConfig(it.id, 'endDaysValue', Number(e.target.value) || cfg.endDaysValue)}
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
                        <ToggleSwitch checked={cfg.remind} onChange={(value) => setConfig(it.id, 'remind', value)} />
                      </div>

                      {cfg.remind && (
                        <div className="mt-3">
                          <div className="px-1 text-[12px] font-medium text-text-secondary">Before activity</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <Select
                              options={remindAmountOptions}
                              value={cfg.remindAmount}
                              onChange={(v) => setConfig(it.id, 'remindAmount', Number(v))}
                              buttonClassName="py-2 text-[14px]"
                            />
                            <Select
                              options={remindUnits}
                              value={cfg.remindUnit}
                              onChange={(v) => setConfig(it.id, 'remindUnit', String(v) as RemindUnit)}
                              buttonClassName="py-2 text-[14px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const selectedCount = selected.length

  return (
    <div className="space-y-6">
      {/* Global validation popup */}
      {showGlobalErrors.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-[#E53935]/30 bg-[#2A1214] text-white shadow-lg">
          <div className="flex items-start gap-3 p-4">
            <div className="mt-0.5 text-[#FFB4A9]">⚠</div>
            <div className="flex-1">
              <div className="font-semibold">Please complete the required fields</div>
              <ul className="mt-1 list-disc pl-4 text-sm opacity-90">
                {showGlobalErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <button className="text-sm text-[#FFB4A9] hover:underline" onClick={() => setShowGlobalErrors([])}>Close</button>
          </div>
        </div>
      )}
      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search procedures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-border-subtle rounded-lg bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#A385E9]"
          />
        </div>
        <div className="text-sm text-text-secondary">Selected: {selectedCount}</div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <Section title="Skin" category="skin" />
        <Section title="Hair" category="hair" />
        <Section title="Physical health" category="physical" />
        <Section title="Mental Wellness" category="mental" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || selected.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-[#A385E9] to-[#8B6BC9] text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 border-2 border-border-subtle text-text-primary font-semibold rounded-xl hover:bg-surface transition">
          Cancel
        </button>
      </div>
    </div>
  )
}

