"use client"

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: '/icons/misc/home_icon.svg', tint: '#A385E9' },
  { href: '/calendar', label: 'Calendar', icon: '/icons/misc/calendar_icon.svg', tint: '#6366F1' },
  { href: '/moods', label: 'Moods', icon: '/icons/mood.svg', tint: '#FFCC66' },
  { href: '/report', label: 'Report', icon: '/icons/misc/report_icon.svg', tint: '#2AC4CF' },
  { href: '/procedures', label: 'Procedures', icon: '/icons/activities.svg', tint: '#969AB7' },
  { href: '/preferences', label: 'Preferences', icon: '/icons/preferences.svg', tint: '#969AB7' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const idx = items.findIndex((it) => pathname?.startsWith(it.href))
    if (idx !== -1) {
      setActiveIndex(idx)
    }
  }, [pathname])
  
  return (
    <aside 
      className={`sticky top-0 h-screen shrink-0 border-r border-border-subtle bg-surface shadow-[10px_14px_56px_rgba(0,0,0,0.12)] flex flex-col items-start py-6 transition-all duration-300 ${
        expanded ? 'w-[240px]' : 'w-[72px]'
      }`}
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
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-auto text-text-secondary hover:text-text-primary transition"
            aria-label="Collapse sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="absolute left-[60px] top-8 bg-surface border border-border-subtle rounded-full p-1 shadow-md hover:shadow-lg transition z-10"
            aria-label="Expand sidebar"
          >
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav ref={navRef} className="flex-1 flex flex-col gap-2 overflow-y-auto w-full px-3 relative">
        {/* Animated background indicator */}
        {itemRefs.current[activeIndex] && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-3 bg-[rgb(var(--accent))] rounded-lg"
            initial={false}
            animate={{
              top: itemRefs.current[activeIndex]?.offsetTop ?? 0,
              height: itemRefs.current[activeIndex]?.offsetHeight ?? 44,
              width: expanded 
                ? (itemRefs.current[activeIndex]?.offsetWidth ?? 0) 
                : 44,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          />
        )}

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
                  ? 'text-white' 
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
                  className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} object-contain shrink-0`}
                  style={{ filter: active ? 'brightness(0) invert(1)' : 'none' }}
                />
              ) : (
                <span className="text-[18px] leading-none shrink-0" aria-hidden>
                  {it.icon}
                </span>
              )}
              {expanded && (
                <span className="font-medium text-sm whitespace-nowrap">{it.label}</span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="w-full px-3 mt-4">
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
  )
}
