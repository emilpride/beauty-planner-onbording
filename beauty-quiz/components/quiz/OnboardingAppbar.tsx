'use client'

import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
// import { ChevronLeft } from 'lucide-react' // Using lucide-react for icons

const progressSections = [
  { name: 'General', steps: 8 },    // Steps 0-7
  { name: 'Lifestyle', steps: 6 },  // Steps 8-13
  { name: 'Skin', steps: 2 },       // Steps 14-15
  { name: 'Hair', steps: 2 },       // Steps 16-17
  { name: 'Physic', steps: 8 },     // Steps 18-25
  { name: 'AI', steps: 3 },         // Steps 26-28
]

export default function OnboardingAppbar() {
  const router = useRouter()
  const { currentStep } = useQuizStore()

  const getProgress = () => {
    let completedSections = 0
    let stepsInCurrentSection = 0
    let totalStepsInCurrentSection = 0
    let cumulativeSteps = 0

    for (const section of progressSections) {
      if (currentStep >= cumulativeSteps + section.steps) {
        completedSections++
        cumulativeSteps += section.steps
      } else {
        stepsInCurrentSection = currentStep - cumulativeSteps
        totalStepsInCurrentSection = section.steps
        break
      }
    }

    return { completedSections, stepsInCurrentSection, totalStepsInCurrentSection }
  }

  const { completedSections, stepsInCurrentSection, totalStepsInCurrentSection } = getProgress()

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 max-w-lg mx-auto">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-text-primary"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="flex-1 flex items-center space-x-2">
          {progressSections.map((section, index) => (
            <div key={section.name} className="flex-1 flex flex-col items-center">
              <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: index < completedSections ? '100%' : index === completedSections ? `${(stepsInCurrentSection / totalStepsInCurrentSection) * 100}%` : '0%' }}
                />
              </div>
              <span className={`mt-1 text-xs font-medium ${index <= completedSections ? 'text-primary' : 'text-gray-400'}`}>
                {section.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

