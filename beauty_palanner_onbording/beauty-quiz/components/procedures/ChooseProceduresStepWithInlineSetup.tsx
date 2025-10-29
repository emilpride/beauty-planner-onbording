'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { PROCEDURES_ICON_CATALOG, getProceduresIconById, getProceduresIconCategories, type ProceduresIconEntry } from './proceduresIconCatalog'
import { getIconById } from './iconCatalog'
import { getActivityMeta } from './activityMeta'
import { getDefaultNote, type GenderKey } from './defaultActivityNotes'
import { motion, AnimatePresence } from 'framer-motion'
import ProcedureSetupStep from './ProcedureSetupStep'

// Re-export types and functions from ChooseProceduresStep
const extractColorFromClass = (colorClass: string): string => {
  if (colorClass.startsWith('#')) {
    return colorClass
  }
  if (colorClass.startsWith('bg-[')) {
    return colorClass.match(/bg-\[([^\]]+)\]/)?.[1] || '#A385E9'
  }
  return colorClass
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

const QUICK_ICON_IDS = [
  'spa', 'face-care', 'soap', 'massage', 'hydration', 'sunscreen',
  'hair-care', 'conditioner', 'haircut', 'dumbbell', 'yoga', 'meditation'
]
const ICONS_PER_PAGE = 12

export default function ChooseProceduresStepWithInlineSetup() {
  const router = useRouter()
  const { setAnswer, answers, analysis, saveUiSnapshot, getUiSnapshot } = useQuizStore()
  const genderKey: GenderKey = answers.Gender === 1 ? 'male' : answers.Gender === 2 ? 'female' : 'unknown'
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>(() => {
    const snap = getUiSnapshot('procedures-0')
    return Array.isArray(snap?.selectedActivities) ? snap.selectedActivities : []
  })
  
  // Track which activity is currently expanded for inline setup
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const snap = getUiSnapshot('procedures-0')
    return typeof snap?.searchQuery === 'string' ? snap.searchQuery : ''
  })

  const extractAIRecommendations = (analysis: any): Set<string> => {
    const recommendations = new Set<string>()
    if (!analysis) return recommendations
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
    return recommendations
  }

  const aiRecommendations = extractAIRecommendations(analysis)
  const [activities, setActivities] = useState<ActivityCollection>(() => buildInitialActivities(genderKey, aiRecommendations))

  useEffect(() => {
    saveUiSnapshot('procedures-0', { selectedActivities, searchQuery })
  }, [selectedActivities, searchQuery, saveUiSnapshot])

  const handleActivityToggle = (activityId: string) => {
    const isSelected = selectedActivities.includes(activityId)
    setSelectedActivities(prev => 
      isSelected 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
    
    // When selecting, expand the inline setup. When deselecting, collapse it.
    if (!isSelected) {
      setExpandedActivityId(activityId)
    } else {
      setExpandedActivityId(null)
    }
  }

  const handleNext = () => {
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
    }
    setAnswer('ActivityMetaOverrides', nextOverrides)
    const notes: Record<string, string> = {}
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
    router.push('/procedures/2') // Skip step 1, go directly to generating schedule
  }

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Choose Your Procedures</h1>
          <p className="text-text-secondary">Click on a procedure to expand settings</p>
        </div>

        <div className="space-y-4">
          {Object.entries(activities).map(([category, categoryActivities]) => (
            <div key={category} className="space-y-2">
              <h2 className="text-lg font-semibold text-text-primary capitalize">{category}</h2>
              <div className="space-y-3">
                {categoryActivities.map((activity) => {
                  const isSelected = selectedActivities.includes(activity.id)
                  const isExpanded = expandedActivityId === activity.id
                  
                  return (
                    <div key={activity.id} className="border border-border-subtle rounded-lg overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-surface/50 transition-colors flex items-center gap-3"
                        onClick={() => handleActivityToggle(activity.id)}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-5 h-5 rounded"
                          />
                        </div>
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: activity.bgColor }}
                        >
                          {/* Icon would go here */}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{activity.name}</p>
                          {activity.aiRecommended && (
                            <p className="text-xs text-primary">✨ AI Recommended</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            ▼
                          </motion.div>
                        </div>
                      </div>

                      {/* Inline setup panel */}
                      <AnimatePresence>
                        {isExpanded && isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border-subtle bg-surface/30 p-4">
                              <InlineActivitySetup 
                                activityId={activity.id}
                                activityName={activity.name}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-border-subtle py-3 font-medium text-text-primary hover:bg-surface/50 transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={selectedActivities.length === 0}
            className="flex-1 rounded-lg bg-primary text-white py-3 font-medium hover:bg-primary/90 disabled:bg-primary/50 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// Simplified inline setup component - shows key settings for the activity
function InlineActivitySetup({ activityId, activityName }: { activityId: string; activityName: string }) {
  const { answers, setAnswer } = useQuizStore()
  const [repeat, setRepeat] = useState<'Daily' | 'Weekly' | 'Monthly' | null>('Daily')
  const [allDay, setAllDay] = useState(true)
  const [time, setTime] = useState('09:00')

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">Repeat</label>
        <select
          value={repeat || ''}
          onChange={(e) => setRepeat((e.target.value || null) as any)}
          className="w-full rounded border border-border-subtle px-3 py-2 bg-background text-text-primary"
        >
          <option value="">Select frequency</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4"
        />
        <label className="text-sm text-text-primary">All day</label>
      </div>

      {!allDay && (
        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded border border-border-subtle px-3 py-2 bg-background text-text-primary"
          />
        </div>
      )}
    </div>
  )
}
