'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Activity {
  id: string
  name: string
  category: string
  icon: string
  color: string
}

const activities: Activity[] = [
  // Skincare
  { id: 'cleansing', name: 'Face Cleansing', category: 'Skincare', icon: '🧼', color: 'bg-blue-100' },
  { id: 'moisturizing', name: 'Moisturizing', category: 'Skincare', icon: '💧', color: 'bg-blue-100' },
  { id: 'sunscreen', name: 'Sunscreen Application', category: 'Skincare', icon: '☀️', color: 'bg-blue-100' },
  { id: 'exfoliating', name: 'Exfoliating', category: 'Skincare', icon: '✨', color: 'bg-blue-100' },
  { id: 'mask', name: 'Face Mask', category: 'Skincare', icon: '🎭', color: 'bg-blue-100' },
  
  // Fitness
  { id: 'cardio', name: 'Cardio Workout', category: 'Fitness', icon: '🏃', color: 'bg-red-100' },
  { id: 'strength', name: 'Strength Training', category: 'Fitness', icon: '💪', color: 'bg-red-100' },
  { id: 'yoga', name: 'Yoga', category: 'Fitness', icon: '🧘', color: 'bg-red-100' },
  { id: 'stretching', name: 'Stretching', category: 'Fitness', icon: '🤸', color: 'bg-red-100' },
  { id: 'walking', name: 'Walking', category: 'Fitness', icon: '🚶', color: 'bg-red-100' },
  
  // Hair Care
  { id: 'hair_wash', name: 'Hair Washing', category: 'Hair Care', icon: '🚿', color: 'bg-purple-100' },
  { id: 'hair_mask', name: 'Hair Mask', category: 'Hair Care', icon: '💆', color: 'bg-purple-100' },
  { id: 'hair_oil', name: 'Hair Oil Treatment', category: 'Hair Care', icon: '🛢️', color: 'bg-purple-100' },
  { id: 'hair_trim', name: 'Hair Trimming', category: 'Hair Care', icon: '✂️', color: 'bg-purple-100' },
  
  // Wellness
  { id: 'meditation', name: 'Meditation', category: 'Wellness', icon: '🧘‍♀️', color: 'bg-green-100' },
  { id: 'breathing', name: 'Breathing Exercises', category: 'Wellness', icon: '🫁', color: 'bg-green-100' },
  { id: 'journaling', name: 'Journaling', category: 'Wellness', icon: '📝', color: 'bg-green-100' },
  { id: 'sleep', name: 'Sleep Routine', category: 'Wellness', icon: '😴', color: 'bg-green-100' },
  
  // Nutrition
  { id: 'water', name: 'Water Intake', category: 'Nutrition', icon: '💧', color: 'bg-cyan-100' },
  { id: 'vitamins', name: 'Vitamins', category: 'Nutrition', icon: '💊', color: 'bg-cyan-100' },
  { id: 'healthy_meal', name: 'Healthy Meal Prep', category: 'Nutrition', icon: '🥗', color: 'bg-cyan-100' },
]

export default function ChooseActivitiesStep() {
  const { currentStep, nextStep, answers, setAnswer } = useQuizStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>(answers.selectedActivities || [])
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => {
      const newSelection = prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
      
      setAnswer('selectedActivities', newSelection)
      return newSelection
    })
  }

  const handleAISuggest = () => {
    const keywords = aiPrompt.toLowerCase()
    let suggestions: string[] = []
    
    if (keywords.includes('skin')) {
      suggestions = ['cleansing', 'moisturizing', 'sunscreen', 'exfoliating', 'mask']
    } else if (keywords.includes('hair')) {
      suggestions = ['hair_wash', 'hair_mask', 'hair_oil', 'hair_trim']
    } else if (keywords.includes('stress') || keywords.includes('mental')) {
      suggestions = ['meditation', 'breathing', 'journaling', 'sleep']
    } else if (keywords.includes('fit') || keywords.includes('exercise')) {
      suggestions = ['cardio', 'strength', 'yoga', 'stretching', 'walking']
    }
    
    setSelectedActivities(prev => {
      const newSelection = [...new Set([...prev, ...suggestions])]
      setAnswer('selectedActivities', newSelection)
      return newSelection
    })
    
    setShowAIModal(false)
    setAiPrompt('')
  }

  const handleNext = () => {
    const nextStepIndex = currentStep + 1
    nextStep()
    router.push(`/quiz/${nextStepIndex}`)
  }

  const MagicWandIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )

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
          <h1 className="text-xl font-bold text-[#5C4688]">Choose Activities</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent"
          />
          <button
            onClick={() => setShowAIModal(true)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <div className="p-2 bg-[#A385E9] rounded-lg hover:bg-[#906fe2] transition-colors">
              <MagicWandIcon />
            </div>
          </button>
        </div>

        <p className="text-gray-600 text-sm">
          Select the activities you want to include in your routine. You can search or use AI suggestions.
        </p>
      </div>

      {/* Activities Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedActivities.includes(activity.id)
                  ? 'border-[#A385E9] bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleActivityToggle(activity.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center mb-3`}>
                <span className="text-2xl">{activity.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{activity.name}</h3>
              <p className="text-sm text-gray-500">{activity.category}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={selectedActivities.length === 0}
          className="w-full bg-[#A385E9] text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#5C4688] mb-4">AI Activity Suggestions</h3>
            <p className="text-gray-600 mb-4">
              Tell me what you're interested in (e.g., "skin care", "stress relief", "fitness") and I'll suggest relevant activities.
            </p>
            <input
              type="text"
              placeholder="e.g., skin care, stress relief, fitness..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#A385E9]"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAIModal(false)
                  setAiPrompt('')
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAISuggest}
                disabled={!aiPrompt.trim()}
                className="flex-1 py-3 bg-[#A385E9] text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Suggest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}