'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import OnboardingAppbar from '@/components/quiz/OnboardingAppbar' // To be created

// Import all step components (we will create these next)
import GenderStep from '@/components/quiz/steps/GenderStep'
import GoalStep from '@/components/quiz/steps/GoalStep'
import CongratulationsStep from '@/components/quiz/steps/CongratulationsStep'
import ExcitedStep from '@/components/quiz/steps/ExcitedStep'
import StatisticStep from '@/components/quiz/steps/StatisticStep'
import PrivacyStep from '@/components/quiz/steps/PrivacyStep'
import GeneralStep from '@/components/quiz/steps/GeneralStep'
import LifestyleStep from '@/components/quiz/steps/LifestyleStep'
import SleepStep from '@/components/quiz/steps/SleepStep'
import WakeUpStep from '@/components/quiz/steps/WakeUpStep'
import EndDayStep from '@/components/quiz/steps/EndDayStep'
import StressStep from '@/components/quiz/steps/StressStep'
import WorkEnvironmentStep from '@/components/quiz/steps/WorkEnvironmentStep'
import SkinTypeStep from '@/components/quiz/steps/SkinTypeStep'
import SkinProblemsStep from '@/components/quiz/steps/SkinProblemsStep'
import HairTypeStep from '@/components/quiz/steps/HairTypeStep'
import HairProblemsStep from '@/components/quiz/steps/HairProblemsStep'
import PhysicalActivitiesStep from '@/components/quiz/steps/PhysicalActivitiesStep'
import DietStep from '@/components/quiz/steps/DietStep'
import MoodStep from '@/components/quiz/steps/MoodStep'
import EnergyLevelStep from '@/components/quiz/steps/EnergyLevelStep'
import ProcrastinationStep from '@/components/quiz/steps/ProcrastinationStep'
import FocusStep from '@/components/quiz/steps/FocusStep'
import OrganizationInfluenceStep from '@/components/quiz/steps/OrganizationInfluenceStep'
import AnalysisIntroStep from '@/components/quiz/steps/AnalysisIntroStep'
import PhotoUploadStep from '@/components/quiz/steps/PhotoUploadStep'
import AIResultsStep from '@/components/quiz/steps/AIResultsStep'

// Post-quiz screens
import AIAnalysisIntroStep from '@/components/quiz/steps/AIAnalysisIntroStep'
import CurrentConditionAnalysisStep from '@/components/quiz/steps/CurrentConditionAnalysisStep'
import SignUpStep from '@/components/quiz/steps/SignUpStep'
import ScheduleIntroStep from '@/components/quiz/steps/ScheduleIntroStep'
import ChooseActivitiesStep from '@/components/quiz/steps/ChooseActivitiesStep'
import ActivitySetupStep from '@/components/quiz/steps/ActivitySetupStep'
import CreatingScheduleStep from '@/components/quiz/steps/CreatingScheduleStep'
import RemindersStep from '@/components/quiz/steps/RemindersStep'
import ContractStep from '@/components/quiz/steps/ContractStep'
import ChoosePlanStep from '@/components/quiz/steps/ChoosePlanStep'
import PricingStep from '@/components/quiz/steps/PricingStep'
import CongratulationsFinalStep from '@/components/quiz/steps/CongratulationsFinalStep'

const stepComponents: { [key: number]: React.ComponentType } = {
  0: GenderStep,
  1: GoalStep,
  2: CongratulationsStep,
  3: ExcitedStep,
  4: StatisticStep,
  5: PrivacyStep,
  6: GeneralStep,
  7: LifestyleStep,
  8: SleepStep,
  9: WakeUpStep,
  10: EndDayStep,
  11: StressStep,
  12: WorkEnvironmentStep,
  13: SkinTypeStep,
  14: SkinProblemsStep,
  15: HairTypeStep,
  16: HairProblemsStep,
  17: PhysicalActivitiesStep,
  18: DietStep,
  19: MoodStep,
  20: EnergyLevelStep,
  21: ProcrastinationStep,
  22: FocusStep,
  23: OrganizationInfluenceStep,
  24: AnalysisIntroStep,
  25: PhotoUploadStep,
  26: AIResultsStep,
  
  // Post-quiz screens
  27: CurrentConditionAnalysisStep,
  28: SignUpStep,
  29: ScheduleIntroStep,
  30: ChooseActivitiesStep,
  31: ActivitySetupStep,
  32: CreatingScheduleStep,
  33: RemindersStep,
  34: ContractStep,
  35: ChoosePlanStep,
  36: PricingStep,
  37: CongratulationsFinalStep,
}

// Card heights from Flutter design
const cardHeights = [
  0.42, 0.42, 0.6, 0.4, 0.44, 0.45, 0.43, 0.82, 0.45, 0.6, 
  0.55, 0.55, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.6, 
  0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.82, 1.0
];

interface QuizStepClientProps {
  stepNumber: number
}

export default function QuizStepClient({ stepNumber }: QuizStepClientProps) {
  const router = useRouter()
  const { totalSteps, goToStep, answers } = useQuizStore()
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    // Если пользователь еще не выбрал ассистента, перенаправляем на страницу выбора
    if (answers.assistant === 0) {
      router.push('/assistant-selection')
      return
    }
    
    if (isNaN(stepNumber) || stepNumber < 0 || stepNumber >= totalSteps) {
      router.push('/quiz/0')
    } else {
      goToStep(stepNumber)
    }
  }, [stepNumber, goToStep, totalSteps, router, answers.assistant])

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [stepNumber])

  const StepComponent = stepComponents[stepNumber]
  const currentCardHeight = cardHeights[stepNumber] || 0.5;

  const assistantName = answers.assistant === 2 ? 'ellie' : 'max'
  
  // Create accurate lists of available images for each assistant (adjusted for removed step 0)
  const ellieImageSteps = [1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  const maxImageSteps = [1, 2, 3, 4, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  
  let imageUrl;
  const imageIndex = stepNumber + 1; // +1 because we removed step 0, so step 0 now corresponds to image 1

  if (assistantName === 'max') {
    if (maxImageSteps.includes(imageIndex)) {
      imageUrl = `/images/on_boarding_images/onboarding_img_${imageIndex}_max.png`;
    } else {
      imageUrl = `/images/on_boarding_images/onboarding_img_1_max.png`; // Fallback for Max
    }
  } else { // Ellie
    if (ellieImageSteps.includes(imageIndex)) {
       imageUrl = `/images/on_boarding_images/onboarding_img_${imageIndex}.png`;
    } else {
       imageUrl = `/images/on_boarding_images/onboarding_img_1.png`; // Fallback for Ellie
    }
  }

  // Debug logging
  console.log(`Step ${stepNumber}, Assistant: ${assistantName}, ImageIndex: ${imageIndex}, ImageUrl: ${imageUrl}`);

  // Step 25 (PhotoUploadStep) doesn't need assistant character

  const isFullScreen = stepNumber >= 27; // Post-quiz screens start from step 27
  const isAutoTransitionScreen = false; // AI Analysis Intro was removed

  if (!StepComponent) {
    // Fallback for not-yet-created components
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Step {stepNumber}: Component not found</h1>
          <p className="text-text-secondary">This component is under construction.</p>
        </div>
      </div>
    );
  }

  // For auto-transition screens, render directly without any wrappers
  if (isAutoTransitionScreen) {
    return <StepComponent />
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Ellipse - only for quiz steps, not for step 0 */}
      {stepNumber > 0 && (
        <div 
          className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[150vw] h-[60vh] bg-primary opacity-20 rounded-[50%]"
          style={{ filter: 'blur(100px)' }}
        />
      )}
      
      {stepNumber < 27 && stepNumber >= 0 && <OnboardingAppbar />}

      <main className="w-full h-full max-w-lg mx-auto relative">
        {!isFullScreen && stepNumber !== 25 && stepNumber !== 26 && stepNumber !== 27 && (
           <div className="absolute top-0 left-0 right-0 z-10 flex justify-center items-end" style={{ height: '42vh', pointerEvents: 'none' }}>
            <div 
              className={`transition-all duration-500 h-[85%] ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ pointerEvents: 'auto' }}
            >
              <Image
                src={imageUrl}
                alt={`Assistant for step ${stepNumber}`}
                width={300}
                height={300}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          </div>
        )}

        <div 
          className={`absolute left-0 right-0 z-20 transition-all duration-700 ease-in-out ${isReady ? 'opacity-100 bottom-0' : 'opacity-0 -bottom-full'}`}
          style={!isFullScreen ? { 
            top: stepNumber === 1 ? '35vh' : stepNumber === 20 ? '30vh' : stepNumber === 25 ? '15vh' : stepNumber === 26 ? '15vh' : '42vh'
          } : { top: '0' }}
        >
          <div 
            className="bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ height: isFullScreen ? '100vh' : stepNumber === 25 || stepNumber === 26 ? '85vh' : stepNumber === 20 ? '70vh' : '58vh' }}
          >
             <StepComponent />
          </div>
        </div>
      </main>
    </div>
  )
}
