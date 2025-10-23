import React from 'react'

export function ReportCard({ children, padding = 'p-4 sm:p-6' }: { children: React.ReactNode; padding?: string }) {
  return (
    <section className={`rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${padding}`}>
      {children}
    </section>
  )
}
