'use client'

import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const options = [
  { id: 'great', label: 'Great', emoji: '/icons/emojis/great_emoji.png' },
  { id: 'good', label: 'Good', emoji: '/icons/emojis/good_emoji.png' },
  { id: 'okay', label: 'Okay', emoji: '/icons/emojis/okay_emoji.png' },
  { id: 'bad', label: 'Bad', emoji: '/icons/emojis/bad_emoji.png' },
  { id: 'terrible', label: 'Terrible', emoji: '/icons/emojis/not_good_emoji.png' },
]

export default function MoodStep() {
  const { answers, setAnswer, currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const hasTransitioned = useRef(false)

  const handleOptionSelect = (moodId: string) => {
    if (hasTransitioned.current) return

    setAnswer('mood', moodId as any)
    hasTransitioned.current = true

    setTimeout(() => {
      nextStep()
      router.push(`/quiz/${currentStep + 1}`)
    }, 800)
  }

  useEffect(() => {
    setAnswer('mood', '')
    hasTransitioned.current = false

    return () => {
      hasTransitioned.current = false
    }
  }, [setAnswer])

  return (
    <OnboardingStep
      title={"How are you feeling\n today?"}
      subtitle="Your mood can be an important indicator of your overall well-being."
      condition={answers.mood !== ''}
      hideButton={true}
    >
      <div className="grid grid-cols-3 gap-2 place-items-center py-2">
        {options.map((option, index) => {
          const isSelected = answers.mood === option.id
          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full max-w-[110px] flex flex-col items-center space-y-2 rounded-xl px-3 py-3 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                isSelected
                  ? 'scale-110 bg-primary/15 shadow-soft'
                  : 'opacity-70 bg-surface/70 hover:opacity-100 hover:bg-surface-muted'
              }`}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              <motion.div 
                className="w-12 h-12 relative"
                animate={isSelected ? { 
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Image
                  src={option.emoji}
                  alt={option.label}
                  fill
                  className="object-contain"
                />
              </motion.div>
              <motion.span 
                className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text-secondary'}`}
                animate={isSelected ? { 
                  color: ["rgb(107 114 128)", "rgb(163 133 233)", "rgb(163 133 233)"]
                } : {}}
                transition={{ duration: 0.3 }}
              >
                {option.label}
              </motion.span>
              
              {/* Selection pulse effect */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </OnboardingStep>
  )
}
