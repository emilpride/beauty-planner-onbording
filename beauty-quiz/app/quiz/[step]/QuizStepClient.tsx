'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import OnboardingAppbar from '@/components/quiz/OnboardingAppbar' // To be created
import CircularProgressAnimation from '@/components/animations/CircularProgressAnimation'
import AnimatedBackground from '@/components/AnimatedBackground'

// Import all step components (we will create these next)
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
import StressCopingInsightStep from '@/components/quiz/insights/StressCopingInsightStep'
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
import PhotoUploadFaceStep from '@/components/quiz/steps/PhotoUploadFaceStep'
import PhotoUploadHairStep from '@/components/quiz/steps/PhotoUploadHairStep'
import PhotoUploadBodyStep from '@/components/quiz/steps/PhotoUploadBodyStep'
import AIResultsStep from '@/components/quiz/steps/AIResultsStep'

// Post-quiz screens (remaining ones)
import CurrentConditionAnalysisStep from '@/components/post-quiz/CurrentConditionAnalysisStep'
import ChoosePlanStep from '@/components/post-quiz/ChoosePlanStep'
import PricingStep from '@/components/post-quiz/PricingStep'

const stepComponents: { [key: number]: React.ComponentType } = {
  0: GoalStep,
  1: PersonalityInsightStep, // After goals - personality analysis
  2: CongratulationsStep,
  3: ExcitedStep,
  4: StatisticStep,
  5: PrivacyStep,
  6: GeneralStep,
  7: LifestyleStep,
  8: SleepStep,
  9: SleepRhythmInsightStep,
  10: WakeUpStep,
  11: EndDayStep,
  12: StressStep,
  13: StressCopingInsightStep, // After stress – coping insight (no character)
  14: WorkEnvironmentStep,
  15: SkinTypeStep,
  16: SkinProblemsStep,
  17: SkinGlowInsightStep,
  18: HairTypeStep,
  19: HairProblemsStep,
  20: PhysicalActivitiesStep,
  21: DietStep,
  22: MomentumInsightStep,
  23: MomentumCheckStep, // After activities - momentum check
  24: MoodStep,
  25: EnergyLevelStep,
  26: ProcrastinationStep,
  27: FocusStep,
  28: OrganizationInfluenceStep,
  29: AnalysisIntroStep,
  30: PhotoUploadFaceStep,
  31: PhotoUploadHairStep,
  32: PhotoUploadBodyStep,
  33: AIResultsStep,
  34: CurrentConditionAnalysisStep,
  35: ChoosePlanStep,
  36: PricingStep,
}
// Card heights from Flutter design
const cardHeights = [
  0.42, 0.8, 0.4, 0.44, 0.45, 0.43, 0.82, 0.48, 0.6,
  0.6, 0.55, 0.55, 0.5, 0.8, 0.5, 0.5, 0.5, 0.58, 0.6, 0.6,
  0.8, 0.6, 0.6, 0.6, 0.8, 0.6, 0.6, 0.6, 0.6, 0.6,
  0.6, 0.6, 0.6, 0.6, 0.6, 0.6
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
  
  // Refs to measure layout and glue card under character
  const mainRef = useRef<HTMLDivElement | null>(null)
  // Measure the outer character box (fixed 42dvh) to avoid jumps from inner animations
  const characterBoxRef = useRef<HTMLDivElement | null>(null)
  const characterRef = useRef<HTMLDivElement | null>(null)
  const [cardTopPx, setCardTopPx] = useState<number | null>(null)
  const [hasMeasured, setHasMeasured] = useState(false)
  
  // Only use Zustand on client side
  const { totalSteps, goToStep, answers, isTransitioning, setTransitioning, generateSessionId } = useQuizStore()
  
  useEffect(() => {
    setIsHydrated(true)
    if (!answers.sessionId) {
      generateSessionId()
    }
  }, [])

  // Reset transitioning flag when step changes
  useEffect(() => {
    setTransitioning(false)
  }, [stepNumber, setTransitioning])

  
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

  // Centralized entry sequencing: reset flags and precompute layout to avoid blank delays
  useLayoutEffect(() => {
    setIsExiting(false)
    setIsGoingBack(false)
    setShowCharacter(false)
    setIsReady(false)
    setAnimationReady(false)

    const viewportH = Math.max(window.innerHeight, document.documentElement.clientHeight)

    // For fullscreen steps, show immediately
    if (stepNumber >= 35) {
      setTimeout(() => {
        setHasMeasured(true)
        setShowQuestion(true)
        setIsReady(true)
      }, 0)
      return
    }

    // Precompute card position immediately to avoid waiting for measurement
    // If there's no character, place card under appbar/progress zone and mark ready
    const hasCharacter = Boolean(getImageForStep(stepNumber, answers.assistant === 2 ? 'ellie' : 'max'))
    if (!hasCharacter) {
      const approxTop = Math.max(Math.round(viewportH * 0.12), 88)
      setCardTopPx(approxTop)
      setHasMeasured(true)
      setShowQuestion(true)
      setIsReady(true)
    } else {
      // With character, approximate using 40dvh until precise measurement runs
      const approxTop = Math.max(Math.round(viewportH * 0.40), 200)
      setCardTopPx(approxTop)
      setHasMeasured(true)
      setShowQuestion(true)
      // isReady will become true once the character image loads
    }
  }, [stepNumber, answers.assistant])

  

  // Do not early-return on hydration to keep Hook order stable; render a loader conditionally instead

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
  // Steps with specific character images based on actual available files (Gender step removed, indices shifted)
  0: null,  // GoalStep - no character (fill answers to bottom)
  1: null,  // PersonalityInsightStep (insight - no character)
  2: 'onboarding_img_Congratulations_on_taking_the_first_step',  // CongratulationsStep
  3: 'onboarding_img_Were excited to create something_just_for_you',  // ExcitedStep
  4: null,  // StatisticStep (no character)
  5: 'onboarding_img_We_care_about_your_privacy',  // PrivacyStep
  6: null,  // GeneralStep (no character)
  7: 'onboarding_img_Whats_the_rhythm_of_your_life',  // LifestyleStep
  8: 'onboarding_img_How_long_do_you_usually_sleep',  // SleepStep
  9: null,  // SleepRhythmInsightStep (insight - no character)
  10: 'onboarding_img_usually_wake_up',  // WakeUpStep
  11: 'onboarding_img_usually_end_your_day',  // EndDayStep
  12: 'onboarding_img_get_stressed',  // StressStep
  13: null,  // StressCopingInsightStep (insight - no character)
  14: 'onboarding_img_work_environment',  // WorkEnvironmentStep
  15: 'onboarding_img_skin_type',  // SkinTypeStep
  16: 'onboarding_img_Skin_problems',  // SkinProblemsStep
  17: null,  // SkinGlowInsightStep (insight - no character)
  18: 'onboarding_img_hair_type',  // HairTypeStep
  19: 'onboarding_img_Hair_problems',  // HairProblemsStep
  20: 'onboarding_img_physical_activities',  // PhysicalActivitiesStep
  21: 'onboarding_img_diet',  // DietStep
  22: null,  // MomentumInsightStep (insight - no character)
  23: null,  // MomentumCheckStep (insight - no character)
  24: 'onboarding_img_mood',  // MoodStep
  25: 'onboarding_img_energy',  // EnergyLevelStep
  26: 'onboarding_img_procrastinate',  // ProcrastinationStep
  27: 'onboarding_img_hard_to_focus',  // FocusStep
  28: 'onboarding_img_become_organized',  // OrganizationInfluenceStep
  29: 'onboarding_img_analyze_your_face',  // AnalysisIntroStep
  30: null,  // PhotoUploadFaceStep - no character
  31: null,  // PhotoUploadHairStep - no character
  32: null,  // PhotoUploadBodyStep - no character
  33: null,  // AIResultsStep - no character/image on top
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
        return encodeURI(`/images/on_boarding_images/${imageName}_max.png`);
      } else if (imageName === 'onboarding_img_Were excited to create something_just_for_you') {
        return encodeURI(`/images/on_boarding_images/onboarding_img_Were excited to create something_just_for_you_max.png`);
      } else if (imageName === 'onboarding_img_Congratulations_on_taking_the_first_step') {
        return encodeURI(`/images/on_boarding_images/onboarding_img_Congratulations_on_taking_the_first_step_max.png`);
      } else {
        return encodeURI(`/images/on_boarding_images/${imageName}_max.png`);
      }
    } else {
      // Special handling for files with different naming conventions
      if (imageName === 'onboarding_img_What_do_you_want_to_achieve ') {
        return encodeURI(`/images/on_boarding_images/onboarding_img_What_do_you_want_to_achieve_ellie.png`);
      } else if (imageName === 'onboarding_img_Were excited to create something_just_for_you') {
        return encodeURI(`/images/on_boarding_images/onboarding_img_Were_excited_to_create_something_just_for_you_ellie.png`);
      } else if (imageName === 'onboarding_img_Congratulations_on_taking_the_first_step') {
        return encodeURI(`/images/on_boarding_images/onboarding_img_Congratulations_on_taking_the_first_step_and_Let’s_Create_Your_Schedule_ellie.png`);
      } else if (imageName === 'onboarding_img_Whats_the_rhythm_of_your_life') {
        // Ellie uses a combined artwork for lifestyle + procrastination
        return encodeURI(`/images/on_boarding_images/onboarding_img_Whats_the_rhythm_of_your_life_and_Do_you_often_procrastinate_ellie.png`);
      } else {
        return encodeURI(`/images/on_boarding_images/${imageName}_ellie.png`);
      }
    }
  };

  const imageUrl = getImageForStep(stepNumber, assistantName);

  // Step 25 (PhotoUploadStep) doesn't need assistant character

  const isFullScreen = stepNumber >= 34; // Post-quiz screens start from CurrentConditionAnalysis (now index 34)
  const isAutoTransitionScreen = false; // AI Analysis Intro was removed

  // Fallback: ensure content is shown after a reasonable delay if measurement fails
  useEffect(() => {
    if (!isFullScreen && !hasMeasured) {
      const fallbackTimer = setTimeout(() => {
        // Only trigger fallback if we still haven't measured AND haven't shown question
        if (!hasMeasured && !showQuestion) {
          console.warn(`Step ${stepNumber}: Measurement fallback triggered`)
          setHasMeasured(true)
          setShowQuestion(true)
          setCardTopPx(88) // Default fallback position
        }
      }, 600) // Tight fallback to avoid long blank screens

      return () => clearTimeout(fallbackTimer)
    }
  }, [stepNumber, hasMeasured, isFullScreen, showQuestion])

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

  // Ensure animation order: card (text) enters first, then character
  // Add a small delay for animation start
  const [animationReady, setAnimationReady] = useState(false)
  
  useEffect(() => {
    if (showQuestion && hasMeasured) {
      // Small delay to allow animation to start
      const timer = setTimeout(() => setAnimationReady(true), 50)
      return () => clearTimeout(timer)
    } else {
      setAnimationReady(false)
    }
  }, [showQuestion, hasMeasured])

  const cardEntered = animationReady && !isExiting && !isGoingBack
  const characterEntered = showCharacter && cardEntered && !isExiting && !isGoingBack

  // Measure card top based on character box bottom or fallback to app bar/progress bar height
  useLayoutEffect(() => {
    if (isFullScreen) {
      setCardTopPx(0)
      setHasMeasured(true)
      setShowQuestion(true)
      setIsReady(true)
      return
    }

    const compute = () => {
      const main = mainRef.current
      if (!main) return

      const hasCharacter = Boolean(imageUrl)
      if (hasCharacter && characterBoxRef.current) {
        const mainRect = main.getBoundingClientRect()
        const charRect = characterBoxRef.current.getBoundingClientRect()
        const topPx = Math.max(0, Math.round(charRect.bottom - mainRect.top))
        setCardTopPx(topPx)
        setHasMeasured(true)
        setShowQuestion(true)
        return
      }

      // Fallback when no character: place under appbar/progress zone
      // Use max(12dvh, 88px) to avoid underlapping the app bar on small screens
      const viewportH = Math.max(window.innerHeight, document.documentElement.clientHeight)
      const approxTop = Math.max(Math.round(viewportH * 0.12), 88)
      setCardTopPx(approxTop)
      setHasMeasured(true)
      setShowQuestion(true)
      if (!hasCharacter) {
        setIsReady(true)
      }
    }

    // Initial compute before paint and on resize/orientation
    compute()
    const onResize = () => compute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [imageUrl, isFullScreen, stepNumber, assistantName, showCharacter])

  // When character image loads or there is no character, allow character to enter and mark ready
  const handleCharacterLoaded = () => {
    setShowCharacter(true)
    setIsReady(true)
  }

  return (
    <div className={`w-full relative ${isFullScreen ? 'min-h-[100dvh]' : 'min-h-[100dvh] overflow-hidden'}`}>
  {/* Animated Background (paused until step is ready to reduce motion conflicts) */}
  <AnimatedBackground paused={!isReady} />

      {isHydrated ? (
        <>
          {stepNumber < 34 && stepNumber >= 0 && (
            <OnboardingAppbar onBackAnimation={startBackAnimation} />
          )}

          <main ref={mainRef} className="w-full h-full max-w-lg mx-auto relative">
            {!isFullScreen && imageUrl && (
              <div
                ref={characterBoxRef}
                className="absolute top-0 left-0 right-0 z-10 flex justify-center items-end"
                style={{
                  // Use dynamic viewport height to avoid mobile browser UI jumps
                  height: '40dvh',
                  pointerEvents: 'none',
                  ...(assistantName === 'max' && [14, 15, 16, 17, 18, 19].includes(stepNumber)
                    ? {
                        alignItems: 'flex-end',
                        paddingBottom: stepNumber === 18 ? '40px' : stepNumber === 19 ? '30px' : '20px'
                      }
                    : {})
                }}
              >
                <div
                  ref={characterRef}
                  className={`transition-[opacity,transform] duration-500 ease-out h-[85%] ${
                    characterEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    pointerEvents: 'auto',
                    transitionDelay: characterEntered ? '120ms' : '0ms',

                    // Removed marginBottom for Max on steps 14-19 to fix extra space
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={`Assistant for step ${stepNumber}`}
                    width={300}
                    height={300}
                    className="object-contain h-full w-auto"
                    priority
                    onLoad={handleCharacterLoaded}
                  />
                </div>
              </div>
            )}

            <div
              className={`${!isFullScreen ? 'absolute left-0 right-0' : ''} z-40 transition-[opacity,transform] duration-500 ease-out pointer-events-auto ${
                cardEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: cardEntered ? '100ms' : '0ms',
                ...(!isFullScreen
                  ? cardTopPx != null
                    ? { top: `${cardTopPx}px`, ['--card-top' as any]: `${cardTopPx}px` }
                    : { top: '12dvh' }
                  : {})
              }}
            >
              <div
                className={`bg-white shadow-2xl ${isFullScreen ? 'min-h-[100dvh]' : 'rounded-3xl overflow-hidden'} relative z-40`}
                style={
                  isFullScreen
                    ? {}
                    : (
                        stepNumber === 0
                          ? {
                              // On GoalStep only: make the card fill the area so the grid reaches the footer neatly
                              height: 'calc(100svh - var(--card-top, 12dvh))',
                              marginTop: imageUrl ? '-16px' : '0px'
                            }
                          : {
                              // Other steps keep original behavior to avoid visual changes
                              maxHeight: 'calc(100svh - var(--card-top, 12dvh))',
                              marginTop: imageUrl ? '-16px' : '0px'
                            }
                      )
                }
              >
                {/* Inner flex column; height is auto, OnboardingStep will handle scroll caps */}
                <div className="flex flex-col">
                  {cardEntered && (
                    // Mount content only when the card is entering/visible to avoid off-screen animations finishing before visible
                    <StepComponent key={stepNumber} />
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <div className="min-h-[100dvh] bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

