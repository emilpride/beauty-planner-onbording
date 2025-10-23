"use client"

import Link from 'next/link'
import type { Route } from 'next'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useActivities, useDeleteActivity } from '@/hooks/useActivities'

export default function ProceduresPage() {
  const { user } = useAuth()
  const { data: activities, isLoading } = useActivities(user?.uid)
  const del = useDeleteActivity()

  return (
    <Protected>
      <PageContainer>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Procedures</h1>
          <Link href={'/procedures/new' as Route} className="btn">New</Link>
        </div>
        <section className="card p-4 mt-4">
          {isLoading ? (
            <div>Loading…</div>
          ) : (
            <ul className="divide-y divide-base-200">
              {(activities ?? []).map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm opacity-60">{a.category ?? '—'} • {a.type} • {a.time ? `${String(a.time.hour).padStart(2,'0')}:${String(a.time.minute).padStart(2,'0')}` : '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="btn btn-sm btn-outline" href={("/procedures/" + a.id) as Route}>Edit</Link>
                    <button className="btn btn-sm btn-outline" onClick={() => user && del.mutate({ userId: user.uid, id: a.id })}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageContainer>
    </Protected>
  )
}
