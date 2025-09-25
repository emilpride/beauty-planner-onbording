'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useState, useEffect } from 'react'

export default function EndDayStep() {
  const { answers, setAnswer } = useQuizStore()
  const [hours, setHours] = useState(23)
  const [minutes, setMinutes] = useState(0)
  const [isAM, setIsAM] = useState(false)

  useEffect(() => {
    if (answers.endDayTime) {
      const [h, m] = answers.endDayTime.split(':').map(Number)
      
      if (answers.timeFormat === '12h') {
        // Конвертируем 24-часовой формат в 12-часовой
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
      
      // Находим ближайшее значение из списка 5-минутных интервалов
      const closestMinute = minutesList.reduce((prev, curr) => 
        Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
      )
      setMinutes(closestMinute)
    }
  }, [answers.endDayTime, answers.timeFormat])

  const updateTime = (newHours: number, newMinutes: number, newIsAM?: boolean) => {
    setHours(newHours)
    setMinutes(newMinutes)
    if (newIsAM !== undefined) {
      setIsAM(newIsAM)
    }
    
    let timeString: string
    if (answers.timeFormat === '12h') {
      // Конвертируем 12-часовой формат в 24-часовой для сохранения
      let hour24 = newHours
      if (!isAM && newHours !== 12) {
        hour24 = newHours + 12
      } else if (isAM && newHours === 12) {
        hour24 = 0
      }
      timeString = `${hour24.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    } else {
      timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    }
    setAnswer('endDayTime', timeString)
  }

  const hoursList = Array.from({ length: 24 }, (_, i) => i)
  const minutesList = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55

  // Создаем список часов в зависимости от формата
  const displayHoursList = answers.timeFormat === '12h' 
    ? Array.from({ length: 12 }, (_, i) => i + 1) // 1-12
    : Array.from({ length: 24 }, (_, i) => i) // 0-23

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
    } else {
      // Для минут используем шаг в 5 минут
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
      const sensitivity = 3 // Чувствительность свайпа
      const change = Math.round(deltaY / sensitivity)
      
      if (type === 'hours') {
        if (answers.timeFormat === '12h') {
          const newHours = Math.max(1, Math.min(12, startValue + change))
          updateTime(newHours, minutes)
        } else {
          const newHours = Math.max(0, Math.min(23, startValue + change))
          updateTime(newHours, minutes)
        }
      } else {
        // Для минут используем шаг в 5 минут
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

  return (
    <OnboardingStep
      title="What time do you usually end your day?"
      subtitle="This helps us plan your evening wind-down routines."
      condition={answers.endDayTime !== ''}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center space-x-8">
          {/* 12h/24h Format Toggle - вертикальный слева */}
          <div className="flex flex-col items-center">
            <div className="relative flex flex-col w-16 h-20 items-center rounded-full bg-gray-100 p-1">
              <div
                className="absolute left-1 right-1 h-1/2 rounded-full bg-primary shadow-md transition-transform duration-300 ease-in-out"
                style={{ transform: `translateY(${answers.timeFormat === '12h' ? '0' : '100%'})` }}
              />
              {[
                { value: '12h', label: '12h' },
                { value: '24h', label: '24h' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnswer('timeFormat', option.value as '12h' | '24h')}
                  className={`relative z-10 w-full h-1/2 rounded-full py-2 text-center text-sm font-semibold transition-colors duration-300 ${
                    answers.timeFormat === option.value
                      ? 'text-white' 
                      : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hours Column */}
          <div className="flex flex-col items-center">
            <div 
              className="h-32 overflow-hidden relative w-20"
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
                style={{ transform: `translateY(${64 - minutesList.indexOf(minutes) * 40}px)` }}
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

          {/* AM/PM Column - всегда занимает место, но скрывается в 24h */}
          <div className="flex flex-col items-center">
            {answers.timeFormat === '12h' ? (
              <div className="relative flex flex-col w-16 h-20 items-center rounded-full bg-gray-100 p-1">
                <div
                  className="absolute left-1 right-1 h-1/2 rounded-full bg-primary shadow-md transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateY(${isAM ? '0' : '100%'})` }}
                />
                {['AM', 'PM'].map((period, index) => (
                  <button
                    key={period}
                    onClick={() => updateTime(hours, minutes, period === 'AM')}
                    className={`relative z-10 w-full h-1/2 rounded-full py-2 text-center text-sm font-semibold transition-colors duration-300 ${
                      (period === 'AM' && isAM) || (period === 'PM' && !isAM)
                        ? 'text-white' 
                        : 'text-gray-500'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            ) : (
              // Невидимый placeholder для сохранения места
              <div className="w-16 h-20"></div>
            )}
          </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

