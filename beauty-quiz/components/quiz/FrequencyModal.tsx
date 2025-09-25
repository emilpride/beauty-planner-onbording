'use client'

import { useState, useEffect } from 'react'

interface FrequencyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (frequency: number, period: 'day' | 'week' | 'month' | 'year') => void
  activityName: string
  currentFrequency?: number
  currentPeriod?: 'day' | 'week' | 'month' | 'year'
}

export default function FrequencyModal({
  isOpen,
  onClose,
  onConfirm,
  activityName,
  currentFrequency = 1,
  currentPeriod = 'week'
}: FrequencyModalProps) {
  const [frequency, setFrequency] = useState(currentFrequency)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(currentPeriod)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startFrequency, setStartFrequency] = useState(0)

  useEffect(() => {
    setFrequency(currentFrequency)
    setPeriod(currentPeriod)
  }, [currentFrequency, currentPeriod])

  const numbers = Array.from({ length: 30 }, (_, i) => i + 1)
  const periods = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ] as const

  const handleConfirm = () => {
    onConfirm(frequency, period)
    onClose()
  }

  // Обработка скролла колесиком мыши для частоты
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const newFrequency = Math.max(1, Math.min(30, frequency + delta))
    setFrequency(newFrequency)
  }

  // Обработка touch событий для частоты
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartFrequency(frequency)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const currentY = e.touches[0].clientY
    const deltaY = startY - currentY
    const deltaFrequency = Math.round(deltaY / 20) // 20px = 1 единица частоты
    const newFrequency = Math.max(1, Math.min(30, startFrequency + deltaFrequency))
    setFrequency(newFrequency)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Обработка скролла колесиком мыши для периода
  const handlePeriodWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const currentIndex = periods.findIndex(p => p.value === period)
    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(periods.length - 1, currentIndex + delta))
    setPeriod(periods[newIndex].value)
  }

  // Обработка touch событий для периода
  const handlePeriodTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartFrequency(periods.findIndex(p => p.value === period))
  }

  const handlePeriodTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const currentY = e.touches[0].clientY
    const deltaY = startY - currentY
    const deltaIndex = Math.round(deltaY / 20) // 20px = 1 единица периода
    const currentIndex = periods.findIndex(p => p.value === period)
    const newIndex = Math.max(0, Math.min(periods.length - 1, currentIndex + deltaIndex))
    setPeriod(periods[newIndex].value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-text-primary mb-6 text-center">
          {activityName} Every...
        </h3>
        
        <div className="flex justify-center space-x-8 mb-6">
          {/* Numbers Column */}
          <div className="flex flex-col items-center">
            <div 
              className="h-32 overflow-hidden relative w-16"
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - (frequency - 1) * 40}px)` }}
              >
                {numbers.map((num) => (
                  <div
                    key={num}
                    className={`h-10 flex items-center justify-center text-3xl font-bold cursor-pointer transition-all duration-200 ${
                      num === frequency 
                        ? 'text-text-primary scale-110' 
                        : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => setFrequency(num)}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-16 h-1 bg-primary mt-2 rounded-full"></div>
          </div>

          {/* Periods Column */}
          <div className="flex flex-col items-center">
            <div 
              className="h-32 overflow-hidden relative w-20"
              onWheel={handlePeriodWheel}
              onTouchStart={handlePeriodTouchStart}
              onTouchMove={handlePeriodTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex flex-col transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${64 - periods.findIndex(p => p.value === period) * 40}px)` }}
              >
                {periods.map((p) => (
                  <div
                    key={p.value}
                    className={`h-10 flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-200 ${
                      p.value === period 
                        ? 'text-text-primary scale-110' 
                        : 'text-gray-400 scale-75'
                    }`}
                    onClick={() => setPeriod(p.value)}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-20 h-1 bg-primary mt-2 rounded-full"></div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

