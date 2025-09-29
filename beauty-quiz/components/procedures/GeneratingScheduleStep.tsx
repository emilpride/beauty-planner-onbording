'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion, animate } from 'framer-motion'

export default function GeneratingScheduleStep() {
  const { currentStep, nextStep, answers } = useQuizStore()
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const steps = [
    { id: 'analyzing', title: 'Analyzing your answers', completed: false },
    { id: 'personalizing', title: 'Analyzing your appearance', completed: false },
    { id: 'optimizing', title: 'Your plan is almost ready', completed: false },
    { id: 'finalizing', title: 'Done!', completed: false }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= steps.length) {
          clearInterval(interval)
          // Navigate to next step after all steps are complete
          setTimeout(() => {
            router.push('/procedures/3')
          }, 3000)
          return prev
        }
        return nextIndex
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [currentStep, nextStep, router])

  const getStatusIcon = (stepIndex: number) => {
    const isCompleted = stepIndex < currentStepIndex
    const isCurrent = stepIndex === currentStepIndex

    if (isCompleted) {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }

    if (isCurrent) {
      return (
        <div className="w-8 h-8 bg-[#A385E9] rounded-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    return (
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
    )
  }

  const getAssistantImage = () => {
    return answers.assistant === 2 
      ? '/images/content/assistant_ellie.png'
      : '/images/content/assistant_max.png'
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-100 to-pink-100 flex flex-col">
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <div className="w-6 h-6 bg-[#A385E9] rounded-full"></div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
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

        {/* Progress List */}
        <div className="w-full max-w-md space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center space-x-4 p-4 bg-white bg-opacity-80 rounded-xl backdrop-blur-sm"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {getStatusIcon(index)}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-600">
            Please wait while we create your personalized beauty routine...
          </p>
        </motion.div>
      </div>
    </div>
  )
}
