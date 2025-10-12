'use client'

import AnimatedBackground from '@/components/AnimatedBackground'
import { useTheme, type ThemeVariant } from '@/components/theme/ThemeProvider'
import { Sparkles, Sun, Moon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { logQuizStart, logThemeSelected } from '@/lib/quizEvents'

export default function ThemeSelectionPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTheme, setActiveTheme] = useState<ThemeVariant>(theme)
  const { sessionId, setAnswer } = useQuizStore()
  const [isContinuing, setIsContinuing] = useState(false)
  useEffect(() => {
    setActiveTheme(theme)
  }, [theme])


  // Flag to avoid logging quiz start multiple times
  const [quizStarted, setQuizStarted] = useState(false)

  const isDark = activeTheme === 'dark'

  const handleSelect = (mode: ThemeVariant) => {
    if (mode === activeTheme) return
    setActiveTheme(mode)
    setTheme(mode)
  }

  const toggle = () => handleSelect(isDark ? 'light' : 'dark')

  const handleContinue = async () => {
    if (isContinuing) return
    setIsContinuing(true)
    try {
      sessionStorage.setItem('themeSelected', '1')
    } catch {}
    if (!quizStarted) {
      await logQuizStart(sessionId)
      setQuizStarted(true)
      // Set quizStartTime
      setAnswer('quizStartTime', new Date().toISOString())
    }
    await logThemeSelected(sessionId, activeTheme)
    setAnswer('theme', activeTheme)
    router.push('/welcome')
    // small grace to avoid double taps before navigation completes
    setTimeout(() => setIsContinuing(false), 1200)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-500">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl space-y-12 text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle/60 bg-surface/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" /> Personalize your experience
            </span>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Choose the mood that feels right
            </h1>
            <p className="mx-auto max-w-xl text-base text-text-secondary sm:text-lg">
              Pick between light and dark. We’ll remember your choice, and you can switch it anytime in settings.
            </p>
          </div>

          <div className="space-y-10">
            <motion.div
              className="mx-auto h-24 w-full max-w-lg rounded-full border border-border-subtle/70 bg-surface/80 p-3 shadow-soft backdrop-blur"
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div
                className="relative flex h-full w-full items-center rounded-full px-6"
                role="switch"
                aria-checked={isDark}
                tabIndex={0}
                onClick={toggle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggle()
                  }
                }}
              >
                <motion.div
                  layout
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25,
                    mass: 0.8
                  }}
                  className={`absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-full bg-primary/15 shadow-elevated ${
                    isDark ? 'right-1' : 'left-1'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />

                <motion.button
                  type="button"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation()
                    handleSelect('light')
                  }}
                  className={`z-10 flex flex-1 items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                    isDark ? 'text-text-secondary' : 'text-text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: isDark ? 0 : 360,
                      scale: isDark ? 0.9 : 1.1
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                  <motion.span
                    animate={{ 
                      opacity: isDark ? 0.6 : 1,
                      scale: isDark ? 0.95 : 1.05
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    Light
                  </motion.span>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation()
                    handleSelect('dark')
                  }}
                  className={`z-10 flex flex-1 items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                    isDark ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.span
                    animate={{ 
                      opacity: isDark ? 1 : 0.6,
                      scale: isDark ? 1.05 : 0.95
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    Dark
                  </motion.span>
                  <motion.div
                    animate={{ 
                      rotate: isDark ? 360 : 0,
                      scale: isDark ? 1.1 : 0.9
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>


            <motion.button
              onClick={handleContinue}
              disabled={isContinuing}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-base font-semibold text-white shadow-soft transition-all duration-200 ${
                isContinuing
                  ? 'bg-primary/70 cursor-wait'
                  : 'bg-primary hover:scale-[1.02] hover:shadow-elevated'
              }`}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {isContinuing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
              )}
              <motion.span
                key={isDark ? 'dark' : 'light'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isContinuing ? 'Loading…' : `Continue in ${isDark ? 'Dark' : 'Light'} Mode`}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
