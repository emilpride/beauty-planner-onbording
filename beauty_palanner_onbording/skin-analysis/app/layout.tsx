import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Skin Analysis',
  description: 'Advanced skin analysis powered by Face++',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
