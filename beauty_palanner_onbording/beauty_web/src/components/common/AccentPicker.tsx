"use client"

import { useAccentColor } from '@/hooks/useAccentColor'

const PRESET_ACCENTS = ['#A385E9', '#22c55e', '#3b82f6', '#ef4444', '#f59e0b']

export function AccentPicker() {
  const { accent, setAccent } = useAccentColor()
  return (
    <div className="flex items-center gap-4">
      <input
        type="color"
        aria-label="Accent color"
        value={accent}
        onChange={(e) => setAccent((e.target as HTMLInputElement).value)}
        className="h-10 w-16 rounded border"
      />
      <div className="flex flex-wrap gap-2">
        {PRESET_ACCENTS.map((hex) => (
          <button
            key={hex}
            onClick={() => setAccent(hex)}
            className="h-8 w-8 rounded-full border"
            style={{ backgroundColor: hex, outline: accent === hex ? '2px solid rgb(var(--accent))' : undefined }}
            title={hex}
          />
        ))}
      </div>
    </div>
  )
}
