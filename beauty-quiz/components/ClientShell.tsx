'use client'

import { ReactNode } from 'react'
import ThemeToggle from '@/components/theme/ThemeToggle'

// Client-only shell rendered within RootLayout to mount global client UI (theme toggle)
export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeToggle />
      {children}
    </>
  )
}
