'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

export default function EnergyLevelStep() {
  const { answers, setAnswer } = useQuizStore()

  const getBatteryLevel = (level: number) => {
    // Возвращаем количество полосок для батарейки (1-5)
    return level
  }

  const getBatteryColor = (level: number) => {
    if (level <= 1) return 'bg-red-500'
    if (level <= 2) return 'bg-orange-500'
    if (level <= 3) return 'bg-yellow-400'
    if (level <= 4) return 'bg-green-400'
    return 'bg-green-500'
  }

  const batteryLevel = getBatteryLevel(answers.energyLevel || 2)
  const batteryColor = getBatteryColor(answers.energyLevel || 2)

  return (
    <OnboardingStep
      title="How's Your Daily Energy Level?"
      subtitle="Tap the battery to set your energy level."
      condition={answers.energyLevel > 0}
    >
      <div className="flex justify-center py-8">
        <div className="space-y-6">
          {/* Interactive Battery - Vertical */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newLevel = answers.energyLevel >= 5 ? 1 : (answers.energyLevel || 0) + 1
                setAnswer('energyLevel', newLevel as any)
              }}
              className="w-[119px] h-[212px] p-[14px] border-4 border-primary rounded-[21px] hover:scale-105 transition-transform duration-200 flex flex-col justify-end items-center gap-[6px] relative"
            >
              {/* Battery cap - centered at top */}
              <div className="absolute w-[49px] h-[18px] left-1/2 transform -translate-x-1/2 -top-[18px] bg-primary rounded-t-[5px]"></div>
              
              {/* Battery bars - vertical stack, charge from bottom up */}
              <div className="flex flex-col gap-[6px] w-full items-center">
                {[5, 4, 3, 2, 1].map((bar) => (
                  <div
                    key={bar}
                    className={`w-[91px] h-[32px] rounded-[5px] ${
                      bar <= batteryLevel ? batteryColor : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

