'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import OnboardingAppbar from '@/components/quiz/OnboardingAppbar' // To be created
import CircularProgressAnimation from '@/components/animations/CircularProgressAnimation'

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

// Post-quiz screens (remaining ones)
import CurrentConditionAnalysisStep from '@/components/post-quiz/CurrentConditionAnalysisStep'
import ChoosePlanStep from '@/components/post-quiz/ChoosePlanStep'
import PricingStep from '@/components/post-quiz/PricingStep'

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
  
  // Post-quiz screens (remaining ones)
  27: CurrentConditionAnalysisStep,
  28: ChoosePlanStep,
  29: PricingStep,
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
  const [isReady, setIsReady] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isGoingBack, setIsGoingBack] = useState(false)
  
  // Only use Zustand on client side
  const quizStore = useQuizStore()
  const { totalSteps, goToStep, answers } = quizStore || { totalSteps: 30, goToStep: () => {}, answers: { assistant: 0 } }
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  useEffect(() => {
    if (!isHydrated) return
    
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
  }, [stepNumber, goToStep, totalSteps, router, answers.assistant, isHydrated])

  useEffect(() => {
    // Сброс состояний при смене шага
    setIsExiting(false)
    setIsGoingBack(false)
    setShowQuestion(false)
    setShowCharacter(false)
    setIsReady(false)
    
    // Сначала показываем вопрос
    const questionTimer = setTimeout(() => {
      setShowQuestion(true)
    }, 100)
    
    // Затем показываем персонажа с задержкой
    const characterTimer = setTimeout(() => {
      setShowCharacter(true)
    }, 600)
    
    // Общее состояние готовности
    const readyTimer = setTimeout(() => {
      setIsReady(true)
    }, 800)
    
    return () => {
      clearTimeout(questionTimer)
      clearTimeout(characterTimer)
      clearTimeout(readyTimer)
    }
  }, [stepNumber])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-light-container flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const StepComponent = stepComponents[stepNumber]
  const currentCardHeight = cardHeights[stepNumber] || 0.5;

  const assistantName = answers.assistant === 2 ? 'ellie' : 'max'
  
  // Функция для запуска анимации исчезновения
  const startExitAnimation = () => {
    setIsExiting(true)
  }
  
  // Функция для запуска анимации возврата назад
  const startBackAnimation = () => {
    setIsGoingBack(true)
  }
  
  // Correct image mapping for each step using actual existing files
  const getImageForStep = (step: number, assistant: 'max' | 'ellie') => {
    // Map step numbers to actual existing image files
    const stepToImageMap: { [key: number]: string } = {
      0: 'onboarding_img_2',   // GenderStep
      1: 'onboarding_img_3',   // GoalStep
      2: 'onboarding_img_4',   // CongratulationsStep
      3: 'onboarding_img_5',   // ExcitedStep
      4: 'onboarding_img_7',   // StatisticStep (img_6 doesn't exist)
      5: 'onboarding_img_7',   // PrivacyStep
      6: 'onboarding_img_1',   // GeneralStep (removed img_9)
      7: 'onboarding_img_9',   // LifestyleStep
      8: 'onboarding_img_10',  // SleepStep
      9: 'onboarding_img_11',  // WakeUpStep
      10: 'onboarding_img_12', // EndDayStep
      11: 'onboarding_img_13', // StressStep
      12: 'onboarding_img_14', // WorkEnvironmentStep
      13: 'onboarding_img_15', // SkinTypeStep
      14: 'onboarding_img_16', // SkinProblemsStep
      15: 'onboarding_img_17', // HairTypeStep
      16: 'onboarding_img_18', // HairProblemsStep
      17: 'onboarding_img_19', // PhysicalActivitiesStep
      18: 'onboarding_img_21', // DietStep
      19: 'onboarding_img_22', // MoodStep
      20: 'onboarding_img_23', // EnergyLevelStep
      21: 'onboarding_img_24', // ProcrastinationStep
      22: 'onboarding_img_25', // FocusStep
      23: 'onboarding_img_26', // OrganizationInfluenceStep
      24: 'onboarding_img_27', // AnalysisIntroStep
      25: 'onboarding_img_27', // PhotoUploadStep
      26: 'onboarding_img_1',  // AIResultsStep (fallback to img_1)
    };

    const imageName = stepToImageMap[step] || 'onboarding_img_1';
    
    if (assistant === 'max') {
      return `/images/on_boarding_images/${imageName}_max.png`;
    } else {
      return `/images/on_boarding_images/${imageName}.png`;
    }
  };

  const imageUrl = getImageForStep(stepNumber, assistantName);

  // Debug logging
  console.log(`Step ${stepNumber}, Assistant: ${assistantName}, ImageUrl: ${imageUrl}`);

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
    <div className={`w-full relative ${isFullScreen ? 'min-h-screen' : 'min-h-screen overflow-hidden'}`}>
      {/* Background Ellipse - only for quiz steps, not for step 0 */}
      {stepNumber > 0 && (
        <div 
          className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[150vw] h-[60vh] bg-primary opacity-20 rounded-[50%]"
          style={{ filter: 'blur(100px)' }}
        />
      )}
      
      {stepNumber < 27 && stepNumber >= 0 && <OnboardingAppbar onBackAnimation={startBackAnimation} />}

      <main className="w-full h-full max-w-lg mx-auto relative">
        {!isFullScreen && stepNumber !== 25 && stepNumber !== 26 && stepNumber !== 27 && stepNumber !== 6 && (
           <div className="absolute top-0 left-0 right-0 z-10 flex justify-center items-end" style={{ height: '42vh', pointerEvents: 'none' }}>
            <div 
              className={`transition-all duration-700 ease-out h-[85%] ${
                showCharacter && !isExiting && !isGoingBack
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-16'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {stepNumber === 4 ? (
                // Если это 4-й шаг, показываем нашу новую анимацию
                <div className="flex justify-center items-center h-full">
                  <CircularProgressAnimation percentage={87} />
                </div>
              ) : (
                // Для всех остальных шагов показываем картинку, как и раньше
                <Image
                  src={imageUrl}
                  alt={`Assistant for step ${stepNumber}`}
                  width={300}
                  height={300}
                  className="object-contain h-full w-auto"
                  priority
                />
              )}
            </div>
          </div>
        )}

        <div 
          className={`absolute left-0 right-0 z-20 transition-all duration-700 ease-out ${
            showQuestion && !isExiting && !isGoingBack
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-full'
          }`}
          style={!isFullScreen ? { 
            top: stepNumber === 1 ? '35vh' : stepNumber === 6 ? '15vh' : stepNumber === 20 ? '30vh' : stepNumber === 25 ? '15vh' : stepNumber === 26 ? '15vh' : '42vh'
          } : { top: '0' }}
        >
          <div 
            className={`bg-white shadow-2xl ${isFullScreen ? 'min-h-screen' : 'rounded-t-3xl overflow-hidden'}`}
            style={isFullScreen ? {} : { height: stepNumber === 6 ? '85vh' : stepNumber === 25 || stepNumber === 26 ? '85vh' : stepNumber === 20 ? '70vh' : '58vh' }}
          >
             <StepComponent onExitAnimation={startExitAnimation} onBackAnimation={startBackAnimation} />
          </div>
        </div>
      </main>
    </div>
  )
}
