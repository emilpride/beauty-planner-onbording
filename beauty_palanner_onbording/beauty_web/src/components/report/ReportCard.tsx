import React from 'react'

export function ReportCard({ children, padding = 'p-4 sm:p-6' }: { children: React.ReactNode; padding?: string }) {
  return (
    <section className={`rounded-xl bg-surface border border-border-subtle shadow-sm ${padding}`}>
      {children}
    </section>
  )
}
