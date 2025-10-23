"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AccentPicker } from '@/components/common/AccentPicker'

export default function AccountAppearancePage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">App Appearance</h1>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Theme</h2>
        <ThemeToggle />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Accent color</h2>
        <AccentPicker />
        <div>
          <button className="btn">Apply</button>
        </div>
      </section>
    </PageContainer>
  )
}
