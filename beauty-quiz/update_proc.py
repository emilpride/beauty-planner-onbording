from pathlib import Path
import re

def build_activity_meta() -> str:
    text = Path('components/procedures/ChooseProceduresStep.tsx').read_text(encoding='utf-8')
    icon_block = re.search(r"const iconEmojis = \{(.*?)\}\n\n", text, re.S)
    icon_map = {}
    for raw in icon_block.group(1).splitlines():
        line = raw.strip().rstrip(',')
        if not line:
            continue
        name, value = line.split(':', 1)
        key = name.strip()
        value = value.strip().strip("'")
        icon_map[key] = value.encode().decode('unicode_escape')

    pattern = re.compile(r"\{ id: '([^']+)', name: '([^']+)', icon: iconEmojis\.([a-zA-Z0-9]+), color: '([^']+)', bgColor: '([^']+)'", re.S)

    def normalize(color_str: str) -> str:
        if color_str.startswith('bg-[') and color_str.endswith(']'):
            return color_str[4:-1]
        if color_str.startswith('bg-[#') and color_str.endswith(']'):
            return color_str[4:-1]
        if color_str.startswith('bg-#'):
            return '#' + color_str[4:]
        if color_str.startswith('bg-'):
            return color_str[3:]
        return color_str

    lines = []
    for match in pattern.finditer(text):
        activity_id, name, icon_key, color, bg_color = match.groups()
        icon = icon_map.get(icon_key)
        if not icon:
            continue
        primary = normalize(color)
        surface = normalize(bg_color)
        safe_name = name.replace("'", "\\'")
        safe_icon = icon.replace("'", "\\'")
        lines.append(f"  '{activity_id}': {{ name: '{safe_name}', icon: '{safe_icon}', primary: '{primary}', surface: '{surface}' }},")

    return '\n'.join(lines)


def generate_file() -> None:
    entries_text = build_activity_meta()
    full_week = ', '.join(str(i) for i in range(7))

    template = """'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

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

interface ActivityMeta {
  name: string
  icon: string
  primary: string
  surface: string
}

const FULL_WEEK = [__FULL_WEEK__] as const
const HOUR_VALUES_24 = Array.from({ length: 24 }, (_, index) => index)
const HOUR_VALUES_12 = Array.from({ length: 12 }, (_, index) => index + 1)
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index)

type ReminderUnitId = 'minutes' | 'hours' | 'days' | 'weeks'

interface ReminderUnit {
  id: ReminderUnitId
  label: string
  multiplier: number
  max: number
}

const REMINDER_UNITS: ReminderUnit[] = [
  { id: 'minutes', label: 'Minutes', multiplier: 1, max: 59 },
  { id: 'hours', label: 'Hours', multiplier: 60, max: 24 },
  { id: 'days', label: 'Days', multiplier: 1440, max: 30 },
  { id: 'weeks', label: 'Weeks', multiplier: 10080, max: 12 },
]

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const repeatOptions: ActivitySetting['repeat'][] = ['Daily', 'Weekly', 'Monthly']
const periodOptions: ActivitySetting['timePeriod'][] = ['Morning', 'Afternoon', 'Evening']
const weeklyNumberLabels = [1, 2, 3, 4, 5, 6, 7]
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1)

const ACTIVITY_META: Record<string, ActivityMeta> = {
__ENTRIES__
}

const DEFAULT_META: ActivityMeta = { name: 'Custom Activity', icon: '?', primary: '#A385E9', surface: 'rgba(163,133,233,0.15)' }

const getActivityMeta = (activityId: string, fallbackName?: string): ActivityMeta => {
  if (activityId.startsWith('custom-')) {
    return { ...DEFAULT_META, name: fallbackName || DEFAULT_META.name }
  }

  const preset = ACTIVITY_META[activityId]
  if (preset) {
    return preset
  }

  return { ...DEFAULT_META, name: fallbackName || `Activity ${activityId}` }
}

const createActivitySetting = (activityId: string, fallbackName?: string): ActivitySetting => {
  const meta = getActivityMeta(activityId, fallbackName)

  return {
    id: activityId,
    name: meta.name,
    note: '',
    repeat: 'Daily',
    allDay: true,
    weekdays: [...FULL_WEEK],
    monthlyDays: [],
    time: '07:00',
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

const formatTimeLabel = (time: string) => {
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return '--:--'
  }

  const [hoursStr, minutesStr] = time.split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const normalized = hours % 12 === 0 ? 12 : hours % 12
  return `${normalized.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

const formatMonthlySummary = (days: number[]) => {
  if (!days.length) {
    return 'Select days of the month'
  }

  const sorted = [...days].sort((a, b) => a - b)
  return `Every month on ${sorted.join(', ')}`
}

const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">{children}</div>
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
          <h2 className="text-lg font-semibold text-[#5C4688]">Choose Days of Month</h2>
          <p className="text-sm text-[#8C8FA9]">Tap all dates you want to include in this routine.</p>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
            <span key={label} className="text-xs font-medium text-[#B4B7D4]">
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
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isSelected ? 'bg-[#5C4688] text-white shadow-sm' : 'text-[#5C4688] hover:bg-[#ECE9FF]'
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
            className="rounded-full border border-[#D8DAEE] px-5 py-2 text-sm font-medium text-[#5C4688] hover:bg-[#ECE9FF]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selection)}
            className="rounded-full bg-[#A385E9] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8F74E5]"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  )
}

const TimePicker = ({ value, onChange }: { value: string; onChange: (next: string) => void }) => {
  const [mode, setMode] = useState<'12h' | '24h'>('12h')
  const [hour24, setHour24] = useState(7)
  const [minute, setMinute] = useState(30)

  useEffect(() => {
    if (/^\d{2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(':').map(Number)
      setHour24(h)
      setMinute(m)
    } else {
      setHour24(7)
      setMinute(30)
    }
  }, [value])

  useEffect(() => {
    const formatted = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    if (formatted !== value) {
      onChange(formatted)
    }
  }, [hour24, minute, onChange, value])

  const currentMeridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM'
  const displayedHour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  const hourOptions = mode === '24h' ? HOUR_VALUES_24 : HOUR_VALUES_12

  const handleModeChange = (next: '12h' | '24h') => {
    if (next === mode) {
      return
    }
    setMode(next)
  }

  const handleMeridiemChange = (next: 'AM' | 'PM') => {
    if (mode === '24h' || next === currentMeridiem) {
      return
    }
    const base = hour24 % 12
    setHour24(next === 'PM' ? base + 12 : base)
  }

  const handleHourSelect = (selected: number) => {
    if (mode === '24h') {
      setHour24(selected)
      return
    }
    const base = selected % 12
    setHour24(currentMeridiem === 'PM' ? base + 12 : base)
  }

  const handleMinuteSelect = (selected: number) => {
    setMinute(selected)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['12h', '24h'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleModeChange(option)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === option ? 'bg-[#5C4688] text-white shadow-sm' : 'bg-white text-[#5C4688] shadow border border-[#E3E5F4] hover:border-[#8F74E5]'
            }`}
          >
            {option.upper()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-[32px] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(92,70,136,0.12)]">
        <div className="flex h-44 w-20 flex-col items-center overflow-y-auto py-2">
          {hourOptions.map((hour) => {
            const isSelected = mode === '24h' ? hour24 === hour : displayedHour12 === hour
            return (
              <button
                key={hour}
                type="button"
                onClick={() => handleHourSelect(hour)}
                className={`my-0.5 flex h-10 w-full items-center justify-center rounded-full text-base font-semibold transition ${
                  isSelected ? 'bg-[#5C4688] text-white shadow' : 'text-[#5C4688] hover:bg-[#ECE9FF]'
                }`}
              >
                {(mode === '24h' ? hour : hour).toString().padStart(2, '0')}
              </button>
            )
          })}
        </div>
        <div className="flex h-44 w-20 flex-col items-center overflow-y-auto py-2">
          {MINUTE_VALUES.map((minuteOption) => {
            const isSelected = minute === minuteOption
            return (
              <button
                key={minuteOption}
                type="button"
                onClick={() => handleMinuteSelect(minuteOption)}
                className={`my-0.5 flex h-10 w-full items-center justify-center rounded-full text-base font-semibold transition ${
                  isSelected ? 'bg-[#5C4688] text-white shadow' : 'text[#5C4688] hover:bg[#ECE9FF]'
                }`}
              >
                {minuteOption.toString().padStart(2, '0')}
              </button>
            )
          })}
        </div>
        {mode === '12h' && (
          <div className="flex flex-col items-center gap-2">
            {(['AM', 'PM'] as const).map((meridiem) => (
              <button
                key={meridiem}
                type="button"
                onClick={() => handleMeridiemChange(meridiem)}
                className={`w-20 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  currentMeridiem === meridiem ? 'bg[#5C4688] text-white shadow-sm' : 'bg-white text[#5C4688] shadow border border[#E3E5F4] hover:border[#8F74E5]'
                }`}
              >
                {meridiem}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"""

    content = template.replace('__FULL_WEEK__', full_week).replace('__ENTRIES__', entries_text)
    Path('components/procedures/ProcedureSetupStep.tsx').write_text(content, encoding='utf-8')


if __name__ == '__main__':
    generate_file()
