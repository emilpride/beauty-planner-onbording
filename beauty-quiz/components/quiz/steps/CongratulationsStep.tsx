'use client'

import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'

export default function CongratulationsStep() {
  return (
    <OnboardingStep
      title="Congratulations on taking the first step!"
      subtitle="You've just made a big move towards becoming the best version of yourself. Let's keep going — I'm here to guide you every step of the way!"
      buttonText="Continue"
    >
      <div className="flex flex-col items-center space-y-6 py-8">
        {/* Animated Celebration Icons */}
        <div className="relative">
          <motion.div
            className="text-6xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          >
            🎉
          </motion.div>
          
          {/* Floating Stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 200 - 100}px`,
                top: `${Math.random() * 200 - 100}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.5 + i * 0.1, 
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Animated Progress Bar */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="bg-surface-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "25%" }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            />
          </div>
          <motion.p
            className="text-sm text-text-secondary mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Step 1 of 4 completed
          </motion.p>
        </motion.div>

        {/* Pulsing Success Ring */}
        <motion.div
          className="relative w-32 h-32 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-green-400/30" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.div>
        </motion.div>
      </div>
    </OnboardingStep>
  )
}
