'use client'

import { useQuizStore } from '@/store/quizStore'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import HeightPicker from '@/components/ui/HeightPicker'

export default function GeneralStep() {
  const { answers, setAnswer } = useQuizStore()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [heightPickerOpen, setHeightPickerOpen] = useState(false)
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
    if (!answers.birthDate) return null
    const today = new Date()
    const [y, m, d] = answers.birthDate.split('-').map((v) => parseInt(v, 10))
    if (!y || !m || !d) return null
    let age = today.getFullYear() - y
    const mDiff = today.getMonth() + 1 - m
    const dDiff = today.getDate() - d
    if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) age--
    return age
  }, [answers.birthDate])

  const isFormValid = () => {
    return (
      answers.name.trim() !== '' &&
      computedAge !== null &&
      computedAge >= 13 &&
      computedAge <= 100 &&
      answers.height.trim() !== '' &&
      answers.weight.trim() !== ''
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
    if (field === 'birthDate') {
      // Also update derived age for backward compatibility
      const [y, m, d] = String(value).split('-').map((v) => parseInt(v, 10))
      if (y && m && d) {
        const today = new Date()
        let age = today.getFullYear() - y
        const mDiff = today.getMonth() + 1 - m
        const dDiff = today.getDate() - d
        if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) age--
        setAnswer('age', isFinite(age) ? age : null)
      } else {
        setAnswer('age', null)
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
    if (answers.heightUnit !== 'cm') setAnswer('heightUnit', 'cm')
    if (answers.weightUnit !== 'kg') setAnswer('weightUnit', 'kg')
  }, [answers.heightUnit, answers.weightUnit, setAnswer])

  return (
    <OnboardingStep
      title="Tell us about yourself"
      subtitle="This helps us create a personalized plan just for you"
      condition={isFormValid()}
    >
      <div className="space-y-3 py-1">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Name
          </label>
          <input
            type="text"
            value={answers.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
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
            <span className={`text-left ${answers.birthDate ? 'text-text-primary' : 'text-gray-400'}`}>
              {answers.birthDate ? new Date(answers.birthDate).toLocaleDateString() : 'Select your birth date'}
            </span>
            <svg className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
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
                value={answers.birthDate ? new Date(answers.birthDate) : null}
                min={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
                max={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
                onCancel={handleCloseCalendar}
                onConfirm={(d) => {
                  // Format date manually to avoid timezone issues from toISOString()
                  const y = d.getFullYear()
                  const m = d.getMonth() + 1
                  const day = d.getDate()
                  const ymd = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  handleInputChange('birthDate', ymd)
                  handleCloseCalendar()
                }}
              />
            </div>
          </div>
        )}

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
            <span className={`text-left ${answers.height ? 'text-text-primary' : 'text-gray-400'}`}>
              {answers.height ? (() => {
                const cm = parseInt(answers.height, 10)
                const totalInches = cm / 2.54
                const feet = Math.floor(totalInches / 12)
                const inches = Math.round(totalInches % 12)
                return `${feet}'${inches} ft (${cm} cm)`
              })() : 'Select your height'}
            </span>
            <svg className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
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
          <input
            type="text"
            inputMode="numeric"
            value={answers.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400 ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={'70'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Ethnic Group (Optional)
          </label>
          <select
            value={answers.ethnicGroup}
            onChange={(e) => setAnswer('ethnicGroup', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary bg-white"
          >
            <option value="">Select your ethnic group</option>
            <option value="European American">European American</option>
            <option value="Asian American">Asian American</option>
            <option value="European">European</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic / Latino">Hispanic / Latino</option>
            <option value="Middle Eastern / North African">Middle Eastern / North African</option>
            <option value="Native American / Indigenous">Native American / Indigenous</option>
            <option value="Pacific Islander">Pacific Islander</option>
            <option value="Mixed / Other">Mixed / Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      {heightPickerOpen && (
        <div className="fixed inset-0 z-[101] bg-white rounded-3xl overflow-hidden">
          <HeightPicker
            value={answers.height ? parseInt(answers.height) : 177}
            gender={answers.gender}
            onConfirm={(height) => {
              handleInputChange('height', height.toString())
              setHeightPickerOpen(false)
            }}
            onCancel={() => setHeightPickerOpen(false)}
          />
        </div>
      )}
    </OnboardingStep>
  )
}


