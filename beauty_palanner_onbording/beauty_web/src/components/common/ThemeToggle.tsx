"use client"

import { useTheme, type ThemeMode } from '@/components/theme/ThemeProvider'

const MODES: ThemeMode[] = ['light', 'dark', 'system']

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  return (
    <div className="flex gap-3">
      {MODES.map((m) => (
        <button
          key={m}
          className={`chip ${mode === m ? 'ring-2 ring-[rgb(var(--accent))]' : ''}`}
          onClick={() => setMode(m)}
        >
          {m[0].toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  )
}
