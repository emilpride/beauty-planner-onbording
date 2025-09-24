'use client'

import { useState } from 'react'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import FrequencyModal from '@/components/quiz/FrequencyModal'

const activities = [
  "Gym Workouts", "Pilates", "Cycling", "Martial Arts", "Dance", "Other"
]

export default function PhysicalActivitiesStep() {
  const { answers, setAnswer } = useQuizStore()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    setSelectedActivity(activity)
    setIsModalOpen(true)
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

  const isActivitySelected = (activity: string) => {
    return answers.activityFrequency.some(a => a.id === activity)
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
                  {getFrequencyText(activity)}
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
    </>
  )
}

