import { getIconById } from './iconCatalog'

export interface ActivityMeta {
  name: string
  iconId: string
  primary: string
  surface: string
}

export interface ResolvedActivityMeta extends ActivityMeta {
  iconPath: string
}

export const FULL_WEEK: readonly number[] = [0, 1, 2, 3, 4, 5, 6] as const

const DEFAULT_ICON_ID = 'customization'
const DEFAULT_ICON_PATH = getIconById(DEFAULT_ICON_ID)?.path ?? '/custom-icons/misc/customization.svg'

const DEFAULT_META: ActivityMeta = {
  name: 'Custom Activity',
  iconId: DEFAULT_ICON_ID,
  primary: '#A385E9',
  surface: 'rgba(163,133,233,0.15)'
}

export const ACTIVITY_META: Record<string, ActivityMeta> = {
  'breathing-exercises': { name: 'Breathing Exercises', iconId: 'breathingExercises', primary: '#00AAFF', surface: 'rgba(0,170,255,0.2)' },
  'cardio-boost': { name: 'Cardio Boost', iconId: 'cardioBoost', primary: '#2600FF', surface: 'rgba(38,0,255,0.2)' },
  'cleanse-hydrate': { name: 'Cleanse & Hydrate', iconId: 'cleanseAndHydrate', primary: '#0080FF', surface: 'rgba(0,128,255,0.2)' },
  'cycling': { name: 'Cycling', iconId: 'cycling', primary: '#BCFF00', surface: 'rgba(188,255,0,0.2)' },
  'dance-it-out': { name: 'Dance It Out', iconId: 'danceItOut', primary: '#00FFFD', surface: 'rgba(0,255,253,0.2)' },
  'deep-hydration': { name: 'Deep Hydration', iconId: 'deepHydration', primary: '#FF001D', surface: 'rgba(255,0,29,0.2)' },
  'deep-nourishment': { name: 'Deep Nourishment', iconId: 'deepNourishment', primary: '#4D00FF', surface: 'rgba(76,0,255,0.2)' },
  'evening-stretch': { name: 'Evening Stretch', iconId: 'eveningStretch', primary: '#FF7200', surface: 'rgba(255,114,0,0.2)' },
  'exfoliate': { name: 'Exfoliate', iconId: 'exfoliate', primary: '#F7FF00', surface: 'rgba(246,255,0,0.2)' },
  'face-massage': { name: 'Face Massage', iconId: 'faceMassage', primary: '#B3FF00', surface: 'rgba(178,255,0,0.2)' },
  'gratitude-exercises': { name: 'Gratitude Exercises', iconId: 'gratitudeJournal', primary: '#77FF00', surface: 'rgba(119,255,0,0.2)' },
  'heat-protection': { name: 'Heat Protection', iconId: 'heatProtection', primary: '#FF007B', surface: 'rgba(255,0,123,0.2)' },
  'learn-grow': { name: 'Learn & Grow', iconId: 'learnGrow', primary: '#35FC77', surface: 'rgba(53,252,119,0.2)' },
  'lip-eye-care': { name: 'Lip & Eye Care', iconId: 'lipEyeCare', primary: '#2BFF00', surface: 'rgba(42,255,0,0.2)' },
  'mindful-meditation': { name: 'Mindful Meditation', iconId: 'mindfulMeditation', primary: '#D0FF00', surface: 'rgba(208,255,0,0.2)' },
  'mood-check-in': { name: 'Mood Check-In', iconId: 'moodCheckIn', primary: '#FFAE00', surface: 'rgba(255,174,0,0.2)' },
  'morning-stretch': { name: 'Morning Stretch', iconId: 'morningStretch', primary: '#0080FF', surface: 'rgba(0,128,255,0.2)' },
  'positive-affirmations': { name: 'Positive Affirmations', iconId: 'positiveAffirmations', primary: '#622CBF', surface: 'rgba(98,44,191,0.2)' },
  'post-color-care': { name: 'Post-Color Care', iconId: 'postColorCare', primary: '#D9FF00', surface: 'rgba(217,255,0,0.2)' },
  'posture-fix': { name: 'Posture Fix', iconId: 'postureFix', primary: '#F1FF00', surface: 'rgba(241,255,0,0.2)' },
  'scalp-detox': { name: 'Scalp Detox', iconId: 'scalpDetox', primary: '#EA00FF', surface: 'rgba(234,0,255,0.2)' },
  'scalp-massage': { name: 'Scalp Massage', iconId: 'scalpMassage', primary: '#FF2600', surface: 'rgba(255,38,0,0.2)' },
  'social-media-detox': { name: 'Social Media Detox', iconId: 'socialMediaDetox', primary: '#2CBFB8', surface: 'rgba(44,191,184,0.2)' },
  'spf-protection': { name: 'SPF Protection', iconId: 'spfProtection', primary: '#00FFA6', surface: 'rgba(0,255,166,0.2)' },
  'strength-training': { name: 'Strength Training', iconId: 'strengthTraining', primary: '#5F00FF', surface: 'rgba(95,0,255,0.2)' },
  'stress-relief': { name: 'Stress Relief', iconId: 'stressRelief', primary: '#FC356D', surface: 'rgba(252,53,109,0.2)' },
  'swimming-time': { name: 'Swimming Time', iconId: 'swimmingTime', primary: '#8CFF00', surface: 'rgba(140,255,0,0.2)' },
  'talk-it-out': { name: 'Talk It Out', iconId: 'talkItOut', primary: '#BF2C4C', surface: 'rgba(191,44,76,0.2)' },
  'trim-split-ends': { name: 'Trim Split Ends', iconId: 'trimSplitEnds', primary: '#FFBB00', surface: 'rgba(255,187,0,0.2)' },
  'wash-care': { name: 'Wash & Care', iconId: 'washCare', primary: '#00FFFF', surface: 'rgba(0,255,255,0.2)' },
  'yoga-flexibility': { name: 'Yoga & Flexibility', iconId: 'yogaFlexibility', primary: '#FF00E6', surface: 'rgba(255,0,230,0.2)' },
}

export const getActivityMeta = (activityId: string, fallbackName?: string): ResolvedActivityMeta => {
  const base = activityId.startsWith('custom-')
    ? { ...DEFAULT_META, name: fallbackName || DEFAULT_META.name }
    : ACTIVITY_META[activityId] || { ...DEFAULT_META, name: fallbackName || `Activity ${activityId}` }

  const iconEntry = getIconById(base.iconId) || getIconById(DEFAULT_ICON_ID)
  const iconPath = iconEntry?.path ?? DEFAULT_ICON_PATH
  const name = fallbackName ?? base.name

  return { ...base, name, iconPath }
}
