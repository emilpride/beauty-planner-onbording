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
  time: string
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | null
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
const repeatOptions: Exclude<ActivityConfig['repeat'], null>[] = ['Daily', 'Weekly', 'Monthly']
const periodOptions: Exclude<ActivityConfig['timePeriod'], null>[] = ['Morning', 'Afternoon', 'Evening']
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

  const toggle = (id: string, name: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id)
      if (exists) {
        return prev.filter((x) => x !== id)
      }
      setConfigs((c) => {
        if (c[id]) return c
        return { ...c, [id]: createActivityConfig(id, name) }
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

  const mapToActivity = (cfg: ActivityConfig): Activity => {
    const meta = getActivityMeta(cfg.id)
    let frequency: Activity['frequency'] = 'daily'
    if (cfg.repeat === 'Weekly') frequency = 'weekly'
    if (cfg.repeat === 'Monthly') frequency = 'monthly'

    const parseTime = (time: string) => {
      const [hStr, mStr] = time.split(':')
      return { hour: Number(hStr), minute: Number(mStr) }
    }

    return {
      id: cfg.id,
      name: cfg.name || meta.name,
      category: undefined,
      categoryId: undefined,
      note: cfg.note,
      isRecommended: false,
      type: 'regular',
      activeStatus: true,
      time: cfg.allDay || !cfg.time ? null : parseTime(cfg.time),
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
  }

  const handleSubmit = async () => {
    const acts = selected.map((id) => mapToActivity(configs[id]))
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

  const setPeriodAndTime = (id: string, period: Exclude<ActivityConfig['timePeriod'], null>) => {
    const timeMap: Record<typeof period, string> = {
      Morning: '07:00',
      Afternoon: '13:00',
      Evening: '19:00',
    }
    setConfig(id, 'timePeriod', period)
    setConfig(id, 'time', timeMap[period])
    setConfig(id, 'allDay', false)
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
              <div key={it.id} className="rounded-xl p-4 hover:shadow-md transition border border-border-subtle" style={{ backgroundColor: it.surface }}>
                <button type="button" className="w-full flex items-center gap-3" onClick={() => toggle(it.id, it.name)}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: it.primary }}>
                    {it.iconPath ? <Image src={it.iconPath} alt="" width={28} height={28} /> : <span className="text-white font-semibold">{it.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-text-primary">{it.name}</div>
                    <div className="text-xs text-text-secondary">Click to {isSelected ? 'collapse' : 'configure'}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border ${isSelected ? 'bg-[#A385E9] border-[#A385E9]' : 'border-border-subtle'} flex items-center justify-center text-white`}>{isSelected ? '✓' : ''}</div>
                </button>

                {isSelected && cfg && (
                  <div className="mt-4">
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
                      <div className="px-1 text-[14px] font-bold text-text-primary">Repeat</div>
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
                          <div className="flex flex-wrap gap-2">
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
                          <div className="grid grid-cols-7 gap-2 text-center">
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
                      <div className="px-1 text-[14px] font-bold text-text-primary">Do it at</div>
                      <div className="mt-2">
                        <div className="mb-2 flex items-center justify-end">
                          <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                            <span>All day</span>
                            <ToggleSwitch
                              checked={cfg.allDay}
                              onChange={(value) =>
                                setConfig(it.id, 'allDay', value)
                              }
                            />
                          </label>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={cfg.time}
                            onChange={(e) => setConfig(it.id, 'time', e.target.value)}
                            disabled={cfg.allDay}
                            className={`w-full rounded-[8px] border border-border-subtle bg-surface px-4 py-3 text-[15px] text-text-primary focus:outline-none ${
                              cfg.allDay ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>

                        <div className="mt-3 flex gap-2">
                          {periodOptions.map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setPeriodAndTime(it.id, period)}
                              className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                cfg.timePeriod === period
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
          {saving ? 'Saving…' : 'Create Procedure(s)'}
        </button>
        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 border-2 border-border-subtle text-text-primary font-semibold rounded-xl hover:bg-surface transition">
          Cancel
        </button>
      </div>
    </div>
  )
}

