import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AppProviders } from '@/components/providers/AppProviders'
import { AppShell } from '@/components/layout/AppShell'
import { Raleway } from 'next/font/google'

const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' })

export const metadata: Metadata = {
  title: 'Beauty Mirror Web',
  description: 'Beauty planner web client',
  manifest: '/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={raleway.className}>
        <AppProviders>
          <AppShell>
            {children}
          </AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
