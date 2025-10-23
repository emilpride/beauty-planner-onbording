import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AppProviders } from '@/components/providers/AppProviders'
import { AppHeader } from '@/components/common/AppHeader'

export const metadata: Metadata = {
  title: 'Beauty Mirror Web',
  description: 'Beauty planner web client',
  manifest: '/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
