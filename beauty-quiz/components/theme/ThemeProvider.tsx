'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeVariant = 'light' | 'dark'
export type PrimaryColor = 'purple' | 'red' | 'blue' | 'green' | 'pink'

interface ThemeContextValue {
  theme: ThemeVariant
  setTheme: (value: ThemeVariant) => void
  primaryColor: PrimaryColor
  setPrimaryColor: (value: PrimaryColor) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'beauty-mirror-theme'
const COLOR_STORAGE_KEY = 'beauty-mirror-primary-color'

// Map our semantic color choices to RGB values (space-separated) used by Tailwind via CSS var
const PRIMARY_COLOR_MAP: Record<PrimaryColor, string> = {
  // default current brand purple
  purple: '138 96 255', // approx #8A60FF
  red: '239 68 68',     // tailwind red-500 #EF4444
  blue: '59 130 246',   // tailwind blue-500 #3B82F6
  green: '34 197 94',   // tailwind green-500 #22C55E
  pink: '236 72 153',   // tailwind pink-500 #EC4899
}

function applyThemeClass(theme: ThemeVariant) {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.setAttribute('data-theme', theme)
}

function applyPrimaryColor(color: PrimaryColor) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const rgb = PRIMARY_COLOR_MAP[color] || PRIMARY_COLOR_MAP.purple
  // Inline style has higher precedence than stylesheet .dark overrides
  root.style.setProperty('--color-primary', rgb)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>('light')
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>('purple')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeVariant | null
    const nextTheme = storedTheme === 'dark' ? 'dark' : 'light'
    setThemeState(nextTheme)
    applyThemeClass(nextTheme)

    const storedColor = (window.localStorage.getItem(COLOR_STORAGE_KEY) as PrimaryColor | null) || 'purple'
    setPrimaryColorState(storedColor)
    applyPrimaryColor(storedColor)
  }, [])

  const setTheme = (value: ThemeVariant) => {
    setThemeState(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
    applyThemeClass(value)
  }

  const setPrimaryColor = (value: PrimaryColor) => {
    setPrimaryColorState(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COLOR_STORAGE_KEY, value)
    }
    applyPrimaryColor(value)
  }

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      primaryColor,
      setPrimaryColor,
    }),
    [theme, primaryColor]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
