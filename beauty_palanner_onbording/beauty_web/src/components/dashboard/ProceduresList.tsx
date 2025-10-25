"use client"

import { useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
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

// removed unused toBg helper

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
  const [dragX, setDragX] = useState<Record<string, number>>({})
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
          <AnimatePresence initial={false}>
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {items.length === 0 ? (
                <div className="text-sm text-text-secondary italic px-3 py-2">No items</div>
              ) : (
                items.map((inst) => {
                const a = byId.get(inst.activityId)
                const name = a?.name || 'Activity'
                const meta = getActivityMeta(a?.categoryId || a?.id || '', name)
                const color = a?.color || meta.primary || '#A385E9'
                const grad = `linear-gradient(135deg, ${hexToRgba(color, 0.18)} 0%, ${hexToRgba(color, 0.08)} 100%)`
                const time = fmtTime(inst.time?.hour, inst.time?.minute)
                const isDone = inst.status === 'completed'
                // const isSkipped = inst.status === 'skipped' || inst.status === 'missed'
                  const dx = dragX[inst.id] ?? 0
                  const doneOpacity = Math.max(0, Math.min(1, dx / 120))
                  const skipOpacity = Math.max(0, Math.min(1, -dx / 120))
                  const canDrag = inst.status === 'pending'
                  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                    const x = info?.offset?.x ?? 0
                    const v = info?.velocity?.x ?? 0
                    // Dynamic threshold: 24% of viewport width, clamped 96..160px
                    const vw = typeof window !== 'undefined' ? window.innerWidth : 480
                    const threshold = Math.max(96, Math.min(160, vw * 0.24))
                    const swipePower = x * v
                    const powerThreshold = 600
                    if (x > threshold || swipePower > powerThreshold) {
                      onComplete?.(inst)
                    } else if (x < -threshold || swipePower < -powerThreshold) {
                      onSkip?.(inst)
                    }
                    setDragX((p) => ({ ...p, [inst.id]: 0 }))
                  }
                return (
                  <motion.div
                    key={inst.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
                    className={`relative overflow-hidden group/card flex items-center gap-3 px-3 py-2.5 rounded-[16px] border border-border-subtle/60 backdrop-blur-md transition-all hover:-translate-y-[2px] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.55)] ${isDone ? 'opacity-80' : ''}`}
                    style={{ background: grad }}
                    drag={canDrag ? 'x' : false}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDrag={(_, info) => setDragX((p) => ({ ...p, [inst.id]: info.offset.x }))}
                    onDragEnd={onDragEnd}
                    whileDrag={{ scale: 0.993 }}
                  >
                    {/* Swipe backgrounds */}
                    {canDrag && (
                      <>
                        <div className="absolute inset-0 -z-10" aria-hidden>
                          <div className="absolute inset-0" style={{
                            background: `linear-gradient(90deg, rgba(16,185,129,${doneOpacity*0.25}) 0%, rgba(16,185,129,${doneOpacity*0.05}) 60%, transparent 100%)`
                          }} />
                          <div className="absolute inset-0" style={{
                            background: `linear-gradient(270deg, rgba(148,163,184,${skipOpacity*0.25}) 0%, rgba(148,163,184,${skipOpacity*0.05}) 60%, transparent 100%)`
                          }} />
                        </div>
                        <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-semibold" style={{ opacity: doneOpacity }}>
                          ✓ Done
                        </div>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold" style={{ opacity: skipOpacity }}>
                          Skip
                        </div>
                      </>
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                      style={{ backgroundColor: color, boxShadow: `0 8px 24px ${hexToRgba(color, 0.35)}` }}
                    >
                      {/* Use curated icon when available */}
                      {meta.iconPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <motion.img src={meta.iconPath} alt={name} width={20} height={20}
                          initial={{ scale: 0.9, opacity: 0.9 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
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
                          <motion.button
                            aria-label="Complete"
                            title="Complete"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow hover:brightness-110 active:translate-y-[1px]"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onComplete?.(inst)}
                          >
                            ✓ Done
                          </motion.button>
                          <motion.button
                            aria-label="Skip"
                            title="Skip"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover active:translate-y-[1px]"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onSkip?.(inst)}
                          >
                            Skip
                          </motion.button>
                        </>
                      )}
                      {(inst.status === 'completed' || inst.status === 'skipped' || inst.status === 'missed') && (
                        <motion.button
                          aria-label="Undo"
                          title="Undo"
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover active:translate-y-[1px]"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onUndo?.(inst)}
                        >
                          ↩ Undo
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )
                })
              )}
            </motion.div>
          </AnimatePresence>
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
