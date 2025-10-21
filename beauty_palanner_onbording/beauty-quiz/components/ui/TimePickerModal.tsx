'use client'

import React, { useEffect, useState } from 'react'
import TimePicker, { type TimePickerProps } from './TimePicker'

interface TimePickerModalProps {
  open: boolean
  title?: string
  value: string
  onCancel: () => void
  onApply: (value: string, fmt?: '12h' | '24h') => void
  timeFormat?: '12h' | '24h'
  onTimeFormatChange?: (fmt: '12h' | '24h') => void
}

export default function TimePickerModal({
  open,
  title = 'Select time',
  value,
  onCancel,
  onApply,
  timeFormat = '24h',
  onTimeFormatChange,
}: TimePickerModalProps) {
  const [localValue, setLocalValue] = useState<string>(value)
  const [localFormat, setLocalFormat] = useState<'12h' | '24h'>(timeFormat)

  useEffect(() => {
    if (open) {
      setLocalValue(value)
      setLocalFormat(timeFormat)
    }
  }, [open, value, timeFormat])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:w-auto sm:min-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-3 rounded-lg text-sm text-text-secondary hover:bg-gray-100"
            aria-label="Close"
          >
            Cancel
          </button>
        </div>

        <TimePicker
          value={localValue}
          onChange={setLocalValue}
          timeFormat={localFormat}
          onTimeFormatChange={onTimeFormatChange ? (fmt) => { setLocalFormat(fmt); onTimeFormatChange?.(fmt) } : undefined}
          presets={[]}
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onApply(localValue, onTimeFormatChange ? localFormat : undefined)}
            className="flex-1 h-11 rounded-xl text-white font-semibold shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
