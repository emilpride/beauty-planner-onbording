"use client"

import { useState } from 'react'
import type { TaskInstance } from '@/types/task'
import type { Activity as UserActivity } from '@/types/activity'
import { getActivityMeta } from '@/data/activityMeta'

interface ProceduresListProps {
  planned: TaskInstance[]
  completed: TaskInstance[]
  skipped: TaskInstance[]
  activities: UserActivity[]
  onComplete?: (t: TaskInstance) => void
  onSkip?: (t: TaskInstance) => void
  onUndo?: (t: TaskInstance) => void
}

function toBg(color?: string | null, alpha = 0.15) {
  if (!color || !color.startsWith('#')) return `rgba(163,133,233,${alpha})`
  // simple fallback, ignore alpha in hex if provided
  const r = parseInt(color.substring(1, 3), 16)
  const g = parseInt(color.substring(3, 5), 16)
  const b = parseInt(color.substring(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function hexToRgba(hex?: string | null, a = 1) {
  if (!hex || !hex.startsWith('#')) return `rgba(163,133,233,${a})`
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function fmtTime(h?: number, m?: number) {
  if (typeof h !== 'number' || typeof m !== 'number') return ''
  const dt = new Date()
  dt.setHours(h, m, 0, 0)
  return dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function ProceduresList({ planned, completed, skipped, activities, onComplete, onSkip, onUndo }: ProceduresListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({ Completed: true, Skipped: true })
  const byId = new Map(activities.map((a) => [a.id, a]))

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderSection = (title: string, items: TaskInstance[], defaultCollapsed = false) => {
    const isCollapsed = collapsedSections[title] ?? defaultCollapsed

    return (
      <div key={title} className="mb-4">
        <button
          onClick={() => toggleSection(title)}
          className="w-full flex items-center justify-between mb-3 text-left group"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm uppercase tracking-wide font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{title}</h3>
            <span className="inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-surface-hover border border-border-subtle text-text-secondary">{items.length}</span>
          </div>
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-text-secondary italic px-3 py-2">No items</div>
            ) : (
              items.map((inst) => {
                const a = byId.get(inst.activityId)
                const name = a?.name || 'Activity'
                const meta = getActivityMeta(a?.categoryId || a?.id || '', name)
                const color = a?.color || meta.primary || '#A385E9'
                const bg = toBg(color, 0.18)
                const grad = `linear-gradient(135deg, ${hexToRgba(color, 0.18)} 0%, ${hexToRgba(color, 0.08)} 100%)`
                const time = fmtTime(inst.time?.hour, inst.time?.minute)
                const isDone = inst.status === 'completed'
                const isSkipped = inst.status === 'skipped' || inst.status === 'missed'
                return (
                  <div
                    key={inst.id}
                    className={`group/card flex items-center gap-3 px-3 py-2.5 rounded-[16px] border border-border-subtle/60 backdrop-blur-md transition-all hover:-translate-y-[1px] hover:shadow-[0_10px_25px_-10px_rgba(0,0,0,0.5)] ${isDone ? 'opacity-80' : ''}`}
                    style={{ background: grad }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                      style={{ backgroundColor: color, boxShadow: `0 8px 24px ${hexToRgba(color, 0.35)}` }}
                    >
                      {/* Use curated icon when available */}
                      {meta.iconPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={meta.iconPath} alt={name} width={20} height={20} />
                      ) : (
                        <span className="text-white text-sm font-semibold">{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isDone ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{name}</div>
                      {time && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-secondary/90 bg-surface-hover/60 border border-border-subtle rounded-full px-2 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {time}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 ml-2">
                      {inst.status === 'pending' && (
                        <>
                          <button
                            aria-label="Complete"
                            title="Complete"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow hover:brightness-110 active:translate-y-[1px]"
                            onClick={() => onComplete?.(inst)}
                          >
                            ✓ Done
                          </button>
                          <button
                            aria-label="Skip"
                            title="Skip"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover active:translate-y-[1px]"
                            onClick={() => onSkip?.(inst)}
                          >
                            Skip
                          </button>
                        </>
                      )}
                      {(inst.status === 'completed' || inst.status === 'skipped' || inst.status === 'missed') && (
                        <button
                          aria-label="Undo"
                          title="Undo"
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover active:translate-y-[1px]"
                          onClick={() => onUndo?.(inst)}
                        >
                          ↩ Undo
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
      {renderSection('Planned', planned, false)}
      {renderSection('Completed', completed, true)}
      {renderSection('Skipped', skipped, true)}
    </div>
  )
}
