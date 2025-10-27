"use client"

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { Activity } from '@/types/activity'
import { ACTIVITY_META, getActivityMeta } from '@/data/activityMeta'
import { Select } from '@/components/common/Select'

const COLORS = [
  { id: 'purple', value: '#A385E9', name: 'Purple' },
  { id: 'blue', value: '#0080FF', name: 'Blue' },
  { id: 'teal', value: '#4ECDC4', name: 'Teal' },
  { id: 'green', value: '#96CEB4', name: 'Green' },
  { id: 'orange', value: '#FFB347', name: 'Orange' },
  { id: 'red', value: '#FF6B6B', name: 'Red' },
  { id: 'pink', value: '#FFB6C1', name: 'Pink' },
  { id: 'yellow', value: '#FFEAA7', name: 'Yellow' },
]

const CATEGORIES = [
  { id: 'skin', name: 'Skin' },
  { id: 'hair', name: 'Hair' },
  { id: 'physical', name: 'Physical health' },
  { id: 'mental', name: 'Mental Wellness' },
]

export function ActivityForm({ initial, onSubmit, submitLabel = 'Save' }: {
  initial: Activity
  onSubmit: (a: Activity) => void | Promise<void>
  submitLabel?: string
}) {
  const [form, setForm] = useState<Activity>({ ...initial })
  const [saving, setSaving] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Get preset activities grouped by category
  const presetActivities = useMemo(() => {
    const activities = Object.keys(ACTIVITY_META).map(id => ({
      id,
      ...getActivityMeta(id)
    }))

    const filtered = searchQuery
      ? activities.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : activities

    const grouped: Record<string, typeof activities> = {
      skin: [],
      hair: [],
      physical: [],
      mental: []
    }

    filtered.forEach(activity => {
      const id = activity.id.toLowerCase()
      if (id.includes('cleanse') || id.includes('hydrat') || id.includes('exfoliat') || id.includes('face') || id.includes('lip') || id.includes('spf')) {
        grouped.skin.push(activity)
      } else if (id.includes('wash') || id.includes('hair') || id.includes('scalp') || id.includes('beard') || id.includes('trim')) {
        grouped.hair.push(activity)
      } else if (id.includes('stretch') || id.includes('cardio') || id.includes('strength') || id.includes('yoga') || id.includes('dance') || id.includes('swim') || id.includes('cycl') || id.includes('posture')) {
        grouped.physical.push(activity)
      } else {
        grouped.mental.push(activity)
      }
    })

    return grouped
  }, [searchQuery])

  const selectPreset = (presetId: string) => {
    const meta = getActivityMeta(presetId)
    setForm(f => ({
      ...f,
      id: presetId,
      name: meta.name,
      color: meta.primary,
      category: Object.entries(presetActivities).find(([_, items]) => 
        items.some(item => item.id === presetId)
      )?.[0] || f.category
    }))
    setShowPresetModal(false)
  }

  const selectedMeta = form.id && ACTIVITY_META[form.id] ? getActivityMeta(form.id) : null

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset Selection */}
  <div className="bg-gradient-to-br from-purple-50/60 to-blue-50/60 dark:from-[#3D3D5C] dark:to-[#2A2A3E] rounded-xl p-6 border-2 border-[#A385E9] border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Choose a Preset</h3>
              <p className="text-sm text-text-secondary">Or create a custom procedure below</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPresetModal(true)}
              className="px-4 py-2 bg-surface text-[#A385E9] font-semibold rounded-lg hover:bg-surface-hover transition border border-[#A385E9]"
            >
              Browse Presets
            </button>
          </div>

          {selectedMeta && (
            <div className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border-subtle">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedMeta.primary }}
              >
                {selectedMeta.iconPath && (
                  <Image src={selectedMeta.iconPath} alt="" width={28} height={28} className="icon-auto" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text-primary">{selectedMeta.name}</div>
                <div className="text-xs text-text-secondary">Preset Selected</div>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, id: '', name: '', color: '' }))}
                className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg text-sm transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary">Details</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Procedure Name *
              </label>
              <input 
                className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent bg-surface text-text-primary" 
                value={form.name} 
                onChange={(e) => set('name', e.target.value)} 
                required 
                placeholder="e.g., Morning Skincare"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Category
              </label>
              <Select
                options={["Select category", ...CATEGORIES.map(cat => cat.name)]}
                value={form.category && CATEGORIES.some(c => c.name === form.category) ? form.category : "Select category"}
                onChange={(v) => set('category', v === 'Select category' ? '' : String(v))}
                buttonClassName="py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => set('color', color.value)}
                  className={`
                    w-10 h-10 rounded-full transition-all
                    ${form.color === color.value 
                      ? 'ring-4 ring-offset-2 ring-[#A385E9] scale-110' 
                      : 'hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <input
                type="text"
                className="px-3 py-2 border border-border-subtle rounded-lg text-sm w-28 bg-surface text-text-primary"
                value={form.color ?? ''}
                onChange={(e) => set('color', e.target.value)}
                placeholder="#A385E9"
              />
            </div>
          </div>
        </div>

        {/* Time & Frequency */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary">Schedule</h3>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Hour
              </label>
              <input 
                type="number" 
                min={0} 
                max={23} 
                className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent bg-surface text-text-primary" 
                value={form.time?.hour ?? 7} 
                onChange={(e) => set('time', { hour: Number(e.target.value), minute: form.time?.minute ?? 0 })} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Minute
              </label>
              <input 
                type="number" 
                min={0} 
                max={59} 
                className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent bg-surface text-text-primary" 
                value={form.time?.minute ?? 0} 
                onChange={(e) => set('time', { hour: form.time?.hour ?? 7, minute: Number(e.target.value) })} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Frequency
              </label>
              <Select
                options={["daily", "weekly", "monthly"]}
                value={form.frequency ?? 'daily'}
                onChange={(v) => set('frequency', String(v))}
                buttonClassName="py-3"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Type
              </label>
              <Select
                options={["regular", "one_time", "calendar"]}
                value={form.type}
                onChange={(v) => set('type', String(v))}
                buttonClassName="py-3"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 px-4 py-3 border border-border-subtle rounded-lg cursor-pointer hover:bg-surface-hover transition">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-[#A385E9] rounded focus:ring-2 focus:ring-[#A385E9]" 
                  checked={!!form.activeStatus} 
                  onChange={(e) => set('activeStatus', e.target.checked)} 
                />
                <span className="text-sm font-semibold text-text-primary">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Notes (Optional)
          </label>
          <textarea 
            className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent resize-none bg-surface text-text-primary placeholder:text-text-secondary" 
            rows={4}
            value={form.note ?? ''} 
            onChange={(e) => set('note', e.target.value)}
            placeholder="Add any additional notes about this procedure..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button 
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A385E9] to-[#8B6BC9] text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit" 
            disabled={saving}
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border-2 border-border-subtle text-text-primary font-semibold rounded-xl hover:bg-surface-hover transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPresetModal(false)}>
          <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-border-subtle" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">Choose a Preset</h2>
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Search procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] bg-surface text-text-primary placeholder:text-text-secondary"
              />
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {Object.entries(presetActivities).map(([category, items]) => {
                if (items.length === 0) return null
                const catInfo = CATEGORIES.find(c => c.id === category)

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-bold text-text-primary mb-3">
                      {catInfo?.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {items.map(activity => (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => selectPreset(activity.id)}
                          className="p-3 rounded-lg border-2 border-border-subtle hover:border-[#A385E9] hover:bg-surface-hover transition text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: activity.primary }}
                            >
                              {activity.iconPath && (
                                <Image src={activity.iconPath} alt="" width={24} height={24} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-text-primary truncate group-hover:text-[#A385E9]">
                                {activity.name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
