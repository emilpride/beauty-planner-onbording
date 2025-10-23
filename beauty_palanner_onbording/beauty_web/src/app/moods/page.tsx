"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useMoodsInRange, useUpsertMood } from '@/hooks/useMoods'
import React from 'react'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) }

export default function MoodsPage() {
  const { user } = useAuth()
  const [date, setDate] = React.useState(new Date())
  const [mood, setMood] = React.useState(0)
  const [feeling, setFeeling] = React.useState('')
  const { data: entries, isLoading } = useMoodsInRange(user?.uid, startOfMonth(date), endOfMonth(date))
  const upsert = useUpsertMood(user?.uid)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    upsert.mutate({ date, mood, feeling })
  }

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Moods</h1>
        <section className="card p-4 mb-6">
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-70">Date</span>
              <input type="date" className="chip" value={toInputDate(date)} onChange={(e) => setDate(new Date(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-70">Mood (1-3)</span>
              <input type="number" min={1} max={3} className="chip" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm opacity-70">Feeling</span>
              <input type="text" className="chip" value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="Optional" />
            </label>
            <div>
              <button className="btn" disabled={upsert.isPending}>Save</button>
            </div>
          </form>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-2">This month</h2>
          {isLoading ? (
            <div>Loading…</div>
          ) : (
            <ul className="divide-y">
              {entries?.map((e) => (
                <li key={e.id} className="py-2 flex items-center justify-between">
                  <span className="opacity-70">{formatDate(e.date)}</span>
                  <span>mood {e.mood}{e.feeling ? ` — ${e.feeling}` : ''}</span>
                </li>
              ))}
              {!entries?.length && <li className="py-2 opacity-70">No entries yet.</li>}
            </ul>
          )}
        </section>
      </PageContainer>
    </Protected>
  )
}

function toInputDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(d: Date) {
  return d.toLocaleDateString()
}
