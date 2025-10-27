"use client"

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { AnimatePresence, motion } from 'framer-motion'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: '/icons/misc/home_icon.svg', tint: '#A385E9' },
  { href: '/calendar', label: 'Calendar', icon: '/icons/misc/calendar_icon.svg', tint: '#6366F1' },
  { href: '/moods', label: 'Moods', icon: '/icons/mood.svg', tint: '#FFCC66' },
  { href: '/report', label: 'Report', icon: '/icons/misc/report_icon.svg', tint: '#2AC4CF' },
  { href: '/procedures', label: 'Procedures', icon: '/icons/activities.svg', tint: '#969AB7' },
  { href: '/preferences', label: 'Preferences', icon: '/icons/preferences.svg', tint: '#969AB7' },
]

type Props = { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }

export function SidebarNav({ mobileOpen, setMobileOpen }: Props) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  // Mobile-only controls
  const { mode, setMode } = useTheme()
  const [systemDark, setSystemDark] = useState<boolean>(() => (typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)').matches : false))
  const isDark = useMemo(() => mode === 'dark' || (mode === 'system' && systemDark), [mode, systemDark])
  const [language, setLanguage] = useState<string>(() => (typeof window !== 'undefined' ? (localStorage.getItem('language') || 'en') : 'en'))

  // Active item handled by matching pathname directly
  
  // Persist language for parity with header mock
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('language', language)
  }, [language])
  
  // Track system color scheme to derive effective theme when mode === 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    setSystemDark(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const toggleTheme = () => {
    // Force switch between light and dark; overrides system mode if set
    setMode(isDark ? 'light' : 'dark')
  }
  
  return (
    <>
      {/* Desktop sidebar (hover to expand) */}
      <aside
        className={`hidden sm:flex sticky top-0 h-screen shrink-0 border-r border-border-subtle bg-surface shadow-[10px_14px_56px_rgba(0,0,0,0.12)] flex-col items-start py-6 transition-all duration-200 ${
          expanded ? 'w-[240px]' : 'w-[72px]'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
      {/* Logo and Toggle */}
      <div className={`flex items-center gap-3 mb-10 ${expanded ? 'px-4' : 'justify-center w-full'}`}>
        <Link href="/" className="h-14 w-14 rounded-2xl bg-[rgb(var(--accent))] text-white grid place-items-center font-bold overflow-hidden shrink-0">
          <Image
            src="/logo.png"
            alt="Beauty Mirror"
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav ref={navRef} className="flex-1 flex flex-col gap-2 overflow-y-auto w-full px-3 relative">
        {items.map((it, idx) => {
          const active = pathname?.startsWith(it.href)
          const isImage = it.icon.endsWith('.svg') || it.icon.endsWith('.png')
          return (
            <Link
              key={it.href}
              ref={(el) => { itemRefs.current[idx] = el }}
              href={it.href as Route}
              className={`relative z-10 flex items-center gap-3 rounded-lg transition ${
                expanded ? 'px-3 py-2.5' : 'justify-center h-11 w-11 mx-auto'
              } ${
                active 
                  ? 'bg-[rgb(var(--accent))] text-white' 
                  : 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
              title={!expanded ? it.label : undefined}
              aria-current={active ? 'page' : undefined}
            >
              {isImage ? (
                <Image
                  src={it.icon}
                  alt={it.label}
                  width={24}
                  height={24}
                  className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
                  style={{ filter: active ? 'brightness(0) invert(1)' : 'grayscale(1) brightness(0.9)' }}
                />
              ) : (
                <span className="text-[18px] leading-none shrink-0" aria-hidden>
                  {it.icon}
                </span>
              )}
              {expanded && (
                <span className="font-medium text-sm whitespace-nowrap transition-opacity duration-200 opacity-90">{it.label}</span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer links (hidden when collapsed; appear after hover-expand) */}
      {expanded && (
        <div className="w-full px-3 mt-2 mb-2" aria-label="Legal and info links">
          <div className="px-1 flex flex-col gap-1 text-xs text-text-secondary/80">
            <a href="https://beautymirror.app/terms" target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md hover:bg-surface-hover">Terms of Service</a>
            <a href="https://beautymirror.app/privacy" target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md hover:bg-surface-hover">Privacy Policy</a>
            <a href="https://beautymirror.app/contact" target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md hover:bg-surface-hover">Contact</a>
            <a href="https://beautymirror.app/about" target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md hover:bg-surface-hover">About</a>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="w-full px-3 mt-2">
        <button 
          onClick={() => logout()}
          className={`flex items-center gap-3 rounded-lg text-red-500 border border-border-subtle hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition ${
            expanded ? 'px-3 py-2.5 w-full' : 'justify-center h-11 w-11 mx-auto'
          }`}
          title={!expanded ? 'Logout' : undefined}
          aria-label="Logout"
        >
          <Image
            src="/icons/logout.svg"
            alt="Logout"
            width={24}
            height={24}
            className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} object-contain shrink-0`}
          />
          {expanded && (
            <span className="font-medium text-sm whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
      </aside>

      {/* Mobile sidebar (burger menu) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[84vw] max-w-[300px] bg-surface border-r border-border-subtle shadow-2xl flex flex-col items-start py-6 px-3"
            >
              <div className="flex items-center gap-3 mb-8 w-full">
                <Link href="/" className="h-12 w-12 rounded-2xl bg-[rgb(var(--accent))] text-white grid place-items-center font-bold overflow-hidden shrink-0">
                  <Image src="/logo.png" alt="Beauty Mirror" width={48} height={48} className="w-full h-full object-cover" />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="ml-auto h-10 w-10 grid place-items-center rounded-xl border border-border-subtle hover:bg-surface-hover"
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <nav ref={navRef} className="flex-1 flex flex-col gap-2 overflow-y-auto w-full relative">
                {items.map((it, _idx) => {
                  const active = pathname?.startsWith(it.href)
                  const isImage = it.icon.endsWith('.svg') || it.icon.endsWith('.png')
                  return (
                    <Link
                      key={it.href}
                      href={it.href as Route}
                      onClick={() => setMobileOpen(false)}
                      className={`relative z-10 flex items-center gap-3 rounded-lg transition px-3 py-2.5 ${
                        active ? 'bg-[rgb(var(--accent))] text-white' : 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      {isImage ? (
                        <Image
                          src={it.icon}
                          alt={it.label}
                          width={20}
                          height={20}
                          className={`w-5 h-5 object-contain shrink-0`}
                          style={{ filter: active ? 'brightness(0) invert(1)' : 'grayscale(1) brightness(0.9)' }}
                        />
                      ) : (
                        <span className="text-[18px] leading-none shrink-0" aria-hidden>
                          {it.icon}
                        </span>
                      )}
                      <span className="font-medium text-sm whitespace-nowrap">{it.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="w-full mt-4">
                <div className="mb-3 text-xs text-text-secondary/80">
                  <a href="https://beautymirror.app/terms" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded-md hover:bg-surface-hover">Terms</a>
                  <a href="https://beautymirror.app/privacy" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded-md hover:bg-surface-hover">Privacy</a>
                  <a href="https://beautymirror.app/contact" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded-md hover:bg-surface-hover">Contact</a>
                  <a href="https://beautymirror.app/about" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 rounded-md hover:bg-surface-hover">About</a>
                </div>
                {/* Mobile-only language and theme controls */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {['en','de','es'].map((code) => (
                      <button key={code} onClick={() => setLanguage(code)} className={`px-3 py-1.5 rounded-lg text-xs border ${language===code? 'bg-[rgb(var(--accent))] text-white border-transparent':'bg-surface hover:bg-surface-hover border-border-subtle text-text-primary'}`}>
                        {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button onClick={toggleTheme} className="h-9 w-9 grid place-items-center rounded-lg border border-border-subtle hover:bg-surface-hover" aria-label="Toggle theme">
                    {isDark ? (
                      <svg className="w-5 h-5 text-[#A385E9]" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#FFB800]" viewBox="0 0 24 24" fill="none"><path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 15.2614 9.23858 17.5 12 17.5ZM12 5.5V3M12 22V19.5M19.0708 6.42923L20.4851 5.01501M3.51489 20.9851L4.92911 19.5709M21 12.5H18.5M5.5 12.5H3M19.0708 18.5708L20.4851 19.985M3.51489 4.01501L4.92911 5.42923" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="w-full flex items-center gap-3 rounded-lg text-red-500 border border-border-subtle hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition px-3 py-2.5"
                >
                  <Image src="/icons/logout.svg" alt="Logout" width={20} height={20} className="w-5 h-5 object-contain shrink-0 icon-auto" />
                  <span className="font-medium text-sm whitespace-nowrap">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
