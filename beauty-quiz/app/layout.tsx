import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './carousel-styles.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import ClientShell from '@/components/ClientShell'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beauty Mirror Quiz - Personalized Wellness Planning',
  description: 'Build your custom Beauty Mirror onboarding experience with guided assessments and AI insights.',
  keywords: 'beauty mirror, wellness quiz, skincare, haircare, personalized plan',
  icons: {
    icon: '/logos/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={[inter.className, 'antialiased'].join(' ')} suppressHydrationWarning>
        <ThemeProvider>
          <ErrorBoundary>
            <ClientShell>{children}</ClientShell>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

