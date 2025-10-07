'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme/ThemeProvider'
import ThemeToggle from '@/components/theme/ThemeToggle'

interface BurgerMenuProps {
  inline?: boolean // inline renders the button in-flow (e.g., inside headers). When false, it's fixed at top-right.
}

export default function BurgerMenu({ inline }: BurgerMenuProps) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const nextTheme = useMemo(() => (isDark ? 'light' : 'dark'), [isDark])
  const pathname = usePathname()
  const onQuiz = pathname?.startsWith('/quiz')
  // Hide global (non-inline) burger on quiz pages to avoid duplication with app bar menu
  const hidden = !inline && onQuiz

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])


  // After all hooks ran consistently, we can return null safely
  if (hidden) return null

  const buttonClasses = `inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface/80 ${open ? (isDark ? 'text-white' : 'text-text-primary') : 'text-text-secondary'} shadow-soft backdrop-blur transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface/70 ${open ? 'md:opacity-0 md:pointer-events-none' : ''} ${inline ? (open ? 'fixed right-3 top-3 z-[1001] md:static md:z-auto' : 'relative z-[101]') : 'relative z-[101]'}`

  const button = (
    <button
      type="button"
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      className={buttonClasses}
      style={inline && open ? { right: 'max(0.75rem, env(safe-area-inset-right))', top: 'max(0.75rem, env(safe-area-inset-top))' } : undefined}
    >
      {/* Hamburger to X animation (centered lines) */}
      <span className="relative block h-5 w-6">
        <motion.span
          className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-current origin-center"
          initial={false}
          animate={open ? { y: 0, rotate: 45 } : { y: -6, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        />
        <motion.span
          className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-current origin-center"
          initial={false}
          animate={open ? { opacity: 0, scaleX: 0.5 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.18 }}
        />
        <motion.span
          className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-current origin-center"
          initial={false}
          animate={open ? { y: 0, rotate: -45 } : { y: 6, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        />
      </span>
    </button>
  )

  const containerClass = inline
    ? 'relative'
    : 'pointer-events-auto fixed right-3 top-3 z-[100] sm:right-5 sm:top-4'

  const containerStyle = inline
    ? undefined
    : { right: 'max(0.75rem, env(safe-area-inset-right))', top: 'max(0.75rem, env(safe-area-inset-top))' }

  return (
    <div className={containerClass} style={containerStyle}>
      {button}

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[59] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed right-0 top-0 z-[60] h-full w-[84vw] max-w-[360px] bg-surface/95 backdrop-blur border-l border-border-subtle shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/60">
              <span className="text-sm font-semibold text-text-secondary">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
              >
                {/* X icon using same lines to keep consistency */}
                <span className="relative block h-4 w-4">
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rotate-45 rounded bg-current" />
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-45 rounded bg-current" />
                </span>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Theme Switch */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/60 bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Theme</p>
                  <p className="text-xs text-text-secondary">{isDark ? 'Dark' : 'Light'} mode</p>
                </div>
                <ThemeToggle inline />
              </div>

              {/* Links */}
              <nav className="space-y-2">
                {[
                  { label: 'Home', href: 'https://beautymirror.app' },
                  { label: 'About', href: 'https://beautymirror.app/about' },
                  { label: 'Contact', href: 'https://beautymirror.app/contact' },
                  { label: 'Terms', href: 'https://beautymirror.app/terms' },
                  { label: 'Privacy', href: 'https://beautymirror.app/privacy' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border-subtle/60 bg-surface px-4 py-3 text-sm text-text-primary hover:bg-surface-muted"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="text-text-tertiary">↗</span>
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
