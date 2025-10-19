'use client'

import { useState } from 'react'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import CustomDietsModal from '@/components/quiz/CustomDietsModal'

const diets = [
  { id: "balanced", title: "Balanced" },
  { id: "vegetarian", title: "Vegetarian" },
  { id: "vegan", title: "Vegan" },
  { id: "keto", title: "Keto" },
  { id: "paleo", title: "Paleo" },
  { id: "pescatarian", title: "Pescatarian" },
  { id: "gluten-free", title: "Gluten-Free" },
  { id: "dairy-free", title: "Dairy-Free" },
  { id: "anything", title: "Anything" },
  { id: "other", title: "Other" }
]

interface CustomDiet {
  id: string
  name: string
}

export default function DietStep() {
  const { answers, setAnswer } = useQuizStore()
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customDiets, setCustomDiets] = useState<CustomDiet[]>([])

  const handleToggleDiet = (dietId: string) => {
    if (dietId === 'other') {
      setIsCustomModalOpen(true)
    } else {
      const newDiets = answers.Diet.map(d => 
        d.id === dietId ? { ...d, isActive: !d.isActive } : d
      )
      setAnswer('Diet', newDiets)
    }
  }

  const handleCustomDietsConfirm = (diets: CustomDiet[]) => {
    setCustomDiets(diets)
    
    // Add custom diets as active
    const customDietObjects = diets.map(diet => ({ id: `custom_${diet.id}`, title: diet.name, isActive: true }))
    
    // Keep existing non-custom active, add custom
    const existingNonCustom = answers.Diet.filter(d => !d.id.startsWith('custom_')).map(d => ({ ...d, isActive: d.isActive }))
    const newDiets = [...existingNonCustom, ...customDietObjects]
    
    setAnswer('Diet', newDiets)
  }

  const isDietSelected = (dietId: string) => {
    if (dietId === 'other') {
      return customDiets.length > 0
    }
    return answers.Diet.find(d => d.id === dietId)?.isActive || false
  }

  const getCustomDietsText = () => {
    if (customDiets.length === 0) return 'Not set'
    if (customDiets.length === 1) {
      return customDiets[0]?.name ?? 'Not set'
    }
    return `${customDiets.length} custom diets`
  }

  return (
    <>
      <OnboardingStep
        title="Do you follow any specific diet?"
        subtitle="Select all that apply."
        condition={answers.Diet?.some(d => d.isActive) ?? false}
      >
        <div className="flex flex-wrap gap-2 py-1">
          {diets.map((diet) => (
            <button
              key={diet.id}
              onClick={() => handleToggleDiet(diet.id)}
              className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
                isDietSelected(diet.id)
                  ? 'border-primary bg-primary bg-opacity-10 text-primary'
                  : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              {diet.id === 'other' ? (
                <div className="flex flex-col items-center">
                  <span>{diet.title}</span>
                  {customDiets.length > 0 && (
                    <span className="text-xs mt-1 opacity-75">
                      {getCustomDietsText()}
                    </span>
                  )}
                </div>
              ) : (
                diet.title
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

