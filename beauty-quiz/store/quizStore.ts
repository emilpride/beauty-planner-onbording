import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActivityMetaOverridePersisted {
  name: string
  iconId: string
  primary: string
  surface: string
}

export interface QuizAnswers {
  // Step 0: Assistant Choice (Implicit)
  assistant: 0 | 1 | 2 // 0 = not selected, 1 = Max, 2 = Ellie
  
  // Step 1: Gender
  gender: 0 | 1 | 2 // 0 = not selected, 1 = male, 2 = female
  
  // Step 2: Goal
  goals: string[]

  // Step 7: General Info
  name: string
  age: number | null
  birthDate: string
  height: string
  heightUnit: 'ft&in' | 'cm'
  weight: string
  weightUnit: 'lbs' | 'kg'
  ethnicGroup: string
  
  // Step 8: Lifestyle
  lifestyle: '' | 'sedentary' | 'active' | 'sports'
  
  // Step 8: Sleep
  sleepHours: '' | '<6' | '6-7' | '7-8' | '8-9' | '>9'

  // Steps 10 & 11: Wake Up & End Day
  wakeUpTime: string // e.g., "07:30"
  endDayTime: string // e.g., "23:00"
  timeFormat: '12h' | '24h' // 12-hour or 24-hour format

  // Step 12: Stress
  stressLevel: '' | 'rarely' | 'sometimes' | 'often' | 'always'

  // Step 13: Work Environment
  workEnvironment: '' | 'office' | 'remote' | 'part-time' | 'jobless'

  // Step 14: Skin Type
  skinType: '' | 'dry' | 'normal' | 'oily' | 'combination' | 'ai_analyze'

  // Step 15: Skin Problems
  skinProblems: string[]

  // Step 17: Hair Type
  hairType: string

  // Step 18: Hair Problems
  hairProblems: string[]

  // Step 19: Physical Activities
  physicalActivities: string[]

  // Step 20: Activity Frequency
  activityFrequency: Array<{ id: string, frequency: number, period: 'day' | 'week' | 'month' | 'year' }>

  // Step 20: Diet
  diet: string[]

  // Step 22: Mood
  mood: '' | 'great' | 'good' | 'okay' | 'bad' | 'terrible'

  // Step 23: Energy Level
  energyLevel: 1 | 2 | 3 | 4 | 5

  // Step 24: Procrastination
  procrastination: '' | 'always' | 'sometimes' | 'rarely' | 'never'

  // Step 25: Focus
  focus: '' | 'always' | 'sometimes' | 'rarely' | 'never'

  // Step 26: Organization Influence
  organizationInfluence: string[]

  // Step 28: Photo Upload
  faceImageUrl: string
  hairImageUrl: string
  bodyImageUrl: string // Added as per documentation
  faceImageSkipped: boolean
  hairImageSkipped: boolean
  bodyImageSkipped: boolean

  // Post-quiz screens
  selectedActivities: string[]
  activityMetaOverrides: Record<string, ActivityMetaOverridePersisted>
  activityNotes: Record<string, string>
  dailyReminders: boolean
  activityReminders: boolean
  contractSignature: string
  selectedPlan: string

  // Post-quiz state
  onboardingComplete: boolean
  paymentCompleted: boolean
  subscriptionPlan: string
}

interface QuizStore {
  answers: QuizAnswers
  currentStep: number
  totalSteps: number
  isTransitioning: boolean
  hydrate: () => void
  setAnswer: <K extends keyof QuizAnswers>(field: K, value: QuizAnswers[K]) => void
  setHeightUnit: (unit: 'cm' | 'ft&in') => void
  setWeightUnit: (unit: 'kg' | 'lbs') => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setTransitioning: (flag: boolean) => void
  resetQuiz: () => void
  completeOnboarding: () => void
}

const initialAnswers: QuizAnswers = {
  assistant: 0, // 0 means "not selected"
  gender: 0,
  goals: [],
  name: '',
  age: null,
  birthDate: '',
  height: '',
  heightUnit: 'ft&in',
  weight: '',
  weightUnit: 'lbs',
  ethnicGroup: '',
  lifestyle: '',
  sleepHours: '',
  wakeUpTime: '07:30',
  endDayTime: '23:00',
  timeFormat: '12h',
  stressLevel: '',
  workEnvironment: '',
  skinType: '',
  skinProblems: [],
  hairType: '',
  hairProblems: [],
  physicalActivities: [],
  activityFrequency: [],
  diet: [],
  mood: '',
  energyLevel: 3,
  procrastination: '',
  focus: '',
  organizationInfluence: [],
  faceImageUrl: '',
  hairImageUrl: '',
  bodyImageUrl: '',
  faceImageSkipped: false,
  hairImageSkipped: false,
  bodyImageSkipped: false,
  selectedActivities: [],
  activityMetaOverrides: {},
  activityNotes: {},
  dailyReminders: false,
  activityReminders: false,
  contractSignature: '',
  selectedPlan: 'yearly',
  onboardingComplete: false,
  paymentCompleted: false,
  subscriptionPlan: '',
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      answers: initialAnswers,
      currentStep: 0,
          totalSteps: 38, // Increased after splitting photo upload into 3 screens
      isTransitioning: false,
      
      hydrate: () => {
        set((state) => state)
      },

      setAnswer: (field, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [field]: value,
          },
        })),

      setHeightUnit: (unit) =>
        set((state) => ({
          answers: {
            ...state.answers,
            heightUnit: unit,
          },
        })),

      setWeightUnit: (unit) =>
        set((state) => ({
          answers: {
            ...state.answers,
            weightUnit: unit,
          },
        })),

      setTransitioning: (flag: boolean) =>
        set(() => ({
          isTransitioning: flag,
        })),
      
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps -1),
        })),
      
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),
      
      goToStep: (step) =>
        set(() => ({
          currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)),
        })),
      
      resetQuiz: () =>
        set(() => ({
          answers: initialAnswers,
          currentStep: 0,
        })),
      
      completeOnboarding: () =>
        set((state) => ({
          answers: {
            ...state.answers,
            onboardingComplete: true,
          },
        })),
    }),
    {
      name: 'beauty-quiz-storage-v2', // New version to avoid conflicts with old structure
      skipHydration: true,
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
      }),
    }
  )
)

