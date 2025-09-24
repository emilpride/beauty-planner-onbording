'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useState, useEffect } from 'react'

export default function WakeUpStep() {
  const { answers, setAnswer } = useQuizStore()
  const [hours, setHours] = useState(7)
  const [minutes, setMinutes] = useState(30)

  useEffect(() => {
    if (answers.wakeUpTime) {
      const [h, m] = answers.wakeUpTime.split(':').map(Number)
      setHours(h)
      setMinutes(m)
    }
  }, [answers.wakeUpTime])

  const updateTime = (newHours: number, newMinutes: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    setAnswer('wakeUpTime', timeString)
  }

  const hoursList = Array.from({ length: 24 }, (_, i) => i)
  const minutesList = Array.from({ length: 60 }, (_, i) => i)

  const handleWheel = (e: React.WheelEvent, type: 'hours' | 'minutes') => {
    e.preventDefault()
    if (type === 'hours') {
      const newHours = Math.max(0, Math.min(23, hours + (e.deltaY > 0 ? 1 : -1)))
      updateTime(newHours, minutes)
    } else {
      const newMinutes = Math.max(0, Math.min(59, minutes + (e.deltaY > 0 ? 1 : -1)))
      updateTime(hours, newMinutes)
    }
  }

  const handleTouchStart = (e: React.TouchEvent, type: 'hours' | 'minutes') => {
    const touch = e.touches[0]
    const startY = touch.clientY
    const startValue = type === 'hours' ? hours : minutes
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const currentY = touch.clientY
      const deltaY = startY - currentY
      const sensitivity = 3 // Чувствительность свайпа
      const change = Math.round(deltaY / sensitivity)
      
      if (type === 'hours') {
        const newHours = Math.max(0, Math.min(23, startValue + change))
        updateTime(newHours, minutes)
      } else {
        const newMinutes = Math.max(0, Math.min(59, startValue + change))
        updateTime(hours, newMinutes)
      }
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <OnboardingStep
      title="What time do you usually wake up?"
      subtitle="Setting your wake-up time helps us create your personalized Activity schedule."
      condition={answers.wakeUpTime !== ''}
    >
      <div className="flex justify-center">
        <div className="flex items-center space-x-12">
          {/* Hours Column */}
          <div className="flex flex-col items-center">
            <div 
              className="h-32 overflow-hidden relative w-20"
              onWheel={(e) => handleWheel(e, 'hours')}
              onTouchStart={(e) => handleTouchStart(e, 'hours')}
            >
              <div 
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - hours * 40}px)` }}
              >
                {hoursList.map((hour) => (
                  <div
                    key={hour}
                    className={`h-10 flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 ${
                      hour === hours 
                        ? 'text-text-primary scale-110' 
                        : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => updateTime(hour, minutes)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-20 h-1 bg-primary mt-2 rounded-full"></div>
          </div>

          {/* Minutes Column */}
          <div className="flex flex-col items-center">
            <div 
              className="h-32 overflow-hidden relative w-20"
              onWheel={(e) => handleWheel(e, 'minutes')}
              onTouchStart={(e) => handleTouchStart(e, 'minutes')}
            >
              <div 
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - minutes * 40}px)` }}
              >
                {minutesList.map((minute) => (
                  <div
                    key={minute}
                    className={`h-10 flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 ${
                      minute === minutes 
                        ? 'text-text-primary scale-110' 
                        : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => updateTime(hours, minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-20 h-1 bg-primary mt-2 rounded-full"></div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

