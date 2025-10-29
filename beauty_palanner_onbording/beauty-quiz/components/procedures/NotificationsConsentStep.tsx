'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NotificationsConsentStep() {
  const { currentStep, nextStep, answers, setAnswer } = useQuizStore()
  const router = useRouter()
  // Default everything ON unless a stored value exists
  const [dailyReminders, setDailyReminders] = useState<boolean>(
    (answers.DailyMoodReminder as boolean | undefined) ?? true
  )
  const [dailyPush, setDailyPush] = useState<boolean>(
    (answers.DailyPushNotifications as boolean | undefined) ?? true
  )
  const [dailyEmail, setDailyEmail] = useState<boolean>(
    (answers.DailyEmailNotifications as boolean | undefined) ?? true
  )
  const [activityReminders, setActivityReminders] = useState<boolean>(
    (answers.ActivityReminder as boolean | undefined) ?? true
  )
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    (answers.EmailNotifications as boolean | undefined) ?? true
  )
  const [pushNotifications, setPushNotifications] = useState<boolean>(
    (answers.PushNotifications as boolean | undefined) ?? true
  )

  const handleSave = () => {
  setAnswer('DailyMoodReminder', dailyReminders)
  setAnswer('DailyPushNotifications', dailyPush)
  setAnswer('DailyEmailNotifications', dailyEmail)
  setAnswer('ActivityReminder', activityReminders)
  setAnswer('EmailNotifications', emailNotifications)
  setAnswer('PushNotifications', pushNotifications)

    // Flow shifted: after notifications (step 2) go to contract (step 3)
    router.push('/procedures/3')
  }

  const getAssistantImage = () => {
    // Show the specific reminders illustration per assistant
    return answers.assistant === 2
      ? '/images/on_boarding_images/reminders.png'
      : '/images/on_boarding_images/reminders_max.png'
  }

  return (
    <div className="h-full bg-gradient-to-br from-background to-surface-muted flex flex-col overflow-hidden">
      {/* Top Section with Character */}
  <div className="flex-1 flex flex-col items-center justify-start p-6 relative overflow-y-auto min-h-0">
        {/* Floating Bell Icon */}
        <motion.div
          className="absolute top-20 right-8 z-20"
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
          className="mb-2 z-0 pointer-events-none"
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
          className="relative z-10 w-full max-w-md bg-surface rounded-2xl p-6 shadow-xl -mt-2 sm:-mt-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Set Up Reminders</h1>
            <p className="text-text-secondary">
              Stay on track with smart reminders. Configure delivery inside.
            </p>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* Daily Mood Reminder */}
            <div className="p-4 bg-surface-muted rounded-xl">
              <div className="flex items-center justify-between">
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
              {dailyReminders && (
                <div className="mt-3 pt-3 border-t border-border-subtle/60">
                  <p className="text-xs text-text-secondary mb-2">Delivery channels</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDailyPush((v) => !v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${dailyPush ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-border-subtle'}`}
                    >In‑app push</button>
                    <button
                      type="button"
                      onClick={() => setDailyEmail((v) => !v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${dailyEmail ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-border-subtle'}`}
                    >Email</button>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Reminders */}
            <div className="p-4 bg-surface-muted rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">Activity reminders</h3>
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
              {activityReminders && (
                <div className="mt-3 pt-3 border-t border-border-subtle/60">
                  <p className="text-xs text-text-secondary mb-2">Delivery channels</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPushNotifications((v) => !v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${pushNotifications ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-border-subtle'}`}
                    >In‑app push</button>
                    <button
                      type="button"
                      onClick={() => setEmailNotifications((v) => !v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${emailNotifications ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-border-subtle'}`}
                    >Email</button>
                  </div>
                </div>
              )}
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
