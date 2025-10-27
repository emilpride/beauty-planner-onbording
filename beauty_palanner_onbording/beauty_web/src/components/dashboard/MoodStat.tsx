"use client"

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { useMoodsInRange, useUpsertMood } from '@/hooks/useMoods'
import type { MoodEntry as StoredMood } from '@/types/mood'

type MoodType = 'great' | 'good' | 'okay' | 'not_good' | 'bad'

type MoodWithType = StoredMood & { moodType: MoodType }

type ChartPoint = { day: number; label: string; value: number | null }

type MoodSummaryRow = {
  type: MoodType
  count: number
  percent: number
}

const MOODS: Record<MoodType, { emoji: string; label: string; subLabel: string }> = {
  great: { emoji: '/icons/emojis/great_emoji.png', label: 'Great', subLabel: 'Confident' },
  good: { emoji: '/icons/emojis/good_emoji.png', label: 'Good', subLabel: 'Appreciated' },
  okay: { emoji: '/icons/emojis/okay_emoji.png', label: 'Okay', subLabel: 'Bored' },
  not_good: { emoji: '/icons/emojis/not_good_emoji.png', label: 'Not Good', subLabel: '' },
  bad: { emoji: '/icons/emojis/bad_emoji.png', label: 'Bad', subLabel: '' },
}

const MOOD_ORDER: MoodType[] = ['great', 'good', 'okay', 'not_good', 'bad']

const FEELINGS = [
  'Happy',
  'Brave',
  'Motivated',
  'Creative',
  'Confident',
  'Calm',
  'Grateful',
  'Peaceful',
  'Excited',
  'Loved',
  'Hopeful',
  'Inspired',
  'Proud',
  'Euphoric',
  'Nostalgic',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MOOD_CELL_CLASSES: Record<MoodType, string> = {
  great: 'bg-[#F1EAFF] text-[#5C4688] border-[#CDBDF2]',
  good: 'bg-[#EAF7F2] text-[#1C6B5E] border-[#B5E1D4]',
  okay: 'bg-[#FFF5E6] text-[#9C6A1F] border-[#FFD9A8]',
  not_good: 'bg-[#FFF1F1] text-[#AA4A4A] border-[#FFC9C9]',
  bad: 'bg-[#FDEBFF] text-[#803990] border-[#E7B7F2]',
}

function moodValueToType(value: number): MoodType {
  if (value >= 5) return 'great'
  if (value === 4) return 'good'
  if (value === 3) return 'okay'
  if (value === 2) return 'not_good'
  return 'bad'
}

function moodTypeToValue(type: MoodType): number {
  switch (type) {
    case 'great':
      return 5
    case 'good':
      return 4
    case 'okay':
      return 3
    case 'not_good':
      return 2
    case 'bad':
      return 1
    default:
      return 3
  }
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildSummary(rows: MoodWithType[]): MoodSummaryRow[] {
  const total = rows.length || 1
  const counts = new Map<MoodType, number>()

  for (const mood of MOOD_ORDER) counts.set(mood, 0)
  for (const row of rows) counts.set(row.moodType, (counts.get(row.moodType) ?? 0) + 1)

  return MOOD_ORDER.map((type) => {
    const count = counts.get(type) ?? 0
    const percent = Math.round((count / total) * 100)
    return { type, count, percent }
  })
}

function buildChartPoints(rows: MoodWithType[], year: number, month: number): ChartPoint[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const byDay = new Map<number, MoodWithType>()

  for (const row of rows) {
    byDay.set(row.date.getDate(), row)
  }

  const data: ChartPoint[] = []
  for (let day = 1; day <= daysInMonth; day += 1) {
    const entry = byDay.get(day)
    data.push({
      day,
      label: String(day),
      value: entry ? moodTypeToValue(entry.moodType) : null,
    })
  }

  return data
}

export function MoodStat() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState('')

  const monthStart = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate])
  const monthEnd = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate])
  const { data: moods } = useMoodsInRange(user?.uid ?? null, monthStart, monthEnd)
  const upsert = useUpsertMood(user?.uid ?? null)

  const normalizedMoods = useMemo<MoodWithType[]>(
    () =>
      (moods ?? []).map((entry) => ({
        ...entry,
        moodType: moodValueToType(entry.mood),
      })),
    [moods],
  )

  const moodsByDay = useMemo(() => {
    const map = new Map<string, MoodWithType>()
    for (const mood of normalizedMoods) map.set(formatMonthKey(mood.date), mood)
    return map
  }, [normalizedMoods])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const calendarCells = useMemo(() => {
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDayOfMonth; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
    return cells
  }, [firstDayOfMonth, daysInMonth])

  const summaryRows = useMemo(() => buildSummary(normalizedMoods), [normalizedMoods])
  const chartData = useMemo(
    () => buildChartPoints(normalizedMoods, currentDate.getFullYear(), currentDate.getMonth()),
    [normalizedMoods, currentDate],
  )

  const monthLabel = useMemo(
    () => currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [currentDate],
  )

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getMoodForDay = (day: number | null) => {
    if (!day) return null
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return moodsByDay.get(formatMonthKey(date)) ?? null
  }

  const openMoodModal = (day: number) => {
    const dateToSet = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(dateToSet)
    setModalStep(1)
    setSelectedMood(null)
    setSelectedFeeling('')
    setShowModal(true)
  }

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood)
    setModalStep(2)
  }

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling)
  }

  const handleSaveMood = async () => {
    if (!user?.uid || !selectedDate || !selectedMood) return
    const moodValue = moodTypeToValue(selectedMood)
    await upsert.mutateAsync({
      date: selectedDate,
      mood: moodValue,
      feeling: selectedFeeling || MOODS[selectedMood].subLabel,
    })
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
    setSelectedMood(null)
    setSelectedFeeling('')
    setModalStep(1)
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const totalEntries = normalizedMoods.length

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="bg-surface rounded-xl border border-border-subtle p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Mood Calendar</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-text-primary min-w-[140px] text-center">{monthLabel}</span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition"
              aria-label="Next month"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((day, index) => {
              const entry = getMoodForDay(day)
              const today = isToday(day)

              const baseClasses = [
                'aspect-square flex flex-col items-center justify-center rounded-lg border text-xs font-semibold transition',
                day ? 'cursor-pointer hover:border-[#A385E9] hover:bg-[#A385E9]/10' : 'cursor-default opacity-40 border-transparent',
                today ? 'ring-2 ring-offset-2 ring-[#A385E9]' : '',
              ]

              if (day && entry) baseClasses.push(MOOD_CELL_CLASSES[entry.moodType])
              if (day && !entry) baseClasses.push('bg-surface text-text-primary border-border-subtle')
              if (!day) baseClasses.push('bg-transparent')

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => day && openMoodModal(day)}
                  className={baseClasses.filter(Boolean).join(' ')}
                  disabled={!day}
                >
                  {day && (
                    <>
                      {entry ? (
                        <div className="relative w-7 h-7 mb-1">
                          <Image src={MOODS[entry.moodType].emoji} alt={MOODS[entry.moodType].label} fill className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 mb-1 flex items-center justify-center">
                          <svg className={`w-5 h-5 ${today ? 'text-[#A385E9]' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xs font-semibold">{day}</span>
                      {today && !entry && <span className="text-[10px] text-[#A385E9]">Today</span>}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border-subtle">
          {normalizedMoods
            .slice()
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 4)
            .map((entry, index) => {
              const mood = MOODS[entry.moodType]
              const isRecent = index === 0

              return (
                <div key={entry.id ?? `${entry.date.toISOString()}-${index}`} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0">
                    <Image src={mood.emoji} alt={mood.label} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-text-primary">{mood.label}</span>
                      <span className="text-sm text-text-secondary">•</span>
                      <span className="text-sm text-text-secondary">{entry.feeling}</span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {isRecent
                        ? `Today, ${entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${entry.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                        : `${entry.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • ${entry.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                    </div>
                  </div>
                </div>
              )
            })}

          {totalEntries === 0 && (
            <div className="text-sm text-text-secondary text-center py-4 border border-dashed border-border-subtle rounded-lg">
              No moods logged for this month yet.
            </div>
          )}
        </div>
      </section>

      <aside className="bg-surface rounded-xl border border-border-subtle p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary mb-4">Monthly Insights</h2>
        <div className="text-sm text-text-secondary mb-6">{totalEntries} mood {totalEntries === 1 ? 'entry' : 'entries'} logged in {monthLabel}.</div>

        <div className="space-y-3 mb-8">
          {summaryRows.map(({ type, percent, count }) => (
            <div key={type} className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <Image src={MOODS[type].emoji} alt={MOODS[type].label} fill className="object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                  <span>{MOODS[type].label}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#A385E9] transition-all"
                    style={{ width: `${percent}%`, opacity: percent === 0 ? 0.2 : 1 }}
                  />
                </div>
                <div className="text-xs text-text-secondary mt-1">{count} {count === 1 ? 'day' : 'days'}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Mood Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6F2" />
                <XAxis dataKey="label" interval={6} tickLine={false} axisLine={false} tick={{ fill: '#969AB7', fontSize: 12 }} />
                <YAxis
                  domain={[1, 5]}
                  tickCount={5}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#969AB7', fontSize: 12 }}
                  tickFormatter={(value: number) => MOODS[moodValueToType(value)].label.charAt(0)}
                />
                <Tooltip
                  cursor={{ stroke: '#A385E9', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(value: number | string | Array<number | string>) => {
                    if (typeof value !== 'number') return ['No entry', 'Mood']
                    const type = moodValueToType(value)
                    return [`${MOODS[type].label}`, 'Mood']
                  }}
                  labelFormatter={(label: string | number) => `Day ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#A385E9"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#A385E9', fill: '#fff' }}
                  activeDot={{ r: 5, stroke: '#5C4688', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCancel}>
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-subtle" onClick={(event) => event.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#5C4688] mb-2">Choose mood</h2>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-4">
                <div className="text-6xl">👩‍⚕️</div>
              </div>
              {modalStep === 1 && <p className="text-sm text-text-secondary">How is your mood today?</p>}
              {modalStep === 2 && <p className="text-sm text-text-secondary">Great! How would you describe your feelings?</p>}

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-1 flex-1 rounded-full ${modalStep === 1 ? 'bg-[#A385E9]' : 'bg-border-subtle'}`} />
                <div className={`h-1 flex-1 rounded-full ${modalStep === 2 ? 'bg-[#A385E9]' : 'bg-border-subtle'}`} />
              </div>
              <div className="text-right text-xs text-text-secondary mt-1">{modalStep}/2</div>
            </div>

            {modalStep === 1 && (
              <div className="space-y-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleMoodSelect('great')}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-[#A385E9] text-white hover:bg-[#9374D9] transition"
                >
                  <div className="relative w-12 h-12">
                    <Image src={MOODS.great.emoji} alt="Great" fill className="object-contain" />
                  </div>
                  <span className="font-semibold">Great</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMoodSelect('good')}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                >
                  <div className="relative w-12 h-12">
                    <Image src={MOODS.good.emoji} alt="Good" fill className="object-contain" />
                  </div>
                  <span className="font-semibold text-text-primary">Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMoodSelect('okay')}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                >
                  <div className="relative w-12 h-12">
                    <Image src={MOODS.okay.emoji} alt="Okay" fill className="object-contain" />
                  </div>
                  <span className="font-semibold text-text-primary">Okay</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleMoodSelect('not_good')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                  >
                    <div className="relative w-12 h-12">
                      <Image src={MOODS.not_good.emoji} alt="Not Good" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-text-primary">Not Good</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoodSelect('bad')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                  >
                    <div className="relative w-12 h-12">
                      <Image src={MOODS.bad.emoji} alt="Bad" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-text-primary">Bad</span>
                  </button>
                </div>
              </div>
            )}

            {modalStep === 2 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2">
                  {FEELINGS.map((feeling) => (
                    <button
                      key={feeling}
                      type="button"
                      onClick={() => handleFeelingSelect(feeling)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedFeeling === feeling
                          ? 'bg-[#A385E9] text-white'
                          : 'bg-surface-hover text-text-primary hover:bg-[#A385E9]/10 border border-border-subtle'
                      }`}
                    >
                      {feeling}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-surface-hover text-text-primary font-semibold border border-border-subtle hover:bg-surface transition"
              >
                Cancel
              </button>
              {modalStep === 2 && (
                <button
                  type="button"
                  onClick={handleSaveMood}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#A385E9] text-white font-semibold hover:bg-[#9374D9] transition"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
