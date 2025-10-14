import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  // Primary accent color for theming
  primaryColor: 'purple' | 'red' | 'blue' | 'green' | 'pink';

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
  // Micro-questions (analysis interludes)
  UsesAlcohol: boolean | null;
  Smokes: boolean | null;
  HasChildren: boolean | null;
}

interface QuizStore {
  answers: UserModel
  analysis: any | null
  uiSnapshots: Record<string, any>
  currentStep: number
  totalSteps: number
  isTransitioning: boolean
  sessionId: string
  hydrate: () => void
  setAnalysis: (model: any | null) => void
  saveUiSnapshot: (key: string, data: any) => void
  getUiSnapshot: (key: string) => any | undefined
  setAnswer: <K extends keyof UserModel>(field: K, value: UserModel[K]) => void
  // Convenience setter to avoid generic keyof issues in some consumers
  setPrimaryColor: (color: UserModel['primaryColor']) => void
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


// Simple analytics batching to avoid spamming the server
const ANALYTICS_FLUSH_INTERVAL_MS = 1500;
let analyticsQueue: UserModel['events'] = [];
let analyticsTimer: ReturnType<typeof setTimeout> | null = null;

function queueAnalyticsSend(getState: () => QuizStore, newEvents: UserModel['events']) {
  analyticsQueue.push(...newEvents);
  if (analyticsTimer) return;
  analyticsTimer = setTimeout(() => {
    const eventsToSend = analyticsQueue.splice(0, analyticsQueue.length);
    analyticsTimer = null;
    if (!eventsToSend.length) return;
    try {
      const state = getState();
      const sid = ensureSessionIdValue(state.answers.sessionId);
      const uid = state.answers.Id;
      if (!isBlankSessionId(sid)) {
        Promise.resolve(saveOnboardingSession(sid, eventsToSend, uid)).catch((error) => {
          console.warn('Non-blocking: failed to send batched onboarding events', error);
        });
      }
    } catch (err) {
      // swallow; next tick will retry
    }
  }, ANALYTICS_FLUSH_INTERVAL_MS);
}

const MAX_STORED_EVENTS = 80;

function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = (error as any).name
  const message = (error as any).message || ''
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || /quota/i.test(message)
}

function safeSessionGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(key)
  } catch (err) {
    console.warn('Session storage getItem failed for', key, err)
    return null
  }
}

function safeSessionSetItem(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(key, value)
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn('Session storage quota reached while setting', key, err)
      try {
        window.sessionStorage.removeItem(key)
      } catch (removeErr) {
        console.warn('Failed to remove session key after quota error', removeErr)
      }
    } else {
      console.warn('Session storage setItem failed for', key, err)
    }
  }
}

const onboardingStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }

  const storage = window.localStorage
  return {
    getItem: (name: string) => {
      try {
        return storage.getItem(name)
      } catch (err) {
        console.warn('Failed to read onboarding storage', err)
        return null
      }
    },
    setItem: (name: string, newValue: string) => {
      try {
        storage.setItem(name, newValue)
      } catch (err) {
        if (isQuotaExceededError(err)) {
          console.warn('Onboarding storage quota reached, attempting recovery', err)
          try {
            storage.removeItem(name)
          } catch (removeErr) {
            console.warn('Failed to remove onboarding key after quota error', removeErr)
          }

          try {
            const parsed = JSON.parse(newValue)
            if (parsed?.state?.answers?.events) {
              parsed.state.answers.events = []
            }
            const trimmed = JSON.stringify(parsed)
            storage.setItem(name, trimmed)
          } catch (retryErr) {
            try {
              storage.setItem(name, newValue)
            } catch (finalErr) {
              console.error('Unable to persist onboarding store after recovery attempts', finalErr)
            }
          }
        } else {
          console.error('Failed to persist onboarding storage', err)
        }
      }
    },
    removeItem: (name: string) => {
      try {
        storage.removeItem(name)
      } catch (err) {
        console.warn('Failed to remove onboarding storage key', err)
      }
    },
  }
})

function getOrCreateSessionId() {
  if (typeof window !== 'undefined') {
    let sid = safeSessionGetItem('quizSessionId');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      safeSessionSetItem('quizSessionId', sid);
    }
    return sid;
  }
  return '';
}

function appendEvent(events: any[], event: any) {
  const merged = [...ensureEventsArray(events), event];
  if (merged.length > MAX_STORED_EVENTS) {
    return merged.slice(merged.length - MAX_STORED_EVENTS);
  }
  return merged;
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
  primaryColor: 'purple',
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
  UsesAlcohol: null,
  Smokes: null,
  HasChildren: null,
}

function cloneInitialAnswers(): UserModel {
  return JSON.parse(JSON.stringify(initialAnswers)) as UserModel;
}

// Ensure critical array/object fields are always properly shaped to avoid runtime errors
function normalizeAnswers(input: Partial<UserModel> | undefined | null): UserModel {
  const base = cloneInitialAnswers();
  const ans = { ...(input as any) } as Partial<UserModel>;

  // Arrays that we rely on with .includes()/length in UI
  const influence: string[] = Array.isArray(ans?.Influence) ? (ans!.Influence as string[]) : [];
  const goals: GoalItem[] = Array.isArray(ans?.Goals) ? (ans!.Goals as GoalItem[]) : base.Goals;
  const diet: DietItem[] = Array.isArray(ans?.Diet) ? (ans!.Diet as DietItem[]) : base.Diet;
  const skinProblems: ProblemItem[] = Array.isArray(ans?.SkinProblems) ? (ans!.SkinProblems as ProblemItem[]) : base.SkinProblems;
  const hairProblems: ProblemItem[] = Array.isArray(ans?.HairProblems) ? (ans!.HairProblems as ProblemItem[]) : base.HairProblems;
  const physicalActivities: ActivityItem[] = Array.isArray(ans?.PhysicalActivities) ? (ans!.PhysicalActivities as ActivityItem[]) : base.PhysicalActivities;
  const activityFrequency = Array.isArray(ans?.ActivityFrequency) ? ans!.ActivityFrequency! : base.ActivityFrequency;
  const selectedActivities: string[] = Array.isArray(ans?.SelectedActivities) ? (ans!.SelectedActivities as string[]) : [];
  const events = Array.isArray(ans?.events) ? ans!.events! : [];
  const activityMetaOverrides = typeof ans?.ActivityMetaOverrides === 'object' && ans?.ActivityMetaOverrides !== null
    ? ans!.ActivityMetaOverrides!
    : {};
  const activityNotes = typeof ans?.ActivityNotes === 'object' && ans?.ActivityNotes !== null
    ? ans!.ActivityNotes!
    : {};

  return {
    ...base,
    ...ans,
    Influence: influence,
    Goals: goals,
    Diet: diet,
    SkinProblems: skinProblems,
    HairProblems: hairProblems,
    PhysicalActivities: physicalActivities,
    ActivityFrequency: activityFrequency,
    SelectedActivities: selectedActivities,
    ActivityMetaOverrides: activityMetaOverrides,
    ActivityNotes: activityNotes,
    events,
  } as UserModel;
}

function ensureSessionIdValue(current?: unknown): string {
  if (typeof current === 'string') {
    const trimmed = current.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  // When running on the server we can't access sessionStorage; return empty string
  if (typeof window === 'undefined') {
    return '';
  }
  return getOrCreateSessionId();
}

function ensureEventsArray(events?: UserModel['events'] | null): UserModel['events'] {
  return Array.isArray(events) ? events : [];
}

function isBlankSessionId(value: unknown): boolean {
  return !(typeof value === 'string' && value.trim().length > 0);
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      answers: (() => {
        const cloned = cloneInitialAnswers();
        const sessionId = ensureSessionIdValue(cloned.sessionId);
        return normalizeAnswers({ ...cloned, sessionId, events: ensureEventsArray(cloned.events) });
      })(),
      analysis: null,
      uiSnapshots: {},
      currentStep: 0,
      totalSteps: 37, // Reduced by 1 after removing Gender step
      isTransitioning: false,
      get sessionId() {
        return getOrCreateSessionId();
      },

      hydrate: () => {
        set((state) => {
          const normalized = normalizeAnswers(state.answers);
          const sessionId = ensureSessionIdValue(normalized.sessionId);
          const events = ensureEventsArray(normalized.events);
          return {
            ...state,
            answers: {
              ...normalized,
              sessionId,
              events,
            },
          };
        })
      },

      setAnalysis: (model) => set(() => ({ analysis: model })),

      saveUiSnapshot: (key, data) => set((state) => ({
        uiSnapshots: { ...state.uiSnapshots, [key]: data }
      })),

      getUiSnapshot: (key) => get().uiSnapshots[key],

      setAnswer: (field, value) => {
        const state = get();
        const sessionId = ensureSessionIdValue(state.answers.sessionId);
        const existingEvents = ensureEventsArray(state.answers.events);
  const shouldPersistSession = isBlankSessionId(state.answers.sessionId);

        // Avoid emitting events when value is unchanged (for primitives)
        const prev = (state.answers as any)[field];
        const isPrimitive = (v: any) => v === null || ['string','number','boolean','undefined'].includes(typeof v);
        if (isPrimitive(prev) && isPrimitive(value) && prev === value) {
          return;
        }

        const newAnswers = {
          ...state.answers,
          sessionId,
          [field]: value,
        };
        
        // Create event for answer change
        const event = {
          eventName: 'answerChanged',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: {
            field,
            value: typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
              ? value
              : Array.isArray(value)
                ? { type: 'array', length: value.length }
                : value && typeof value === 'object'
                  ? { type: 'object', keys: Object.keys(value).slice(0, 10) }
                  : value
          }
        };
        
        // Update local UI state immediately (no awaiting network)
        set(() => ({
          answers: { ...newAnswers, events: appendEvent(existingEvents, event) }
        }));

        // Fire-and-forget analytics to avoid blocking UI
        queueAnalyticsSend(get, [event]);

        if (shouldPersistSession && sessionId) {
          safeSessionSetItem('quizSessionId', sessionId);
        }
      },

      // Dedicated setter for primaryColor with consistent analytics
      setPrimaryColor: (color) => {
        const state = get();
        const sessionId = ensureSessionIdValue(state.answers.sessionId);
        const existingEvents = ensureEventsArray(state.answers.events);
        const shouldPersistSession = isBlankSessionId(state.answers.sessionId);

        const newAnswers: UserModel = {
          ...state.answers,
          sessionId,
          primaryColor: color,
        };

        const event = {
          eventName: 'answerChanged',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { field: 'primaryColor', value: color },
        };

        set(() => ({
          answers: { ...newAnswers, events: appendEvent(existingEvents, event) },
        }));

        queueAnalyticsSend(get, [event]);

        if (shouldPersistSession && sessionId) {
          safeSessionSetItem('quizSessionId', sessionId);
        }
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

      nextStep: () => {
        const state = get();
        const newStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
  const sessionId = ensureSessionIdValue(state.answers.sessionId);
        const existingEvents = ensureEventsArray(state.answers.events);
        
        // Create event for step completion
        const event = {
          eventName: 'stepCompleted',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { nextStep: newStep }
        };
        
        // Update local state immediately
        set(() => ({
          currentStep: newStep,
          answers: { ...state.answers, sessionId, events: appendEvent(existingEvents, event) }
        }));

        // Non-blocking analytics
        queueAnalyticsSend(get, [event]);
      },

      prevStep: () => {
        const state = get();
        const newStep = Math.max(state.currentStep - 1, 0);
  const sessionId = ensureSessionIdValue(state.answers.sessionId);
        const existingEvents = ensureEventsArray(state.answers.events);
        
        // Create event for step navigation
        const event = {
          eventName: 'stepNavigated',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { nextStep: newStep, direction: 'previous' }
        };
        
        // Update local state immediately
        set(() => ({
          currentStep: newStep,
          answers: { ...state.answers, sessionId, events: appendEvent(existingEvents, event) }
        }));

        // Non-blocking analytics
        queueAnalyticsSend(get, [event]);
      },

      goToStep: (step) => {
        const state = get();
        const target = Math.max(0, Math.min(step, state.totalSteps - 1));
        // No-op if target step equals current to avoid event spam/loops
        if (target === state.currentStep) {
          return;
        }

        const sessionId = ensureSessionIdValue(state.answers.sessionId);
        const existingEvents = ensureEventsArray(state.answers.events);

        // Create event for step jump
        const event = {
          eventName: 'stepJumped',
          timestamp: new Date().toISOString(),
          step: state.currentStep,
          details: { targetStep: target }
        };

        // Update local state immediately
        set(() => ({
          currentStep: target,
          answers: { ...state.answers, sessionId, events: appendEvent(existingEvents, event) }
        }));

        // Non-blocking analytics
        if (!isBlankSessionId(sessionId)) {
          Promise.resolve(saveOnboardingSession(sessionId, [event], state.answers.Id)).catch((error) => {
            console.warn('Non-blocking: failed to send onboarding event', error);
          });
        }
      },

      resetQuiz: () =>
        set(() => {
          const cloned = cloneInitialAnswers();
          const sessionId = ensureSessionIdValue(cloned.sessionId);
          return {
            answers: normalizeAnswers({ ...cloned, sessionId, events: ensureEventsArray(cloned.events) }),
            currentStep: 0,
          };
        }),

      completeOnboarding: () =>
        set((state) => ({
          answers: {
            ...state.answers,
            onboardingComplete: true,
          },
        })),

      generateSessionId: () => {
        const sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        safeSessionSetItem('quizSessionId', sid);
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
          answers: {
            ...state.answers,
            sessionId: ensureSessionIdValue(state.answers.sessionId),
            events: appendEvent(state.answers.events, event)
          }
        }));
      },
    }),
    {
      name: 'beauty-quiz-storage-v2', // New version to avoid conflicts with old structure
      storage: onboardingStorage,
      skipHydration: false,
      onRehydrateStorage: () => (state, error) => {
        // Normalize after persist rehydration to guarantee arrays exist
        if (!error && state) {
          try {
            const normalized = normalizeAnswers((state as any).answers);
            (state as any).answers = normalized;
          } catch (e) {
            // no-op; keep state as-is
          }
        }
      },
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        analysis: state.analysis, // persist analysis so step 34 doesn't disappear
        uiSnapshots: state.uiSnapshots, // persist UI snapshots
      }),
    }
  )
)

