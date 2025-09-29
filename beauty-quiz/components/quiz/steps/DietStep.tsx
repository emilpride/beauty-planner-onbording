'use client'

import { useState } from 'react'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import CustomDietsModal from '@/components/quiz/CustomDietsModal'

const diets = [
  "Balanced", "Vegetarian", "Vegan", "Keto", 
  "Paleo", "Pescatarian", "Gluten-Free", "Dairy-Free", "Anything", "Other"
]

interface CustomDiet {
  id: string
  name: string
}

export default function DietStep() {
  const { answers, setAnswer } = useQuizStore()
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customDiets, setCustomDiets] = useState<CustomDiet[]>([])

  const handleToggleDiet = (diet: string) => {
    if (diet === 'Other') {
      setIsCustomModalOpen(true)
    } else {
      const newDiets = answers.diet.includes(diet)
        ? answers.diet.filter((d) => d !== diet)
        : [...answers.diet, diet]
      setAnswer('diet', newDiets)
    }
  }

  const handleCustomDietsConfirm = (diets: CustomDiet[]) => {
    setCustomDiets(diets)
    

    const existingDiets = answers.diet.filter(d => !d.startsWith('custom_diet_'))
    const customDietNames = diets.map(diet => `custom_diet_${diet.id}`)
    
    setAnswer('diet', [...existingDiets, ...customDietNames])
  }

  const isDietSelected = (diet: string) => {
    if (diet === 'Other') {
      return customDiets.length > 0
    }
    return answers.diet.includes(diet)
  }

  const getCustomDietsText = () => {
    if (customDiets.length === 0) return 'Not set'
    if (customDiets.length === 1) {
      return customDiets[0].name
    }
    return `${customDiets.length} custom diets`
  }

  return (
    <>
      <OnboardingStep
        title="Do you follow any specific diet?"
        subtitle="Select all that apply."
        condition={answers.diet.length > 0}
      >
        <div className="flex flex-wrap gap-2 py-1">
          {diets.map((diet) => (
            <button
              key={diet}
              onClick={() => handleToggleDiet(diet)}
              className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
                isDietSelected(diet)
                  ? 'border-primary bg-primary bg-opacity-10 text-primary'
                  : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              {diet === 'Other' ? (
                <div className="flex flex-col items-center">
                  <span>{diet}</span>
                  {customDiets.length > 0 && (
                    <span className="text-xs mt-1 opacity-75">
                      {getCustomDietsText()}
                    </span>
                  )}
                </div>
              ) : (
                diet
              )}
            </button>
          ))}
        </div>
      </OnboardingStep>

      <CustomDietsModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={handleCustomDietsConfirm}
        existingDiets={customDiets}
      />
    </>
  )
}

