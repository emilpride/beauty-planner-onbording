"use client"

import { useState } from 'react'
import type { Activity } from '@/types/activity'

export function ActivityForm({ initial, onSubmit, submitLabel = 'Save' }: {
  initial: Activity
  onSubmit: (a: Activity) => void | Promise<void>
  submitLabel?: string
}) {
  const [form, setForm] = useState<Activity>({ ...initial })
  const [saving, setSaving] = useState(false)

  function set<K extends keyof Activity>(key: K, val: Activity[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ ...form, lastModifiedAt: new Date() } as Activity)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-control">
          <div className="label"><span className="label-text">Name</span></div>
          <input className="input input-bordered" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label className="form-control">
          <div className="label"><span className="label-text">Category</span></div>
          <input className="input input-bordered" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="form-control">
          <div className="label"><span className="label-text">Hour</span></div>
          <input type="number" min={0} max={23} className="input input-bordered" value={form.time?.hour ?? 7} onChange={(e) => set('time', { hour: Number(e.target.value), minute: form.time?.minute ?? 0 })} />
        </label>
        <label className="form-control">
          <div className="label"><span className="label-text">Minute</span></div>
          <input type="number" min={0} max={59} className="input input-bordered" value={form.time?.minute ?? 0} onChange={(e) => set('time', { hour: form.time?.hour ?? 7, minute: Number(e.target.value) })} />
        </label>
        <label className="form-control">
          <div className="label"><span className="label-text">Frequency</span></div>
          <input className="input input-bordered" value={form.frequency ?? ''} onChange={(e) => set('frequency', e.target.value)} placeholder="e.g., daily, weekly" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="form-control">
          <div className="label"><span className="label-text">Type</span></div>
          <select className="select select-bordered" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="regular">Regular</option>
            <option value="one_time">One-time</option>
            <option value="calendar">Calendar</option>
          </select>
        </label>
        <label className="form-control">
          <div className="label"><span className="label-text">Active</span></div>
          <input type="checkbox" className="toggle" checked={!!form.activeStatus} onChange={(e) => set('activeStatus', e.target.checked)} />
        </label>
        <label className="form-control">
          <div className="label"><span className="label-text">Color</span></div>
          <input className="input input-bordered" value={form.color ?? ''} onChange={(e) => set('color', e.target.value)} placeholder="#FFAABBCC" />
        </label>
      </div>

      <label className="form-control">
        <div className="label"><span className="label-text">Note</span></div>
        <textarea className="textarea textarea-bordered" value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} />
      </label>

      <div className="flex gap-2">
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  )
}
