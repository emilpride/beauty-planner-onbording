"use client"

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useMoodsInRange, useUpsertMood } from '@/hooks/useMoods'
import type { MoodEntry as StoredMood } from '@/types/mood'

type MoodType = 'great' | 'good' | 'okay' | 'not_good' | 'bad'

const MOODS: Record<MoodType, { emoji: string; label: string; subLabel: string }> = {
  great: { emoji: '/icons/emojis/great_emoji.png', label: 'Great', subLabel: 'Confident' },
  good: { emoji: '/icons/emojis/good_emoji.png', label: 'Good', subLabel: 'Appreciated' },
  okay: { emoji: '/icons/emojis/okay_emoji.png', label: 'Okay', subLabel: 'Bored' },
  not_good: { emoji: '/icons/emojis/not_good_emoji.png', label: 'Not Good', subLabel: '' },
  bad: { emoji: '/icons/emojis/bad_emoji.png', label: 'Bad', subLabel: '' },
}

const FEELINGS = [
  'Happy', 'Brave', 'Motivated', 'Creative', 'Confident', 'Calm',
  'Grateful', 'Peaceful', 'Exiled', 'Loved', 'Hopeful', 'Inspired',
  'Proud', 'Euphoric', 'Nostalgic'
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function MoodStat() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState<string>('')

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const { data: moods } = useMoodsInRange(user?.uid ?? null, monthStart, monthEnd)
  const upsert = useUpsertMood(user?.uid ?? null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar grid
  const calendarDays: (number | null)[] = []
  
  // Add empty slots for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const moodMap = useMemo(() => {
    const map = new Map<string, StoredMood>()
    for (const m of moods ?? []) map.set(m.id, m)
    return map
  }, [moods])

  const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const getMoodForDate = (day: number | null) => {
    if (!day) return null
    const id = `${user?.uid ?? ''}_${ymd(new Date(year, month, day))}`
    const found = moodMap.get(id)
    if (!found) return null
    const mood: MoodType = found.mood >= 5 ? 'great' : found.mood === 4 ? 'good' : found.mood === 3 ? 'okay' : found.mood === 2 ? 'not_good' : 'bad'
    return { date: found.date, mood, note: found.feeling }
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const openMoodModal = (day: number) => {
    const dateToSet = new Date(year, month, day)
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
    const moodValue = selectedMood === 'great' ? 5 : selectedMood === 'good' ? 4 : selectedMood === 'okay' ? 3 : selectedMood === 'not_good' ? 2 : 1
    await upsert.mutateAsync({ date: selectedDate, mood: moodValue, feeling: selectedFeeling || MOODS[selectedMood].subLabel })
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
    setSelectedMood(null)
    setSelectedFeeling('')
    setModalStep(1)
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Mood Stat</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary min-w-[140px] text-center">
            {monthName}
          </span>
          <button
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

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-text-secondary">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const moodEntry = getMoodForDate(day)
            const today = isToday(day)

            return (
              <button
                key={index}
                onClick={() => day && openMoodModal(day)}
                disabled={!day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg transition ${
                  !day ? 'invisible' : today ? 'bg-[#A385E9] text-white' : 'hover:bg-surface-hover cursor-pointer'
                }`}
              >
                {day && (
                  <>
                    {moodEntry ? (
                      <div className="relative w-8 h-8 mb-1">
                        <Image
                          src={MOODS[moodEntry.mood].emoji}
                          alt={MOODS[moodEntry.mood].label}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 mb-1 flex items-center justify-center">
                        <svg className={`w-5 h-5 ${today ? 'text-white' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-xs font-medium ${today ? 'text-white' : moodEntry ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {day}
                    </span>
                    {today && !moodEntry && (
                      <span className="text-[10px] text-white/80">Today</span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mood History List */}
      <div className="space-y-3 pt-4 border-t border-border-subtle">
        {(moods ?? [])
          .slice()
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 4)
          .map((entry, index) => {
            const moodKey: MoodType = entry.mood >= 5 ? 'great' : entry.mood === 4 ? 'good' : entry.mood === 3 ? 'okay' : entry.mood === 2 ? 'not_good' : 'bad'
            const mood = MOODS[moodKey]
            const isRecent = index === 0
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src={mood.emoji}
                    alt={mood.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary">
                      {mood.label}
                    </span>
                    <span className="text-sm text-text-secondary">•</span>
                    <span className="text-sm text-text-secondary">
                      {entry.feeling}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {isRecent
                      ? `Today, ${entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${entry.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                      : `${entry.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • ${entry.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                    }
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCancel}>
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-subtle" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#5C4688] mb-2">Choose mood</h2>
              {/* Character illustration */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-4">
                <div className="text-6xl">👩‍⚕️</div>
              </div>
              {modalStep === 1 && (
                <p className="text-sm text-text-secondary">How is your mood today?</p>
              )}
              {modalStep === 2 && (
                <p className="text-sm text-text-secondary">Great! How would you describe your feelings?</p>
              )}
              
              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-1 flex-1 rounded-full ${modalStep === 1 ? 'bg-[#A385E9]' : 'bg-border-subtle'}`} />
                <div className={`h-1 flex-1 rounded-full ${modalStep === 2 ? 'bg-[#A385E9]' : 'bg-border-subtle'}`} />
              </div>
              <div className="text-right text-xs text-text-secondary mt-1">{modalStep}/2</div>
            </div>

            {/* Step 1: Mood Selection */}
            {modalStep === 1 && (
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handleMoodSelect('great')}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-[#A385E9] text-white hover:bg-[#9374D9] transition"
                >
                  <div className="relative w-12 h-12">
                    <Image src={MOODS.great.emoji} alt="Great" fill className="object-contain" />
                  </div>
                  <span className="font-semibold">Great</span>
                </button>

                <button
                  onClick={() => handleMoodSelect('good')}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                >
                  <div className="relative w-12 h-12">
                    <Image src={MOODS.good.emoji} alt="Good" fill className="object-contain" />
                  </div>
                  <span className="font-semibold text-text-primary">Good</span>
                </button>

                <button
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
                    onClick={() => handleMoodSelect('not_good')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-hover hover:bg-[#A385E9]/10 transition border border-border-subtle"
                  >
                    <div className="relative w-12 h-12">
                      <Image src={MOODS.not_good.emoji} alt="Not Good" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-text-primary">Not Good</span>
                  </button>

                  <button
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

            {/* Step 2: Feelings Selection */}
            {modalStep === 2 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2">
                  {FEELINGS.map((feeling) => (
                    <button
                      key={feeling}
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-surface-hover text-text-primary font-semibold border border-border-subtle hover:bg-surface transition"
              >
                Cancel
              </button>
              {modalStep === 2 && (
                <button
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
