import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveUserToFirestore, saveOnboardingSession } from '@/lib/firebase'

export interface GoalItem {
  id: string;
  title: string;
  isActive: boolean;
}

export interface DietItem {
  id: string;
  title: string;
  isActive: boolean;
}

export interface ProblemItem {
  id: string;
  title: string;
  isActive: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  isActive: boolean;
}

export interface UserModel {
  // Core fields
  Id: string;
  Email: string;
  ProfilePicture: string;
  quizStartTime: string;
  quizEndTime: string;

  // Session logging
  sessionId: string;
  events: Array<{
    eventName: string;
    timestamp: string;
    step?: number;
    details?: any;
  }>;

  // Assistant and theme
  assistant: 0 | 1 | 2;
  theme: string;

  // Personal info
  Name: string;
  Gender: 0 | 1 | 2;
  Age: number | null;
  BirthDate: string;
  Height: string;
  HeightUnit: 'ft&in' | 'cm' | null;
  Weight: string;
  WeightUnit: 'lbs' | 'kg' | null;
  Ethnicity: string;

  // Lifestyle
  LifeStyle: '' | 'sedentary' | 'active' | 'sports';
  SleepDuration: '' | '<6' | '6-7' | '7-8' | '8-9' | '>9';
  WakeUp: string;
  EndDay: string;
  TimeFormat: '12h' | '24h' | null;

  // Mental health
  EnergyLevel: 1 | 2 | 3 | 4 | 5 | null;
  Focus: '' | 'always' | 'sometimes' | 'rarely' | 'never';
  Procrastination: '' | 'always' | 'sometimes' | 'rarely' | 'never';
  Stress: '' | 'rarely' | 'sometimes' | 'often' | 'always';
  Mood: '' | 'great' | 'good' | 'okay' | 'bad' | 'terrible';

  // Goals and preferences
  Goals: GoalItem[];
  Diet: DietItem[];
  Influence: string[];

  // Physical activities
  PhysicalActivities: ActivityItem[];
  ActivityFrequency: Array<{ id: string, frequency: number, period: 'day' | 'week' | 'month' | 'year' }>;

  // Skin and hair
  SkinType: '' | 'dry' | 'normal' | 'oily' | 'combination' | 'ai_analyze';
  SkinProblems: ProblemItem[];
  HairType: string;
  HairProblems: ProblemItem[];

  // Post-quiz
  SelectedActivities: string[];
  ActivityMetaOverrides: Record<string, any>;
  ActivityNotes: Record<string, string>;
  DailyMoodReminder: boolean;
  ActivityReminder: boolean;
  ContractSignature: string;
  SelectedPlan: string;
  Onboarding2Completed: boolean;
  PaymentCompleted: boolean;
  SubscriptionPlan: string;

  // Images
  FaceImageUrl: string;
  HairImageUrl: string;
  BodyImageUrl: string;
  FaceImageSkipped: boolean;
  HairImageSkipped: boolean;
  BodyImageSkipped: boolean;
}

interface QuizStore {
  answers: UserModel
  analysis: any | null
  currentStep: number
  totalSteps: number
  isTransitioning: boolean
  sessionId: string
  hydrate: () => void
  setAnalysis: (model: any | null) => void
  setAnswer: <K extends keyof UserModel>(field: K, value: UserModel[K]) => void
  generateSessionId: () => void
  addEvent: (eventName: string, step?: number, details?: any) => void
  setHeightUnit: (unit: 'cm' | 'ft&in') => void
  setWeightUnit: (unit: 'kg' | 'lbs') => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setTransitioning: (flag: boolean) => void
  resetQuiz: () => void
  completeOnboarding: () => void
}


function getOrCreateSessionId() {
  if (typeof window !== 'undefined') {
    let sid = sessionStorage.getItem('quizSessionId');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('quizSessionId', sid);
    }
    return sid;
  }
  return '';
}

export const initialAnswers: UserModel = {
  Id: '',
  Email: '',
  ProfilePicture: '',
  quizStartTime: '',
  quizEndTime: '',
  sessionId: '',
  events: [],
  assistant: 0,
  theme: '',
  Name: '',
  Gender: 0,
  Age: null,
  BirthDate: '',
  Height: '',
  HeightUnit: null,
  Weight: '',
  WeightUnit: null,
  Ethnicity: '',
  LifeStyle: '',
  SleepDuration: '',
  WakeUp: '',
  EndDay: '',
  TimeFormat: null,
  EnergyLevel: null,
  Focus: '',
  Procrastination: '',
  Stress: '',
  Mood: '',
  Goals: [
    { id: 'healthy-activities', title: 'Build Healthy Activities', isActive: false },
    { id: 'boost-productivity', title: 'Boost Productivity', isActive: false },
    { id: 'personal-goals', title: 'Achieve Personal Goals', isActive: false },
    { id: 'manage-stress', title: 'Manage Stress & Anxiety', isActive: false },
    { id: 'increase-longevity', title: 'Increase Longevity', isActive: false },
    { id: 'reduce-biological-age', title: 'Reduce Biological Age', isActive: false },
    { id: 'improve-wellness-score', title: 'Improve Wellness Score', isActive: false },
    { id: 'reduce-procrastination', title: 'Reduce Procrastination', isActive: false },
  ],
  Diet: [
    { id: "balanced", title: "Balanced", isActive: false },
    { id: "vegetarian", title: "Vegetarian", isActive: false },
    { id: "vegan", title: "Vegan", isActive: false },
    { id: "keto", title: "Keto", isActive: false },
    { id: "paleo", title: "Paleo", isActive: false },
    { id: "pescatarian", title: "Pescatarian", isActive: false },
    { id: "gluten-free", title: "Gluten-Free", isActive: false },
    { id: "dairy-free", title: "Dairy-Free", isActive: false },
    { id: "anything", title: "Anything", isActive: false },
    { id: "other", title: "Other", isActive: false }
  ],
  Influence: [],
  PhysicalActivities: [
    { id: "gym-workouts", title: "Gym Workouts", isActive: false },
    { id: "pilates", title: "Pilates", isActive: false },
    { id: "cycling", title: "Cycling", isActive: false },
    { id: "martial-arts", title: "Martial Arts", isActive: false },
    { id: "dance", title: "Dance", isActive: false },
    { id: "other", title: "Other", isActive: false }
  ],
  ActivityFrequency: [],
  SkinType: '',
  SkinProblems: [
    { id: "acne", title: "Acne", isActive: false },
    { id: "redness", title: "Redness", isActive: false },
    { id: "blackheads", title: "Blackheads", isActive: false },
    { id: "pores", title: "Pores", isActive: false },
    { id: "wrinkles", title: "Wrinkles", isActive: false },
    { id: "dark-circles", title: "Dark Circles", isActive: false },
    { id: "dryness", title: "Dryness", isActive: false },
    { id: "oiliness", title: "Oiliness", isActive: false },
    { id: "dullness", title: "Dullness", isActive: false },
    { id: "no_problems", title: "No problems", isActive: false },
    { id: "ai_analyze", title: "Let AI Analyze", isActive: false }
  ],
  HairType: '',
  HairProblems: [
    { id: "hair-loss", title: "Hair Loss", isActive: false },
    { id: "dandruff", title: "Dandruff", isActive: false },
    { id: "dryness", title: "Dryness", isActive: false },
    { id: "split-ends", title: "Split Ends", isActive: false },
    { id: "frizz", title: "Frizz", isActive: false },
    { id: "oiliness", title: "Oiliness", isActive: false },
    { id: "lack-volume", title: "Lack of Volume", isActive: false },
    { id: "no_problems", title: "No problems", isActive: false },
    { id: "ai_analyze", title: "Let AI Analyze", isActive: false }
  ],
  SelectedActivities: [],
  ActivityMetaOverrides: {},
  ActivityNotes: {},
  DailyMoodReminder: false,
  ActivityReminder: false,
  ContractSignature: '',
  SelectedPlan: '',
  Onboarding2Completed: false,
  PaymentCompleted: false,
  SubscriptionPlan: '',
  FaceImageUrl: '',
  HairImageUrl: '',
  BodyImageUrl: '',
  FaceImageSkipped: false,
  HairImageSkipped: false,
  BodyImageSkipped: false,
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      answers: initialAnswers,
      analysis: null,
      currentStep: 0,
      totalSteps: 37, // Reduced by 1 after removing Gender step
      isTransitioning: false,
      get sessionId() {
        return getOrCreateSessionId();
      },

      hydrate: () => {
        set((state) => state)
      },

      setAnalysis: (model) => set(() => ({ analysis: model })),

      setAnswer: async (field, value) => {
        const state = get();
        
        const newAnswers = {
          ...state.answers,
          [field]: value,
        };
        
        // Create event for answer change
        const event = {
          eventName: 'answerChanged',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { field, value }
        };
        
        // Send event immediately to backend
        try {
          await saveOnboardingSession(state.answers.sessionId, [event], state.answers.Id);
        } catch (error) {
          console.error('Failed to save onboarding event:', error);
        }
        
        // Update local state
        set(() => ({
          answers: { ...newAnswers, events: [...newAnswers.events, event] }
        }));
      },

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

      nextStep: async () => {
        const state = get();
        const newStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
        
        // Create event for step completion
        const event = {
          eventName: 'stepCompleted',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { nextStep: newStep, answers: state.answers }
        };
        
        // Send event immediately to backend
        try {
          await saveOnboardingSession(state.answers.sessionId, [event], state.answers.Id);
        } catch (error) {
          console.error('Failed to save onboarding event:', error);
        }
        
        // Update local state
        set(() => ({
          currentStep: newStep,
          answers: { ...state.answers, events: [...state.answers.events, event] }
        }));
      },

      prevStep: async () => {
        const state = get();
        const newStep = Math.max(state.currentStep - 1, 0);
        
        // Create event for step navigation
        const event = {
          eventName: 'stepNavigated',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { nextStep: newStep, direction: 'previous' }
        };
        
        // Send event immediately to backend
        try {
          await saveOnboardingSession(state.answers.sessionId, [event], state.answers.Id);
        } catch (error) {
          console.error('Failed to save onboarding event:', error);
        }
        
        // Update local state
        set(() => ({
          currentStep: newStep,
          answers: { ...state.answers, events: [...state.answers.events, event] }
        }));
      },

      goToStep: async (step) => {
        const state = get();
        
        // Create event for step jump
        const event = {
          eventName: 'stepJumped',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { targetStep: step }
        };
        
        // Send event immediately to backend
        try {
          await saveOnboardingSession(state.answers.sessionId, [event], state.answers.Id);
        } catch (error) {
          console.error('Failed to save onboarding event:', error);
        }
        
        // Update local state
        set(() => ({
          currentStep: Math.max(0, Math.min(step, state.totalSteps - 1)),
          answers: { ...state.answers, events: [...state.answers.events, event] }
        }));
      },

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

      generateSessionId: () => {
        const sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        set((state) => ({
          answers: { ...state.answers, sessionId: sid }
        }));
      },

      addEvent: (eventName, step, details) => {
        const event = {
          eventName,
          timestamp: new Date().toISOString(),
          step,
          details
        };
        set((state) => ({
          answers: { ...state.answers, events: [...state.answers.events, event] }
        }));
      },
    }),
    {
      name: 'beauty-quiz-storage-v2', // New version to avoid conflicts with old structure
      skipHydration: false,
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
      }),
    }
  )
)

