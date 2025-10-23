"use client"

import type { TaskInstance } from '@/types/task'
import { useUpdateActions } from '@/hooks/useUpdates'
import { useAuth } from '@/hooks/useAuth'

export function TaskList({ title, items }: { title: string; items: TaskInstance[] }) {
  const { user } = useAuth()
  const { complete, skip } = useUpdateActions()

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-sm opacity-60">{items.length} tasks</div>
      </div>
      {items.length === 0 ? (
        <div className="opacity-60 text-sm">Nothing here</div>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded border border-base-200 p-2">
              <div>
                <div className="font-medium">{t.activityId}</div>
                <div className="text-xs opacity-60">
                  {t.date}
                  {t.time ? ` • ${String(t.time.hour).padStart(2, '0')}:${String(t.time.minute).padStart(2, '0')}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm btn-success"
                  disabled={!user || complete.isPending}
                  onClick={() => user && complete.mutate({ userId: user.uid, id: t.id })}
                >
                  Complete
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={!user || skip.isPending}
                  onClick={() => user && skip.mutate({ userId: user.uid, id: t.id })}
                >
                  Skip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
