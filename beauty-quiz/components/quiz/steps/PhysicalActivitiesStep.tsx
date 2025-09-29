'use client'

import { useState } from 'react'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import FrequencyModal from '@/components/quiz/FrequencyModal'
import CustomActivitiesModal from '@/components/quiz/CustomActivitiesModal'

const activities = [
  "Gym Workouts", "Pilates", "Cycling", "Martial Arts", "Dance", "Other"
]

interface CustomActivity {
  id: string
  name: string
  frequency: number
  period: 'day' | 'week' | 'month' | 'year'
}

export default function PhysicalActivitiesStep() {
  const { answers, setAnswer } = useQuizStore()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([])

  const getFrequencyText = (activity: string) => {
    const activityData = answers.activityFrequency.find(a => a.id === activity)
    if (!activityData) return 'Not set'
    
    const { frequency, period } = activityData
    const periodText = period === 'day' ? 'Day' : 
                     period === 'week' ? 'Week' : 
                     period === 'month' ? 'Month' : 'Year'
    
    return `Every ${frequency} ${periodText}${frequency > 1 ? 's' : ''}`
  }

  const handleActivityClick = (activity: string) => {
    if (activity === 'Other') {
      setIsCustomModalOpen(true)
    } else {
      setSelectedActivity(activity)
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

    const existingIndex = answers.activityFrequency.findIndex(a => a.id === selectedActivity)
    let newFrequencies = [...answers.activityFrequency]
    
    if (existingIndex >= 0) {
      newFrequencies[existingIndex] = newFrequency
    } else {
      newFrequencies.push(newFrequency)
    }

    setAnswer('activityFrequency', newFrequencies)
  }

  const handleCustomActivitiesConfirm = (activities: CustomActivity[]) => {
    setCustomActivities(activities)
    

    const existingFrequencies = answers.activityFrequency.filter(a => !a.id.startsWith('custom_'))
    const customFrequencies = activities.map(activity => ({
      id: activity.id,
      frequency: activity.frequency,
      period: activity.period
    }))
    
    setAnswer('activityFrequency', [...existingFrequencies, ...customFrequencies])
  }

  const isActivitySelected = (activity: string) => {
    if (activity === 'Other') {
      return customActivities.length > 0
    }
    return answers.activityFrequency.some(a => a.id === activity)
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
        condition={answers.activityFrequency.length > 0}
      >
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity}
              onClick={() => handleActivityClick(activity)}
              className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                isActivitySelected(activity)
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-text-primary">{activity}</span>
                <span className={`text-sm ${
                  isActivitySelected(activity) ? 'text-primary' : 'text-gray-500'
                }`}>
                  {activity === 'Other' ? getCustomActivitiesText() : getFrequencyText(activity)}
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
        currentFrequency={answers.activityFrequency.find(a => a.id === selectedActivity)?.frequency || 1}
        currentPeriod={answers.activityFrequency.find(a => a.id === selectedActivity)?.period || 'week'}
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
