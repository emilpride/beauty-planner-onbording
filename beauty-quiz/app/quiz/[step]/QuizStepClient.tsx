'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import OnboardingAppbar from '@/components/quiz/OnboardingAppbar' // To be created
import CircularProgressAnimation from '@/components/animations/CircularProgressAnimation'
import AnimatedBackground from '@/components/AnimatedBackground'

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
import SleepRhythmInsightStep from '@/components/quiz/insights/SleepRhythmInsightStep'
import PersonalityInsightStep from '@/components/quiz/insights/PersonalityInsightStep'
import EnergyVisualizationStep from '@/components/quiz/insights/EnergyVisualizationStep'
import BeautyAnalysisStep from '@/components/quiz/insights/BeautyAnalysisStep'
import MomentumCheckStep from '@/components/quiz/insights/MomentumCheckStep'
import WakeUpStep from '@/components/quiz/steps/WakeUpStep'
import EndDayStep from '@/components/quiz/steps/EndDayStep'
import StressStep from '@/components/quiz/steps/StressStep'
import WorkEnvironmentStep from '@/components/quiz/steps/WorkEnvironmentStep'
import SkinTypeStep from '@/components/quiz/steps/SkinTypeStep'
import SkinProblemsStep from '@/components/quiz/steps/SkinProblemsStep'
import SkinGlowInsightStep from '@/components/quiz/insights/SkinGlowInsightStep'
import HairTypeStep from '@/components/quiz/steps/HairTypeStep'
import HairProblemsStep from '@/components/quiz/steps/HairProblemsStep'
import PhysicalActivitiesStep from '@/components/quiz/steps/PhysicalActivitiesStep'
import DietStep from '@/components/quiz/steps/DietStep'
import MomentumInsightStep from '@/components/quiz/insights/MomentumInsightStep'
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
  2: PersonalityInsightStep, // NEW: After goals - personality analysis
  3: CongratulationsStep,
  4: ExcitedStep,
  5: StatisticStep,
  6: PrivacyStep,
  7: GeneralStep,
  8: LifestyleStep,
  9: SleepStep,
  10: SleepRhythmInsightStep,
  11: WakeUpStep,
  12: EndDayStep,
  13: StressStep,
  14: EnergyVisualizationStep, // NEW: After sleep questions - energy analysis
  15: WorkEnvironmentStep,
  16: SkinTypeStep,
  17: SkinProblemsStep,
  18: SkinGlowInsightStep,
  19: HairTypeStep,
  20: HairProblemsStep,
  21: BeautyAnalysisStep, // NEW: After skin/hair questions - beauty analysis
  22: PhysicalActivitiesStep,
  23: DietStep,
  24: MomentumInsightStep,
  25: MomentumCheckStep, // NEW: After activities - momentum check
  26: MoodStep,
  27: EnergyLevelStep,
  28: ProcrastinationStep,
  29: FocusStep,
  30: OrganizationInfluenceStep,
  31: AnalysisIntroStep,
  32: PhotoUploadStep,
  33: AIResultsStep,
  34: CurrentConditionAnalysisStep,
  35: ChoosePlanStep,
  36: PricingStep,
}
// Card heights from Flutter design
const cardHeights = [
  0.42, 0.42, 0.8, 0.4, 0.44, 0.45, 0.43, 0.82, 0.48, 0.6,
  0.6, 0.55, 0.55, 0.5, 0.8, 0.5, 0.5, 0.5, 0.58, 0.6, 0.6,
  0.8, 0.6, 0.6, 0.6, 0.8, 0.6, 0.6, 0.6, 0.6, 0.6,
  0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6
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
  const { totalSteps, goToStep, answers } = quizStore || { totalSteps: 33, goToStep: () => {}, answers: { assistant: 0 } }
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  useEffect(() => {
    if (!isHydrated) return
    

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

    setIsExiting(false)
    setIsGoingBack(false)
    setShowQuestion(false)
    setShowCharacter(false)
    setIsReady(false)
    

    const questionTimer = setTimeout(() => {
      setShowQuestion(true)
    }, 100)
    

    const characterTimer = setTimeout(() => {
      setShowCharacter(true)
    }, 600)
    

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const StepComponent = stepComponents[stepNumber]
  const currentCardHeight = cardHeights[stepNumber] || 0.5;

  const assistantName = answers.assistant === 2 ? 'ellie' : 'max'
  

  const startExitAnimation = () => {
    setIsExiting(true)
  }
  

  const startBackAnimation = () => {
    setIsGoingBack(true)
  }
  
  // Correct image mapping for each step using actual existing files
  const getImageForStep = (step: number, assistant: 'max' | 'ellie') => {
    // Map step numbers to actual existing image files
    const stepToImageMap: { [key: number]: string | null } = {
  // Steps with specific character images based on actual available files
  0: 'onboarding_img_Select_your_gender',  // GenderStep - "Select Your Gender"
  1: 'onboarding_img_What_do_you_want_to_achieve ',  // GoalStep - "What Do You Want To Achieve" (note the space)
  2: null,  // PersonalityInsightStep (insight - no character)
  3: 'onboarding_img_Congratulations_on_taking_the_first_step',  // CongratulationsStep - "Congratulations on taking the first step"
  4: 'onboarding_img_Were excited to create something_just_for_you',  // ExcitedStep - "We're excited to create something just for you"
  5: null,  // StatisticStep (no character)
  6: 'onboarding_img_We_care_about_your_privacy',  // PrivacyStep - "We care about your privacy"
  7: null,  // GeneralStep (no character)
  8: 'onboarding_img_Whats_the_rhythm_of_your_life',  // LifestyleStep - "What's the rhythm of your life"
  9: 'onboarding_img_How_long_do_you_usually_sleep',  // SleepStep - "How long do you usually sleep"
  10: null,  // SleepRhythmInsightStep (insight - no character)
  11: 'onboarding_img_usually_wake_up',  // WakeUpStep - "usually wake up"
  12: 'onboarding_img_usually_end_your_day',  // EndDayStep - "usually end your day"
  13: 'onboarding_img_get_stressed',  // StressStep - "get stressed"
  14: 'onboarding_img_energy',  // EnergyVisualizationStep - "energy"
  15: 'onboarding_img_work_environment',  // WorkEnvironmentStep - "work environment"
  16: 'onboarding_img_skin_type',  // SkinTypeStep - "skin type"
  17: 'onboarding_img_Skin_problems',  // SkinProblemsStep - "Skin problems"
  18: null,  // SkinGlowInsightStep (insight - no character)
  19: 'onboarding_img_hair_type',  // HairTypeStep - "hair type"
  20: 'onboarding_img_Hair_problems',  // HairProblemsStep - "Hair problems"
  21: null,  // BeautyAnalysisStep (insight - no character)
  22: 'onboarding_img_physical_activities',  // PhysicalActivitiesStep - "physical activities"
  23: 'onboarding_img_diet',  // DietStep - "diet"
  24: null,  // MomentumInsightStep (insight - no character)
  25: null,  // MomentumCheckStep (insight - no character)
  26: 'onboarding_img_mood',  // MoodStep - "mood"
  27: 'onboarding_img_energy',  // EnergyLevelStep - "energy"
  28: 'onboarding_img_procrastinate',  // ProcrastinationStep - "procrastinate"
  29: 'onboarding_img_hard_to_focus',  // FocusStep - "hard to focus"
  30: 'onboarding_img_become_organized',  // OrganizationInfluenceStep - "become organized"
  31: 'onboarding_img_analyze_your_face',  // AnalysisIntroStep - "analyze your face"
  32: 'onboarding_img_analyze_your_face',  // PhotoUploadStep - "analyze your face"
  33: 'onboarding_img_creating_schedule',  // AIResultsStep - "creating schedule"
  34: null,  // CurrentConditionAnalysisStep (no character)
  35: null,  // ChoosePlanStep (no character)
  36: null,  // PricingStep (no character)
};

    const imageName = stepToImageMap[step];
    
    // If no image is specified for this step, return null (no character)
    if (!imageName) {
      return null;
    }
    
    if (assistant === 'max') {
      // Special handling for files with different naming conventions
      if (imageName === 'onboarding_img_What_do_you_want_to_achieve ') {
        return `/images/on_boarding_images/${imageName}_max.png`;
      } else if (imageName === 'onboarding_img_Were excited to create something_just_for_you') {
      return `/images/on_boarding_images/${imageName}_max.png`;
      } else {
        return `/images/on_boarding_images/${imageName}_max.png`;
      }
    } else {
      // Special handling for files with different naming conventions
      if (imageName === 'onboarding_img_What_do_you_want_to_achieve ') {
        return `/images/on_boarding_images/onboarding_img_What_do_you_want_to_achieve_ellie.png`;
      } else if (imageName === 'onboarding_img_Were excited to create something_just_for_you') {
        return `/images/on_boarding_images/onboarding_img_Were_excited_to_create_something_just_for_you_ellie.png`;
      } else if (imageName === 'onboarding_img_Congratulations_on_taking_the_first_step') {
        return `/images/on_boarding_images/onboarding_img_Congratulations_on_taking_the_first_step_and_Let's_Create_Your_Schedule_ellie.png`;
      } else {
        return `/images/on_boarding_images/${imageName}_ellie.png`;
      }
    }
  };

  const imageUrl = getImageForStep(stepNumber, assistantName);

  // Step 25 (PhotoUploadStep) doesn't need assistant character

  const isFullScreen = stepNumber >= 34; // Post-quiz screens start from step 34
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
      {/* Animated Background */}
      <AnimatedBackground />
      
      {stepNumber < 34 && stepNumber >= 0 && <OnboardingAppbar onBackAnimation={startBackAnimation} />}

      <main className="w-full h-full max-w-lg mx-auto relative">
        {!isFullScreen && imageUrl && (
           <div 
             className="absolute top-0 left-0 right-0 z-10 flex justify-center items-end" 
             style={{ 
               height: '42vh', 
               pointerEvents: 'none',

               ...(assistantName === 'max' && [15, 16, 17, 18, 19, 20].includes(stepNumber) 
                 ? { 
                     alignItems: 'flex-end', 
                     paddingBottom: stepNumber === 19 ? '40px' : stepNumber === 20 ? '30px' : '20px',
                     transform: 'translateY(20px)'
                   }
                 : {})
             }}
           >
            <div 
              className={`transition-all duration-700 ease-out h-[85%] ${
                showCharacter && !isExiting && !isGoingBack
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-16'
              }`}
              style={{ 
                pointerEvents: 'auto',

                ...(assistantName === 'max' && [15, 16, 17, 18, 19, 20].includes(stepNumber) 
                  ? { 
                      transform: 'translateY(30px)',
                      marginBottom: stepNumber === 19 ? '20px' : '10px'
                    }
                  : {})
              }}
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
          className={`absolute left-0 right-0 z-20 transition-all duration-700 ease-out ${
            showQuestion && !isExiting && !isGoingBack
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-full'
          }`}
          style={!isFullScreen ? { 
            top: !imageUrl ? '10vh' : // No character - start higher
                 stepNumber === 1 ? '35vh' : 
                 stepNumber === 6 ? '15vh' : 
                 stepNumber === 25 ? '30vh' : 
                 stepNumber === 30 ? '40vh' : 
                 stepNumber === 31 ? '15vh' : 

                 (assistantName === 'max' && [15, 16, 17, 18, 19, 20].includes(stepNumber)) 
                   ? (stepNumber === 19 ? '35vh' : stepNumber === 20 ? '37vh' : '38vh')
                   : '42vh'
          } : { top: '0' }}
        >
          <div 
            className={`bg-white shadow-2xl ${isFullScreen ? 'min-h-screen' : 'rounded-3xl overflow-hidden'}`}
            style={isFullScreen ? {} : { 
              height: !imageUrl ? '90vh' : // No character - use more height
                     stepNumber === 6 ? '85vh' : 
                     stepNumber === 30 ? '60vh' : 
                     stepNumber === 31 ? '85vh' : 
                     stepNumber === 25 ? '70vh' : 

                     (assistantName === 'max' && [15, 16, 17, 18, 19, 20].includes(stepNumber)) 
                       ? (stepNumber === 19 ? '65vh' : '62vh')
                       : '58vh' 
            }}
          >
              <StepComponent />
          </div>
        </div>
      </main>
    </div>
  )
}

