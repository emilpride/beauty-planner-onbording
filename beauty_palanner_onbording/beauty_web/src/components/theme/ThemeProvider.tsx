"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  accent: string // hex color like #A385E9
  setAccent: (hex: string) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_KEY = 'bm_theme'
const ACCENT_KEY = 'bm_accent'

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!match) return null
  const [, r, g, b] = match
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [accent, setAccentState] = useState<string>('#A385E9')

  // initialize from storage
  useEffect(() => {
    try {
      const storedMode = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system'
      const storedAccent = localStorage.getItem(ACCENT_KEY) || '#A385E9'
      setModeState(storedMode)
      setAccentState(storedAccent)
    } catch {}
  }, [])

  const applyTheme = useCallback((m: ThemeMode) => {
    const effective = m === 'system' ? (getSystemPrefersDark() ? 'dark' : 'light') : m
    const root = document.documentElement
    root.setAttribute('data-theme', effective)
  }, [])

  const applyAccent = useCallback((hex: string) => {
    const rgb = hexToRgb(hex)
    const root = document.documentElement
    if (rgb) {
      root.style.setProperty('--accent', `${rgb[0]} ${rgb[1]} ${rgb[2]}`)
    }
  }, [])

  // apply on mount and when values change
  useEffect(() => {
    if (typeof window === 'undefined') return
    applyTheme(mode)
    applyAccent(accent)

    // react to system changes when in system mode
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener?.('change', handler)
      return () => mq.removeEventListener?.('change', handler)
    }
  }, [mode, accent, applyTheme, applyAccent])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    try { localStorage.setItem(THEME_KEY, m) } catch {}
  }, [])

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex)
    try { localStorage.setItem(ACCENT_KEY, hex) } catch {}
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({ mode, setMode, accent, setAccent }), [mode, setMode, accent, setAccent])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
