'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ensureAuthUser, ensureUsersV2Doc, upsertUsersV2 } from '@/lib/firebase'
import Image from 'next/image'
import OnboardingAppbar from '@/components/quiz/OnboardingAppbar'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useQuizResume } from '@/hooks/useQuizResume'
import { QuizResumeToast } from '@/components/quiz/QuizResumeToast'

// Import all step components
import GoalStep from '@/components/quiz/steps/GoalStep'
import CongratulationsStep from '@/components/quiz/steps/CongratulationsStep'
import ExcitedStep from '@/components/quiz/steps/ExcitedStep'
import StatisticStep from '@/components/quiz/steps/StatisticStep'
import PrivacyStep from '@/components/quiz/steps/PrivacyStep'
import GeneralStep from '@/components/quiz/steps/GeneralStep'
import LifestyleStep from '@/components/quiz/steps/LifestyleStep'
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
import AIResultsStep from '@/components/quiz/steps/AIResultsStep'

// Post-quiz screens
import CurrentConditionAnalysisStep from '@/components/post-quiz/CurrentConditionAnalysisStep'

const stepComponents: { [key: number]: React.ComponentType } = {
  0: GoalStep,
  1: PersonalityInsightStep, // After goals - personality analysis
  2: CongratulationsStep,
  3: ExcitedStep,
  4: StatisticStep,
  5: PrivacyStep,
  6: GeneralStep,
  7: LifestyleStep,
  // SleepStep removed. Reorder to: WakeUp -> EndDay -> SleepRhythm
  8: WakeUpStep,
  9: EndDayStep,
  10: SleepRhythmInsightStep,
  11: StressStep,
  12: StressCopingInsightStep, // After stress – coping insight (no character)
  13: WorkEnvironmentStep,
  14: SkinTypeStep,
  15: SkinProblemsStep,
  16: SkinGlowInsightStep,
  17: HairTypeStep,
  18: HairProblemsStep,
  19: PhysicalActivitiesStep,
  20: DietStep,
  21: MomentumInsightStep,
  22: MomentumCheckStep, // After activities - momentum check
  23: MoodStep,
  24: EnergyLevelStep,
  25: ProcrastinationStep,
  26: FocusStep,
  27: OrganizationInfluenceStep,
  28: AnalysisIntroStep,
  29: PhotoUploadFaceStep,
  30: PhotoUploadHairStep,
  31: AIResultsStep,
  32: CurrentConditionAnalysisStep,
}
// Card heights from Flutter design
// Updated card heights after removing SleepStep and reordering SleepRhythm
const cardHeights = [
  0.42, 0.8, 0.4, 0.44, 0.45, 0.43, 0.82, 0.48,
  0.55, // WakeUpStep (was index 10)
  0.55, // EndDayStep (was index 11)
  0.6,  // SleepRhythmInsightStep (was index 9)
  0.5, 0.8, 0.5, 0.5, 0.5, 0.58, 0.6, 0.6,
  0.8, 0.6, 0.6, 0.6, 0.8, /* 19 PhysicalActivities */ 0.78, 0.6, 0.6, 0.6,
  0.6, 0.6, 0.6, 0.6
];
interface QuizStepClientProps { stepNumber: number }

export default function QuizStepClient({ stepNumber }: QuizStepClientProps) {
  const router = useRouter()
  // UI state
  const [isReady, setIsReady] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isGoingBack, setIsGoingBack] = useState(false)

  // Quiz resume notification
  const { notification, dismiss } = useQuizResume()

  // Refs to measure and glue the card under the character
  const mainRef = useRef<HTMLDivElement | null>(null)
  const characterBoxRef = useRef<HTMLDivElement | null>(null)
  const characterRef = useRef<HTMLDivElement | null>(null)
  const [cardTopPx, setCardTopPx] = useState<number | null>(null)
  const [hasMeasured, setHasMeasured] = useState(false)
  const [animationReady, setAnimationReady] = useState(false)

  // Store
  const { totalSteps, answers, setTransitioning, generateSessionId, setAnswer, currentStep } = useQuizStore()

  // Hydration + ensure session + auth
  useEffect(() => {
    setIsHydrated(true)
    if (!answers.sessionId) generateSessionId()

    const initializeAuth = async () => {
      try {
        if (answers.Id && answers.Id.trim().length > 0) {
          // Already have user id
          return
        }
        const user = await ensureAuthUser()
        if (user && user.uid) {
          setAnswer('Id', user.uid)
        }
      } catch (error) {
        console.error('Authentication error:', error)
      }
    }
    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset transitioning flag when step changes
  useEffect(() => { setTransitioning(false) }, [stepNumber, setTransitioning])

  // Mark that user entered the quiz funnel
  useEffect(() => {
    try {
      const firstStep = 0
      if (stepNumber === firstStep) {
        const event = { eventName: 'quizEntered', timestamp: new Date().toISOString(), step: stepNumber }
        // Fire-and-forget via store batching
        useQuizStore.getState().addEvent(event.eventName, event.step, undefined)
      }
    } catch {}
    // run once per step 0 mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber])

  // At the congratulatory step, ensure a users_v2 doc exists for this (anon) user
  const createdV2Ref = useRef(false)
  useEffect(() => {
    const shouldInit = stepNumber === 2 && !createdV2Ref.current && Boolean(answers?.Id)
    if (!shouldInit) return
    createdV2Ref.current = true
    ensureUsersV2Doc(answers.Id, { sessionId: answers.sessionId, source: 'web-quiz' })
      .catch(() => { /* non-blocking */ })
  }, [stepNumber, answers?.Id, answers?.sessionId])

  // Debounced incremental autosave of key answers to users_v2 as user progresses
  const autosaveTimer = useRef<number | null>(null)
  useEffect(() => {
    // Only autosave once we have an authenticated uid and a session id
    if (!answers?.Id || !answers?.sessionId) return
    // Don't spam writes on very early steps; start after step 2
    if (stepNumber < 2) return

    const buildPatch = () => {
  const patch: Record<string, any> = {}
      if ((answers as any)['assistant'] && (answers as any)['assistant'] > 0) patch['assistant'] = (answers as any)['assistant']
      // Standardize capitalized Theme for users_v2
      if ((answers as any)['theme'] && typeof (answers as any)['theme'] === 'string') patch['Theme'] = (answers as any)['theme']
      if ((answers as any)['primaryColor'] && typeof (answers as any)['primaryColor'] === 'string') {
        patch['primaryColor'] = (answers as any)['primaryColor']
        const colorToHex: Record<string, string> = { purple: '#8A60FF', blue: '#3B82F6', green: '#22C55E', pink: '#EC4899', red: '#EF4444' }
        patch['PrimaryColor'] = colorToHex[(answers as any)['primaryColor']] || '#8A60FF'
      }

      if ((answers as any)['Goals'] && Array.isArray((answers as any)['Goals']) && (answers as any)['Goals'].some((g: any) => g?.isActive)) {
        patch['Goals'] = (answers as any)['Goals']
      }
      if ((answers as any)['SkinType']) patch['SkinType'] = (answers as any)['SkinType']
      if ((answers as any)['SkinProblems'] && Array.isArray((answers as any)['SkinProblems']) && (answers as any)['SkinProblems'].some((p: any) => p?.isActive)) {
        patch['SkinProblems'] = (answers as any)['SkinProblems']
      }
      if ((answers as any)['HairType']) patch['HairType'] = (answers as any)['HairType']
      if ((answers as any)['HairProblems'] && Array.isArray((answers as any)['HairProblems']) && (answers as any)['HairProblems'].some((p: any) => p?.isActive)) {
        patch['HairProblems'] = (answers as any)['HairProblems']
      }
      if (Array.isArray((answers as any)['SelectedActivities']) && (answers as any)['SelectedActivities'].length > 0) {
        patch['SelectedActivities'] = (answers as any)['SelectedActivities']
      }
      if (Array.isArray((answers as any)['Diet']) && (answers as any)['Diet'].some((d: any) => d?.isActive)) {
        patch['Diet'] = (answers as any)['Diet']
      }
      if ((answers as any)['WorkEnvironment']) patch['WorkEnvironment'] = (answers as any)['WorkEnvironment']
      if (typeof (answers as any)['EnergyLevel'] === 'number') patch['EnergyLevel'] = (answers as any)['EnergyLevel']
      if ((answers as any)['Mood']) patch['Mood'] = (answers as any)['Mood']
      if ((answers as any)['Focus']) patch['Focus'] = (answers as any)['Focus']
      if ((answers as any)['Procrastination']) patch['Procrastination'] = (answers as any)['Procrastination']
      // General step details (name/age/height/weight)
      if ((answers as any)['Name']) patch['Name'] = (answers as any)['Name']
      if (typeof (answers as any)['Age'] === 'number') patch['Age'] = (answers as any)['Age']
      if ((answers as any)['Height']) patch['Height'] = (answers as any)['Height']
      if ((answers as any)['HeightUnit'] != null) patch['HeightUnit'] = (answers as any)['HeightUnit']
      if ((answers as any)['Weight']) patch['Weight'] = (answers as any)['Weight']
      if ((answers as any)['WeightUnit'] != null) patch['WeightUnit'] = (answers as any)['WeightUnit']
      // Day rhythm
      if ((answers as any)['WakeUp']) patch['WakeUp'] = (answers as any)['WakeUp']
      if ((answers as any)['EndDay']) patch['EndDay'] = (answers as any)['EndDay']
      if ((answers as any)['SleepDuration']) patch['SleepDuration'] = (answers as any)['SleepDuration']
      return patch
    }

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current)
      autosaveTimer.current = null
    }
    autosaveTimer.current = window.setTimeout(async () => {
      try {
        await ensureUsersV2Doc(answers.Id, { sessionId: answers.sessionId, source: 'web-quiz' })
        const patch = buildPatch()
        if (Object.keys(patch).length > 0) {
          await upsertUsersV2(answers.Id, patch)
        }
      } catch { /* non-blocking */ }
    }, 600) // small debounce to batch rapid changes within a step

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current)
        autosaveTimer.current = null
      }
    }
  // Track fields that affect the patch; avoid including large objects to reduce reruns
  }, [stepNumber, (answers as any)['Id'], (answers as any)['sessionId'], (answers as any)['assistant'], (answers as any)['theme'], (answers as any)['primaryColor'], (answers as any)['Goals'], (answers as any)['SkinType'], (answers as any)['SkinProblems'], (answers as any)['HairType'], (answers as any)['HairProblems'], (answers as any)['SelectedActivities'], (answers as any)['Diet'], (answers as any)['WorkEnvironment'], (answers as any)['EnergyLevel'], (answers as any)['Mood'], (answers as any)['Focus'], (answers as any)['Procrastination'], (answers as any)['Name'], (answers as any)['Age'], (answers as any)['Height'], (answers as any)['HeightUnit'], (answers as any)['Weight'], (answers as any)['WeightUnit'], (answers as any)['WakeUp'], (answers as any)['EndDay'], (answers as any)['SleepDuration']])

  
  // Simplified sync: store is source of truth, URL follows store
  // Keep URL in sync with store and guard assistant selection
  useEffect(() => {
    if (!isHydrated) return
    if (answers.assistant === 0) {
      router.replace('/assistant-selection')
      return
    }
    const clampedStep = isNaN(stepNumber) ? 0 : Math.max(0, Math.min(stepNumber, totalSteps - 1))
    if (currentStep !== clampedStep) {
      router.replace(`/quiz/${currentStep}`)
    }
  }, [isHydrated, stepNumber, currentStep, totalSteps, answers.assistant, router])

  // Centralized entry sequencing: reset flags and precompute layout to avoid blank delays
  useLayoutEffect(() => {
    setIsExiting(false)
    setIsGoingBack(false)
    setShowCharacter(false)
    setIsReady(false)
    setAnimationReady(false)

    const viewportH = Math.max(window.innerHeight, document.documentElement.clientHeight)
    const hasCharacter = Boolean(getImageForStep(stepNumber, answers.assistant === 2 ? 'ellie' : 'max'))
    if (!hasCharacter) {
      const approxTop = Math.max(Math.round(viewportH * 0.12), 88)
      setCardTopPx(approxTop)
      setHasMeasured(true)
      setShowQuestion(true)
      setIsReady(true)
    } else {
      const approxTop = Math.max(Math.round(viewportH * 0.40), 200)
      setCardTopPx(approxTop)
      setHasMeasured(true)
      setShowQuestion(true)
      // isReady flips true when character image loads
    }
  }, [stepNumber, answers.assistant])

  

  // Do not early-return on hydration to keep Hook order stable; render a loader conditionally instead

  const StepComponent = stepComponents[stepNumber]
  const currentCardHeight = cardHeights[stepNumber] || 0.5
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
  8: 'onboarding_img_usually_wake_up',  // WakeUpStep
  9: 'onboarding_img_usually_end_your_day',  // EndDayStep
  10: null,  // SleepRhythmInsightStep (insight - no character)
  11: 'onboarding_img_get_stressed',  // StressStep
  12: null,  // StressCopingInsightStep (insight - no character)
  13: 'onboarding_img_work_environment',  // WorkEnvironmentStep
  14: 'onboarding_img_skin_type',  // SkinTypeStep
  15: null,  // SkinProblemsStep - remove character to expand question area
  16: null,  // SkinGlowInsightStep (insight - no character)
  17: 'onboarding_img_hair_type',  // HairTypeStep
  18: 'onboarding_img_Hair_problems',  // HairProblemsStep
  19: null,  // PhysicalActivitiesStep - remove character to maximize selection area
  20: 'onboarding_img_diet',  // DietStep
  21: null,  // MomentumInsightStep (insight - no character)
  22: null,  // MomentumCheckStep (insight - no character)
  23: 'onboarding_img_mood',  // MoodStep
  24: 'onboarding_img_energy',  // EnergyLevelStep
  25: 'onboarding_img_procrastinate',  // ProcrastinationStep
  26: 'onboarding_img_hard_to_focus',  // FocusStep
  27: 'onboarding_img_become_organized',  // OrganizationInfluenceStep
  28: 'onboarding_img_analyze_your_face',  // AnalysisIntroStep
  29: null,  // PhotoUploadFaceStep - no character
  30: null,  // PhotoUploadHairStep - no character
  31: null,  // AIResultsStep - no character/image on top
  32: null,  // CurrentConditionAnalysisStep (no character)
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

  const imageUrl = getImageForStep(stepNumber, assistantName)

  // Step 25 (PhotoUploadStep) doesn't need assistant character

  const isFullScreen = stepNumber >= 32 // Post-quiz screens start from CurrentConditionAnalysis (now index 32)
  const isAutoTransitionScreen = false // AI Analysis Intro was removed

  // ===== ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS =====
  
  // Fallback: ensure content is shown after a reasonable delay if measurement fails
  useEffect(() => {
    if (!isFullScreen && !hasMeasured) {
      const fallbackTimer = setTimeout(() => {
        if (!hasMeasured && !showQuestion) {
          setHasMeasured(true)
          setShowQuestion(true)
          setCardTopPx(88)
        }
      }, 600)
      return () => clearTimeout(fallbackTimer)
    }
    return () => {}
  }, [stepNumber, hasMeasured, isFullScreen, showQuestion])

  // Ensure animation order: card (text) enters first, then character
  // Add a small delay for animation start
  useEffect(() => {
    if (showQuestion && hasMeasured) {
      const timer = setTimeout(() => setAnimationReady(true), 50)
      return () => clearTimeout(timer)
    } else {
      setAnimationReady(false)
      return () => {}
    }
  }, [showQuestion, hasMeasured])

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
        const baseTop = Math.max(0, Math.round(charRect.bottom - mainRect.top))
        // Per-step adjustments
  const offset = (stepNumber === 28 /* Analysis Intro */ || stepNumber === 31 /* AI Results: "Analyzing Your Profile" */) ? -40 : 0
        const topPx = Math.max(0, baseTop + offset)
        setCardTopPx(topPx)
        setHasMeasured(true)
        setShowQuestion(true)
        return
      }

  const viewportH = Math.max(window.innerHeight, document.documentElement.clientHeight)
  const approxTop = Math.max(Math.round(viewportH * 0.12), 88)
  const fallbackOffset = (stepNumber === 28 || stepNumber === 31) ? -40 : 0
  setCardTopPx(Math.max(0, approxTop + fallbackOffset))
      setHasMeasured(true)
      setShowQuestion(true)
      if (!hasCharacter) setIsReady(true)
    }

    compute()
    const onResize = () => compute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [imageUrl, isFullScreen, stepNumber, assistantName, showCharacter])

  // ===== CONDITIONAL RETURNS AFTER ALL HOOKS =====

  if (!StepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8" />
      </div>
    )
  }

  // For auto-transition screens, render directly without any wrappers
  if (isAutoTransitionScreen) {
    return <StepComponent />
  }

  const cardEntered = animationReady && !isExiting && !isGoingBack
  const characterEntered = showCharacter && cardEntered && !isExiting && !isGoingBack

  // When character image loads or there is no character, allow character to enter and mark ready
  const handleCharacterLoaded = () => {
    setShowCharacter(true)
    setIsReady(true)
  }

  return (
    <div className={`w-full relative ${isFullScreen ? 'min-h-[100dvh]' : 'min-h-[100dvh] overflow-hidden'}`}>
      {/* Animated Background (paused until step is ready to reduce motion conflicts) */}
      <AnimatedBackground paused={!isReady} />

      {/* Quiz Resume Notification */}
      <QuizResumeToast
        show={notification.show}
        message={notification.progressText}
        onDismiss={dismiss}
      />

      {isHydrated ? (
        <>
          {stepNumber < 33 && stepNumber >= 0 && ![30, 31, 32].includes(stepNumber) && (
            <OnboardingAppbar onBackAnimation={() => setIsGoingBack(true)} />
          )}

          <main ref={mainRef} className="w-full h-full max-w-lg mx-auto relative">
            {!isFullScreen && imageUrl && (
              <div
                ref={characterBoxRef}
                className="absolute top-0 left-0 right-0 z-10 flex justify-center items-end"
                style={{
                  height: '40dvh',
                  pointerEvents: 'none',
                  ...(assistantName === 'max' && [14, 15, 16, 17, 18, 19].includes(stepNumber)
                    ? {
                        alignItems: 'flex-end',
                        paddingBottom:
                          stepNumber === 18
                            ? '14px' // HairProblemsStep: lower image a bit compared to previous 40px
                            : stepNumber === 19
                            ? '30px'
                            : stepNumber === 17
                            ? '8px' // HairTypeStep: lower slightly
                            : stepNumber === 14
                            ? '8px' // SkinTypeStep: lower slightly
                            : '20px',
                      }
                    : {}),
                }}
              >
                <div
                  ref={characterRef}
                  className={`transition-[opacity,transform] duration-500 ease-out h-[85%] ${
                    characterEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ pointerEvents: 'auto', transitionDelay: characterEntered ? '120ms' : '0ms' }}
                >
                  <Image
                    src={imageUrl as string}
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
                  : {}),
              }}
            >
              <div
                className={`bg-surface shadow-2xl ${isFullScreen ? 'min-h-[100dvh]' : 'rounded-3xl overflow-hidden'} relative z-40`}
                style={
                  isFullScreen
                    ? {}
                    : stepNumber === 0
                      ? {
                          height: 'calc(100svh - var(--card-top, 12dvh))',
                          marginTop: imageUrl ? '-16px' : '0px',
                        }
                      : {
                          maxHeight: 'calc(100svh - var(--card-top, 12dvh))',
                          marginTop: imageUrl ? '-16px' : '0px',
                        }
                }
              >
                <div className="flex flex-col">
                  {cardEntered && <StepComponent key={stepNumber} />}
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

