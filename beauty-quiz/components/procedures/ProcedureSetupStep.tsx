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
  
  // Получаем выбранные процедуры из store
  const selectedActivities = answers.selectedActivities || []
  
  // Создаем настройки для выбранных процедур
  const [activitySettings, setActivitySettings] = useState<ActivitySetting[]>(() => {
    if (selectedActivities.length === 0) {
      return [{
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
      }]
    }
    
    // Создаем настройки для каждой выбранной процедуры
    return selectedActivities.map((activityId) => {
      const activityInfo = getActivityInfo(activityId)
      return {
        id: activityId,
        name: activityInfo.name,
        note: '',
        repeat: 'Daily' as const,
        allDay: false,
        selectedDays: [1, 2, 3, 4, 5],
        time: '08:00',
        timePeriod: 'Morning' as const,
        endDate: false,
        endType: 'date' as const,
        endDateValue: '',
        endDaysValue: 30,
        remind: true,
        remindBefore: 15,
        remindBefore2: 5
      }
    })
  })

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

  // Функция для получения информации о процедуре по ID
  const getActivityInfo = (activityId: string) => {
    // Проверяем, является ли это пользовательской процедурой
    if (activityId.startsWith('custom-')) {
      // Для пользовательских процедур используем базовую информацию
      return { name: `Custom Activity`, icon: '✨', color: 'bg-gray-500' }
    }
    
    // Базовые процедуры
    const activityMap: Record<string, { name: string; icon: string; color: string }> = {
      'cleanse-hydrate': { name: 'Cleanse & Hydrate', icon: '🧼', color: 'bg-blue-500' },
      'deep-hydration': { name: 'Deep Hydration', icon: '💧', color: 'bg-blue-600' },
      'exfoliate': { name: 'Exfoliate', icon: '✨', color: 'bg-yellow-500' },
      'face-massage': { name: 'Face Massage', icon: '🤲', color: 'bg-green-500' },
      'lip-eye-care': { name: 'Lip & Eye Care', icon: '👁️', color: 'bg-purple-500' },
      'spf-protection': { name: 'SPF Protection', icon: '☀️', color: 'bg-orange-500' },
      'wash-care': { name: 'Wash & Care', icon: '🚿', color: 'bg-cyan-500' },
      'deep-nourishment': { name: 'Deep Nourishment', icon: '🌿', color: 'bg-indigo-500' },
      'scalp-detox': { name: 'Scalp Detox', icon: '🧴', color: 'bg-pink-500' },
      'heat-protection': { name: 'Heat Protection', icon: '🔥', color: 'bg-red-500' },
      'scalp-massage': { name: 'Scalp Massage', icon: '💆', color: 'bg-purple-600' },
      'trim-split-ends': { name: 'Trim Split Ends', icon: '✂️', color: 'bg-yellow-600' },
      'post-color-care': { name: 'Post-Color Care', icon: '🎨', color: 'bg-green-600' },
      'morning-stretch': { name: 'Morning Stretch', icon: '🤸', color: 'bg-blue-500' },
      'cardio-boost': { name: 'Cardio Boost', icon: '🏃', color: 'bg-red-500' },
      'strength-training': { name: 'Strength Training', icon: '💪', color: 'bg-purple-500' },
      'yoga-flexibility': { name: 'Yoga & Flexibility', icon: '🧘', color: 'bg-green-500' },
      'dance-it-out': { name: 'Dance It Out', icon: '💃', color: 'bg-pink-500' },
      'swimming-time': { name: 'Swimming Time', icon: '🏊', color: 'bg-cyan-500' },
      'cycling': { name: 'Cycling', icon: '🚴', color: 'bg-orange-500' },
      'posture-fix': { name: 'Posture Fix', icon: '🦴', color: 'bg-indigo-500' },
      'evening-stretch': { name: 'Evening Stretch', icon: '🌙', color: 'bg-purple-500' },
      'mindful-meditation': { name: 'Mindful Meditation', icon: '🧘‍♀️', color: 'bg-green-500' },
      'breathing-exercises': { name: 'Breathing Exercises', icon: '🫁', color: 'bg-blue-500' },
      'gratitude-exercises': { name: 'Gratitude Exercises', icon: '🙏', color: 'bg-yellow-500' },
      'mood-check-in': { name: 'Mood Check-In', icon: '😊', color: 'bg-pink-500' },
      'learn-grow': { name: 'Learn & Grow', icon: '📚', color: 'bg-indigo-500' },
      'social-media-detox': { name: 'Social Media Detox', icon: '📱', color: 'bg-gray-500' },
      'positive-affirmations': { name: 'Positive Affirmations', icon: '💭', color: 'bg-purple-500' },
      'talk-it-out': { name: 'Talk It Out', icon: '🗣️', color: 'bg-blue-500' },
      'stress-relief': { name: 'Stress Relief', icon: '😌', color: 'bg-green-500' },
    }
    
    return activityMap[activityId] || { name: `Activity ${activityId}`, icon: '✨', color: 'bg-gray-500' }
  }

  const getActivityIcon = (activityId: string) => {
    return getActivityInfo(activityId).icon
  }

  const getActivityColor = (activityId: string) => {
    return getActivityInfo(activityId).color
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
          <h1 className="text-xl font-bold text-[#5C4688]">
            Activity Setup ({currentActivityIndex + 1}/{activitySettings.length})
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Activity Card */}
        <motion.div 
          className="p-4 rounded-xl border-2 border-gray-200"
          style={{ backgroundColor: `${getActivityColor(currentActivity.id)}20` }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getActivityColor(currentActivity.id)} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl text-white">{getActivityIcon(currentActivity.id)}</span>
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