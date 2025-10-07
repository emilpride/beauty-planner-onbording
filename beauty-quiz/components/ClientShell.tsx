'use client'

import { ReactNode } from 'react'
import BurgerMenu from '@/components/ui/BurgerMenu'

// Client-only shell rendered within RootLayout to mount global client UI (theme toggle)
export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Global hamburger menu (also used inline inside quiz app bar) */}
      <BurgerMenu />
      {children}
    </>
  )
}
