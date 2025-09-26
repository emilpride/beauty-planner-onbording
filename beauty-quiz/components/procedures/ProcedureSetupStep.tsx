'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ActivitySetting {
  id: string
  name: string
  note: string
  repeat: 'Daily' | 'Weekly' | 'Monthly'
  allDay: boolean
  selectedDays: number[]
  time: string
  timePeriod: 'Morning' | 'Afternoon' | 'Evening'
  endDate: boolean
  endType: 'date' | 'days'
  endDateValue: string
  endDaysValue: number
  remind: boolean
  remindBefore: number
  remindBefore2: number
}

export default function ProcedureSetupStep() {
  const { currentStep, nextStep, answers } = useQuizStore()
  const router = useRouter()
  
  const [activitySettings, setActivitySettings] = useState<ActivitySetting[]>([
    {
      id: '1',
      name: 'Morning Skincare',
      note: '',
      repeat: 'Daily',
      allDay: false,
      selectedDays: [1, 2, 3, 4, 5],
      time: '08:00',
      timePeriod: 'Morning',
      endDate: false,
      endType: 'date',
      endDateValue: '',
      endDaysValue: 30,
      remind: true,
      remindBefore: 15,
      remindBefore2: 5
    }
  ])

  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const currentActivity = activitySettings[currentActivityIndex]

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const updateActivity = (updates: Partial<ActivitySetting>) => {
    setActivitySettings(prev => prev.map((activity, index) => 
      index === currentActivityIndex ? { ...activity, ...updates } : activity
    ))
  }

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = currentActivity.selectedDays
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort()
    
    updateActivity({ selectedDays: newDays })
  }

  const handleRepeatChange = (repeat: 'Daily' | 'Weekly' | 'Monthly') => {
    updateActivity({ 
      repeat,
      selectedDays: repeat === 'Daily' ? [] : [1, 2, 3, 4, 5],
      allDay: repeat === 'Daily'
    })
  }

  const handleNext = () => {
    if (currentActivityIndex < activitySettings.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1)
    } else {
      router.push('/procedures/2') // Переходим к GeneratingScheduleStep
    }
  }

  const getActivityIcon = (name: string) => {
    if (name.includes('Skincare')) return '🧼'
    if (name.includes('Fitness')) return '🏃'
    if (name.includes('Hair')) return '🚿'
    if (name.includes('Wellness')) return '🧘'
    return '✨'
  }

  const getActivityColor = (name: string) => {
    if (name.includes('Skincare')) return 'bg-blue-500'
    if (name.includes('Fitness')) return 'bg-red-500'
    if (name.includes('Hair')) return 'bg-purple-500'
    if (name.includes('Wellness')) return 'bg-green-500'
    return 'bg-gray-500'
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#5C4688]">Activity Setup</h1>
          <div className="w-10"></div>
        </div>

        {/* Activity Card */}
        <motion.div 
          className="p-4 rounded-xl border-2 border-gray-200"
          style={{ backgroundColor: `${getActivityColor(currentActivity.name)}20` }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getActivityColor(currentActivity.name)} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl text-white">{getActivityIcon(currentActivity.name)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{currentActivity.name}</h3>
              <p className="text-sm text-gray-500">Setup your routine</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <textarea
            value={currentActivity.note}
            onChange={(e) => updateActivity({ note: e.target.value })}
            placeholder="Add a note about this activity..."
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Repeat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Repeat</label>
          <div className="flex space-x-2">
            {['Daily', 'Weekly', 'Monthly'].map((option) => (
              <button
                key={option}
                onClick={() => handleRepeatChange(option as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentActivity.repeat === option
                    ? 'bg-[#A385E9] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* On these days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">On these days</label>
          
          {currentActivity.repeat === 'Daily' && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allDay"
                checked={currentActivity.allDay}
                onChange={(e) => updateActivity({ allDay: e.target.checked })}
                className="w-4 h-4 text-[#A385E9] border-gray-300 rounded focus:ring-[#A385E9]"
              />
              <label htmlFor="allDay" className="text-sm text-gray-700">All day</label>
            </div>
          )}

          {currentActivity.repeat === 'Weekly' && (
            <div className="flex space-x-2">
              {dayLabels.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayToggle(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentActivity.selectedDays.includes(index)
                      ? 'bg-[#A385E9] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {currentActivity.repeat === 'Monthly' && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`Every month on ${currentActivity.selectedDays.map(d => dayNames[d]).join(', ')}`}
                readOnly
                className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
              <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Do It At */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Do It At</label>
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="time"
              value={currentActivity.time}
              onChange={(e) => updateActivity({ time: e.target.value })}
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            {['Morning', 'Afternoon', 'Evening'].map((period) => (
              <button
                key={period}
                onClick={() => updateActivity({ timePeriod: period as any })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentActivity.timePeriod === period
                    ? 'bg-[#A385E9] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* End Activity On */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">End Activity On</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentActivity.endDate}
                onChange={(e) => updateActivity({ endDate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A385E9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A385E9]"></div>
            </label>
          </div>
          
          {currentActivity.endDate && (
            <div className="flex space-x-2">
              <button
                onClick={() => updateActivity({ endType: 'date' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentActivity.endType === 'date'
                    ? 'bg-[#A385E9] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Date
              </button>
              <button
                onClick={() => updateActivity({ endType: 'days' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentActivity.endType === 'days'
                    ? 'bg-[#A385E9] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Days
              </button>
            </div>
          )}
        </div>

        {/* Remind me */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Remind me</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentActivity.remind}
                onChange={(e) => updateActivity({ remind: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A385E9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A385E9]"></div>
            </label>
          </div>
          
          {currentActivity.remind && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Before {currentActivity.timePeriod}</label>
                <select
                  value={currentActivity.remindBefore}
                  onChange={(e) => updateActivity({ remindBefore: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Before activity</label>
                <select
                  value={currentActivity.remindBefore2}
                  onChange={(e) => updateActivity({ remindBefore2: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          className="w-full bg-[#A385E9] text-white py-4 rounded-xl font-semibold hover:bg-[#906fe2] transition-colors"
        >
          {currentActivityIndex < activitySettings.length - 1 ? 'Next Activity' : 'Continue'}
        </button>
      </div>
    </div>
  )
}