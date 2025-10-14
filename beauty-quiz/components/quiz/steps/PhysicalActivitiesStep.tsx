'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import FrequencyModal from '@/components/quiz/FrequencyModal'
import CustomActivitiesModal from '@/components/quiz/CustomActivitiesModal'
import Image from 'next/image'

const activityOptions = [
  {
    id: 'gym-workouts',
    title: 'Gym Workouts',
    description: 'Strength, HIIT, or circuit training sessions at the gym.',
    icon: '/icons/misc/strengthTraining.svg',
  },
  {
    id: 'pilates',
    title: 'Pilates',
    description: 'Mat or reformer work focused on core, posture, and control.',
    icon: '/icons/misc/yogaFlexibility.svg',
  },
  {
    id: 'cycling',
    title: 'Cycling',
    description: 'Outdoor rides or studio classes to build stamina and legs.',
    icon: '/icons/misc/cycling.svg',
  },
  {
    id: 'martial-arts',
    title: 'Martial Arts',
    description: 'Boxing, MMA, or other combat training for strength and focus.',
    icon: '/icons/misc/physic.svg',
  },
  {
    id: 'dance',
    title: 'Dance',
    description: 'Movement sessions that mix rhythm, cardio, and fun.',
    icon: '/icons/misc/danceItOut.svg',
  },
  {
    id: 'other',
    title: 'Custom activities',
    description: 'Add walking, sports leagues, or any routine that fits you.',
    icon: '/icons/misc/customization.svg',
  },
]

interface CustomActivity {
  id: string
  name: string
  frequency: number
  period: 'day' | 'week' | 'month' | 'year'
}

export default function PhysicalActivitiesStep() {
  const router = useRouter()
  const { answers, setAnswer, currentStep, nextStep, setTransitioning } = useQuizStore()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([])

  useEffect(() => {
    const currentCustom = (answers.PhysicalActivities || [])
      .filter((activity) => activity.id.startsWith('custom_'))
      .map((activity) => {
        const freq = answers.ActivityFrequency?.find((f) => f.id === activity.id)
        return {
          id: activity.id,
          name: activity.title,
          frequency: freq?.frequency ?? 1,
          period: freq?.period ?? 'week',
        }
      })
    setCustomActivities(currentCustom)
  }, [answers.PhysicalActivities, answers.ActivityFrequency])

  const frequencySummary = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of answers.ActivityFrequency || []) {
      const periodText = item.period === 'day' ? 'day' : item.period === 'week' ? 'week' : item.period === 'month' ? 'month' : 'year'
      map.set(item.id, `${item.frequency}× / ${periodText}`)
    }
    return map
  }, [answers.ActivityFrequency])

  const getFrequencyText = (activityId: string) => {
    const summary = frequencySummary.get(activityId)
    return summary ? summary : 'Tap to set frequency'
  }

  const handleActivityClick = (activityId: string) => {
    if (activityId === 'other') {
      setIsCustomModalOpen(true)
    } else {
      setSelectedActivity(activityId)
      setIsModalOpen(true)
    }
  }

  const handleFrequencyConfirm = (frequency: number, period: 'day' | 'week' | 'month' | 'year') => {
    if (!selectedActivity) return

    const newFrequency = {
      id: selectedActivity,
      frequency,
      period
    }

    const existingIndex = answers.ActivityFrequency?.findIndex(a => a.id === selectedActivity) ?? -1
    const newFrequencies = [...(answers.ActivityFrequency || [])]
    
    if (existingIndex >= 0) {
      newFrequencies[existingIndex] = newFrequency
    } else {
      newFrequencies.push(newFrequency)
    }

    setAnswer('ActivityFrequency', newFrequencies)

    // Also update PhysicalActivities to mark as active
    const newActivities = answers.PhysicalActivities.map(a => 
      a.id === selectedActivity ? { ...a, isActive: true } : a
    )
    setAnswer('PhysicalActivities', newActivities)
  }

  const handleCustomActivitiesConfirm = (activities: CustomActivity[]) => {
  setCustomActivities(activities)


    const existingFrequencies = answers.ActivityFrequency?.filter(a => !a.id.startsWith('custom_')) || []
    const customFrequencies = activities.map(activity => ({
      id: activity.id,
      frequency: activity.frequency,
      period: activity.period
    }))
    
    setAnswer('ActivityFrequency', [...existingFrequencies, ...customFrequencies])

    // Also update PhysicalActivities for custom ones
    const customActivityObjects = activities.map(activity => ({ id: activity.id, title: activity.name, isActive: true }))
    const existingNonCustom = answers.PhysicalActivities.filter(a => !a.id.startsWith('custom_'))
    setAnswer('PhysicalActivities', [...existingNonCustom, ...customActivityObjects])
  }

  const isActivitySelected = (activityId: string) => {
    if (activityId === 'other') {
      return customActivities.length > 0
    }
    return answers.PhysicalActivities?.some(a => a.id === activityId && a.isActive) ?? false
  }

  const getCustomActivitiesText = () => {
    if (customActivities.length === 0) return 'Not set'
    if (customActivities.length === 1) {
      const activity = customActivities[0]
      const periodText = activity.period === 'day' ? 'Day' : 
                        activity.period === 'week' ? 'Week' : 
                        activity.period === 'month' ? 'Month' : 'Year'
      return `${activity.name} - Every ${activity.frequency} ${periodText}${activity.frequency > 1 ? 's' : ''}`
    }
    return `${customActivities.length} custom activities`
  }

  return (
    <>
      <OnboardingStep
        title="How Often Do You Engage In These Activities?"
        subtitle="Select activities and set their frequency."
        condition={answers.PhysicalActivities?.some(a => a.isActive) ?? false}
        skip
        skipText={"I don't exercise"}
        onSkip={() => {
          // Clear any selected activities/frequencies and move forward
          setAnswer('ActivityFrequency', [])
          const newActivities = answers.PhysicalActivities.map(a => ({ ...a, isActive: false }))
          setAnswer('PhysicalActivities', newActivities)
          nextStep()
        }}
      >
        <div className="grid grid-cols-1 gap-3 py-1 sm:grid-cols-2">
          {activityOptions.map((activity) => {
            const selected = isActivitySelected(activity.id)
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => handleActivityClick(activity.id)}
                className={`group relative flex h-full flex-col justify-between rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selected ? 'border-primary/70 bg-primary/5' : 'border-border-subtle/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition ${
                    selected ? 'bg-primary text-white' : ''
                  }`}>
                    <Image
                      src={activity.icon}
                      alt={activity.title}
                      width={32}
                      height={32}
                      className={`h-8 w-8 ${selected ? 'brightness-200 invert' : ''}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-text-primary">{activity.title}</p>
                    <p className="mt-1 text-xs text-text-secondary/80 leading-snug">
                      {activity.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className={selected ? 'text-primary' : 'text-text-secondary'}>
                    {activity.id === 'other' ? getCustomActivitiesText() : getFrequencyText(activity.id)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-text-secondary transition group-hover:bg-primary/10 group-hover:text-primary">
                    {selected ? 'Edit' : 'Set'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </OnboardingStep>

      <FrequencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFrequencyConfirm}
        activityName={selectedActivity || ''}
        currentFrequency={answers.ActivityFrequency?.find(a => a.id === selectedActivity)?.frequency || 1}
        currentPeriod={answers.ActivityFrequency?.find(a => a.id === selectedActivity)?.period || 'week'}
      />

      <CustomActivitiesModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={handleCustomActivitiesConfirm}
        existingActivities={customActivities}
      />
    </>
  )
}
