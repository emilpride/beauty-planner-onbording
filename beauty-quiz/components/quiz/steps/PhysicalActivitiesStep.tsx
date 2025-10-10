'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import FrequencyModal from '@/components/quiz/FrequencyModal'
import CustomActivitiesModal from '@/components/quiz/CustomActivitiesModal'

const activities = [
  { id: "gym-workouts", title: "Gym Workouts" },
  { id: "pilates", title: "Pilates" },
  { id: "cycling", title: "Cycling" },
  { id: "martial-arts", title: "Martial Arts" },
  { id: "dance", title: "Dance" },
  { id: "other", title: "Other" }
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

  const getFrequencyText = (activityId: string) => {
    const activityData = answers.ActivityFrequency?.find(a => a.id === activityId)
    if (!activityData) return 'Not set'
    
    const { frequency, period } = activityData
    const periodText = period === 'day' ? 'Day' : 
                     period === 'week' ? 'Week' : 
                     period === 'month' ? 'Month' : 'Year'
    
    return `Every ${frequency} ${periodText}${frequency > 1 ? 's' : ''}`
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
    let newFrequencies = [...(answers.ActivityFrequency || [])]
    
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
          const nextIndex = currentStep + 1
          router.push(`/quiz/${nextIndex}`)
          nextStep()
        }}
      >
        <div className="space-y-2 py-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity.id)}
              className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                isActivitySelected(activity.id)
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-border-subtle/60 hover:border-primary/40'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-text-primary">{activity.title}</span>
                <span className={`text-sm ${
                  isActivitySelected(activity.id) ? 'text-primary' : 'text-text-secondary'
                }`}>
                  {activity.id === 'other' ? getCustomActivitiesText() : getFrequencyText(activity.id)}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
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
