'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type EnergyLevel = 1 | 2 | 3 | 4 | 5


export default function EnergyLevelStep() {
  const { answers, setAnswer } = useQuizStore()
  const batteryRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [currentLevel, setCurrentLevel] = useState<EnergyLevel>(3)
  const containerRef = useRef<HTMLDivElement>(null)

  // Плавное обновление уровня энергии по всей высоте батарейки
  const updateLevel = useCallback(
    (level: EnergyLevel) => {
      setCurrentLevel(level)
      setAnswer('EnergyLevel', level)
    },
    [setAnswer]
  )

  // Плавное определение уровня по позиции пальца
  const measureLevel = useCallback(
    (clientY: number): EnergyLevel => {
      const battery = batteryRef.current
      if (!battery) return currentLevel
      const rect = battery.getBoundingClientRect()
      const relY = clientY - rect.top
      // Позволяет плавно менять уровень по всей высоте
      let percent = 1 - relY / rect.height
      if (percent < 0) percent = 0
      if (percent > 1) percent = 1
      // 1 = низ, 5 = верх
      let level = Math.round(percent * 4) + 1
      if (level < 1) level = 1
      if (level > 5) level = 5
      return level as EnergyLevel
    },
    [currentLevel]
  )

  useEffect(() => {
    const stored = Number(answers.EnergyLevel)
    if (stored >= 1 && stored <= 5) {
      setCurrentLevel(stored as EnergyLevel)
    } else {
      updateLevel(3)
    }
  }, [answers.EnergyLevel, updateLevel])

  // Обработка pointer событий для плавного свайпа
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    draggingRef.current = true
    batteryRef.current?.setPointerCapture(e.pointerId)
    updateLevel(measureLevel(e.clientY))
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.preventDefault()
    updateLevel(measureLevel(e.clientY))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    batteryRef.current?.releasePointerCapture(e.pointerId)
  }
  // Цвет батарейки в зависимости от уровня
  const getBatteryColor = (level: number) => {
    if (level <= 2) return 'bg-orange-400'
    if (level === 3) return 'bg-yellow-300'
    if (level === 4) return 'bg-green-400'
    return 'bg-green-600'
  }

  return (
    <OnboardingStep
      title="Daily energy"
      condition={(answers.EnergyLevel || 0) > 0}
      onNext={() => {}}
    >
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ minHeight: 320 }}
      >
        <div
          ref={batteryRef}
          className="relative select-none touch-none flex flex-col justify-end"
          style={{
            width: 64,
            height: 240,
            paddingTop: 'clamp(24px, 8vw, 40px)',
            paddingBottom: 'clamp(24px, 8vw, 40px)',
            boxSizing: 'content-box',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Батарейка: 5 сегментов */}
          <div className="absolute left-1/2 -top-3 w-8 h-3 -translate-x-1/2 rounded-t bg-gray-300" />
          <div className="flex flex-col-reverse h-full w-full gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`transition-colors duration-150 rounded ${level <= currentLevel ? getBatteryColor(level) : 'bg-gray-200'}`}
                style={{ flex: '1 1 0%' }}
                onClick={() => updateLevel(level as EnergyLevel)}
                role="button"
                tabIndex={0}
              />
            ))}
          </div>
        </div>
        {/* Можно добавить подписи или подсказки ниже */}
      </div>
    </OnboardingStep>
  )
}
