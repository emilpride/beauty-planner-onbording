"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import type { Route } from 'next'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
]

type HeaderProps = { onBurger?: () => void }

export function DashboardHeader({ onBurger }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState('en')
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const { user } = useAuth()
  const { data: profile } = useUserProfile(user?.uid)
  const avatarUrl = profile?.profilePicture || user?.photoURL || ''
  const fallbackInitial = (profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  return (
    <header className="sticky top-0 z-10 h-16 border-b border-border-subtle bg-surface shadow-sm backdrop-blur">
      <div className="flex items-center justify-between h-full px-6">
        {/* Page Title / Breadcrumb placeholder */}
        <div className="flex items-center gap-3">
          {/* Mobile burger menu button */}
          <button
            type="button"
            onClick={() => onBurger?.()}
            className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover transition"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-primary">
              <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        </div>

        {/* Right side: Profile + Language + Theme */}
        <div className="flex items-center gap-4">
          {/* Language Selector - Dropdown (desktop only) */}
          <div className="relative hidden sm:inline-block">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">{currentLang.label}</span>
              <svg
                className={`w-4 h-4 text-text-secondary transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isLanguageOpen && (
              <div className="absolute top-full mt-2 right-0 bg-surface border border-border-subtle rounded-lg shadow-lg overflow-hidden min-w-[180px] z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setIsLanguageOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors ${
                      language === lang.code ? 'bg-[#A385E9]/10' : ''
                    }`}
                  >
                    <div className="flex-1 text-left text-sm font-medium text-text-primary">{lang.label}</div>
                    {language === lang.code && (
                      <svg className="w-4 h-4 text-[#A385E9]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle - Single animated icon */}
          <button
            onClick={toggleTheme}
            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-border-subtle bg-[#E9E9F5] dark:bg-[#2A2A3E] hover:shadow-md transition"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            <AnimatePresence initial={false} mode="wait">
              {theme === 'light' ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="text-[#FFB800]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 15.2614 9.23858 17.5 12 17.5ZM12 5.5V3M12 22V19.5M19.0708 6.42923L20.4851 5.01501M3.51489 20.9851L4.92911 19.5709M21 12.5H18.5M5.5 12.5H3M19.0708 18.5708L20.4851 19.985M3.51489 4.01501L4.92911 5.42923" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="text-[#A385E9]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Profile */}
          <Link href={'/account' as Route} className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-text-primary">{profile?.name || user?.displayName || '—'}</div>
              <div className="text-xs text-text-secondary">{`Level ${profile?.level ?? 1}`}</div>
            </div>
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full ring-2 ring-white shadow-md dark:ring-gray-800">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={profile?.name || user?.displayName || 'User avatar'}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#A385E9] to-[#E8B1EB] text-sm font-bold text-white grid place-items-center">
                    {fallbackInitial}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
