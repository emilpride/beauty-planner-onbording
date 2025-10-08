'use client'

import { ReactNode } from 'react'
import BurgerMenu from '@/components/ui/BurgerMenu'
import { usePathname } from 'next/navigation'

// Client-only shell rendered within RootLayout to mount global client UI (theme toggle)
export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideBurger = pathname === '/'
  return (
    <>
      {/* Global hamburger menu (also used inline inside quiz app bar) */}
      {!hideBurger && <BurgerMenu />}
      {children}
    </>
  )
}
