"use client"

import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Activity } from '@/types/activity'
import { generateTasksForDate } from '@/lib/clientTaskGenerator'
// (no month updates needed for this compact mobile UI)

type Props = {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  activities?: Activity[]
}

export function CalendarStrip({ selectedDate, onSelectDate, activities: _activities = [] }: Props) {

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const start = new Date(year, month, 1)

  // Build a long date range so users can swipe far left/right across months
  const PAST_MONTHS = 12
  const FUTURE_MONTHS = 12
  const rangeStart = useMemo(() => new Date(year, month - PAST_MONTHS, 1), [year, month])
  const rangeEnd = useMemo(() => new Date(year, month + FUTURE_MONTHS + 1, 0), [year, month])

  const allDays = useMemo(() => {
    const out: Date[] = []
    const d = new Date(rangeStart)
    while (d <= rangeEnd) {
      out.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return out
  }, [rangeStart, rangeEnd])

  // Pull updates for this month to derive icons/status hints
  // no-op: previously used to show icons per day; simplified UI no longer displays them

  // We still fetch updates for possible future badges, but we don't render icons in the mobile strip UI.
  // monthUpdates fetched above to keep behavior consistent with other data flows.

  const listRef = useRef<HTMLDivElement>(null)

  // Compute which days have any planned procedures (tiny dot indicator)
  const hasPlanned = useMemo(() => {
    const set = new Set<string>()
    if ((_activities?.length ?? 0) === 0) return set
    for (const d of allDays) {
      const items = generateTasksForDate(_activities, d)
      if (items.length > 0) set.add(d.toDateString())
    }
    return set
  }, [allDays, _activities])

  // Auto-scroll selected day into center on mount/selection change
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const idx = allDays.findIndex(d => d.toDateString() === selectedDate.toDateString())
    const btn = el.querySelectorAll('button')[idx] as HTMLButtonElement | undefined
    if (btn) {
      // Center based on element widths to avoid padding/offset rect issues
      const targetLeft = btn.offsetLeft - (el.clientWidth / 2 - btn.clientWidth / 2)
      el.scrollTo({ left: targetLeft, behavior: 'smooth' })
    }
  }, [selectedDate, allDays])

  const monthLabel = start.toLocaleString(undefined, { month: 'long' })

  return (
    <div className="w-full rounded-2xl p-3 bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-[#4F3D7A] dark:to-[#2F2A4A]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-base font-semibold text-text-primary capitalize">{monthLabel}</div>
        {/* icon intentionally removed per design */}
      </div>

      <div className="overflow-x-auto no-scrollbar" ref={listRef}>
        <motion.div
          className="flex gap-1.5 pr-1 snap-x snap-mandatory"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.01 } } }}
        >
          {allDays.map((date) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const dow = date.toLocaleDateString(undefined, { weekday: 'short' })
            const todayLabel = (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ru')) ? 'Сегодня' : 'Today'
            const atMonthStart = date.getDate() === 1
            return (
              <motion.button
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                onClick={() => onSelectDate(date)}
                className={`shrink-0 snap-center ${atMonthStart ? 'ml-3' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* pill */}
                <div
                  className={
                    isSelected
                      ? 'w-12 h-16 rounded-[22px] bg-gradient-to-b from-[rgba(163,133,233,0.35)] via-[rgba(163,133,233,0.75)] to-[rgba(88,61,170,0.95)] text-white flex flex-col items-center justify-center shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] ring-2 ring-white/40 dark:ring-gray-800/60'
                      : 'w-12 h-16 rounded-[22px] bg-surface text-text-primary flex flex-col items-center justify-center shadow-sm border border-border-subtle'
                  }
                >
                  {/* number bubble when selected, plain number otherwise */}
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-white grid place-items-center text-[11px] font-semibold text-violet-700 shadow-sm mb-0.5">{date.getDate()}</div>
                  ) : (
                    <div className={`text-[13px] font-semibold mb-0.5 ${isToday ? 'text-[rgb(var(--accent))]' : 'text-text-primary'}`}>{date.getDate()}</div>
                  )}
                  <div className={`${isSelected ? 'text-white/95' : 'text-text-secondary'} text-[10px] font-medium tracking-wide`}>
                    {isToday && !isSelected ? todayLabel : dow.slice(0, 2)}
                  </div>
                  {/* tiny dot indicator for planned procedures */}
                  {hasPlanned.has(date.toDateString()) && (
                    <span className={`mt-1 block h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[rgb(var(--accent))]'}`} />
                  )}
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
