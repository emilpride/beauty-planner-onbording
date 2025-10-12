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

  const updateLevel = useCallback(
    (level: EnergyLevel) => {
      setCurrentLevel(level)
      setAnswer('EnergyLevel', level)
    },
    [setAnswer]
  )

  const measureLevel = useCallback(
    (clientY: number): EnergyLevel => {
      const battery = batteryRef.current
      if (!battery) return currentLevel
      const rect = battery.getBoundingClientRect()
      const relY = clientY - rect.top
      const segment = rect.height / 5
      let level = 5 - Math.floor(relY / segment)
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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    draggingRef.current = true
    if (e.cancelable) e.preventDefault()
    const clientY = e.touches[0]?.clientY
    if (clientY) updateLevel(measureLevel(clientY))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    if (e.cancelable) e.preventDefault()
    const clientY = e.touches[0]?.clientY
    if (clientY) updateLevel(measureLevel(clientY))
  }

  const handleTouchEnd = () => {
    draggingRef.current = false
  }

  const batteryColor = useMemo(() => {
    if (currentLevel <= 1) return 'bg-red-500'
    if (currentLevel <= 2) return 'bg-orange-500'
    if (currentLevel <= 3) return 'bg-yellow-400'
    if (currentLevel <= 4) return 'bg-green-400'
    return 'bg-green-500'
  }, [currentLevel])

  return (
    <OnboardingStep
      title="Daily energy"
      subtitle="Tap or drag to fill the battery"
      condition={(answers.EnergyLevel || 0) > 0}
      fillContent
    >
      <div ref={containerRef} className="flex w-full justify-center px-4 py-6 touch-manipulation select-none" onWheel={(e)=> e.preventDefault()}>
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div
            ref={batteryRef}
            className="relative select-none rounded-3xl border-4 border-primary bg-white/70 p-3 shadow-inner"
            style={{ width: 120, height: 220 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute -top-4 left-1/2 h-4 w-12 -translate-x-1/2 rounded-t-lg bg-primary" />
            {/* Segments container */}
            <div className="absolute inset-3 flex flex-col-reverse gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  role="button"
                  tabIndex={0}
                  onClick={() => updateLevel(level as EnergyLevel)}
                  className={`h-full rounded-md transition-colors duration-150 ${
                    level <= currentLevel ? `${batteryColor}` : 'bg-gray-200'
                  }`}
                  style={{ flex: '1 1 0%' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}
