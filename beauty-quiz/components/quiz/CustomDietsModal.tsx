'use client'

import { useState, useEffect } from 'react'

interface CustomDiet {
  id: string
  name: string
}

interface CustomDietsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (diets: CustomDiet[]) => void
  existingDiets: CustomDiet[]
}

export default function CustomDietsModal({
  isOpen,
  onClose,
  onConfirm,
  existingDiets
}: CustomDietsModalProps) {
  const [diets, setDiets] = useState<CustomDiet[]>(existingDiets)

  useEffect(() => {
    setDiets(existingDiets)
  }, [existingDiets])

  const addNewDiet = () => {
    const newDiet: CustomDiet = {
      id: `custom_diet_${Date.now()}`,
      name: ''
    }
    setDiets([...diets, newDiet])
  }

  const removeDiet = (id: string) => {
    setDiets(diets.filter(diet => diet.id !== id))
  }

  const updateDiet = (id: string, name: string) => {
    setDiets(diets.map(diet => 
      diet.id === id ? { ...diet, name } : diet
    ))
  }

  const handleConfirm = () => {
    const validDiets = diets.filter(diet => diet.name.trim() !== '')
    onConfirm(validDiets)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-text-primary mb-6 text-center">
          Add Custom Diets
        </h3>
        
        <div className="space-y-4 mb-6">
          {diets.map((diet) => (
            <div key={diet.id} className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={diet.name}
                  onChange={(e) => updateDiet(diet.id, e.target.value)}
                  placeholder="Diet name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:ring-inset outline-none transition text-text-primary placeholder-gray-400"
                />
                {diets.length > 1 && (
                  <button
                    onClick={() => removeDiet(diet.id)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addNewDiet}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors duration-200 mb-4"
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Diet
          </div>
        </button>

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
            Save Diets
          </button>
        </div>
      </div>
    </div>
  )
}
