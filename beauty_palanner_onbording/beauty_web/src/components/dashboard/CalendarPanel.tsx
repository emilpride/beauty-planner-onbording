"use client"

import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react'
import { motion, type PanInfo, useDragControls } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Select } from '@/components/common/Select'
import { useAuth } from '@/hooks/useAuth'
import { useUpdatesInDateRange } from '@/hooks/useUpdates'
import type { Activity } from '@/types/activity'
import { getActivityMeta } from '@/data/activityMeta'
import { generateTasksForDate } from '@/lib/clientTaskGenerator'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import { buildUpdateId } from '@/lib/taskActions'
import { InlineProcedurePicker } from '@/components/procedures/InlineProcedurePicker'
import { useSaveActivity } from '@/hooks/useActivities'

type RemindUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
type OneTimeSubmissionPayload = {
  id: string
  date: string | null
  time: string | null
  remind: { amount: number; unit: RemindUnit } | null
}

type InlineProcedurePickerComponentProps = {
  onSubmit: (activities: Activity[]) => void | Promise<void>
  saving?: boolean
  mode?: 'activity' | 'one-time'
  defaultDate?: string
  visibleSections?: Partial<Record<'note' | 'repeat' | 'end' | 'time' | 'remind' | 'date', boolean>>
  onSubmitOneTime?: (payload: OneTimeSubmissionPayload) => void | Promise<void>
}

const InlineProcedurePickerComponent = InlineProcedurePicker as ComponentType<InlineProcedurePickerComponentProps>
type SaveActivityFn = (input: { userId: string; activity: Activity }) => Promise<unknown>

function parseTimeValue(time: string | null): Activity['time'] {
  if (!time) return null
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return { hour, minute }
}

async function ensureOneTimeActivityExists({
  payload,
  existingActivities,
  userId,
  saveActivity,
  time,
}: {
  payload: OneTimeSubmissionPayload
  existingActivities: Activity[]
  userId: string
  saveActivity: SaveActivityFn
  time: Activity['time']
}) {
  const matched = existingActivities.find((activity) => activity.id === payload.id)
  if (matched) return

  const meta = getActivityMeta(payload.id)
  const reminder = payload.remind ? `${payload.remind.amount} ${payload.remind.unit}` : ''
  const dateSource = payload.date ? new Date(payload.date) : new Date()
  const activity: Activity = {
    id: payload.id,
    name: meta.name,
    type: 'one_time',
    activeStatus: true,
    time,
    frequency: 'one_time',
    notifyBefore: reminder,
    color: meta.primary,
    enabledAt: dateSource,
    endBeforeActive: true,
    endBeforeType: 'date',
    selectedEndBeforeDate: dateSource,
  }

  await saveActivity({ userId, activity })
}

async function upsertOneTimeUpdate({
  payload,
  userId,
  defaultDate,
  time,
}: {
  payload: OneTimeSubmissionPayload
  userId: string
  defaultDate: string
  time: Activity['time']
}) {
  const date = payload.date || defaultDate
  const reminder = payload.remind ? `${payload.remind.amount} ${payload.remind.unit}` : ''
  const updateId = buildUpdateId(
    payload.id,
    date,
    time ? time.hour : undefined,
    time ? time.minute : undefined,
  )
  const db = getFirestoreDb()
  const updatesCollection = collection(doc(collection(db, 'users_v2'), userId), 'Updates')
  const updateRef = doc(updatesCollection, updateId)

  await setDoc(updateRef, {
    id: updateId,
    activityId: payload.id,
    date,
    status: 'pending',
    time: time ? { hour: time.hour, minute: time.minute } : undefined,
    notifyBefore: reminder,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

async function submitOneTimeProcedure({
  payload,
  userId,
  existingActivities,
  defaultDate,
  saveActivity,
  queryClient,
}: {
  payload: OneTimeSubmissionPayload
  userId: string
  existingActivities: Activity[]
  defaultDate: string
  saveActivity: SaveActivityFn
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const time = parseTimeValue(payload.time)
  await ensureOneTimeActivityExists({
    payload,
    existingActivities,
    userId,
    saveActivity,
    time,
  })

  await upsertOneTimeUpdate({
    payload,
    userId,
    defaultDate,
    time,
  })

  queryClient.invalidateQueries({ queryKey: ['updates'] })
}

function getWeekdays(weekStart: 'monday' | 'sunday') {
  const base = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  if (weekStart === 'monday') {
    return [...base.slice(1), base[0]]
  }
  return base
}

function monthMatrix(year: number, month: number, weekStart: 'monday' | 'sunday') {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startIdx = weekStart === 'monday' ? ((first.getDay() + 6) % 7) : first.getDay()
  const daysInMonth = last.getDate()
  const rows: (number | null)[][] = []
  let day = 1 - startIdx
  for (let r = 0; r < 6; r++) {
    const row: (number | null)[] = []
    for (let c = 0; c < 7; c++) {
      if (day < 1 || day > daysInMonth) row.push(null)
      else row.push(day)
      day++
    }
    rows.push(row)
  }
  return rows
}

export function CalendarPanel({
  selectedDate,
  onSelectDate,
  category,
  onCategoryChange,
  procedureId = 'all',
  onProcedureChange,
  activities = [],
  className,
}: {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  category: 'all' | 'skin' | 'hair' | 'physical' | 'mental'
  onCategoryChange: (c: 'all' | 'skin' | 'hair' | 'physical' | 'mental') => void
  procedureId?: 'all' | string
  onProcedureChange?: (id: 'all' | string) => void
  activities?: Activity[]
  className?: string
}) {
  const { user } = useAuth()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const router = useRouter()
  const qc = useQueryClient()
  const [addModalStep, setAddModalStep] = useState<'closed' | 'choice' | 'one-time'>('closed')
  const [dateStr, setDateStr] = useState(toYMD(selectedDate))
  const save = useSaveActivity()
  const dragControls = useDragControls()
  // Week start preference (defaults to Monday if not loaded)
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>('monday')
  useEffect(() => {
    try {
      const cached = localStorage.getItem('bm_week_start') as 'monday' | 'sunday' | null
      if (cached === 'monday' || cached === 'sunday') setWeekStart(cached)
    } catch {}
  }, [])
  const grid = useMemo(() => monthMatrix(ym.y, ym.m, weekStart), [ym, weekStart])
  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })), []
  )
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const handleOneTimeSubmit = async (payload: OneTimeSubmissionPayload) => {
    if (!user?.uid) return
    await submitOneTimeProcedure({
      payload,
      userId: user.uid,
      existingActivities: activities,
      defaultDate: dateStr,
      saveActivity: (input) => save.mutateAsync(input),
      queryClient: qc,
    })
  }

  const monthStart = new Date(ym.y, ym.m, 1)
  const monthEnd = new Date(ym.y, ym.m + 1, 0)
  const { data: monthUpdates } = useUpdatesInDateRange(user?.uid, monthStart, monthEnd)
  const activityById = useMemo(() => new Map(activities.map(a => [a.id, a])), [activities])
  const [isMobile, setIsMobile] = useState(false)
  const isModalOpen = addModalStep !== 'closed'
  const isOneTimeStep = addModalStep === 'one-time'
  const containerClassName = className
    ? `rounded-lg bg-surface p-4 w-full border border-border-subtle shadow-sm ${className}`
    : 'rounded-lg bg-surface p-4 w-full max-w-[382px] border border-border-subtle shadow-sm'

  const modalSizing = isMobile
    ? isOneTimeStep
      ? 'w-full max-w-none rounded-t-2xl rounded-b-none h-[85vh]'
      : 'w-full max-w-none rounded-t-2xl rounded-b-none pb-6'
    : isOneTimeStep
      ? 'w-full max-w-3xl rounded-2xl my-8 max-h-[85vh]'
      : 'w-full max-w-xl rounded-2xl my-16'
  const modalBaseClasses = 'bg-surface border border-border-strong shadow-xl overflow-hidden flex flex-col'

  useEffect(() => {
    const calc = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!isModalOpen) return
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [isModalOpen])

  // Reset scroll when entering one-time step
  useEffect(() => {
    if (!isOneTimeStep) return
    const node = scrollContainerRef.current
    if (!node) return
    requestAnimationFrame(() => {
      if (scrollContainerRef.current === node) {
        node.scrollTop = 0
      }
    })
  }, [isOneTimeStep])
  const dayInfo = useMemo(() => {
    const map = new Map<number, { has: boolean; icon?: string }>()

    // 1) Use Firestore updates (if any)
    for (const inst of monthUpdates?.items ?? []) {
      if (inst.status === 'deleted') continue
      const [y, m, d] = inst.date.split('-').map((x) => Number(x))
      if (y !== ym.y || m !== ym.m + 1) continue
      if (procedureId !== 'all' && inst.activityId !== procedureId) continue
      const act = activityById.get(inst.activityId)
      const cat = (act?.category || '').toLowerCase()
      const matches =
        category === 'all' ||
        (category === 'skin' && cat === 'skin') ||
        (category === 'hair' && cat === 'hair') ||
        (category === 'physical' && (cat === 'physical' || cat === 'physical health')) ||
        (category === 'mental' && (cat === 'mental' || cat === 'mental wellness'))
      if (!matches) continue
      if (!map.has(d)) {
        const meta = getActivityMeta(act?.id || '', act?.name)
        map.set(d, { has: true, icon: meta.iconPath })
      }
    }

    // 2) Also derive from scheduled activities (fallback if Updates are empty)
    const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      if (map.has(day)) continue
      const date = new Date(ym.y, ym.m, day)
      const generated = generateTasksForDate(activities, date)
      const first = generated.find((g) => {
        if (procedureId !== 'all' && g.activityId !== procedureId) return false
        const act = activityById.get(g.activityId)
        const cat = (act?.category || '').toLowerCase()
        return (
          category === 'all' ||
          (category === 'skin' && cat === 'skin') ||
          (category === 'hair' && cat === 'hair') ||
          (category === 'physical' && (cat === 'physical' || cat === 'physical health')) ||
          (category === 'mental' && (cat === 'mental' || cat === 'mental wellness'))
        )
      })
      if (first) {
        const act = activityById.get(first.activityId)
        const meta = getActivityMeta(act?.id || '', act?.name)
        map.set(day, { has: true, icon: meta.iconPath })
      }
    }

    return map
  }, [monthUpdates?.items, ym, activityById, category, activities, procedureId])

  return (
  <aside className={containerClassName}>
      {/* Filters row */}
      <div className="flex items-center justify-between gap-2 text-sm mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs font-bold">Category:</span>
            <Select 
              options={["All","Skin","Hair","Physical","Mental"]}
              value={{ all:"All", skin:"Skin", hair:"Hair", physical:"Physical", mental:"Mental" }[category]}
              onChange={(v) => {
                const val = String(v).toLowerCase() as 'all'|'skin'|'hair'|'physical'|'mental'
                onCategoryChange(val)
              }}
              buttonClassName="py-1 text-xs" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs font-bold">Procedure:</span>
            <Select
              options={[ 'All procedures', ...activities.map(a => a.name) ]}
              value={procedureId === 'all' ? 'All procedures' : (activities.find(a => a.id === procedureId)?.name || 'All procedures')}
              onChange={(v) => {
                const label = String(v)
                if (!onProcedureChange) return
                if (label === 'All procedures') onProcedureChange('all')
                else {
                  const match = activities.find(a => a.name === label)
                  onProcedureChange(match?.id || 'all')
                }
              }}
              buttonClassName="py-1 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs mb-3">
        <button className="px-3 py-1 rounded-md bg-surface-hover text-text-primary border border-border-subtle">Today</button>
        <button className="px-3 py-1 rounded-md bg-surface-hover text-text-primary border border-border-subtle">All</button>
        <Select
          options={Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)}
          value={ym.y}
          onChange={(v) => setYm((s) => ({ ...s, y: Number(v) }))}
          buttonClassName="py-1 text-xs"
        />
        <Select
          options={months.map((m) => `${m}`)}
          value={months[ym.m]}
          onChange={(v) => setYm((s) => ({ ...s, m: months.indexOf(String(v)) }))}
          buttonClassName="py-1 text-xs"
        />
      </div>

  <div className="border-t border-border-subtle mb-2" />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 text-center text-sm text-text-secondary font-medium mb-1">
        {getWeekdays(weekStart).map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.flatMap((row, rIdx) => row.map((d, cIdx) => {
          const isToday = d === new Date().getDate() && ym.y === now.getFullYear() && ym.m === now.getMonth()
          const info = d ? dayInfo.get(d) : undefined
          const isSelected = d
            ? (selectedDate.getFullYear() === ym.y && selectedDate.getMonth() === ym.m && selectedDate.getDate() === d)
            : false
          return (
            <div 
              key={`${rIdx}-${cIdx}`}
              className={`h-12 grid place-items-center rounded-[12px] text-[13px] transition ${d ? 'bg-surface-hover text-text-primary cursor-pointer hover:bg-surface' : ''}`}
              onClick={() => { if (d) onSelectDate(new Date(ym.y, ym.m, d)) }}
            >
              {d && (
                <div className={`relative flex items-center justify-center w-full h-full rounded-[12px] ${isSelected ? 'bg-[rgb(var(--accent))] text-white font-semibold shadow-[0_4px_16px_rgba(163,133,233,0.35)]' : isToday ? 'ring-1 ring-[rgb(var(--accent))]' : ''}`}>
                  <span>{d}</span>
                  {info?.has && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <span className={`block h-2 w-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[rgb(var(--accent))]'}`} />
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        }))}
      </div>

      <div className="border-t border-border-subtle my-3" />

      <button
        className="w-full h-11 rounded-[11px] bg-[#A385E9] text-white font-semibold text-sm"
        onClick={() => {
          setDateStr(toYMD(selectedDate))
          setAddModalStep('choice')
        }}
      >
        Add activity
      </button>

  <div className="mt-4 space-y-3 text-xs text-text-secondary">
        <div className="opacity-80">Tap a date to load its activities on the dashboard.</div>
      </div>

      {/* Add modal */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center p-4 bg-black/50 overscroll-none`}
          onClick={() => setAddModalStep('closed')}
        >
          <motion.div
            className={`${modalSizing} ${modalBaseClasses}`}
            onClick={(e) => e.stopPropagation()}
            drag={isMobile ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.1}
            dragMomentum={false}
            dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
            onDragEnd={(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
              const y = info?.offset?.y ?? 0
              const vy = info?.velocity?.y ?? 0
              const threshold = 120
              const powerThreshold = 800
              if (y > threshold || vy > powerThreshold) setAddModalStep('closed')
            }}
          >
            {isMobile && (
              <div className="pt-2 pb-1 grid place-items-center select-none cursor-grab active:cursor-grabbing"
                   onPointerDown={(e) => { dragControls.start(e) }}>
                <div className="h-1.5 w-12 rounded-full bg-border-subtle" />
              </div>
            )}
            <div className="p-4 border-b border-border-subtle flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  {isOneTimeStep ? 'Add one-time procedure' : 'Add procedure'}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {isOneTimeStep ? 'It will appear only on the selected date' : 'Choose which type of procedure you want to create.'}
                </p>
              </div>
              {isOneTimeStep && (
                <button
                  className="text-xs text-text-secondary hover:text-text-primary"
                  onClick={() => setAddModalStep('choice')}
                >
                  Back
                </button>
              )}
            </div>

            {isOneTimeStep ? (
              <>
                <div
                  ref={scrollContainerRef}
                  className={`flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 ${isMobile ? 'overscroll-contain' : ''}`}
                  style={isMobile ? { touchAction: 'pan-y' } : undefined}
                >
                  <InlineProcedurePickerComponent
                    mode="one-time"
                    defaultDate={dateStr}
                    visibleSections={{ note: false, repeat: false, end: false, time: true, remind: true, date: true }}
                    onSubmit={async () => { /* unused in this mode */ }}
                    onSubmitOneTime={handleOneTimeSubmit}
                  />
                </div>
                <div className="p-4 border-t border-border-subtle flex items-center justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm border border-border-subtle"
                    onClick={() => setAddModalStep('closed')}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm bg-[#A385E9] text-white font-semibold"
                    onClick={() => setAddModalStep('closed')}
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 flex flex-col gap-3 text-left">
                  <button
                    className="rounded-xl border border-border-subtle bg-surface-hover px-4 py-3 text-left transition hover:border-[#A385E9]"
                    onClick={() => {
                      setAddModalStep('closed')
                      router.push('/procedures/new')
                    }}
                  >
                    <div className="text-sm font-semibold text-text-primary">Regular procedure</div>
                    <div className="text-xs text-text-secondary mt-1">Create or adjust a repeating routine with full settings.</div>
                  </button>
                  <button
                    className="rounded-xl border border-border-subtle bg-surface-hover px-4 py-3 text-left transition hover:border-[#A385E9]"
                    onClick={() => setAddModalStep('one-time')}
                  >
                    <div className="text-sm font-semibold text-text-primary">One-time procedure</div>
                    <div className="text-xs text-text-secondary mt-1">Schedule it for a single day with quick date, time, and reminder options.</div>
                  </button>
                </div>
                <div className="p-4 border-t border-border-subtle flex items-center justify-end">
                  <button
                    className="px-4 py-2 rounded-lg text-sm border border-border-subtle"
                    onClick={() => setAddModalStep('closed')}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </aside>
  )
}

function toYMD(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

// kept for reference; no longer used in the new modal flow
