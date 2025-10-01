'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  sections: { name: string; steps: number }[]
  currentStep: number
}

export default function ProgressBar({ sections, currentStep }: ProgressBarProps) {
  let completedSections = 0
  let stepsInCurrentSection = 0
  let totalStepsInCurrentSection = 1
  let cumulativeSteps = 0
  let activeSectionIndex = 0

  for (const [index, section] of sections.entries()) {
    if (currentStep >= cumulativeSteps + section.steps) {
      completedSections++
      cumulativeSteps += section.steps
    } else {
      activeSectionIndex = index
      stepsInCurrentSection = currentStep - cumulativeSteps
      totalStepsInCurrentSection = section.steps
      break
    }
  }
  // Handle case where currentStep is the last step
  if (currentStep === sections.reduce((acc, s) => acc + s.steps, 0)) {
    activeSectionIndex = sections.length -1
    completedSections = sections.length
    stepsInCurrentSection = totalStepsInCurrentSection
  }


  return (
    <div className="flex w-full items-center space-x-2">
      {sections.map((section, index) => {
        const progress =
          index < completedSections
            ? 1
            : index === activeSectionIndex
            ? stepsInCurrentSection / totalStepsInCurrentSection
            : 0
        const isActive = index === activeSectionIndex

        return (
          <div key={section.name} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
              <motion.div
                className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-primary-light to-primary dark:from-primary-dark dark:to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 -translate-x-full animate-shine rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    }}
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </motion.div>
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                index <= activeSectionIndex ? 'text-primary' : 'text-text-tertiary'
              }`}
            >
              {section.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
