"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import type { Route } from 'next'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'

// Language selector hidden for now

type HeaderProps = { onBurger?: () => void }

export function DashboardHeader({ onBurger }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  // const [language, setLanguage] = useState('en')
  // const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const { user } = useAuth()
  const { data: profile } = useUserProfile(user?.uid)
  const avatarUrl = profile?.profilePicture || user?.photoURL || ''
  const isAvatarProcessing = profile?.avatarStatus === 'processing'
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

  // const currentLang = languages.find((l) => l.code === language) || languages[0]

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
          {/* Language Selector - temporarily hidden */}

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
              {isAvatarProcessing ? (
                <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] leading-none ring-2 ring-white dark:ring-gray-800">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>processing</span>
                </div>
              ) : (
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
