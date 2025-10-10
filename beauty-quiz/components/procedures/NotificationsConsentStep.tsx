'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NotificationsConsentStep() {
  const { currentStep, nextStep, answers, setAnswer } = useQuizStore()
  const router = useRouter()
  const [dailyReminders, setDailyReminders] = useState(answers.DailyMoodReminder || false)
  const [activityReminders, setActivityReminders] = useState<boolean>(answers.ActivityReminder || true)

  const handleSave = () => {
    setAnswer('DailyMoodReminder', dailyReminders)
    setAnswer('ActivityReminder', activityReminders)
    
    router.push('/procedures/4')
  }

  const getAssistantImage = () => {
    // Show the specific reminders illustration per assistant
    return answers.assistant === 2
      ? '/images/on_boarding_images/reminders.png'
      : '/images/on_boarding_images/reminders_max.png'
  }

  return (
    <div className="h-full bg-gradient-to-br from-background to-surface-muted flex flex-col">
      {/* Top Section with Character */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Floating Bell Icon */}
        <motion.div
          className="absolute top-20 right-8"
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
        </motion.div>

        {/* Assistant Character */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative w-48 h-48">
            <Image
              src={getAssistantImage()}
              alt="AI Assistant"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Set Up Reminders</h1>
            <p className="text-text-secondary">
              Stay on track with your beauty routine by setting up personalized reminders.
            </p>
          </div>

          {/* Toggle Options */}
          <div className="space-y-6">
            {/* Daily Mood Reminder */}
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl">
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Daily reminder to log your mood</h3>
                <p className="text-sm text-text-secondary">Get notified to track your daily mood</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A385E9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border-subtle/60 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A385E9]"></div>
              </label>
            </div>

            {/* Activity Reminders */}
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl">
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">Reminders of Activities</h3>
                <p className="text-sm text-text-secondary">Get notified about your scheduled activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activityReminders}
                  onChange={(e) => setActivityReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A385E9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border-subtle/60 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A385E9]"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            onClick={handleSave}
            className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Save
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
