"use client"

import { usePathname } from 'next/navigation'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useState } from 'react'

type Props = { children: React.ReactNode }

export function AppShell({ children }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password'

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onBurger={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
