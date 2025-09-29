'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeVariant = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeVariant
  setTheme: (value: ThemeVariant) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'beauty-mirror-theme'

function applyThemeClass(theme: ThemeVariant) {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>('light')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeVariant | null
    const nextTheme = storedTheme === 'dark' ? 'dark' : 'light'
    setThemeState(nextTheme)
    applyThemeClass(nextTheme)
  }, [])

  const setTheme = (value: ThemeVariant) => {
    setThemeState(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
    applyThemeClass(value)
  }

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
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
