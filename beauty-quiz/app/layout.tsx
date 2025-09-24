import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './carousel-styles.css' // Import carousel styles

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beauty Mirror Quiz - Персонализированный уход за кожей',
  description: 'Пройдите квиз и получите персональные рекомендации по уходу за кожей от Beauty Mirror',
  keywords: 'уход за кожей, красота, персонализация, квиз, Beauty Mirror',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          {children}
        </div>
      </body>
    </html>
  )
}
