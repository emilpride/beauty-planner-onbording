"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import Link from 'next/link'
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({ Completed: false, Skipped: false })
  const [dragX, setDragX] = useState<Record<string, number>>({})
  const [dragging, setDragging] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [floaters, setFloaters] = useState<Record<string, Array<{ key: string; text: string; color: string }>>>({})
  const byId = new Map(activities.map((a) => [a.id, a]))

  useEffect(() => {
    const calc = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // If there are no pending items for the selected date, auto-expand Completed/Skipped to avoid empty-looking list
  useEffect(() => {
    if (planned.length === 0 && (completed.length > 0 || skipped.length > 0)) {
      setCollapsedSections((prev) => ({ ...prev, Completed: false, Skipped: false }))
    }
  }, [planned.length, completed.length, skipped.length])

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
                  // kept for historical reference; explicit segments now show action intent clearly
                  // const doneOpacity = Math.max(0, Math.min(1, dx / 120))
                  // const skipOpacity = Math.max(0, Math.min(1, -dx / 120))
                  const canDrag = inst.status === 'pending' && isMobile
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
                    setDragging((p) => ({ ...p, [inst.id]: false }))
                  }
                const pushFloater = (id: string, type: 'done' | 'skip') => {
                  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
                  const text = type === 'done' ? '+0.02' : '-0.03'
                  const color = type === 'done' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  setFloaters((prev) => ({
                    ...prev,
                    [id]: [...(prev[id] ?? []), { key, text, color }],
                  }))
                  setTimeout(() => {
                    setFloaters((prev) => ({
                      ...prev,
                      [id]: (prev[id] ?? []).filter((f) => f.key !== key),
                    }))
                  }, 1600)
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
                    drag={canDrag ? 'x' : false}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragStart={() => setDragging((p) => ({ ...p, [inst.id]: true }))}
                    onDrag={(_, info) => setDragX((p) => ({ ...p, [inst.id]: info.offset.x }))}
                    onDragEnd={(e, info) => {
                      const x = info?.offset?.x ?? 0
                      const v = info?.velocity?.x ?? 0
                      const vw = typeof window !== 'undefined' ? window.innerWidth : 480
                      const threshold = Math.max(96, Math.min(160, vw * 0.24))
                      const powerThreshold = 600
                      if (x > threshold || x * v > powerThreshold) {
                        pushFloater(inst.id, 'done')
                        onComplete?.(inst)
                      } else if (x < -threshold || x * v < -powerThreshold) {
                        pushFloater(inst.id, 'skip')
                        onSkip?.(inst)
                      }
                      setDragX((p) => ({ ...p, [inst.id]: 0 }))
                      setDragging((p) => ({ ...p, [inst.id]: false }))
                    }}
                    whileDrag={{ scale: 0.993 }}
                  >
                    {/* Gradient background layer */}
                    <div className="absolute inset-0 -z-20" style={{ background: grad }} />
                    {/* Mobile-only swipe backgrounds; reveal only while dragging */}
                    {canDrag && dragging[inst.id] && Math.abs(dx) > 2 && (
                      <>
                        {(() => {
                          const maxReveal = 160
                          const doneW = Math.min(maxReveal, Math.max(0, dx))
                          const skipW = Math.min(maxReveal, Math.max(0, -dx))
                          return (
                            <div className="absolute inset-0 -z-10 flex items-stretch justify-between select-none" aria-hidden>
                              {/* Left DONE capsule */}
                              <div className="h-full flex items-center pl-3 pr-2"
                                   style={{ width: doneW }}>
                                <div className="w-full h-[72%] rounded-l-[16px] bg-emerald-500/90 flex items-center gap-2 pl-3 pr-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]">
                                  <div className="w-6 h-6 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>
                                  <span className="text-white text-[12px] font-semibold hidden xs:inline">Done</span>
                                </div>
                              </div>
                              {/* Spacer fills remaining area */}
                              <div className="flex-1" />
                              {/* Right SKIP capsule */}
                              <div className="h-full flex items-center pr-3 pl-2"
                                   style={{ width: skipW }}>
                                <div className="w-full h-[72%] rounded-r-[16px] bg-rose-500/90 flex items-center justify-end gap-2 pr-3 pl-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]">
                                  <span className="text-white text-[12px] font-semibold">Skip</span>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </>
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
                      style={{ backgroundColor: color, boxShadow: `0 8px 24px ${hexToRgba(color, 0.35)}` }}
                    >
                      {/* Use curated icon when available */}
                      {meta.iconPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <motion.img src={meta.iconPath} alt={name} width={20} height={20} className="icon-auto"
                          initial={{ scale: 0.9, opacity: 0.9 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium break-words whitespace-normal ${isDone ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{name}</div>
                      {time && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-secondary/90 bg-surface-hover/60 border border-border-subtle rounded-full px-2 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {time}
                        </div>
                      )}
                    </div>
                    {/* Floating delta badges */}
                    <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <AnimatePresence initial={false}>
                        {(floaters[inst.id] ?? []).map((f) => (
                          <motion.div key={f.key}
                                      initial={{ y: 8, opacity: 0, scale: 0.9 }}
                                      animate={{ y: -18, opacity: 1, scale: 1 }}
                                      exit={{ y: -30, opacity: 0 }}
                                      transition={{ duration: 1.2 }}
                                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full shadow ${f.color}`}
                          >
                            {f.text}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5 ml-2">
                      {inst.status === 'pending' && (
                        <Link
                          href={{ pathname: '/procedure', query: { id: inst.activityId, date: inst.date } }}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover"
                        >
                          Start
                        </Link>
                      )}
                      {inst.status === 'pending' && (
                        <>
                          <motion.button
                            aria-label="Complete"
                            title="Complete"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow hover:brightness-110 active:translate-y-[1px]"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { pushFloater(inst.id, 'done'); onComplete?.(inst) }}
                          >
                            ✓ Done
                          </motion.button>
                          <motion.button
                            aria-label="Skip"
                            title="Skip"
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-surface text-text-primary border border-border-subtle hover:bg-surface-hover active:translate-y-[1px]"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { pushFloater(inst.id, 'skip'); onSkip?.(inst) }}
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
