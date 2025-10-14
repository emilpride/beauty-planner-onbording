'use client'

import React from 'react'

type TimeFormat = '12h' | '24h'

export interface TimePickerProps {
  value: string // 'HH:mm'
  onChange: (value: string) => void
  timeFormat?: TimeFormat
  onTimeFormatChange?: (fmt: TimeFormat) => void
  presets?: string[] // array of 'HH:mm'
  label?: string
  helpText?: string
  id?: string
}

function parse(value: string): { h: number; m: number } | null {
  if (!value || typeof value !== 'string') return null
  const parts = value.split(':')
  if (parts.length !== 2) return null
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { h, m }
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function toLabel(value: string, format: TimeFormat = '24h') {
  const t = parse(value)
  if (!t) return ''
  if (format === '24h') return `${pad2(t.h)}:${pad2(t.m)}`
  const isAM = t.h < 12
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12
  return `${h12}:${pad2(t.m)} ${isAM ? 'AM' : 'PM'}`
}

export default function TimePicker({
  value,
  onChange,
  timeFormat = '24h',
  onTimeFormatChange,
  presets = [],
  label,
  helpText,
  id,
}: TimePickerProps) {
  const addMinutes = (start: string, delta: number) => {
    const t = parse(start) || { h: 0, m: 0 }
    const total = (t.h * 60 + t.m + delta + 24 * 60) % (24 * 60)
    const h = Math.floor(total / 60)
    const m = total % 60
    return `${pad2(h)}:${pad2(m)}`
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value // already 'HH:mm'
    onChange(v)
  }

  const selectedLabel = value ? toLabel(value, timeFormat) : ''
  const minutePresetValues = ['00', '15', '30', '45']

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(addMinutes(value || '00:00', -15))}
              className="h-10 w-10 rounded-xl bg-gray-100 text-text-primary hover:bg-gray-200 active:scale-95 transition"
              title="-15 min"
              aria-label="Minus 15 minutes"
            >
              −15
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-text-primary">
                {selectedLabel || toLabel(value || '00:00', timeFormat)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange(addMinutes(value || '00:00', +15))}
              className="h-10 w-10 rounded-xl bg-gray-100 text-text-primary hover:bg-gray-200 active:scale-95 transition"
              title="+15 min"
              aria-label="Plus 15 minutes"
            >
              +15
            </button>
          </div>

          {onTimeFormatChange && (
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold">
              {(['12h', '24h'] as TimeFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onTimeFormatChange(fmt)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    timeFormat === fmt ? 'bg-primary text-white' : 'text-text-secondary'
                  }`}
                  aria-pressed={timeFormat === fmt}
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id={id}
            type="time"
            className="w-full max-w-[260px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg font-semibold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={value}
            step={300}
            onChange={handleInput}
          />
          <button
            type="button"
            onClick={() => onChange(new Date().toTimeString().slice(0,5))}
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-text-secondary hover:border-primary/60"
          >
            Now
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = p === value
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
                }`}
                aria-label={`Set time to ${toLabel(p, timeFormat)}`}
              >
                {toLabel(p, timeFormat)}
              </button>
            )
          })}
          {/* minute presets */}
          {minutePresetValues.map((mm) => {
            const t = parse(value || '00:00') || { h: 0, m: 0 }
            const p = `${pad2(t.h)}:${mm}`
            const active = p === value
            return (
              <button
                key={`m-${mm}`}
                type="button"
                onClick={() => onChange(p)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  active ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
                }`}
                aria-label={`Set minutes to ${mm}`}
              >
                :{mm}
              </button>
            )
          })}
        </div>
      </div>

      {helpText && (
        <p className="mt-2 text-sm text-text-secondary">{helpText}</p>
      )}

      {value && (
        <div className="mt-2 text-sm text-text-secondary">
          Selected: <span className="font-semibold text-text-primary">{selectedLabel}</span>
        </div>
      )}
    </div>
  )
}
