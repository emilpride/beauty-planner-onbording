"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { TaskList } from '@/components/dashboard/TaskList'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesForDate } from '@/hooks/useUpdates'

function parseDateParam(v: string | string[] | undefined): Date | null {
  const s = Array.isArray(v) ? v[0] : v
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export default function CalendarDayPage({ params }: { params: { date: string } }) {
  const { user } = useAuth()
  const date = parseDateParam(params?.date) ?? new Date()
  const { data } = useUpdatesForDate(user?.uid, date)
  const items = (data?.items ?? [])
  const pretty = date.toLocaleDateString()

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">{pretty}</h1>
        <div className="mt-4">
          <TaskList title="Tasks" items={items} />
        </div>
      </PageContainer>
    </Protected>
  )
}
