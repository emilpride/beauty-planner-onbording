'use client'

import { useQuizStore } from '@/store/quizStore'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import UnitToggle from '@/components/ui/UnitToggle'
import { useState, useEffect } from 'react'

export default function GeneralStep() {
  const { answers, setAnswer, setHeightUnit, setWeightUnit } = useQuizStore()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const isFormValid = () => {
    return (
      answers.name.trim() !== '' &&
      answers.age !== null &&
      answers.age >= 13 &&
      answers.age <= 100 &&
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
      case 'age':
        if (value === null || value < 13 || value > 100) {
          error = 'Please enter a valid age (13-100)'
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
    validateField(field, value)
  }

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

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Age
          </label>
          <input
            type="number"
            value={answers.age || ''}
            onChange={(e) =>
              handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)
            }
            className={`w-full px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400 ${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your age"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-text-secondary">
              Height
            </label>
            <UnitToggle
              selectedValue={answers.heightUnit}
              onChange={(value) => setHeightUnit(value as 'cm' | 'ft&in')}
              options={[
                { value: 'ft&in', label: 'ft, in' },
                { value: 'cm', label: 'cm' }
              ]}
            />
          </div>
          <input
            type="text"
            value={answers.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400 ${
              errors.height ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={answers.heightUnit === 'cm' ? '175' : "5' 9\""}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-text-secondary">
              Weight
            </label>
            <UnitToggle
              selectedValue={answers.weightUnit}
              onChange={(value) => setWeightUnit(value as 'kg' | 'lbs')}
              options={[
                { value: 'lbs', label: 'lbs' },
                { value: 'kg', label: 'kg' }
              ]}
            />
          </div>
          <input
            type="text"
            value={answers.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400 ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={answers.weightUnit === 'kg' ? '70' : '154'}
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
    </OnboardingStep>
  )
}


