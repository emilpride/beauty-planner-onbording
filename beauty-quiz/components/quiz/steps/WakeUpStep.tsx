'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useState, useEffect } from 'react'

export default function WakeUpStep() {
  const { answers, setAnswer } = useQuizStore()
  const [hours, setHours] = useState(7)
  const [minutes, setMinutes] = useState(30)
  const [isAM, setIsAM] = useState(true)

  useEffect(() => {
    // Default to 12h for US-friendly experience if not set
    if (answers.timeFormat !== '12h' && answers.timeFormat !== '24h') {
      setAnswer('timeFormat', '12h')
    }

    if (answers.wakeUpTime) {
      const [h, m] = answers.wakeUpTime.split(':').map(Number)
      
      if (answers.timeFormat === '12h') {

        if (h === 0) {
          setHours(12)
          setIsAM(true)
        } else if (h < 12) {
          setHours(h)
          setIsAM(true)
        } else if (h === 12) {
          setHours(12)
          setIsAM(false)
        } else {
          setHours(h - 12)
          setIsAM(false)
        }
      } else {
        setHours(h)
      }
      

      const closestMinute = minutesList.reduce((prev, curr) => 
        Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
      )
      setMinutes(closestMinute)
    }
  }, [answers.wakeUpTime, answers.timeFormat])

  const updateTime = (newHours: number, newMinutes: number, newIsAM?: boolean) => {
    setHours(newHours)
    setMinutes(newMinutes)
    if (newIsAM !== undefined) {
      setIsAM(newIsAM)
    }
    
    let timeString: string
    if (answers.timeFormat === '12h') {
      const effectiveIsAM = newIsAM !== undefined ? newIsAM : isAM
      let hour24 = newHours
      if (!effectiveIsAM && newHours !== 12) {
        hour24 = newHours + 12
      } else if (effectiveIsAM && newHours === 12) {
        hour24 = 0
      }
      timeString = `${hour24.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    } else {
      timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    }
    setAnswer('wakeUpTime', timeString)
  }

  const hoursList = Array.from({ length: 24 }, (_, i) => i)
  const minutesList = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55

  const handleWheel = (e: React.WheelEvent, type: 'hours' | 'minutes') => {
    e.preventDefault()
    if (type === 'hours') {
      if (answers.timeFormat === '12h') {
        const newHours = Math.max(1, Math.min(12, hours + (e.deltaY > 0 ? 1 : -1)))
        updateTime(newHours, minutes)
      } else {
        const newHours = Math.max(0, Math.min(23, hours + (e.deltaY > 0 ? 1 : -1)))
        updateTime(newHours, minutes)
      }
    } else if (type === 'minutes') {

      const currentMinuteIndex = minutesList.indexOf(minutes)
      const newIndex = Math.max(0, Math.min(11, currentMinuteIndex + (e.deltaY > 0 ? 1 : -1)))
      updateTime(hours, minutesList[newIndex])
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
      const sensitivity = 3
      const change = Math.round(deltaY / sensitivity)
      
      if (type === 'hours') {
        if (answers.timeFormat === '12h') {
          const newHours = Math.max(1, Math.min(12, startValue + change))
          updateTime(newHours, minutes)
        } else {
          const newHours = Math.max(0, Math.min(23, startValue + change))
          updateTime(newHours, minutes)
        }
      } else if (type === 'minutes') {

        const currentMinuteIndex = minutesList.indexOf(startValue)
        const newIndex = Math.max(0, Math.min(11, currentMinuteIndex + change))
        updateTime(hours, minutesList[newIndex])
      }
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }


  const displayHoursList = answers.timeFormat === '12h' 
    ? Array.from({ length: 12 }, (_, i) => i + 1) // 1-12
    : Array.from({ length: 24 }, (_, i) => i) // 0-23

  return (
    <OnboardingStep
      title="What time do you usually wake up?"
      subtitle="Setting your wake-up time helps us create your personalized Activity schedule."
      condition={answers.wakeUpTime !== ''}
    >
      <div className="space-y-4 py-1">
        {/* Format toggle (compact, horizontal) */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold">
            {[
              { value: '12h', label: '12h' },
              { value: '24h', label: '24h' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswer('timeFormat', opt.value as '12h' | '24h')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  answers.timeFormat === opt.value ? 'bg-primary text-white' : 'text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time wheels (compact) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div
              className="h-32 overflow-hidden relative w-16 sm:w-20"
              onWheel={(e) => handleWheel(e, 'hours')}
              onTouchStart={(e) => handleTouchStart(e, 'hours')}
            >
              <div
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - displayHoursList.indexOf(hours) * 40}px)` }}
              >
                {displayHoursList.map((hour) => (
                  <div
                    key={hour}
                    className={`h-10 flex items-center justify-center text-2xl sm:text-4xl font-bold cursor-pointer transition-all duration-200 ${
                      hour === hours ? 'text-text-primary scale-110' : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => updateTime(hour, minutes)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-16 sm:w-20 h-1 bg-primary mt-2 rounded-full"></div>
          </div>

          {/* Colon */}
          <div className="text-2xl sm:text-4xl font-bold text-text-primary select-none">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div
              className="h-32 overflow-hidden relative w-16 sm:w-20"
              onWheel={(e) => handleWheel(e, 'minutes')}
              onTouchStart={(e) => handleTouchStart(e, 'minutes')}
            >
              <div
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - minutesList.indexOf(minutes) * 40}px)` }}
              >
                {minutesList.map((minute) => (
                  <div
                    key={minute}
                    className={`h-10 flex items-center justify-center text-2xl sm:text-4xl font-bold cursor-pointer transition-all duration-200 ${
                      minute === minutes ? 'text-text-primary scale-110' : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => updateTime(hours, minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-16 sm:w-20 h-1 bg-primary mt-2 rounded-full"></div>
          </div>
        </div>

        {/* AM/PM toggle (compact) */}
        {answers.timeFormat === '12h' && (
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold">
              {['AM', 'PM'].map((period) => (
                <button
                  key={period}
                  onClick={() => updateTime(hours, minutes, period === 'AM')}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    (period === 'AM' && isAM) || (period === 'PM' && !isAM)
                      ? 'bg-primary text-white'
                      : 'text-text-secondary'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </OnboardingStep>
  )
}
