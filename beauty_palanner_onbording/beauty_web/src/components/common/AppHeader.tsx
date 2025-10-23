"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import React from 'react'

export function AppHeader() {
  const { user, logout, loading } = useAuth()
  const [open, setOpen] = React.useState(false)
  return (
    <header className="border-b border-surface">
      <div className="container-page h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">Beauty Mirror</Link>
        <div className="flex items-center gap-3">
          <button className="chip sm:hidden" aria-label="Menu" onClick={() => setOpen(v => !v)}>
            Menu
          </button>
          <nav className={`sm:flex items-center gap-3 ${open ? 'flex' : 'hidden'} sm:!flex`}>
            <Link className="chip" href="/dashboard">Dashboard</Link>
            <Link className="chip" href="/calendar">Calendar</Link>
            <Link className="chip" href="/achievements">Achievements</Link>
            <Link className="chip" href="/report">Report</Link>
            <Link className="chip" href="/procedures">Procedures</Link>
            <Link className="chip" href="/assistant">Assistant</Link>
            <Link className="chip" href="/moods">Moods</Link>
            <Link className="chip" href="/account">Account</Link>
            {!loading && (
              user ? (
                <button className="chip" onClick={() => logout()}>Logout</button>
              ) : (
                <Link className="chip" href="/login">Login</Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
