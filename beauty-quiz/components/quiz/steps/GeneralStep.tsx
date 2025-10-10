'use client'

import { useQuizStore } from '@/store/quizStore'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import HeightPicker from '@/components/ui/HeightPicker'
import WeightPicker from '@/components/ui/WeightPicker'

export default function GeneralStep() {
  const { answers, setAnswer } = useQuizStore()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [heightPickerOpen, setHeightPickerOpen] = useState(false)
  const [weightPickerOpen, setWeightPickerOpen] = useState(false)
  const [isAnimating, setAnimating] = useState(false)
  const calendarRef = useRef<HTMLDivElement | null>(null)

  const handleOpenCalendar = () => {
    setCalendarOpen(true)
    setTimeout(() => setAnimating(true), 10) // Allow component to mount before animating
  }

  const handleCloseCalendar = () => {
    setAnimating(false)
    setTimeout(() => setCalendarOpen(false), 300) // Wait for animation to finish
  }

  // Compute age from birthDate
  const computedAge = useMemo(() => {
    if (!answers.BirthDate) return null
    const today = new Date()
    const [y, m, d] = answers.BirthDate.split('-').map((v) => parseInt(v, 10))
    if (!y || !m || !d) return null
    let age = today.getFullYear() - y
    const mDiff = today.getMonth() + 1 - m
    const dDiff = today.getDate() - d
    if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) age--
    return age
  }, [answers.BirthDate])

  const isFormValid = () => {
    return (
      answers.Name.trim() !== '' &&
      computedAge !== null &&
      computedAge >= 13 &&
      computedAge <= 100 &&
      answers.Height.trim() !== '' &&
      answers.Weight.trim() !== ''
    )
  }

  const validateField = (name: string, value: any) => {
    let error = ''
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Please enter your name'
        break
      case 'birthDate':
        if (!value) {
          error = 'Please select your birth date'
        } else {
          const [y, m, d] = value.split('-').map((v: string) => parseInt(v, 10))
          if (!y || !m || !d) {
            error = 'Please select a valid date'
          } else {
            // Compute age directly from the provided value to avoid stale state
            const today = new Date()
            let age = today.getFullYear() - y
            const mDiff = today.getMonth() + 1 - m
            const dDiff = today.getDate() - d
            if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) age--
            if (age === null || age < 13 || age > 100) {
              error = 'Age must be between 13 and 100'
            }
          }
        }
        break
      case 'height':
        if (!value.trim()) error = 'Please enter your height'
        break
      case 'weight':
        if (!value.trim()) error = 'Please enter your weight'
        break
      default:
        break
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleInputChange = (field: keyof typeof answers, value: any) => {
    setAnswer(field, value)
    if (field === 'BirthDate') {
      // Also update derived age for backward compatibility
      const [y, m, d] = String(value).split('-').map((v) => parseInt(v, 10))
      if (y && m && d) {
        const today = new Date()
        let age = today.getFullYear() - y
        const mDiff = today.getMonth() + 1 - m
        const dDiff = today.getDate() - d
        if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) age--
        setAnswer('Age', isFinite(age) ? age : null)
      } else {
        setAnswer('Age', null)
      }
    }
    validateField(field, value)
  }

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        handleCloseCalendar()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Prevent body scroll when modal open
  useEffect(() => {
    if (calendarOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [calendarOpen])

  // Enforce metric units for simplified UI
  useEffect(() => {
    if (answers.HeightUnit !== 'cm') setAnswer('HeightUnit', 'cm')   
    if (answers.WeightUnit !== 'kg') setAnswer('WeightUnit', 'kg')   
  }, [answers.HeightUnit, answers.WeightUnit, setAnswer])

  return (
    <OnboardingStep
      title="Tell us about yourself"
      subtitle="This helps us create a personalized plan just for you"
      condition={isFormValid()}
    >
      <div className="space-y-3 py-1">
        {/* Gender selection tabs (styled) - moved to top */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Gender
          </label>
          <div
            role="tablist"
            aria-label="Select your gender"
            className="w-full rounded-xl border border-gray-300 bg-white p-1"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                role="tab"
                aria-selected={answers.Gender === 1}
                aria-pressed={answers.Gender === 1}
                onClick={() => setAnswer('Gender', 1)}
                className={`relative w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary flex items-center justify-center gap-2 active:scale-[0.98]
                  ${answers.Gender === 1
                    ? 'text-white bg-gradient-to-r from-[#53E5FF] to-[#8A60FF]'
                    : 'bg-transparent text-text-primary hover:bg-white/60 dark:hover:bg-white/5'}`}
              >
                <span aria-hidden className="text-base leading-none">♂</span>
                <span>Male</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={answers.Gender === 2}
                aria-pressed={answers.Gender === 2}
                onClick={() => setAnswer('Gender', 2)}
                className={`relative w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary flex items-center justify-center gap-2 active:scale-[0.98]
                  ${answers.Gender === 2
                    ? 'text-white bg-gradient-to-r from-[#FF99CC] to-[#8A60FF]'
                    : 'bg-transparent text-text-primary hover:bg-white/60 dark:hover:bg-white/5'}`}
              >
                <span aria-hidden className="text-base leading-none">♀</span>
                <span>Female</span>
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Name
          </label>
          <input
            type="text"
            value={answers.Name}
            onChange={(e) => handleInputChange('Name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your name"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Birthday
          </label>
          <button
            type="button"
            onClick={handleOpenCalendar}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary bg-white ${
              errors.birthDate ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
          >
            <span className={`text-left ${answers.BirthDate ? 'text-text-primary' : 'text-gray-400'}`}>
              {answers.BirthDate ? new Date(answers.BirthDate).toLocaleDateString() : 'Select your birth date'}
            </span>
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
              <path d="M8 3.5v3M16 3.5v3M3.5 9.5h17" strokeLinecap="round" />
              <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </button>
          {errors.birthDate && (
            <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>
          )}
        </div>
        {calendarOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            onClick={handleCloseCalendar}
          >
            <div
              ref={calendarRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl animate-in zoom-in-95 duration-300"
            >
              <DatePicker
                value={answers.BirthDate ? new Date(answers.BirthDate) : null}
                min={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
                max={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
                onCancel={handleCloseCalendar}
                onConfirm={(d) => {
                  // Format date manually to avoid timezone issues from toISOString()
                  const y = d.getFullYear()
                  const m = d.getMonth() + 1
                  const day = d.getDate()
                  const ymd = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  handleInputChange('BirthDate', ymd)
                  handleCloseCalendar()
                }}
              />
            </div>
          </div>
        )}


        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Height
            </label>
            <button
              type="button"
              onClick={() => setHeightPickerOpen(true)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary bg-white ${
                errors.height ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <span className={`text-left ${answers.Height ? 'text-text-primary' : 'text-gray-400'}`}>
                {answers.Height ? (() => {
                  const cm = parseInt(answers.Height, 10)
                  const totalInches = cm / 2.54
                  const feet = Math.floor(totalInches / 12)
                  const inches = Math.round(totalInches % 12)
                  return `${feet}'${inches} ft (${cm} cm)`
                })() : 'Select your height'}
              </span>
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                aria-hidden="true"
              >
                <path d="M12 3v18M9 6l3-3 3 3M9 18l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {errors.height && (
              <p className="mt-1 text-xs text-red-600">{errors.height}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Weight
            </label>
            <button
              type="button"
              onClick={() => setWeightPickerOpen(true)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary bg-white ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <span className={`text-left ${answers.Weight ? 'text-text-primary' : 'text-gray-400'}`}>
                {answers.Weight ? (() => {
                  const kg = parseInt(answers.Weight, 10)
                  const lb = Math.round(kg * 2.20462)
                  return `${lb} lb (${kg} kg)`
                })() : 'Select your weight'}
              </span>
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path d="M8 9a4 4 0 0 1 8 0" />
                <path d="M12 9v3" strokeLinecap="round" />
                <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </button>
            {errors.weight && (
              <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
            )}
          </div>
        </div>
      </div>

      {heightPickerOpen && (
        <div className="fixed inset-0 z-[101] bg-black/40 flex items-center justify-center">
          <div className="w-full h-full md:w-full md:max-w-md md:rounded-3xl md:overflow-hidden">
            <HeightPicker
              value={answers.Height ? parseInt(answers.Height) : 177}
              gender={answers.Gender}
              onConfirm={(height) => {
                handleInputChange('Height', height.toString())
                setHeightPickerOpen(false)
              }}
              onCancel={() => setHeightPickerOpen(false)}
            />
          </div>
        </div>
      )}

      {weightPickerOpen && (
        <div className="fixed inset-0 z-[101] bg-black/40 flex items-center justify-center">
          <div className="w-full h-full md:w-full md:max-w-md md:rounded-3xl md:overflow-hidden">
            <WeightPicker
              valueKg={answers.Weight ? parseInt(answers.Weight, 10) : 80}
              onConfirm={(kg) => {
                handleInputChange('Weight', String(kg))
                setWeightPickerOpen(false)
              }}
              onCancel={() => setWeightPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </OnboardingStep>
  )
}


