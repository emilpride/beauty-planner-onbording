"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { ActivityForm } from '@/components/procedures/ActivityForm'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useSaveActivity } from '@/hooks/useActivities'
import { v4 as uuidv4 } from 'uuid'
import type { Activity } from '@/types/activity'

export default function NewActivityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const save = useSaveActivity()

  const initial: Activity = {
    id: uuidv4(),
    name: '',
    type: 'regular',
    activeStatus: true,
    time: { hour: 7, minute: 0 },
    frequency: 'daily',
  }

  async function onSubmit(a: Activity) {
    if (!user) return
    await save.mutateAsync({ userId: user.uid, activity: a })
    router.push('/procedures')
  }

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">New Activity</h1>
        <section className="card p-6 mt-4 max-w-2xl">
          <ActivityForm initial={initial} onSubmit={onSubmit} submitLabel="Create" />
        </section>
      </PageContainer>
    </Protected>
  )
}
