'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useState, useRef } from 'react'

export default function EnergyLevelStep() {
  // Для свайпа по батарее
  const batteryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false)

  // Определить уровень по позиции Y
  const getLevelFromY = (clientY: number) => {
    const battery = batteryRef.current
    if (!battery) return currentLevel
    const rect = battery.getBoundingClientRect()
    const relY = clientY - rect.top
    const barHeight = rect.height / 5
    let level = 5 - Math.floor(relY / barHeight)
    if (level < 1) level = 1
    if (level > 5) level = 5
    return level as 1|2|3|4|5
  }

  // Обработчики мыши/тача
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY
    const level = getLevelFromY(clientY)
    setCurrentLevel(level)
    setAnswer('EnergyLevel', level)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }
  const handlePointerMove = (e: PointerEvent) => {
    const level = getLevelFromY(e.clientY)
    setCurrentLevel(level)
    setAnswer('EnergyLevel', level)
  }
  const handlePointerUp = (e: PointerEvent) => {
    setIsDragging(false)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const clientY = e.touches[0].clientY
    const level = getLevelFromY(clientY)
    setCurrentLevel(level)
    setAnswer('EnergyLevel', level)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
  }
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    const clientY = e.touches[0].clientY
    const level = getLevelFromY(clientY)
    setCurrentLevel(level)
    setAnswer('EnergyLevel', level)
  }
  const handleTouchEnd = (e: TouchEvent) => {
    setIsDragging(false)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  }
  // Disable scroll on mount, restore on unmount
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  const { answers, setAnswer } = useQuizStore()
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4 | 5>(1)

  useEffect(() => {
    setAnswer('EnergyLevel', 1)
    setCurrentLevel(1)
  }, [setAnswer])

  const handleLevelClick = (level: 1 | 2 | 3 | 4 | 5) => {
    setCurrentLevel(level)
    setAnswer('EnergyLevel', level)
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
      condition={(answers.EnergyLevel || 0) > 0}
    >
      <div className="flex justify-center py-4">
        <div className="space-y-4">
          {/* Interactive Battery - Vertical */}
          <div className="flex justify-center">
            <div
              ref={batteryRef}
              className="w-[119px] h-[212px] p-[14px] border-4 border-primary rounded-[21px] flex flex-col justify-end items-center gap-[6px] relative select-none cursor-pointer"
              onPointerDown={handlePointerDown}
              onTouchStart={handleTouchStart}
            >
              {/* Battery cap - centered at top */}
              <div className="absolute w-[49px] h-[18px] left-1/2 transform -translate-x-1/2 -top-[18px] bg-primary rounded-t-[5px]"></div>
              
              {/* Battery bars - vertical stack, each bar is clickable */}
              <div className="flex flex-col gap-[6px] w-full items-center">
                {[5, 4, 3, 2, 1].map((bar) => (
                  <button
                    key={bar}
                    onClick={() => handleLevelClick(bar as 1 | 2 | 3 | 4 | 5)}
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
