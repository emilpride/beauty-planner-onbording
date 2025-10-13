'use client'


import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import ProgressBar from './ui/ProgressBar'
import BurgerMenu from '@/components/ui/BurgerMenu'

const progressSections = [
  { name: 'General', steps: 9 },     // 0-8
  { name: 'Lifestyle', steps: 7 },   // 9-15
  { name: 'Skin', steps: 2 },        // 16-17
  { name: 'Hair', steps: 2 },        // 18-19
  { name: 'Wellness', steps: 10 },   // 20-29 (activities, diet, momentum, mood, energy, focus, organization)
  { name: 'AI', steps: 8 },          // 30-37 (AnalysisIntro + 3 uploads + AI + 3 post-quiz)
]

interface OnboardingAppbarProps {
  onBackAnimation?: () => void
}

export default function OnboardingAppbar({ onBackAnimation }: OnboardingAppbarProps) {
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
        {currentStep === 33 ? null : (
        <button
          onClick={() => {
            if (onBackAnimation) {
              onBackAnimation()
            }
            setTimeout(() => {
              router.back()
            }, 300)
          }}
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
        )}

        <div className="flex-1">
          <ProgressBar sections={progressSections} currentStep={currentStep} />
        </div>
        <BurgerMenu inline />
      </div>
    </header>
  )
}

