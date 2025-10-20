import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import './carousel-styles.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { QueryProvider } from '@/components/QueryProvider'
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Beauty Mirror Quiz',
  },
  formatDetection: {
    telephone: false,
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
        {/* Meta Pixel Base Code */}
        <Script id="fb-pixel-base" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return; n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
              n.queue=[]; t=b.createElement(e); t.async=!0;
              t.src=v; s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            try {
              window.fbq('init', '785592354117222');
              window.fbq('track', 'PageView');
            } catch (e) { /* noop */ }
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=785592354117222&ev=PageView&noscript=1" alt="" />
        </noscript>
        <QueryProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ClientShell>{children}</ClientShell>
            </ErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

