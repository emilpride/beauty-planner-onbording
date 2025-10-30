'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { PROCEDURES_ICON_CATALOG, getProceduresIconById, getProceduresIconCategories, type ProceduresIconEntry } from './proceduresIconCatalog'
import { getIconById } from './iconCatalog'
import { getActivityMeta, ACTIVITY_META } from './activityMeta'
import { getDefaultNote, type GenderKey } from './defaultActivityNotes'
import { saveOnboardingSession } from '@/lib/firebase'

const extractColorFromClass = (colorClass: string): string => {
  if (colorClass.startsWith('#')) {
    return colorClass
  }

  if (colorClass.startsWith('bg-[')) {
    return colorClass.match(/bg-\[([^\]]+)\]/)?.[1] || '#A385E9'
  }

  return colorClass
}

const extractRgbaFromClass = (bgColorClass: string): string => {
  if (bgColorClass.startsWith('rgba(')) {
    return bgColorClass
  }

  if (bgColorClass.startsWith('bg-[rgba(')) {
    const match = bgColorClass.match(/bg-\[rgba\(([^)]+)\)\]/)
    if (match) {
      return `rgba(${match[1]})`
    }
  }

  return 'rgba(163, 133, 233, 0.2)'
}

interface ActivityCard {
  id: string
  name: string
  iconId: string
  color: string
  bgColor: string
  aiRecommended: boolean
  note?: string
}

type ActivityCollection = Record<string, ActivityCard[]>

const QUICK_ICON_IDS: readonly string[] = [
  'cleanseAndHydrate',
  'deepHydration',
  'exfoliate',
  'faceMassage',
  'lipEyeCare',
  'mindfulMeditation',
  'breathingExercises',
  'gratitudeJournal',
]

const ICONS_PER_PAGE = 48

const ActivityIcon = ({
  activityId,
  iconId,
  color,
  label,
}: {
  activityId: string
  iconId?: string
  color: string
  label: string
}) => {
  const backgroundColor = extractColorFromClass(color)
  const meta = getActivityMeta(activityId, label)
  const resolvedIconId = iconId || meta.iconId
  const iconEntry = resolvedIconId ? getIconById(resolvedIconId) : undefined
  const iconPath = iconEntry?.path || meta.iconPath

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
      style={{ backgroundColor }}
    >
      {iconPath ? (
        <Image src={iconPath} alt={`${label} icon`} width={28} height={28} />
      ) : (
        <span className="text-white text-base font-semibold">{label.charAt(0)}</span>
      )}
    </div>
  )
}

const createPresetActivity = (
  activityId: string,
  overrides: Partial<ActivityCard> = {},
  gender: GenderKey = 'unknown'
): ActivityCard => {
  const meta = getActivityMeta(activityId)

  return {
    id: activityId,
    name: overrides.name || meta.name,
    iconId: overrides.iconId || meta.iconId,
    color: overrides.color || meta.primary,
    bgColor: overrides.bgColor || meta.surface,
    aiRecommended: overrides.aiRecommended ?? false,
    note: overrides.note ?? getDefaultNote(activityId, gender),
  }
}
const buildInitialActivities = (gender: GenderKey, aiRecommendations?: Set<string>): ActivityCollection => ({
  skin: [
    createPresetActivity('cleanse-hydrate', { aiRecommended: aiRecommendations?.has('cleanse-hydrate') ?? true }, gender),
    createPresetActivity('deep-hydration', { aiRecommended: aiRecommendations?.has('deep-hydration') ?? false }, gender),
    createPresetActivity('exfoliate', { aiRecommended: aiRecommendations?.has('exfoliate') ?? true }, gender),
    createPresetActivity('face-massage', { aiRecommended: aiRecommendations?.has('face-massage') ?? false }, gender),
    createPresetActivity('lip-eye-care', { aiRecommended: aiRecommendations?.has('lip-eye-care') ?? true }, gender),
    createPresetActivity('spf-protection', { aiRecommended: aiRecommendations?.has('spf-protection') ?? false }, gender),
  ],
  hair: [
    createPresetActivity('wash-care', { aiRecommended: aiRecommendations?.has('wash-care') ?? false }, gender),
    createPresetActivity('deep-nourishment', { aiRecommended: aiRecommendations?.has('deep-nourishment') ?? true }, gender),
    createPresetActivity('scalp-detox', { aiRecommended: aiRecommendations?.has('scalp-detox') ?? false }, gender),
    createPresetActivity('heat-protection', { aiRecommended: aiRecommendations?.has('heat-protection') ?? true }, gender),
    createPresetActivity('scalp-massage', { aiRecommended: aiRecommendations?.has('scalp-massage') ?? false }, gender),
    createPresetActivity('trim-split-ends', { aiRecommended: aiRecommendations?.has('trim-split-ends') ?? true }, gender),
    createPresetActivity('post-color-care', { aiRecommended: aiRecommendations?.has('post-color-care') ?? false }, gender),
    ...(gender === 'male'
      ? [
          createPresetActivity('beard-shave-care', { aiRecommended: aiRecommendations?.has('beard-shave-care') ?? true }, gender),
          createPresetActivity('hair-loss-support', { aiRecommended: aiRecommendations?.has('hair-loss-support') ?? false }, gender),
        ]
      : []),
    ...(gender === 'female'
      ? [
          createPresetActivity('leave-in-care', { aiRecommended: aiRecommendations?.has('leave-in-care') ?? false }, gender),
          createPresetActivity('night-care-routine', { aiRecommended: aiRecommendations?.has('night-care-routine') ?? true }, gender),
        ]
      : []),
  ],
  physical: [
    createPresetActivity('morning-stretch', { aiRecommended: aiRecommendations?.has('morning-stretch') ?? true }, gender),
    createPresetActivity('cardio-boost', { aiRecommended: aiRecommendations?.has('cardio-boost') ?? false }, gender),
    createPresetActivity('strength-training', { aiRecommended: aiRecommendations?.has('strength-training') ?? true }, gender),
    createPresetActivity('yoga-flexibility', { aiRecommended: aiRecommendations?.has('yoga-flexibility') ?? false }, gender),
    createPresetActivity('dance-it-out', { aiRecommended: aiRecommendations?.has('dance-it-out') ?? true }, gender),
    createPresetActivity('swimming-time', { aiRecommended: aiRecommendations?.has('swimming-time') ?? false }, gender),
    createPresetActivity('cycling', { aiRecommended: aiRecommendations?.has('cycling') ?? true }, gender),
    createPresetActivity('posture-fix', { aiRecommended: aiRecommendations?.has('posture-fix') ?? false }, gender),
    createPresetActivity('evening-stretch', { aiRecommended: aiRecommendations?.has('evening-stretch') ?? true }, gender),
  ],
  mental: [
    createPresetActivity('mindful-meditation', { aiRecommended: aiRecommendations?.has('mindful-meditation') ?? true }, gender),
    createPresetActivity('breathing-exercises', { aiRecommended: aiRecommendations?.has('breathing-exercises') ?? false }, gender),
    createPresetActivity('gratitude-exercises', { aiRecommended: aiRecommendations?.has('gratitude-exercises') ?? true }, gender),
    createPresetActivity('mood-check-in', { aiRecommended: aiRecommendations?.has('mood-check-in') ?? false }, gender),
    createPresetActivity('learn-grow', { aiRecommended: aiRecommendations?.has('learn-grow') ?? true }, gender),
    createPresetActivity('social-media-detox', { aiRecommended: aiRecommendations?.has('social-media-detox') ?? false }, gender),
    createPresetActivity('positive-affirmations', { aiRecommended: aiRecommendations?.has('positive-affirmations') ?? true }, gender),
    createPresetActivity('talk-it-out', { aiRecommended: aiRecommendations?.has('talk-it-out') ?? false }, gender),
    createPresetActivity('stress-relief', { aiRecommended: aiRecommendations?.has('stress-relief') ?? true }, gender),
  ],
})

export default function ChooseProceduresStep() {
  const router = useRouter()
  const { setAnswer, answers, analysis, saveUiSnapshot, getUiSnapshot } = useQuizStore()
  const genderKey: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
  const [selectedActivities, setSelectedActivities] = useState<string[]>(() => {
    const snap = getUiSnapshot('procedures-0')
    return Array.isArray(snap?.selectedActivities) ? snap.selectedActivities : []
  })
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const snap = getUiSnapshot('procedures-0')
    return typeof snap?.searchQuery === 'string' ? snap.searchQuery : ''
  })
  // Removed prompt-driven schedule creation (analysis icon button & modal)
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  // Inline note expand state per activity (for inline setup Note textarea)
  const [expandedInlineNotes, setExpandedInlineNotes] = useState<Record<string, boolean>>({})
  // Create Activity modal Note expand toggle
  const [createNoteExpanded, setCreateNoteExpanded] = useState(false)
  // Inline settings per selected activity (kept local to avoid altering overall design/state)
  type RepeatType = 'Daily' | 'Weekly' | 'Monthly' | null
  type TimePeriod = 'Morning' | 'Afternoon' | 'Evening' | null
  type TimeEntry = { time: string; timePeriod: Exclude<TimePeriod, null> }
  type RemindUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  interface InlineActivitySettings {
    note: string
    repeat: RepeatType
    weeklyInterval: number
    weekdays: number[]
    monthlyDays: number[]
    allDay: boolean
    times: TimeEntry[]
    endDate: boolean
    endType: 'date' | 'days'
    endDateValue: string
    endDaysValue: number
    remind: boolean
    remindAmount: number
    remindUnit: RemindUnit
  }
  const [inlineSettings, setInlineSettings] = useState<Record<string, InlineActivitySettings>>({})
  // Track which selected activities have their inline settings expanded
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set())
  // Guard to avoid re-prefilling after user edits
  const didPrefillFromAI = useRef(false)
  // Validation state to highlight required fields on Next
  const [showErrors, setShowErrors] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  // Validation modal state
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationSummary, setValidationSummary] = useState<Array<{ id: string; issues: string[] }>>([])
  // Refs to scroll to first invalid activity block
  const activityRefs = useRef<Record<string, HTMLDivElement | null>>({})
  // Extract AI recommendations from analysis results
  const extractAIRecommendations = (analysis: any): Set<string> => {
    const recommendations = new Set<string>()
    
    if (!analysis) return recommendations
    
    // Extract recommendations from all condition types
    const conditionTypes = ['skinCondition', 'hairCondition', 'physicalCondition', 'mentalCondition']
    
    for (const conditionType of conditionTypes) {
      const condition = analysis[conditionType]
      if (condition && Array.isArray(condition.recommendations)) {
        for (const rec of condition.recommendations) {
          if (typeof rec === 'string') {
            recommendations.add(rec)
          }
        }
      }
    }
    
    console.log('Extracted AI recommendations:', Array.from(recommendations))
    return recommendations
  }

  const aiRecommendations = extractAIRecommendations(analysis)
  const [activities, setActivities] = useState<ActivityCollection>(() => buildInitialActivities(genderKey, aiRecommendations))
  // Persist UI state on change (throttled by React cadence)
  useEffect(() => {
    saveUiSnapshot('procedures-0', { selectedActivities, searchQuery })
  }, [selectedActivities, searchQuery, saveUiSnapshot])
  useEffect(() => {
    // Rebuild activities when gender or analysis changes
    const currentAIRecommendations = extractAIRecommendations(analysis)
    setActivities((prev) => {
      const rebuilt = buildInitialActivities(genderKey, currentAIRecommendations)
      // Merge in any extra categories/items previously added by user
      const merged: ActivityCollection = { ...rebuilt }
      for (const [key, list] of Object.entries(prev)) {
        const targetList = (merged[key] ||= [])
        // Append items that are not part of the rebuilt list (custom-*)
        const existingIds = new Set(targetList.map((a) => a.id))
        for (const item of (list ?? [])) {
          if (!existingIds.has(item.id)) targetList.push(item)
        }
      }
      return merged
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.Gender, analysis])

  // ---- Helpers to prefill schedule from AI or defaults ----
  const toMinutes = (hhmm?: string | null): number | null => {
    if (!hhmm || typeof hhmm !== 'string') return null
    const [hh, mm] = hhmm.split(':')
    const h = Number(hh)
    const m = Number(mm)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
  }
  const fmt = (min: number): string => {
    const mm = (min % 60 + 60) % 60
    let h = Math.floor(min / 60)
    while (h < 0) h += 24
    h = h % 24
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
    return `${pad(h)}:${pad(mm)}`
  }
  const aroundMorning = (): string | null => {
    const w = toMinutes(answers.WakeUp)
    if (w == null) return null
    return fmt(w + 30)
  }
  const aroundEvening = (): string | null => {
    const e = toMinutes(answers.EndDay)
    if (e == null) return null
    return fmt(e - 30)
  }

  type PartialInline = Partial<InlineActivitySettings>
  const defaultScheduleForId = (id: string): PartialInline => {
    switch (id) {
      case 'cleanse-hydrate':
        return { repeat: 'Daily', allDay: false, times: [{ time: aroundMorning() || '07:30', timePeriod: 'Morning' }] }
      case 'spf-protection':
        return { repeat: 'Daily', allDay: false, times: [{ time: aroundMorning() || '08:00', timePeriod: 'Morning' }] }
      case 'evening-stretch':
        return { repeat: 'Daily', allDay: false, times: [{ time: aroundEvening() || '21:30', timePeriod: 'Evening' }] }
      case 'mindful-meditation':
        return { repeat: 'Daily', allDay: false, times: [{ time: aroundEvening() || '21:00', timePeriod: 'Evening' }] }
      case 'exfoliate':
        return { repeat: 'Weekly', weeklyInterval: 1, weekdays: [1,4], allDay: false, times: [] }
      case 'deep-hydration':
        return { repeat: 'Weekly', weeklyInterval: 1, weekdays: [0], allDay: false, times: [] }
      case 'strength-training':
        return { repeat: 'Weekly', weeklyInterval: 1, weekdays: [1,3], allDay: false, times: [{ time: '18:30', timePeriod: 'Evening' }] }
      case 'morning-stretch':
        return { repeat: 'Daily', allDay: false, times: [{ time: aroundMorning() || '07:15', timePeriod: 'Morning' }] }
      default:
        return { repeat: 'Daily', allDay: false, times: [] }
    }
  }

  // Normalize time strings like "7pm" -> "19:00" and period synonyms (used in multiple places)
  const parse12hTo24h = (raw?: any): { time: string | null; inferred: 'Morning'|'Afternoon'|'Evening'|null } => {
    if (typeof raw !== 'string') return { time: null, inferred: null }
    const s = raw.trim()
    const hhmm = /^\d{2}:\d{2}$/.test(s)
    if (hhmm) {
      const hh = Number(s.slice(0,2))
      if (!Number.isFinite(hh)) return { time: s, inferred: null }
      if (hh >= 5 && hh < 12) return { time: s, inferred: 'Morning' }
      if (hh >= 12 && hh < 17) return { time: s, inferred: 'Afternoon' }
      return { time: s, inferred: 'Evening' }
    }
    const m = s.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?|am|pm)\s*$/i)
    if (m) {
      let h = Number(m[1])
      const mm = typeof m[2] === 'string' && m[2] ? Number(m[2]) : 0
      const ap = (m[3] || '').toLowerCase()
      if (ap.startsWith('p') && h < 12) h += 12
      if (ap.startsWith('a') && h === 12) h = 0
      const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
      const time = `${pad(Math.max(0, Math.min(23, h)))}:${pad(Math.max(0, Math.min(59, mm)))}`
      const inferred: 'Morning'|'Afternoon'|'Evening' = h >= 5 && h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
      return { time, inferred }
    }
    return { time: null, inferred: null }
  }
  const normPeriod = (raw: any, fallback: 'Morning'|'Afternoon'|'Evening'|null): 'Morning'|'Afternoon'|'Evening'|null => {
    const v = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
    if (!v) return fallback
    if (v === 'morning' || v === 'am') return 'Morning'
    if (v === 'afternoon' || v === 'midday' || v === 'noon') return 'Afternoon'
    if (v === 'evening' || v === 'pm' || v === 'night' || v === 'late evening') return 'Evening'
    return fallback
  }

  // Map Gemini free-text recommendations to our curated activity IDs
  const normalizeLabel = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
  const NAME_TO_ID: Record<string, string> = {
    'cleanse and hydrate': 'cleanse-hydrate',
    'spf protection': 'spf-protection',
    'exfoliate': 'exfoliate',
    'deep hydration': 'deep-hydration',
    'face massage': 'face-massage',
    'lip and eye care': 'lip-eye-care',
    'wash and care': 'wash-care',
    'deep nourishment': 'deep-nourishment',
    'scalp detox': 'scalp-detox',
    'heat protection': 'heat-protection',
    'scalp massage': 'scalp-massage',
    'trim split ends': 'trim-split-ends',
    'post color care': 'post-color-care',
    'leave in care': 'leave-in-care',
    'leave in conditioner': 'leave-in-care',
    'leave in treatment': 'leave-in-care',
    'morning stretch': 'morning-stretch',
    'cardio boost': 'cardio-boost',
    'strength training': 'strength-training',
    'yoga flexibility': 'yoga-flexibility',
    'dance it out': 'dance-it-out',
    'swimming time': 'swimming-time',
    'cycling': 'cycling',
    'posture fix': 'posture-fix',
    'evening stretch': 'evening-stretch',
    'mindful meditation': 'mindful-meditation',
    'breathing exercises': 'breathing-exercises',
    'gratitude exercises': 'gratitude-exercises',
    'mood check in': 'mood-check-in',
    'learn and grow': 'learn-grow',
    'social media detox': 'social-media-detox',
    'positive affirmations': 'positive-affirmations',
    'talk it out': 'talk-it-out',
    'stress relief': 'stress-relief',
    // common synonyms
    'sunscreen': 'spf-protection',
    'spf': 'spf-protection',
    'hydrate': 'cleanse-hydrate',
    'hydration mask': 'deep-hydration',
    'hydration masks': 'deep-hydration',
    'mask hydration': 'deep-hydration',
    'exfoliation': 'exfoliate',
    'face massage lymphatic': 'face-massage',
  }
  const curatedNameToId: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    for (const [id, meta] of Object.entries(ACTIVITY_META)) {
      const key = (meta?.name || '').toLowerCase().trim()
      if (key) map[key] = id
    }
    return map
  }, [])
  const mapLabelToId = (label: unknown): string | null => {
    if (typeof label !== 'string' || !label.trim()) return null
    const raw = label.trim()
    const lower = raw.toLowerCase()
    // If Gemini already sent a curated ID
    if (ACTIVITY_META[lower]) return lower
    const norm = normalizeLabel(raw)
    if (NAME_TO_ID[norm]) return NAME_TO_ID[norm]
    if (curatedNameToId[lower]) return curatedNameToId[lower]
    return null
  }

  const buildInlineFromGemini = (id: string, src: any): InlineActivitySettings => {
    const genderKeyLocal: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
    const base: InlineActivitySettings = {
      note: getDefaultNote(id, genderKeyLocal),
      repeat: null,
      weeklyInterval: 1,
      weekdays: [],
      monthlyDays: [],
      allDay: false,
      times: [],
      endDate: false,
      endType: 'date',
      endDateValue: '',
      endDaysValue: 30,
      remind: false,
      remindAmount: 15,
      remindUnit: 'minutes',
    }
    const def = defaultScheduleForId(id)
    const merged = { ...base, ...def }
    if (src && typeof src === 'object') {
      if (typeof src.note === 'string' && src.note.trim()) merged.note = src.note
      const r = src.repeat
      if (r === 'Daily' || r === 'Weekly' || r === 'Monthly') merged.repeat = r
      if (typeof src.weeklyInterval === 'number' && src.weeklyInterval >= 1) merged.weeklyInterval = src.weeklyInterval
      if (Array.isArray(src.weeklyDays)) merged.weekdays = src.weeklyDays.filter((d: any) => Number.isFinite(d))
      if (Array.isArray(src.monthlyDays)) merged.monthlyDays = src.monthlyDays.filter((d: any) => Number.isFinite(d))
      if (typeof src.allDay === 'boolean') merged.allDay = src.allDay
      // Prefer multi-times if provided by server; else fall back to single
      if (Array.isArray(src.times) && src.times.length > 0) {
        const arr: TimeEntry[] = []
        for (const t of src.times) {
          let tt: string | null = null
          let inferred: 'Morning'|'Afternoon'|'Evening'|null = null
          if (typeof t?.time === 'string') {
            if (/^\d{2}:\d{2}$/.test(t.time)) {
              tt = t.time
              if (tt) {
                const hh = Number(tt.slice(0,2))
                inferred = hh >= 5 && hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening'
              }
            } else {
              const cv = parse12hTo24h(t.time)
              tt = cv.time
              inferred = cv.inferred
            }
          }
          const tp = (t?.timePeriod === 'Morning' || t?.timePeriod === 'Afternoon' || t?.timePeriod === 'Evening')
            ? t.timePeriod
            : normPeriod(t?.timePeriod, inferred)
          if (tt && tp && arr.length < 3) arr.push({ time: tt, timePeriod: tp })
        }
        if (arr.length > 0) {
          merged.times = arr
          merged.allDay = false
        }
      } else {
        // Back-compat: convert single time/timePeriod into one entry in times
        const rawTp = src.timePeriod
        const rawTt = src.time
        let tt: string | null = null
        let inferred: 'Morning'|'Afternoon'|'Evening'|null = null
        if (typeof rawTt === 'string') {
          if (/^\d{2}:\d{2}$/.test(rawTt)) {
            tt = rawTt
            if (tt) {
              const hh = Number(tt.slice(0,2))
              inferred = hh >= 5 && hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening'
            }
          } else {
            const cv = parse12hTo24h(rawTt)
            tt = cv.time
            inferred = cv.inferred
          }
        }
        const period = normPeriod(rawTp, inferred)
        if (tt && period) {
          merged.times = [{ time: tt, timePeriod: period }]
          merged.allDay = false
        }
      }
    }
    // Ensure repeat is set
    if (!merged.repeat) merged.repeat = 'Daily'
    return merged
  }

  // Prefill from AI recommendedSchedule once per visit; if schedule is short, top-up with condition recommendations
  useEffect(() => {
    if (didPrefillFromAI.current) return
    const sched: any[] = Array.isArray((analysis as any)?.recommendedSchedule) ? (analysis as any).recommendedSchedule : []
    try {
      if (sched.length) {
        const scheduleIds = sched.map((s) => s?.id).filter((v: any) => typeof v === 'string') as string[]
        if (scheduleIds.length) {
          // Top up selection with general AI recommendations if schedule is too short (<6)
          const recSet = extractAIRecommendations(analysis)
          // Build allowed curated IDs list
          const ensureAdd: string[] = []
          const already = new Set(scheduleIds)
          // Only accept IDs that exist in our curated activities list to ensure they actually render/select
          const allowedIds = new Set<string>()
          for (const list of Object.values(activities)) {
            for (const a of (list as any[])) {
              if (a && typeof (a as any).id === 'string') allowedIds.add((a as any).id)
            }
          }
          const pickFirstAvailable = (arr: any): string | null => {
            const list = Array.isArray(arr) ? arr : []
            for (const x of list) {
              if (typeof x === 'string') {
                const mapped = mapLabelToId(x)
                if (mapped && !already.has(mapped) && allowedIds.has(mapped)) return mapped
              }
            }
            return null
          }
          const phys1 = pickFirstAvailable((analysis as any)?.physicalCondition?.recommendations)
          if (phys1) { ensureAdd.push(phys1); already.add(phys1) }
          const ment1 = pickFirstAvailable((analysis as any)?.mentalCondition?.recommendations)
          if (ment1) { ensureAdd.push(ment1); already.add(ment1) }

          // Map all remaining recommendations to curated IDs and include them all (deduped)
          const mappedRecs: string[] = []
          for (const rec of recSet) {
            const mapped = mapLabelToId(rec)
            if (mapped && allowedIds.has(mapped) && !already.has(mapped)) {
              mappedRecs.push(mapped)
              already.add(mapped)
            }
          }
          const targetIds = Array.from(new Set(scheduleIds.concat(ensureAdd).concat(mappedRecs)))

          // Always ensure AI targets are included on first prefill; don't remove user's existing selections
          setSelectedActivities((prev) => Array.from(new Set([...(prev || []), ...targetIds])))

          setInlineSettings((prev) => {
            const next: Record<string, InlineActivitySettings> = { ...prev }
            // Fill settings from Gemini for schedule items
            for (const item of sched) {
              const id = typeof item?.id === 'string' ? item.id : ''
              if (!id) continue
              if (!next[id]) {
                next[id] = buildInlineFromGemini(id, item)
              } else {
                // Merge duplicate entries for same id to support multiple times per day
                const existing = next[id]
                // Prefer src.times if provided
                if (Array.isArray((item as any)?.times) && (item as any).times.length > 0) {
                  let added = false
                  for (const t of (item as any).times) {
                    let tt: string | null = null
                    let inferred: 'Morning'|'Afternoon'|'Evening'|null = null
                    if (typeof t?.time === 'string') {
                      if (/^\d{2}:\d{2}$/.test(t.time)) {
                        tt = t.time
                        if (tt) {
                          const hh = Number(tt.slice(0,2))
                          inferred = hh >= 5 && hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening'
                        }
                      } else {
                        const cv = parse12hTo24h(t.time)
                        tt = cv.time
                        inferred = cv.inferred
                      }
                    }
                    const tp = (t?.timePeriod === 'Morning' || t?.timePeriod === 'Afternoon' || t?.timePeriod === 'Evening')
                      ? t.timePeriod
                      : normPeriod(t?.timePeriod, inferred)
                    if (tt && tp) {
                      const dup = (existing.times || []).some(x => x.time === tt && x.timePeriod === tp)
                      if (!dup && (existing.times || []).length < 3) {
                        existing.times = [...(existing.times || []), { time: tt, timePeriod: tp }]
                        added = true
                      }
                    }
                  }
                  if (added) existing.allDay = false
                } else {
                  // Fallback to single time/timePeriod
                  const rawTp = (item as any)?.timePeriod
                  const rawTt = (item as any)?.time
                  let tt: string | null = null
                  let inferred: 'Morning'|'Afternoon'|'Evening'|null = null
                  if (typeof rawTt === 'string') {
                    if (/^\d{2}:\d{2}$/.test(rawTt)) {
                      tt = rawTt
                      if (tt) {
                        const hh = Number(tt.slice(0,2))
                        inferred = hh >= 5 && hh < 12 ? 'Morning' : hh < 17 ? 'Afternoon' : 'Evening'
                      }
                    } else {
                      const cv = parse12hTo24h(rawTt)
                      tt = cv.time
                      inferred = cv.inferred
                    }
                    const period = normPeriod(rawTp, inferred)
                    if (tt && period) {
                      const dup = (existing.times || []).some(x => x.time === tt && x.timePeriod === period)
                      if (!dup && (existing.times || []).length < 3) {
                        existing.times = [...(existing.times || []), { time: tt, timePeriod: period }]
                        existing.allDay = false
                      }
                    }
                  }
                }
              }
            }
            // For topped-up items, ensure defaults exist
            for (const id of targetIds) {
              if (!next[id]) {
                const base: InlineActivitySettings = {
                  note: getDefaultNote(id, genderKey),
                  repeat: null,
                  weeklyInterval: 1,
                  weekdays: [],
                  monthlyDays: [],
                  allDay: false,
                  times: [],
                  endDate: false,
                  endType: 'date',
                  endDateValue: '',
                  endDaysValue: 30,
                  remind: false,
                  remindAmount: 15,
                  remindUnit: 'minutes',
                }
                const merged = { ...base, ...defaultScheduleForId(id) }
                if (!merged.repeat) merged.repeat = 'Daily'
                next[id] = merged
              }
            }
            return next
          })

          // Expand all selected items by default so their settings are visible
          setExpandedActivities(new Set(targetIds))
          didPrefillFromAI.current = true
          return
        }
      }
      // Fallback: derive a small set from AI condition recommendations if schedule missing
      const recsRaw = Array.from(extractAIRecommendations(analysis))
      // Use mapping to turn labels into curated IDs and include all available curated ones
      const allowedIds = new Set<string>()
      for (const list of Object.values(activities)) {
        for (const a of (list as any[])) {
          if (a && typeof (a as any).id === 'string') allowedIds.add((a as any).id)
        }
      }
      const recs = recsRaw.map(mapLabelToId).filter((id): id is string => !!id && allowedIds.has(id))
      if (recs.length) {
        // Fallback: include all curated AI recs while preserving any existing selections
        setSelectedActivities((prev) => Array.from(new Set([...(prev || []), ...recs])))
        setInlineSettings((prev) => {
          const next: Record<string, InlineActivitySettings> = { ...prev }
          for (const id of recs) {
            if (!next[id]) {
              // Use deterministic defaults per id
              const base: InlineActivitySettings = {
                note: getDefaultNote(id, genderKey),
                repeat: null,
                weeklyInterval: 1,
                weekdays: [],
                monthlyDays: [],
                allDay: false,
                times: [],
                endDate: false,
                endType: 'date',
                endDateValue: '',
                endDaysValue: 30,
                remind: false,
                remindAmount: 15,
                remindUnit: 'minutes',
              }
              next[id] = { ...base, ...defaultScheduleForId(id) }
              // Ensure repeat
              if (!next[id].repeat) next[id].repeat = 'Daily'
            }
          }
          return next
        })
        // Expand all selected in fallback (consistent with prior expectation)
        setExpandedActivities(new Set(recs))
        didPrefillFromAI.current = true
      }
    } catch {
      // ignore bad AI data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis])
  

  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '',
    iconId: ''
  })
  
  const [newActivity, setNewActivity] = useState({
    name: '',
    note: '',
    category: '',
    color: '',
    iconId: ''
  })
  
  const [activityErrors, setActivityErrors] = useState({
    name: '',
    category: '',
    color: '',
    iconId: ''
  })


  // Removed templates list (was used by deleted prompt modal)


  const [categories, setCategories] = useState([
    'Skin', 'Hair', 'Physical health', 'Mental Wellness'
  ])

  const colors = [
    { id: 'red', value: '#FF6B6B', name: 'Red' },
    { id: 'teal', value: '#4ECDC4', name: 'Teal' },
    { id: 'blue', value: '#45B7D1', name: 'Blue' },
    { id: 'green', value: '#96CEB4', name: 'Green' },
    { id: 'purple', value: '#A385E9', name: 'Purple' },
    { id: 'orange', value: '#FFB347', name: 'Orange' },
    { id: 'pink', value: '#FFB6C1', name: 'Pink' },
    { id: 'yellow', value: '#FFEAA7', name: 'Yellow' }
  ]

  const quickIconOptions = useMemo<ProceduresIconEntry[]>(() => {
    const seen = new Set<string>()
    const picks: ProceduresIconEntry[] = []

    for (const id of QUICK_ICON_IDS) {
      const entry = getProceduresIconById(id)
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id)
        picks.push(entry)
      }
    }

    if (!picks.length) {
      for (const entry of PROCEDURES_ICON_CATALOG) {
        if (!seen.has(entry.id)) {
          seen.add(entry.id)
          picks.push(entry)
        }
        if (picks.length >= 8) {
          break
        }
      }
    }

    return picks
  }, [])

  const iconCategories = useMemo(() => {
    return getProceduresIconCategories()
  }, [])

  const [iconCategoryFilter, setIconCategoryFilter] = useState<string>('all')
  const [iconPage, setIconPage] = useState(0)

  const normalizedIconSearch = (iconSearchQuery ?? '').toString().trim().toLowerCase()

  const filteredIconEntries = useMemo(() => {
    return PROCEDURES_ICON_CATALOG.filter((entry) => {
      const matchesCategory = iconCategoryFilter === 'all' || entry.category === iconCategoryFilter
      if (!matchesCategory) {
        return false
      }

      if (!normalizedIconSearch) {
        return true
      }

      const haystack = [entry.label, entry.id, ...(entry.search ?? [])]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedIconSearch)
    })
  }, [iconCategoryFilter, normalizedIconSearch])

  useEffect(() => {
    setIconPage(0)
  }, [iconCategoryFilter, normalizedIconSearch, isIconPickerOpen])

  const totalIconPages = filteredIconEntries.length
    ? Math.ceil(filteredIconEntries.length / ICONS_PER_PAGE)
    : 0

  useEffect(() => {
    if (totalIconPages === 0) {
      setIconPage(0)
      return
    }

    setIconPage((prev) => Math.min(prev, totalIconPages - 1))
  }, [totalIconPages])

  const paginatedIconEntries = useMemo(() => {
    if (!totalIconPages) {
      return []
    }
    const startIndex = iconPage * ICONS_PER_PAGE
    return filteredIconEntries.slice(startIndex, startIndex + ICONS_PER_PAGE)
  }, [filteredIconEntries, iconPage, totalIconPages])

  const selectedActivityIcon = newActivity.iconId ? getProceduresIconById(newActivity.iconId) : null
  const selectedCategoryIcon = newCategory.iconId ? getProceduresIconById(newCategory.iconId) : null
  const activeIconId = isCreateCategoryModalOpen ? newCategory.iconId : newActivity.iconId
  const activeIconColor = isCreateCategoryModalOpen ? (newCategory.color || 'rgb(var(--color-primary))') : (newActivity.color || 'rgb(var(--color-primary))')

  useEffect(() => {
    const stored = answers.SelectedActivities
    // Only hydrate from persisted answers if there is something to restore.
    // Avoid overriding AI prefill or user selections with an empty array.
    if (Array.isArray(stored) && stored.length > 0) {
      setSelectedActivities(stored)
    }
  }, [answers.SelectedActivities])


  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )

    // When selecting manually, expand that activity by default; when deselecting, collapse it
    setExpandedActivities(prev => {
      const next = new Set(prev)
      if (next.has(activityId)) {
        next.delete(activityId)
      } else {
        next.add(activityId)
      }
      return next
    })

    // Initialize inline defaults on first expand (do not change global answers here)
    setInlineSettings(prev => {
      if (prev[activityId]) return prev
      const activityCard = (() => {
        for (const list of Object.values(activities)) {
          const found = (list || []).find((a) => a.id === activityId)
          if (found) return found
        }
        return undefined
      })()
      const genderKey: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
      return {
        ...prev,
        [activityId]: {
          note: activityCard?.note ?? getDefaultNote(activityId, genderKey),
          repeat: null,
          weeklyInterval: 1,
          weekdays: [],
          monthlyDays: [],
          allDay: false,
          times: [],
          endDate: false,
          endType: 'date',
          endDateValue: '',
          endDaysValue: 30,
          remind: false,
          remindAmount: 15,
          remindUnit: 'minutes',
        },
      }
    })
  }

  const handleCreateActivity = () => {
    // Pre-fill default notes for selected activities into overrides (non-destructive)
    const genderKey: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
    const existingOverrides = answers.ActivityMetaOverrides || {}
    const nextOverrides = { ...existingOverrides }
    for (const id of selectedActivities) {
      const meta = getActivityMeta(id)
      if (!nextOverrides[id]) {
        nextOverrides[id] = {
          name: meta.name,
          iconId: meta.iconId,
          primary: meta.primary,
          surface: meta.surface,
        }
      }
      // Attach default note as a synthetic field on the override via a parallel map in session state if needed.
      // Since overrides schema doesn't include 'note', we rely on ProcedureSetupStep to compute note again.
    }
    setAnswer('ActivityMetaOverrides', nextOverrides)
    // Save default notes snapshot for selected items
    const notes: Record<string, string> = {}
    // Build a quick lookup for all activities by id to capture custom notes
    const allActivityMap = new Map<string, ActivityCard>()
    for (const list of Object.values(activities)) {
      for (const a of list) allActivityMap.set(a.id, a)
    }
    for (const id of selectedActivities) {
      const a = allActivityMap.get(id)
      if (a && a.note) {
        notes[id] = a.note
      } else {
        notes[id] = getDefaultNote(id, genderKey)
      }
    }
    setAnswer('ActivityNotes', { ...(answers.ActivityNotes || {}), ...notes })
    setAnswer('SelectedActivities', selectedActivities)
    router.push('/procedures/1')
  }

  // Removed prompt submit & template selection handlers


  const handleNewActivityChange = (field: string, value: string) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }))
    

    if (activityErrors[field as keyof typeof activityErrors]) {
      setActivityErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }


  const handleNewCategoryChange = (field: string, value: string) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value
    }))
  }


  // Inline settings validator
  const getIssues = (s: InlineActivitySettings): string[] => {
    const issues: string[] = []
    if (!s.repeat) issues.push('missingRepeat')
    if (s.repeat === 'Weekly' && (!s.weekdays || s.weekdays.length === 0)) issues.push('weeklyNoDays')
    if (s.repeat === 'Monthly' && (!s.monthlyDays || s.monthlyDays.length === 0)) issues.push('monthlyNoDays')
    if (!s.allDay) {
      if (!Array.isArray(s.times) || s.times.length === 0 || s.times.some(t => !t.time)) {
        issues.push('missingTime')
      }
    }
    if (s.endDate) {
      if (s.endType === 'date' && !s.endDateValue) issues.push('missingEndDate')
      if (s.endType === 'days' && (!s.endDaysValue || s.endDaysValue < 1)) issues.push('invalidEndDays')
    }
    return issues
  }

  // Next button: validate, persist inline config, emit activities payload to DB, then go to generating
  const handleNext = () => {
    setShowErrors(true)
    const errs: Record<string, string[]> = {}
    for (const id of selectedActivities) {
      const s = inlineSettings[id] || {
        note: getDefaultNote(id, answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'),
        repeat: null,
        weeklyInterval: 1,
        weekdays: [],
        monthlyDays: [],
        allDay: false,
        times: [],
        endDate: false,
        endType: 'date',
        endDateValue: '',
        endDaysValue: 30,
        remind: false,
        remindAmount: 15,
        remindUnit: 'minutes',
      }
      const issues = getIssues(s)
      if (issues.length) errs[id] = issues
    }
    setValidationErrors(errs)
    if (Object.keys(errs).length > 0) {
      // Stop and highlight invalid fields
      const firstInvalidId = selectedActivities.find((id) => (errs[id] || []).length > 0)
      // Expand all activities that have errors for visibility
      const errorIds = Object.keys(errs)
      setExpandedActivities(prev => {
        const next = new Set(prev)
        for (const id of errorIds) next.add(id)
        return next
      })
      setValidationSummary(errorIds.map(id => ({ id, issues: errs[id] || [] })))
      setShowValidationModal(true)
      if (firstInvalidId) {
        const el = activityRefs.current[firstInvalidId]
        if (el && typeof el.scrollIntoView === 'function') {
          // Slight defer to ensure error styles are rendered
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
          })
        }
      }
      return
    }

    // Persist notes and preConfig overrides
    const nextNotes: Record<string, string> = { ...(answers.ActivityNotes || {}) }
    const nextOverrides = { ...(answers.ActivityMetaOverrides || {}) } as Record<string, any>

    // Build a quick lookup for default notes
    const allActivityMap = new Map<string, ActivityCard>()
    for (const list of Object.values(activities)) {
      for (const a of (list || [])) allActivityMap.set(a.id, a)
    }

    for (const id of selectedActivities) {
      const meta = getActivityMeta(id)
      const s = inlineSettings[id]
      const gender: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
      const fallbackNote = allActivityMap.get(id)?.note ?? getDefaultNote(id, gender)
      nextNotes[id] = s?.note ?? fallbackNote

      if (!nextOverrides[id]) {
        nextOverrides[id] = {
          name: meta.name,
          iconId: meta.iconId,
          primary: meta.primary,
          surface: meta.surface,
        }
      }
      const firstTime = s?.times && s.times.length > 0 ? s.times[0] : undefined
      nextOverrides[id].preConfig = {
        note: s?.note,
        repeat: s?.repeat,
        weeklyInterval: s?.weeklyInterval,
        weekdays: s?.weekdays,
        monthlyDays: s?.monthlyDays,
        allDay: s?.allDay,
        // Back-compat single fields populated from first time entry
        time: firstTime?.time,
        timePeriod: firstTime?.timePeriod,
        // New multi-time support
        times: s?.times || [],
        endDate: s?.endDate,
        endType: s?.endType,
        endDateValue: s?.endDateValue,
        endDaysValue: s?.endDaysValue,
        remind: s?.remind,
        remindAmount: s?.remindAmount,
        remindUnit: s?.remindUnit,
      }
    }

    setAnswer('ActivityNotes', nextNotes)
    setAnswer('ActivityMetaOverrides', nextOverrides)
    setAnswer('SelectedActivities', selectedActivities)

    // Build compact activities payload for server finalize to consume
    try {
      const activitiesPayload = selectedActivities.map((id) => {
        const meta = getActivityMeta(id)
        const s = inlineSettings[id]
        const note = nextNotes[id] || ''
        const freq = (s?.repeat || 'Daily').toLowerCase()
        return {
          Id: id,
          Name: meta.name,
          Illustration: meta.iconId,
          Category: '',
          CategoryId: '',
          Note: note,
          IsRecommended: false,
          Type: 'regular',
          ActiveStatus: true,
          Time: s?.allDay ? null : ((s?.times && s.times[0]?.time) || ''),
          Frequency: freq, // 'daily' | 'weekly' | 'monthly'
          SelectedDays: freq === 'weekly' ? (s?.weekdays || []) : [],
          WeeksInterval: s?.weeklyInterval ?? 1,
          SelectedMonthDays: freq === 'monthly' ? (s?.monthlyDays || []) : [],
          SelectedNotifyBeforeUnit: s?.remind ? (s?.remindUnit || 'minutes') : '',
          SelectedNotifyBeforeFrequency: s?.remind ? (s?.remindAmount || 0) : '',
          Color: meta.primary,
        }
      })

      const evt = [{
        eventName: 'activitiesConfigured',
        timestamp: new Date().toISOString(),
        details: { activities: activitiesPayload },
      }]
      // Fire-and-forget: persist activities snapshot for server finalize to read
      Promise.resolve(
        saveOnboardingSession((answers.sessionId || '').trim(), evt as any, answers.Id)
      ).catch(() => {})
    } catch {}

    router.push('/procedures/1')
  }


  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.color || !newCategory.iconId) {
      return
    }


    setCategories(prev => [...prev, newCategory.name])


    const categoryKey = newCategory.name.toLowerCase().replace(/\s+/g, '')
    setActivities(prev => ({
      ...prev,
      [categoryKey]: []
    }))

    console.log('Created new category:', newCategory.name, 'with key:', categoryKey)


    setNewActivity(prev => ({
      ...prev,
      category: newCategory.name
    }))


    setNewCategory({
      name: '',
      color: '',
      iconId: ''
    })


    setIsCreateCategoryModalOpen(false)
  }


  const hexToRgb = (hex: string) => {
    console.log('Converting hex to RGB:', hex)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    const rgb = result ? [
      parseInt(result[1]!, 16),
      parseInt(result[2]!, 16),
      parseInt(result[3]!, 16)
    ] : [0, 0, 0]
    console.log('RGB result:', rgb)
    return rgb
  }

  const getColorFromPosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY
    

    const distance = Math.sqrt(x * x + y * y)
    const maxRadius = rect.width / 2 - 32
    

    if (distance < 32) return null
    

    const saturation = Math.min(distance / maxRadius, 1)
    

    const angle = (Math.atan2(y, x) * (180 / Math.PI) + 90 + 360) % 360
    

    const hue = angle
    const lightness = 0.5
    
    return `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`
  }

  const handleColorPickerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const color = getColorFromPosition(e)
    if (color) {
      handleNewActivityChange('color', color)
    }
  }

  const handleColorPickerMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const color = getColorFromPosition(e)
      if (color) {
        handleNewActivityChange('color', color)
      }
    }
  }

  const handleColorPickerClick = (e: React.MouseEvent) => {
    const color = getColorFromPosition(e)
    if (color) {
      handleColorSelect(color)
    }
  }

  const handleColorPickerMouseUp = () => {
    setIsDragging(false)
  }


  const hslToHex = (hsl: string) => {
    if (!hsl.startsWith('hsl')) return hsl
    
    const matches = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!matches) return hsl
    
    const h = parseInt(matches[1]!) / 360
    const s = parseInt(matches[2]!) / 100
    const l = parseInt(matches[3]!) / 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const handleColorSelect = (color: string) => {

    const hexColor = hslToHex(color)
    if (isCreateCategoryModalOpen) {
      handleNewCategoryChange('color', hexColor)
    } else {
      handleNewActivityChange('color', hexColor)
    }

  }


  const handleIconPickerOpen = () => {
    setIsIconPickerOpen(true)
    setIconSearchQuery('')
  }


  const categoryDisplayNames: Record<string, string> = {
    'skin': 'Skin',
    'hair': 'Hair',
    'physical': 'Physical health',
    'mental': 'Mental Wellness',

  }


  const filteredActivities = Object.keys(activities).reduce((acc, categoryKey) => {
    acc[categoryKey] = ((activities as any)[categoryKey] || []).filter((activity: any) => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="h-screen bg-background flex justify-center">
      <div className="w-11/12 max-w-xl flex flex-col">
      {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <button 
            onClick={() => router.back()}
            className="w-7 h-7 flex items-center justify-center"
          >
            <span className="text-text-primary text-xl">‹</span>
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Choose Activities</h1>
          <div className="w-10 h-10" aria-hidden="true"></div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
                placeholder="Type something"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-surface border border-border-subtle/70 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
            </div>
          <button
            onClick={() => setIsCreateActivityModalOpen(true)}
            aria-label="Add new activity"
            className="w-14 h-12 bg-surface border-2 border-primary rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors font-semibold text-2xl"
          >
            +
          </button>
          </div>
        </div>

             {/* Activities List */}
             <div className="flex-1 px-6 pb-32 overflow-y-auto min-h-0 scrollbar-hide">
               {/* Dynamic Categories */}
               {Object.entries(filteredActivities).map(([categoryKey, activitiesList]) => {
                 if (activitiesList.length === 0) return null
                 
                 const displayName = categoryDisplayNames[categoryKey] || 
                   categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
                 
                 return (
                   <div key={categoryKey} className="mb-6">
                     <h3 className="text-sm text-text-secondary mb-3">{displayName}</h3>
                     <div className="space-y-3">
                       {activitiesList.map((activity) => {
                         const selected = selectedActivities.includes(activity.id)
                         const settings: InlineActivitySettings = inlineSettings[activity.id] || {
                           note: activity.note ?? getDefaultNote(activity.id, genderKey),
                           repeat: null,
                           weeklyInterval: 1,
                           weekdays: [],
                           monthlyDays: [],
                           allDay: false,
                           times: [],
                           endDate: false,
                           endType: 'date',
                           endDateValue: '',
                           endDaysValue: 30,
                           remind: false,
                           remindAmount: 15,
                           remindUnit: 'minutes',
                         }
                         // Determine configuration completeness to drive the status indicator
                         const configured = ((): boolean => {
                           const issues = getIssues(settings)
                           return issues.length === 0
                         })()
                         return (
                           <div
                             key={activity.id}
                             className=""
                             ref={(el) => {
                               activityRefs.current[activity.id] = el
                             }}
                           >
                             <button
                               onClick={() => handleActivityToggle(activity.id)}
                               className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                                 selected
                                   ? 'hover:opacity-80'
                                   : 'border border-border-subtle bg-surface grayscale opacity-70 hover:opacity-80'
                               }`}
                               style={selected ? { backgroundColor: extractRgbaFromClass(activity.bgColor) } : undefined}
                             >
                               <ActivityIcon activityId={activity.id} iconId={activity.iconId} color={activity.color} label={activity.name} />
                               <div className="ml-3 flex-1 text-left">
                                 <div className="text-text-primary font-medium text-base">{activity.name}</div>
                                 {activity.aiRecommended && (
                                   <div className="text-xs font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent">
                                     AI recommendation for you
                                   </div>
                                 )}
                               </div>
                               {selected && (
                                 <button
                                   type="button"
                                   aria-label={expandedActivities.has(activity.id) ? 'Collapse settings' : 'Expand settings'}
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     setExpandedActivities(prev => {
                                       const next = new Set(prev)
                                       if (next.has(activity.id)) next.delete(activity.id)
                                       else next.add(activity.id)
                                       return next
                                     })
                                   }}
                                   className="mr-3 w-6 h-6 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary"
                                 >
                                   <svg className={`w-4 h-4 transition-transform ${expandedActivities.has(activity.id) ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                     <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                   </svg>
                                 </button>
                               )}
                               {selected && (
                                 <div
                                   className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                     configured ? 'bg-primary' : 'border-2 border-primary'
                                   }`}
                                 >
                                   {configured && (
                                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                     </svg>
                                   )}
                                 </div>
                               )}
                             </button>

                             {/* Inline settings (collapsed when not selected) */}
                             <AnimatePresence initial={false}>
                               {selected && expandedActivities.has(activity.id) && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   transition={{ duration: 0.25 }}
                                   className="overflow-hidden"
                                 >
                                   <div className="px-3 pt-2 pb-3">
                                     {/* Note */}
                                     <div className="mt-2">
                                       <div className="flex items-center justify-between px-1">
                                         <div className="text-[14px] font-bold text-text-primary">Note</div>
                                         <button
                                           type="button"
                                           onClick={(e) => {
                                             e.stopPropagation()
                                             setExpandedInlineNotes(prev => ({ ...prev, [activity.id]: !prev[activity.id] }))
                                           }}
                                           className="text-[12px] font-semibold text-text-secondary hover:text-text-primary"
                                         >
                                           {expandedInlineNotes[activity.id] ? 'Collapse' : 'Expand'}
                                         </button>
                                       </div>
                                       <textarea
                                         value={settings.note}
                                         onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, note: e.target.value } }))}
                                         placeholder="Type the note here.."
                                         className={`mt-2 w-full rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[14px] text-text-primary ${expandedInlineNotes[activity.id] ? 'resize-y min-h-[120px]' : 'resize-none'}`}
                                       />
                                     </div>

                                     {/* Repeat controls */}
                                     <div className="mt-3">
                                       <div className="px-1 text-[14px] font-bold text-text-primary">Repeat</div>
                                       <div className={`mt-2 flex gap-2 ${showErrors && validationErrors[activity.id]?.includes('missingRepeat') ? 'ring-2 ring-red-400 rounded-[10px] p-1' : ''}`}>
                                         {(['Daily','Weekly','Monthly'] as const).map((option) => (
                                           <button
                                             key={option}
                                             type="button"
                                             onClick={() => {
                                               const next = { ...settings, repeat: option as RepeatType }
                                               if (option === 'Daily') {
                                                 next.weekdays = [0,1,2,3,4,5,6]
                                               }
                                               if (option === 'Weekly') {
                                                 next.allDay = false
                                                 if (!next.weeklyInterval) next.weeklyInterval = 1
                                               }
                                               if (option === 'Monthly') {
                                                 next.allDay = false
                                                 if (!Array.isArray(next.monthlyDays)) next.monthlyDays = []
                                               }
                                               setInlineSettings(prev => ({ ...prev, [activity.id]: next }))
                                             }}
                                             className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                               settings.repeat === option
                                                 ? 'bg-[#5C4688] text-white shadow'
                                                 : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                                             }`}
                                           >
                                             {option}
                                           </button>
                                         ))}
                                       </div>
                                         {showErrors && validationErrors[activity.id]?.includes('missingRepeat') && (
                                           <div className="mt-2 px-1 text-[12px] font-semibold text-red-500">Choose Daily, Weekly or Monthly</div>
                                         )}

                                       {/* Weekly details */}
                                       {settings.repeat === 'Weekly' && (
                                         <div className="mt-3">
                                           <div className="mb-2 flex items-center flex-wrap gap-2 px-1 text-[14px] font-bold text-text-primary">
                                             <span>On these days</span>
                                             <span className="text-text-secondary font-medium">every</span>
                                              <div className={`relative ${showErrors && (validationErrors[activity.id]?.includes('weeklyNoDays') || validationErrors[activity.id]?.includes('missingRepeat')) ? 'ring-2 ring-red-400 rounded-[10px]' : ''}`}>
                                               <select
                                                 aria-label="Weekly interval"
                                                 value={settings.weeklyInterval}
                                                 onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, weeklyInterval: Math.min(7, Math.max(1, Number(e.target.value) || 1)) } }))}
                                                  className="appearance-none rounded-[10px] border border-border-subtle bg-surface px-3 py-2 pr-9 text-[14px] font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/70 hover:border-primary/60 shadow-sm"
                                               >
                                                 {[1,2,3,4,5,6,7].map((n) => (
                                                   <option key={n} value={n}>{n}</option>
                                                 ))}
                                               </select>
                                               <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary">
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                   <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                               </span>
                                             </div>
                                             <span className="text-text-secondary font-medium">week{settings.weeklyInterval > 1 ? 's' : ''}</span>
                                           </div>
                                           <div className="flex flex-wrap gap-2">
                                             {['S','M','T','W','T','F','S'].map((label, dayIndex) => {
                                               const isActive = settings.weekdays.includes(dayIndex)
                                               return (
                                                 <button
                                                   type="button"
                                                   key={`weekly-${activity.id}-${dayIndex}-${label}`}
                                                   onClick={() => {
                                                     const nextDays = isActive
                                                       ? settings.weekdays.filter(d => d !== dayIndex)
                                                       : [...settings.weekdays, dayIndex].sort((a,b)=>a-b)
                                                     setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, weekdays: nextDays } }))
                                                   }}
                                                  className={`h-9 w-9 rounded-full text-sm font-medium transition ${
                                                    isActive ? 'bg-[#5C4688] text-white shadow' : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                                                  } ${showErrors && validationErrors[activity.id]?.includes('weeklyNoDays') ? 'ring-2 ring-red-400' : ''}`}
                                                 >
                                                   {label}
                                                 </button>
                                               )
                                             })}
                                           </div>
                                          {showErrors && validationErrors[activity.id]?.includes('weeklyNoDays') && (
                                            <div className="mt-2 px-1 text-[12px] font-semibold text-red-500">Pick at least one weekday</div>
                                          )}
                                         </div>
                                       )}

                                       {/* Monthly details */}
                                       {settings.repeat === 'Monthly' && (
                                         <div className="mt-3">
                                           <div className="px-1 text-[12px] font-medium text-text-secondary mb-2">Select days of month</div>
                                           <div className={`grid grid-cols-7 gap-2 ${showErrors && validationErrors[activity.id]?.includes('monthlyNoDays') ? 'ring-2 ring-red-400 rounded-[12px] p-1' : ''}`}>
                                             {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                                               const active = settings.monthlyDays.includes(day)
                                               return (
                                                 <button
                                                   key={`mday-${activity.id}-${day}`}
                                                   type="button"
                                                   onClick={() => {
                                                     const next = active
                                                       ? settings.monthlyDays.filter((d) => d !== day)
                                                       : [...settings.monthlyDays, day].sort((a,b)=>a-b)
                                                     setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, monthlyDays: next } }))
                                                   }}
                                                   className={`h-9 w-9 rounded-full text-sm font-semibold transition ${active ? 'bg-[#5C4688] text-white shadow' : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'}`}
                                                 >
                                                   {day}
                                                 </button>
                                               )
                                             })}
                                           </div>
                                           {showErrors && validationErrors[activity.id]?.includes('monthlyNoDays') && (
                                             <div className="mt-2 px-1 text-[12px] font-semibold text-red-500">Select at least one day of month</div>
                                           )}
                                         </div>
                                       )}
                                     </div>

                                     {/* All day + Time(s) */}
                                     <div className="mt-3 flex items-center gap-2 px-1">
                                       <input
                                         type="checkbox"
                                         checked={settings.allDay}
                                         onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, allDay: e.target.checked } }))}
                                         className="w-4 h-4"
                                       />
                                       <label className="text-sm text-text-primary">All day</label>
                                     </div>
                                     {!settings.allDay && (
                                       <div className="mt-2">
                                         <div className="px-1 text-[14px] font-bold text-text-primary">Time(s)</div>
                                         {/* Quick multi-select presets */}
                                         <div className={`mt-2 flex gap-2 ${showErrors && validationErrors[activity.id]?.includes('missingTime') && (settings.times || []).length === 0 ? 'ring-2 ring-red-400 rounded-[10px] p-1' : ''}`}>
                                           {(['Morning','Afternoon','Evening'] as const).map(period => {
                                             const active = (settings.times || []).some(t => t.timePeriod === period)
                                             return (
                                               <button
                                                 key={period}
                                                 type="button"
                                                 onClick={() => {
                                                   const timeMap: Record<Exclude<TimePeriod, null>, string> = { Morning: '07:00', Afternoon: '13:00', Evening: '19:00' }
                                                   setInlineSettings(prev => {
                                                     const cur = prev[activity.id] || settings
                                                     const exists = (cur.times || []).some(t => t.timePeriod === period)
                                                     let nextTimes: TimeEntry[]
                                                     if (exists) {
                                                       nextTimes = (cur.times || []).filter(t => t.timePeriod !== period)
                                                     } else {
                                                       const toAdd: TimeEntry = { time: timeMap[period], timePeriod: period }
                                                       nextTimes = [ ...(cur.times || []), toAdd ].slice(0,3)
                                                     }
                                                     return { ...prev, [activity.id]: { ...cur, times: nextTimes } }
                                                   })
                                                 }}
                                                 className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                                   active
                                                     ? 'bg-[#5C4688] text-white shadow'
                                                     : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                                                 }`}
                                               >
                                                 {period}
                                               </button>
                                             )
                                           })}
                                         </div>
                                         {/* Times list */}
                                         <div className="mt-3 space-y-2">
                                           {(settings.times || []).map((entry, idx) => (
                                             <div key={idx} className="flex items-center gap-2">
                                               <input
                                                 type="time"
                                                 value={entry.time}
                                                 onChange={(e) => setInlineSettings(prev => {
                                                   const cur = prev[activity.id] || settings
                                                   const nextTimes = [...(cur.times || [])]
                                                   const current = nextTimes[idx] as TimeEntry
                                                   nextTimes[idx] = { time: e.target.value, timePeriod: current?.timePeriod || 'Morning' }
                                                   return { ...prev, [activity.id]: { ...cur, times: nextTimes } }
                                                 })}
                                                 className={`flex-1 rounded-[10px] border px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/70 hover:border-primary/60 shadow-sm ${showErrors && validationErrors[activity.id]?.includes('missingTime') ? 'border-red-500 ring-red-400 focus:ring-red-400' : 'border-border-subtle'}`}
                                               />
                                               <select
                                                 value={entry.timePeriod}
                                                 onChange={(e) => setInlineSettings(prev => {
                                                   const cur = prev[activity.id] || settings
                                                   const nextTimes = [...(cur.times || [])]
                                                   const current = nextTimes[idx] as TimeEntry
                                                   const newPeriod = e.target.value as TimeEntry['timePeriod']
                                                   nextTimes[idx] = { time: current?.time || '07:00', timePeriod: newPeriod }
                                                   return { ...prev, [activity.id]: { ...cur, times: nextTimes } }
                                                 })}
                                                 className="w-36 rounded-[10px] border border-border-subtle bg-surface px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/70 hover:border-primary/60 shadow-sm"
                                               >
                                                 {(['Morning','Afternoon','Evening'] as const).map(p => (
                                                   <option key={p} value={p}>{p}</option>
                                                 ))}
                                               </select>
                                               <button
                                                 type="button"
                                                 onClick={() => setInlineSettings(prev => {
                                                   const cur = prev[activity.id] || settings
                                                   const nextTimes = (cur.times || []).filter((_, i) => i !== idx)
                                                   return { ...prev, [activity.id]: { ...cur, times: nextTimes } }
                                                 })}
                                                 className="w-9 h-9 rounded-full border border-border-subtle text-text-secondary hover:text-red-500 hover:border-red-400"
                                                 aria-label="Remove time"
                                               >
                                                 ×
                                               </button>
                                             </div>
                                           ))}
                                         </div>
                                         <div className="mt-2">
                                           <button
                                             type="button"
                                             onClick={() => setInlineSettings(prev => {
                                               const cur = prev[activity.id] || settings
                                               const defaults: TimeEntry[] = (cur.times || [])
                                               if (defaults.length >= 3) return prev
                                               const missingPeriod = (['Morning','Afternoon','Evening'] as const).find(p => !(defaults || []).some(t => t.timePeriod === p)) || 'Morning'
                                               const timeMap: Record<Exclude<TimePeriod, null>, string> = { Morning: '07:00', Afternoon: '13:00', Evening: '19:00' }
                                               const nextTimes = [ ...(defaults || []), { time: timeMap[missingPeriod], timePeriod: missingPeriod } ]
                                               return { ...prev, [activity.id]: { ...cur, times: nextTimes } }
                                             })}
                                             className="w-full rounded-[10px] border border-dashed border-border-subtle px-3 py-2 text-[14px] text-text-secondary hover:border-primary hover:text-text-primary"
                                           >
                                             + Add another time
                                           </button>
                                           {showErrors && validationErrors[activity.id]?.includes('missingTime') && (
                                             <div className="mt-2 px-1 text-[12px] font-semibold text-red-500">Pick at least one time or set All day</div>
                                           )}
                                         </div>
                                       </div>
                                     )}

                                     {/* End Activity On */}
                                     <div className="mt-4">
                                       <div className="flex items-center justify-between px-1">
                                         <div className="text-[14px] font-bold text-text-primary">End Activity On</div>
                                         <input
                                           type="checkbox"
                                           checked={settings.endDate}
                                           onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, endDate: e.target.checked } }))}
                                           className="w-4 h-4"
                                         />
                                       </div>
                                       {settings.endDate && (
                                         <div className="mt-3">
                                           <div className="flex gap-2">
                                             {(['date','days'] as const).map((option) => (
                                               <button
                                                 key={option}
                                                 type="button"
                                                 onClick={() => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, endType: option } }))}
                                                 className={`flex-1 rounded-[9px] px-3 py-[6px] text-[14px] leading-[13px] transition-colors ${
                                                   settings.endType === option
                                                     ? 'bg-[#5C4688] text-white shadow'
                                                     : 'bg-surface text-text-primary dark:bg-white/5 dark:text-white'
                                                 }`}
                                               >
                                                 {option === 'date' ? 'Date' : 'Days'}
                                               </button>
                                             ))}
                                           </div>
                                           {settings.endType === 'date' ? (
                                             <div className="mt-3">
                                               <input
                                                 type="date"
                                                 value={settings.endDateValue}
                                                 onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, endDateValue: e.target.value } }))}
                                                 className="w-full rounded-[8px] border border-border-subtle bg-surface px-4 py-2 text-[15px] text-text-primary focus:outline-none"
                                               />
                                             </div>
                                           ) : (
                                             <div className="mt-3 flex items-center gap-2">
                                               <span className="text-[14px] text-text-secondary">After</span>
                                               <input
                                                 type="number"
                                                 min={1}
                                                 value={settings.endDaysValue}
                                                 onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, endDaysValue: Math.max(1, Number(e.target.value) || 1) } }))}
                                                 className="w-24 rounded-[8px] border border-border-subtle bg-surface px-3 py-2 text-[15px] text-text-primary focus:outline-none"
                                               />
                                               <span className="text-[14px] text-text-secondary">days</span>
                                             </div>
                                           )}
                                         </div>
                                       )}
                                     </div>

                                     {/* Remind me */}
                                     <div className="mt-4">
                                       <div className="flex items-center justify-between px-1">
                                         <div className="text-[14px] font-bold text-text-primary">Remind me</div>
                                         <input
                                           type="checkbox"
                                           checked={settings.remind}
                                           onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, remind: e.target.checked } }))}
                                           className="w-4 h-4"
                                         />
                                       </div>
                                       {settings.remind && (
                                         <div className="mt-3">
                                           <div className="px-1 text-[12px] font-medium text-text-secondary">Before activity</div>
                                           <div className="mt-2 grid grid-cols-2 gap-3">
                                             <div className="relative">
                                               <select
                                               value={settings.remindAmount}
                                               onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, remindAmount: Math.max(1, Math.min(60, Number(e.target.value) || 1)) } }))}
                                               className="w-full appearance-none rounded-[10px] border border-border-subtle bg-surface px-3 py-2 pr-9 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/70 hover:border-primary/60 shadow-sm"
                                             >
                                               {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => (
                                                 <option key={n} value={n}>{n}</option>
                                               ))}
                                               </select>
                                               <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary">
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                   <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                               </span>
                                             </div>
                                             <div className="relative">
                                               <select
                                               value={settings.remindUnit}
                                               onChange={(e) => setInlineSettings(prev => ({ ...prev, [activity.id]: { ...settings, remindUnit: (e.target.value as RemindUnit) } }))}
                                               className="w-full appearance-none rounded-[10px] border border-border-subtle bg-surface px-3 py-2 pr-9 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/70 hover:border-primary/60 shadow-sm"
                                             >
                                               {(['seconds','minutes','hours','days','weeks','months','years'] as const).map((u) => (
                                                 <option key={u} value={u}>{u}</option>
                                               ))}
                                               </select>
                                               <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary">
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                   <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                               </span>
                                             </div>
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                           </div>
                         )
                       })}
                     </div>
                   </div>
                 )
               })}
             </div>

             {/* Next Button */}
             <div className="fixed bottom-0 left-0 right-0 p-6 bg-background">
               <div className="w-11/12 max-w-xl mx-auto">
        <button
          onClick={handleNext}
          disabled={selectedActivities.length === 0}
                   className={`w-full py-4 rounded-xl font-semibold text-sm transition-colors ${
                     selectedActivities.length > 0
                       ? 'bg-primary text-white hover:bg-primary/90'
                       : 'bg-gray-300 text-text-secondary cursor-not-allowed'
                   }`}
        >
          Next
        </button>
      </div>
        </div>
      </div>

      {/* Validation summary modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-surface shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <div className="text-[16px] font-semibold text-text-primary">Complete procedure settings</div>
              <button
                type="button"
                aria-label="Close"
                className="w-9 h-9 rounded-full grid place-items-center text-text-secondary hover:text-text-primary"
                onClick={() => setShowValidationModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm text-text-secondary">
                Some selected procedures need configuration. Please fill the highlighted fields.
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {validationSummary.map(({ id, issues }) => {
                  const meta = getActivityMeta(id)
                  const readable = issues.map((iss) =>
                    iss === 'missingRepeat' ? 'Frequency not selected (Daily/Weekly/Monthly)'
                    : iss === 'weeklyNoDays' ? 'Weekdays not selected'
                    : iss === 'monthlyNoDays' ? 'Monthly days not selected'
                    : iss === 'missingTime' ? 'Time not selected (or enable All day)'
                    : iss === 'missingEndDate' ? 'End date not specified'
                    : iss === 'invalidEndDays' ? 'Invalid number of days until end'
                    : iss
                  )
                  return (
                    <li key={id} className="flex items-start gap-2">
                      <span className="mt-1 text-red-500">•</span>
                      <button
                        type="button"
                        className="text-left flex-1 text-[14px] text-text-primary hover:text-primary"
                        onClick={() => {
                          setShowValidationModal(false)
                          setExpandedActivities(prev => new Set(prev).add(id))
                          const el = activityRefs.current[id]
                          if (el && typeof el.scrollIntoView === 'function') {
                            requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
                          }
                        }}
                      >
                        <span className="font-medium">{meta.name}:</span> {readable.join('; ')}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-full border border-border-subtle px-4 py-2 text-sm text-text-primary hover:border-primary/60"
                  onClick={() => setShowValidationModal(false)}
                >
                  Got it
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary text-white px-4 py-2 text-sm hover:bg-primary/90"
                  onClick={() => {
                    // Ensure all with errors are expanded
                    const ids = new Set(expandedActivities)
                    validationSummary.forEach(({ id }) => ids.add(id))
                    setExpandedActivities(ids)
                    setShowValidationModal(false)
                  }}
                >
                  Expand all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt modal removed */}

      {/* Create Activity Modal */}
      {isCreateActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Create New Activity</h2>
              <button
                onClick={() => setIsCreateActivityModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-muted/80 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Task name</label>
            <input
              type="text"
                  value={newActivity.name}
                  onChange={(e) => handleNewActivityChange('name', e.target.value)}
                  placeholder="Type the name"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-text-primary ${
                    activityErrors.name ? 'border-red-500' : 'border-border-subtle/60'
                  }`}
                />
                {activityErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.name}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-text-primary">Note</label>
                  <button
                    type="button"
                    onClick={() => setCreateNoteExpanded(v => !v)}
                    className="text-[12px] font-semibold text-text-secondary hover:text-text-primary"
                  >
                    {createNoteExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                <textarea
                  value={newActivity.note}
                  onChange={(e) => handleNewActivityChange('note', e.target.value)}
                  placeholder="Type the note here..."
                  className={`w-full p-2 border border-border-subtle/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-text-primary ${createNoteExpanded ? 'resize-y min-h-[120px]' : 'resize-none h-16'}`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => {
                    if (e.target.value === 'add-new-category') {
                      setIsCreateCategoryModalOpen(true)
                    } else {
                      handleNewActivityChange('category', e.target.value)
                    }
                  }}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-text-primary bg-surface ${
                    activityErrors.category ? 'border-red-500' : 'border-border-subtle/60'
                  }`}
                >
                  <option value="" className="text-text-secondary">Choose category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-text-primary">{category}</option>
                  ))}
                  <option value="add-new-category" className="text-primary font-medium">+ Add new category</option>
                </select>
                {activityErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.category}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Color</label>
                <div className={`flex gap-1 p-2 border rounded-lg ${
                  activityErrors.color ? 'border-red-500' : 'border-border-subtle/60'
                }`}>
                  {}
                  {colors.map((color) => {

                    const isSelected = newActivity.color === color.value
                    
                    return (
                      <button
                        key={color.id}
                        onClick={() => handleNewActivityChange('color', color.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary scale-110 ring-2 ring-primary ring-opacity-50 shadow-lg'
                            : 'border-border-subtle/60 hover:scale-105 hover:border-primary/60'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    )
                  })}
                  
                  {}
                  {newActivity.color && !colors.some(c => c.value === newActivity.color) && (
                    <button
                      onClick={() => handleNewActivityChange('color', newActivity.color)}
                      className="w-7 h-7 rounded-full border-2 border-primary scale-110 ring-2 ring-primary ring-opacity-50 shadow-lg transition-all duration-200"
                      style={{ backgroundColor: newActivity.color }}
                      title="Selected color"
                    />
                  )}
                  <button
                    onClick={() => setIsColorPickerOpen(true)}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-border-subtle/60 flex items-center justify-center hover:border-primary hover:bg-surface-muted transition-all duration-200"
                  >
                    <span className="text-text-secondary text-sm font-bold">+</span>
                  </button>
                </div>
                {activityErrors.color && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.color}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Icon</label>
                <div
                  className={`flex gap-1 p-2 border rounded-lg ${
                    activityErrors.iconId ? 'border-red-500' : 'border-border-subtle/60'
                  }`}
                >
                  {quickIconOptions.map((option) => {
                    const isSelected = newActivity.iconId === option.id
                    return (
                      <button
                        key={`activity-${option.id}`}
                        onClick={() => handleNewActivityChange('iconId', option.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 box-border ${
                          isSelected ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: newActivity.color || 'rgb(var(--color-primary))',
                        }}
                      >
                        <Image src={option.path} alt={`${option.label} icon`} width={20} height={20} />
                      </button>
                    )
                  })}

                  {selectedActivityIcon &&
                    !quickIconOptions.some((option) => option.id === selectedActivityIcon.id) && (
                      <button
                        key={`activity-selected-${selectedActivityIcon.id}`}
                        onClick={() => handleNewActivityChange('iconId', selectedActivityIcon.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-primary ring-offset-1 scale-105 box-border"
                        style={{ backgroundColor: newActivity.color || 'rgb(var(--color-primary))' }}
                        title="Selected icon"
                      >
                        <Image
                          src={selectedActivityIcon.path}
                          alt={`${selectedActivityIcon.label} icon`}
                          width={20}
                          height={20}
                        />
                      </button>
                    )}

                  <button
                    onClick={handleIconPickerOpen}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-primary hover:bg-purple-50 transition-all duration-200 box-border"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
                {activityErrors.iconId && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.iconId}</p>
                )}
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreateActivityModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border-subtle/60 text-text-primary rounded-lg hover:bg-surface-muted transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {isColorPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Choose Color</h3>
              <button
                onClick={() => setIsColorPickerOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-muted/80 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative w-80 h-80">
                <div 
                  className="w-full h-full rounded-full cursor-crosshair relative overflow-hidden select-none"
                  style={{
                    background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)'
                  }}
                  onMouseDown={handleColorPickerMouseDown}
                  onMouseMove={handleColorPickerMouseMove}
                  onMouseUp={handleColorPickerMouseUp}
                  onMouseLeave={handleColorPickerMouseUp}
                  onClick={handleColorPickerClick}
                >
                  {}
                  <div className="absolute inset-8 bg-surface rounded-full"></div>
                  
                  {}
                  {newActivity.color && (
                    <div 
                      className="absolute w-16 h-16 rounded-full border-4 border-white shadow-lg pointer-events-none"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: newActivity.color
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsColorPickerOpen(false)}
                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div
            className="bg-surface rounded-3xl w-full max-w-4xl max-h-[80vh] shadow-2xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center p-8 pb-4">
              <h3 className="text-xl font-bold text-text-primary">Choose Icon</h3>
              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-muted/80 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 pb-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearchQuery}
                  onChange={(event) => setIconSearchQuery(event.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-border-subtle/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIconCategoryFilter('all')}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      iconCategoryFilter === 'all'
                        ? 'bg-primary text-white border-primary'
                        : 'border-border-subtle/60 text-text-primary hover:border-primary'
                    }`}
                >
                  All
                </button>
                {iconCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setIconCategoryFilter(category)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      iconCategoryFilter === category
                        ? 'bg-primary text-white border-primary'
                        : 'border-border-subtle/60 text-text-primary hover:border-primary'
                    }`}
                  >
                    {category.replace(/[-_]/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 text-sm text-text-secondary">
              Showing {paginatedIconEntries.length} of {filteredIconEntries.length} icons
            </div>

            <div className="flex-1 px-8 overflow-y-auto scrollbar-hide">
              {paginatedIconEntries.length > 0 ? (
                <div className="grid grid-cols-8 gap-3">
                  {paginatedIconEntries.map((entry) => {
                    const isSelected = activeIconId === entry.id
                    return (
                      <button
                        key={entry.id}
                        onClick={() => {
                          if (isCreateCategoryModalOpen) {
                            handleNewCategoryChange('iconId', entry.id)
                          } else {
                            handleNewActivityChange('iconId', entry.id)
                          }
                        }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: activeIconColor }}
                        title={entry.label}
                      >
                        <Image src={entry.path} alt={`${entry.label} icon`} width={24} height={24} />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <p className="text-base font-medium">No icons match your search.</p>
                  <p className="text-sm">Try a different keyword or category.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIconPage((prev) => Math.max(prev - 1, 0))}
                  disabled={iconPage === 0}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    iconPage === 0
                      ? 'border-border-subtle/60 text-[#D9DCEF] cursor-not-allowed'
                      : 'border-primary text-text-primary hover:bg-[#F3EDFF]'
                  }`}
                >
                  Prev
                </button>
                <span className="text-sm text-text-primary">Page {totalIconPages ? iconPage + 1 : 0} of {totalIconPages}</span>
                <button
                  type="button"
                  onClick={() => setIconPage((prev) => Math.min(prev + 1, Math.max(totalIconPages - 1, 0)))}
                  disabled={iconPage >= totalIconPages - 1}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    iconPage >= totalIconPages - 1
                      ? 'border-border-subtle/60 text-[#D9DCEF] cursor-not-allowed'
                      : 'border-primary text-text-primary hover:bg-[#F3EDFF]'
                  }`}
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="self-end sm:self-auto px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {isCreateCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text-primary mb-6 text-center">Create New Category</h2>
            
            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                  placeholder="Type the name"
                  className="w-full p-2 border border-border-subtle/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm text-text-primary"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Color</label>
                <div className="flex gap-1 p-2 border border-border-subtle/60 rounded-lg">
                  {}
                  {colors.map((color) => {

                    const isSelected = newCategory.color === color.value
                    
                    return (
              <button
                        key={color.id}
                        onClick={() => handleNewCategoryChange('color', color.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary scale-110 ring-2 ring-primary ring-opacity-50 shadow-lg'
                            : 'border-border-subtle/60 hover:scale-105 hover:border-primary/60'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    )
                  })}
                  
                  {}
                  {newCategory.color && !colors.some(c => c.value === newCategory.color) && (
                    <button
                      onClick={() => handleNewCategoryChange('color', newCategory.color)}
                      className="w-7 h-7 rounded-full border-2 border-primary scale-110 ring-2 ring-primary ring-opacity-50 shadow-lg transition-all duration-200"
                      style={{ backgroundColor: newCategory.color }}
                      title="Selected color"
                    />
                  )}
                  <button
                    onClick={() => setIsColorPickerOpen(true)}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-border-subtle/60 flex items-center justify-center hover:border-primary hover:bg-surface-muted transition-all duration-200"
                  >
                    <span className="text-text-secondary text-sm font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Icon</label>
                <div className="flex gap-1 p-2 border border-border-subtle/60 rounded-lg">
                  {quickIconOptions.map((option) => {
                    const isSelected = newCategory.iconId === option.id

                    return (
                      <button
                        key={`category-${option.id}`}
                        onClick={() => handleNewCategoryChange('iconId', option.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 box-border ${
                          isSelected ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? (newCategory.color || 'rgb(var(--color-primary))') : (newCategory.color || 'rgb(var(--color-primary))'),
                        }}
                      >
                        <Image src={option.path} alt={`${option.label} icon`} width={20} height={20} />
                      </button>
                    )
                  })}

                  {selectedCategoryIcon &&
                    !quickIconOptions.some((option) => option.id === selectedCategoryIcon.id) && (
                      <button
                        key={`category-selected-${selectedCategoryIcon.id}`}
                        onClick={() => handleNewCategoryChange('iconId', selectedCategoryIcon.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-primary ring-offset-1 scale-105 box-border"
                        style={{ backgroundColor: newCategory.color || 'rgb(var(--color-primary))' }}
                        title="Selected icon"
                      >
                        <Image
                          src={selectedCategoryIcon.path}
                          alt={`${selectedCategoryIcon.label} icon`}
                          width={20}
                          height={20}
                        />
                      </button>
                    )}

                  <button
                    onClick={handleIconPickerOpen}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-border-subtle/60 flex items-center justify-center hover:border-primary hover:bg-surface-muted transition-all duration-200 box-border"
                  >
                    <span className="text-text-secondary text-sm font-bold">+</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreateCategoryModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border-subtle/60 text-text-primary rounded-lg hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name || !newCategory.color || !newCategory.iconId}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
