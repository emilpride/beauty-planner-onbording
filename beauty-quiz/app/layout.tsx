import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './carousel-styles.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beauty Mirror Quiz - Personalized Wellness Planning',
  description: 'Build your custom Beauty Mirror onboarding experience with guided assessments and AI insights.',
  keywords: 'beauty mirror, wellness quiz, skincare, haircare, personalized plan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={[inter.className, 'antialiased'].join(' ')} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

