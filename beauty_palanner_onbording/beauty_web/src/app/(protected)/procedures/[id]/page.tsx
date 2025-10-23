"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
import { ActivityForm } from '@/components/procedures/ActivityForm'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useActivities, useDeleteActivity, useSaveActivity } from '@/hooks/useActivities'
import type { Activity } from '@/types/activity'

export default function EditActivityPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const router = useRouter()
  const { data: activities } = useActivities(user?.uid)
  const save = useSaveActivity()
  const del = useDeleteActivity()

  const current = (activities ?? []).find((a) => a.id === id)
  if (!user) return null

  async function onSubmit(a: Activity) {
    if (!user) return
    await save.mutateAsync({ userId: user.uid, activity: a })
    router.push('/procedures')
  }

  async function onDelete() {
    if (!user) return
    await del.mutateAsync({ userId: user.uid, id })
    router.push('/procedures')
  }

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Edit Activity</h1>
        <section className="card p-6 mt-4 max-w-2xl">
          {current ? (
            <>
              <ActivityForm initial={current} onSubmit={onSubmit} submitLabel="Save" />
              <div className="mt-4">
                <button className="btn btn-outline" onClick={onDelete}>Delete</button>
              </div>
            </>
          ) : (
            <div>Loading…</div>
          )}
        </section>
      </PageContainer>
    </Protected>
  )
}
