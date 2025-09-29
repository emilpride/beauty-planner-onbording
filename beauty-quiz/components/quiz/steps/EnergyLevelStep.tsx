'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useState } from 'react'

export default function EnergyLevelStep() {
  const { answers, setAnswer } = useQuizStore()
  const [currentLevel, setCurrentLevel] = useState(answers.energyLevel || 1)

  useEffect(() => {
    if (!answers.energyLevel) {
      setAnswer('energyLevel', 1)
      setCurrentLevel(1)
    }
  }, [answers.energyLevel, setAnswer])

  const handleLevelClick = (level: number) => {
    setCurrentLevel(level)
    setAnswer('energyLevel', level as any)
  }

  const getBatteryColor = (level: number) => {
    if (level <= 1) return 'bg-red-500'
    if (level <= 2) return 'bg-orange-500'
    if (level <= 3) return 'bg-yellow-400'
    if (level <= 4) return 'bg-green-400'
    return 'bg-green-500'
  }

  const batteryColor = getBatteryColor(currentLevel)

  return (
    <OnboardingStep
      title="How's Your Daily Energy Level?"
      subtitle="Tap the battery to set your energy level."
      condition={answers.energyLevel > 0}
    >
      <div className="flex justify-center py-4">
        <div className="space-y-4">
          {/* Interactive Battery - Vertical */}
          <div className="flex justify-center">
            <div className="w-[119px] h-[212px] p-[14px] border-4 border-primary rounded-[21px] flex flex-col justify-end items-center gap-[6px] relative">
              {/* Battery cap - centered at top */}
              <div className="absolute w-[49px] h-[18px] left-1/2 transform -translate-x-1/2 -top-[18px] bg-primary rounded-t-[5px]"></div>
              
              {/* Battery bars - vertical stack, each bar is clickable */}
              <div className="flex flex-col gap-[6px] w-full items-center">
                {[5, 4, 3, 2, 1].map((bar) => (
                  <button
                    key={bar}
                    onClick={() => handleLevelClick(bar)}
                    className={`w-[91px] h-[32px] rounded-[5px] transition-all duration-200 hover:scale-105 ${
                      bar <= currentLevel ? batteryColor : 'bg-gray-200 hover:bg-gray-300'
                    } ${bar === currentLevel ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}
