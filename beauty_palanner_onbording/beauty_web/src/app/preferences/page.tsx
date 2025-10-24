"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'

export default function PreferencesPage() {
  const PreferenceCard = ({ title }: { title: string }) => (
    <div className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 opacity-60 cursor-not-allowed">
      <h3 className="text-xl font-semibold text-text-primary flex-1">{title}</h3>
      <span className="text-sm text-text-secondary">Coming soon</span>
    </div>
  )

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto space-y-3 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Preferences</h1>
          <PreferenceCard title="App Appearance" />
          <PreferenceCard title="Notifications" />
          <PreferenceCard title="Language & Region" />
          <PreferenceCard title="Privacy" />
          <PreferenceCard title="Data & Storage" />
        </div>
      </PageContainer>
    </Protected>
  )
}
