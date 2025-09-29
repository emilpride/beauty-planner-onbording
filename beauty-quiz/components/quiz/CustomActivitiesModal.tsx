'use client'

import { useState, useEffect } from 'react'

interface CustomActivity {
  id: string
  name: string
  frequency: number
  period: 'day' | 'week' | 'month' | 'year'
}

interface CustomActivitiesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (activities: CustomActivity[]) => void
  existingActivities: CustomActivity[]
}

export default function CustomActivitiesModal({
  isOpen,
  onClose,
  onConfirm,
  existingActivities
}: CustomActivitiesModalProps) {
  const [activities, setActivities] = useState<CustomActivity[]>(existingActivities)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startFrequency, setStartFrequency] = useState(0)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  useEffect(() => {
    setActivities(existingActivities)
  }, [existingActivities])

  const numbers = Array.from({ length: 30 }, (_, i) => i + 1)
  const periods = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ] as const

  const addNewActivity = () => {
    const newActivity: CustomActivity = {
      id: `custom_${Date.now()}`,
      name: '',
      frequency: 1,
      period: 'week'
    }
    setActivities([...activities, newActivity])
  }

  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id))
  }

  const updateActivity = (id: string, field: keyof CustomActivity, value: any) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ))
  }

  const handleConfirm = () => {
    const validActivities = activities.filter(activity => activity.name.trim() !== '')
    onConfirm(validActivities)
    onClose()
  }


  const handleWheel = (e: React.WheelEvent, activityIndex: number) => {
    e.preventDefault()
    const activity = activities[activityIndex]
    if (!activity) return
    
    const delta = e.deltaY > 0 ? 1 : -1
    const newFrequency = Math.max(1, Math.min(30, activity.frequency + delta))
    updateActivity(activity.id, 'frequency', newFrequency)
  }


  const handleTouchStart = (e: React.TouchEvent, activityIndex: number) => {
    setIsDragging(true)
    setDraggingIndex(activityIndex)
    setStartY(e.touches[0].clientY)
    setStartFrequency(activities[activityIndex]?.frequency || 1)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || draggingIndex === null) return
    e.preventDefault()
    
    const activity = activities[draggingIndex]
    if (!activity) return
    
    const currentY = e.touches[0].clientY
    const deltaY = startY - currentY
    const deltaFrequency = Math.round(deltaY / 20)
    const newFrequency = Math.max(1, Math.min(30, startFrequency + deltaFrequency))
    updateActivity(activity.id, 'frequency', newFrequency)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDraggingIndex(null)
  }


  const handlePeriodWheel = (e: React.WheelEvent, activityIndex: number) => {
    e.preventDefault()
    const activity = activities[activityIndex]
    if (!activity) return
    
    const currentIndex = periods.findIndex(p => p.value === activity.period)
    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(periods.length - 1, currentIndex + delta))
    updateActivity(activity.id, 'period', periods[newIndex].value)
  }


  const handlePeriodTouchStart = (e: React.TouchEvent, activityIndex: number) => {
    setIsDragging(true)
    setDraggingIndex(activityIndex)
    setStartY(e.touches[0].clientY)
    setStartFrequency(periods.findIndex(p => p.value === activities[activityIndex]?.period) || 0)
  }

  const handlePeriodTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || draggingIndex === null) return
    e.preventDefault()
    
    const activity = activities[draggingIndex]
    if (!activity) return
    
    const currentY = e.touches[0].clientY
    const deltaY = startY - currentY
    const deltaIndex = Math.round(deltaY / 20)
    const currentIndex = periods.findIndex(p => p.value === activity.period)
    const newIndex = Math.max(0, Math.min(periods.length - 1, currentIndex + deltaIndex))
    updateActivity(activity.id, 'period', periods[newIndex].value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-text-primary mb-6 text-center">
          Add Custom Activities
        </h3>
        
        <div className="space-y-4 mb-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                  placeholder="Activity name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400"
                />
                {activities.length > 1 && (
                  <button
                    onClick={() => removeActivity(activity.id)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex justify-center space-x-6">
                {/* Frequency Column */}
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-600 mb-2">Every</div>
                  <div 
                    className="h-24 overflow-hidden relative w-12"
                    onWheel={(e) => handleWheel(e, index)}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div 
                      className="flex flex-col transition-transform duration-300 ease-out"
                      style={{ transform: `translateY(${48 - (activity.frequency - 1) * 24}px)` }}
                    >
                      {numbers.slice(0, 10).map((num) => (
                        <div
                          key={num}
                          className={`h-6 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200 ${
                            num === activity.frequency 
                              ? 'text-text-primary scale-110' 
                              : 'text-gray-400 scale-75'
                          }`}
                          onClick={() => updateActivity(activity.id, 'frequency', num)}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-12 h-1 bg-primary mt-1 rounded-full"></div>
                </div>

                {/* Period Column */}
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-600 mb-2">Period</div>
                  <div 
                    className="h-24 overflow-hidden relative w-16"
                    onWheel={(e) => handlePeriodWheel(e, index)}
                    onTouchStart={(e) => handlePeriodTouchStart(e, index)}
                    onTouchMove={handlePeriodTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div 
                      className="flex flex-col transition-transform duration-300 ease-out"
                      style={{ transform: `translateY(${48 - periods.findIndex(p => p.value === activity.period) * 24}px)` }}
                    >
                      {periods.map((p) => (
                        <div
                          key={p.value}
                          className={`h-6 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 ${
                            p.value === activity.period 
                              ? 'text-text-primary scale-110' 
                              : 'text-gray-400 scale-75'
                          }`}
                          onClick={() => updateActivity(activity.id, 'period', p.value)}
                        >
                          {p.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-16 h-1 bg-primary mt-1 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addNewActivity}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors duration-200 mb-4"
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Activity
          </div>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors duration-200"
          >
            Save Activities
          </button>
        </div>
      </div>
    </div>
  )
}
