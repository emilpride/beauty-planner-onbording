import { getIconById, ICON_CATALOG, type IconCatalogEntry } from './iconCatalog'

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
  // Gender-specific additions
  'beard-shave-care': { name: 'Beard & Shave Care', iconId: 'washCare', primary: '#8F74E5', surface: 'rgba(143,116,229,0.2)' },
  'hair-loss-support': { name: 'Hair Loss Support', iconId: 'scalpMassage', primary: '#5C4688', surface: 'rgba(92,70,136,0.2)' },
  'leave-in-care': { name: 'Leave‑in Care', iconId: 'deepNourishment', primary: '#4D00FF', surface: 'rgba(76,0,255,0.2)' },
  'night-care-routine': { name: 'Night Care Routine', iconId: 'bedtime', primary: '#A385E9', surface: 'rgba(163,133,233,0.2)' },
}

export const getActivityMeta = (activityId: string, fallbackName?: string): ResolvedActivityMeta => {
  const isCustom = activityId.startsWith('custom-')

  // Slugify helper to resolve curated icons by readable names like "Cleanse & Hydrate" -> "cleanse-hydrate"
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  // Lightweight Levenshtein distance for fuzzy matching
  const levenshtein = (a: string, b: string) => {
    const m = a.length, n = b.length
    if (m === 0) return n
    if (n === 0) return m
    const dp = new Array(n + 1)
    for (let j = 0; j <= n; j++) dp[j] = j
    for (let i = 1; i <= m; i++) {
      let prev = i - 1
      dp[0] = i
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j]
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + (a[i - 1] === b[j - 1] ? 0 : 1)
        )
        prev = tmp
      }
    }
    return dp[n]
  }

  // Try to find an icon by fuzzy name match across id/label/search
  const findIconByFuzzyName = (name: string | undefined): IconCatalogEntry | undefined => {
    if (!name) return undefined
    const slug = slugify(name)
    if (!slug) return undefined

    // 1) exact id match
    const exact = ICON_CATALOG.find((e) => slug === slugify(e.id))
    if (exact) return exact

    // 2) exact label/search match
    const exactLabel = ICON_CATALOG.find((e) => slug === slugify(e.label) || e.search?.some((s) => slug === slugify(s)))
    if (exactLabel) return exactLabel

    // 3) includes
    const incl = ICON_CATALOG.find((e) => slugify(e.id).includes(slug) || slug.includes(slugify(e.id)) || slugify(e.label).includes(slug))
    if (incl) return incl

    // 4) fuzzy distance threshold
    let best: { e: IconCatalogEntry; d: number } | undefined
    for (const e of ICON_CATALOG) {
      const candidates = [e.id, e.label, ...(e.search || [])]
      for (const c of candidates) {
        const d = levenshtein(slug, slugify(c))
        if (!best || d < best.d) best = { e, d }
      }
    }
    const maxD = Math.max(2, Math.floor(slug.length * 0.25))
    return best && best.d <= maxD ? best.e : undefined
  }

  const nameSlug = fallbackName ? slugify(fallbackName) : undefined
  const nameSlugAlt = nameSlug ? nameSlug.replace(/-and-/g, '-') : undefined
  const curated =
    ACTIVITY_META[activityId]
    || (nameSlug ? ACTIVITY_META[nameSlug] : undefined)
    || (nameSlugAlt ? ACTIVITY_META[nameSlugAlt] : undefined)

  // Choose base meta:
  // - custom: default meta with fallback name if provided
  // - curated: use curated meta as-is
  // - unknown non-custom: default meta with fallback or generic name
  const base: ActivityMeta = isCustom
    ? { ...DEFAULT_META, name: fallbackName || DEFAULT_META.name }
    : curated
      ? curated
      : { ...DEFAULT_META, name: fallbackName || `Activity ${activityId}` }

  let iconEntry = getIconById(base.iconId)
  // If we didn't find a curated meta (using default icon), try fuzzy name resolution
  if (!curated) {
    const fuzzy = findIconByFuzzyName(fallbackName)
    if (fuzzy) iconEntry = fuzzy
  }
  if (!iconEntry) iconEntry = getIconById(DEFAULT_ICON_ID)
  const iconPath = iconEntry?.path ?? DEFAULT_ICON_PATH

  // Only use fallbackName to override when there is no curated entry (custom/unknown).
  const name = (!curated ? (fallbackName || base.name) : base.name)

  return { ...base, name, iconPath }
}
