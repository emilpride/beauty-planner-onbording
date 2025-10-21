'use client'

import { useTheme } from '@/components/theme/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

/**
 * Floating theme toggle shown on every page (top-right).
 * - Uses ThemeProvider to switch between light/dark
 * - Animates icon swap with rotate/scale/fade
 * - Accessible button with aria-pressed and label
 */
interface ThemeToggleProps {
  inline?: boolean
}

export default function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(true)

  const nextTheme = useMemo(() => (isDark ? 'light' : 'dark'), [isDark])

  const handleToggle = () => setTheme(nextTheme)

  useEffect(() => {
    if (inline) return
    // If sessionStorage is not available, keep it visible (web). Hide only if explicitly not selected yet.
    try {
      const flag = sessionStorage.getItem('themeSelected')
      if (flag === '1') {
        setVisible(true)
      } else {
        // Hide only on quiz flow pages where app bar exists to avoid overlap before selection
        const onQuizFlow = typeof window !== 'undefined' && window.location.pathname.startsWith('/quiz')
        setVisible(!onQuizFlow)
      }
    } catch {
      setVisible(true)
    }
  }, [inline])

  if (inline) {
    return (
      <motion.button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-pressed={isDark}
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface/80 text-text-secondary shadow-soft backdrop-blur transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface/70"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Moon className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Sun className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle radial hover aura */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/0 opacity-0 blur-md transition-all duration-300 group-hover:bg-primary/10 group-hover:opacity-100" />
      </motion.button>
    )
  }

  return (
    <div
      className={`pointer-events-auto fixed right-3 z-[60] sm:right-5 transition-opacity ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        // Place below app bar/progress area
        top: 'max(4.75rem, calc(env(safe-area-inset-top) + 3.75rem))',
        right: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <motion.button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-pressed={isDark}
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface/80 text-text-secondary shadow-soft backdrop-blur transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface/70"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Moon className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Sun className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle radial hover aura */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/0 opacity-0 blur-md transition-all duration-300 group-hover:bg-primary/10 group-hover:opacity-100" />
      </motion.button>
    </div>
  )
}
