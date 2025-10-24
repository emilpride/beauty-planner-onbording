// Force static generation to avoid SSR function deployment; data loads client-side from Firestore.
export const dynamic = 'force-static'

// Generate limited set of static params to enable Next.js export without SSR.
export async function generateStaticParams() {
  // Export +-30 days around today to cover recent navigation.
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const days: { date: string }[] = []
  for (let i = -30; i <= 1; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push({ date: toYMD(d) })
  }
  return days
}

import CalendarDayClient from './CalendarDayClient'

export default function CalendarDayPage({ params }: { params: { date: string } }) {
  return <CalendarDayClient dateString={params.date} />
}
