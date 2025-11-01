import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import { calculateLevel } from '@/types/achievements'
import { getFirestoreDb } from '@/lib/firebase'

// V2 notification preferences: per-category delivery channels (procedures, mood)
export interface ChannelPrefs { push: boolean; email: boolean }
export interface NotificationPrefs {
  procedures: ChannelPrefs
  mood: ChannelPrefs
  weeklyEmail: boolean
  // legacy fields can exist in Firestore; we don't expose them in the public type
  updatedAt?: Date
}

const DEFAULT_PREFS: NotificationPrefs = {
  procedures: { push: false, email: false },
  mood: { push: false, email: false },
  weeklyEmail: false,
}

export async function fetchNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  type RawPrefs = {
    procedures?: { push?: unknown; email?: unknown }
    mood?: { push?: unknown; email?: unknown }
    weeklyEmail?: unknown
    WeeklyEmail?: unknown
    mobilePush?: unknown
    emailReminders?: unknown
    Procedures?: { Push?: unknown; Email?: unknown }
    Mood?: { Push?: unknown; Email?: unknown }
  }
  const data = snap.data() as { NotificationPrefs?: RawPrefs } | undefined
  const prefs: RawPrefs = (data?.NotificationPrefs ?? {}) as RawPrefs

  // Backward compatibility: if nested objects are missing, derive from legacy booleans
  const legacyPush = Boolean(prefs.mobilePush)
  const legacyEmail = Boolean(prefs.emailReminders)

  const normalized: NotificationPrefs = {
    procedures: {
      push: Boolean(prefs.procedures?.push ?? prefs.Procedures?.Push ?? legacyPush ?? DEFAULT_PREFS.procedures.push),
      email: Boolean(prefs.procedures?.email ?? prefs.Procedures?.Email ?? legacyEmail ?? DEFAULT_PREFS.procedures.email),
    },
    mood: {
      push: Boolean(prefs.mood?.push ?? prefs.Mood?.Push ?? legacyPush ?? DEFAULT_PREFS.mood.push),
      email: Boolean(prefs.mood?.email ?? prefs.Mood?.Email ?? legacyEmail ?? DEFAULT_PREFS.mood.email),
    },
    weeklyEmail: Boolean(prefs.weeklyEmail ?? prefs.WeeklyEmail ?? DEFAULT_PREFS.weeklyEmail),
  }
  return normalized
}

export async function saveNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  // Also set legacy aggregate flags for backwards compatibility: any category enabling sets the legacy flag
  const legacyEmail = !!(prefs.procedures.email || prefs.mood.email)
  const legacyPush = !!(prefs.procedures.push || prefs.mood.push)
  await setDoc(ref, {
    NotificationPrefs: {
      procedures: { push: !!prefs.procedures.push, email: !!prefs.procedures.email },
      mood: { push: !!prefs.mood.push, email: !!prefs.mood.email },
      weeklyEmail: !!prefs.weeklyEmail,
      // legacy mirrors
      emailReminders: legacyEmail,
      mobilePush: legacyPush,
      updatedAt: serverTimestamp(),
    },
  }, { merge: true })
}

export async function fetchUserTimezone(userId: string): Promise<string | null> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as Record<string, unknown> | undefined
  const tz = (data?.Timezone as string | undefined) || null
  return tz
}

export async function saveUserTimezone(userId: string, timezone: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  await setDoc(ref, { Timezone: timezone, TimezoneUpdatedAt: serverTimestamp() }, { merge: true })
}

// Language & Region
export interface LocalePrefs { language: string; region: string }

export async function fetchUserLocale(userId: string): Promise<LocalePrefs> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as Record<string, unknown> | undefined
  const language = (data?.Language as string | undefined) ?? 'en'
  const region = (data?.Region as string | undefined) ?? 'us'
  return { language, region }
}

export async function saveUserLocale(userId: string, locale: LocalePrefs): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  await setDoc(
    ref,
    { Language: locale.language, Region: locale.region, LocaleUpdatedAt: serverTimestamp() },
    { merge: true },
  )
}

// Calendar & Schedule
export type WeekStart = 'monday' | 'sunday'
export interface DaySections { morning: string; afternoon: string; evening: string }
export interface SchedulePrefs { weekStart: WeekStart; vacation: boolean; daySections: DaySections }

const DEFAULT_SCHEDULE: SchedulePrefs = {
  weekStart: 'monday',
  vacation: false,
  daySections: { morning: '05:00', afternoon: '12:00', evening: '18:00' },
}

export async function fetchSchedulePrefs(userId: string): Promise<SchedulePrefs> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as { SchedulePrefs?: Partial<SchedulePrefs> } | undefined
  const raw = data?.SchedulePrefs || {}
  return {
    weekStart: (raw.weekStart === 'sunday' ? 'sunday' : 'monday'),
    vacation: Boolean(raw.vacation ?? DEFAULT_SCHEDULE.vacation),
    daySections: {
      morning: typeof raw.daySections?.morning === 'string' ? raw.daySections!.morning : DEFAULT_SCHEDULE.daySections.morning,
      afternoon: typeof raw.daySections?.afternoon === 'string' ? raw.daySections!.afternoon : DEFAULT_SCHEDULE.daySections.afternoon,
      evening: typeof raw.daySections?.evening === 'string' ? raw.daySections!.evening : DEFAULT_SCHEDULE.daySections.evening,
    },
  }
}

export async function saveSchedulePrefs(userId: string, prefs: SchedulePrefs): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  await setDoc(
    ref,
    {
      SchedulePrefs: {
        weekStart: prefs.weekStart,
        vacation: !!prefs.vacation,
        daySections: {
          morning: prefs.daySections.morning,
          afternoon: prefs.daySections.afternoon,
          evening: prefs.daySections.evening,
        },
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true },
  )
}

// Assistant selection (kept compatible with mobile onboarding: field name 'Assistant', 1=Max, 2=Ellie)
export type AssistantId = 1 | 2

export async function fetchAssistant(userId: string): Promise<AssistantId | null> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = snap.data() as Record<string, unknown> | undefined
  const val = data?.Assistant
  if (typeof val === 'number' && (val === 1 || val === 2)) return val
  return null
}

export async function saveAssistant(userId: string, assistant: AssistantId): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const payload = { Assistant: assistant, AssistantUpdatedAt: serverTimestamp() }
  await setDoc(ref, payload, { merge: true })
}

// Personal Info
export type Gender = 'male' | 'female' | 'other' | ''
export interface UserProfile {
  fullName: string
  email: string
  gender: Gender
  birthDate: string | null // ISO yyyy-mm-dd
  ageNumber?: number | null
  photoUrl?: string | null
}

export interface UserStats {
  level: number
  currentStreak: number
  completionRate: number // 0..1
  activitiesCompleted: number
  perfectDays: number
  totalActivities: number
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = (snap.data() as Record<string, unknown>) || {}
  const asString = (v: unknown) => (typeof v === 'string' ? v : '')
  const fullName = asString(data['FullName']) || asString(data['Name']) || asString(data['DisplayName'])
  const email = asString(data['Email']) || asString(data['email'])
  // Normalize gender from multiple possible shapes (string/number/booleans, different keys)
  const toGender = (val: unknown): Gender => {
    if (typeof val === 'string') {
      const g = val.trim().toLowerCase()
      if (['male','man','men','m','муж','мужской'].includes(g)) return 'male'
      if (['female','woman','women','f','жен','женский'].includes(g)) return 'female'
      if (['other','unknown','другое','иной','x','u','n/a','na','unspecified'].includes(g)) return 'other'
      // Sometimes numbers are encoded as strings
      if (g === '1') return 'male'
      if (g === '2') return 'female'
      return ''
    }
    if (typeof val === 'number') {
      if (val === 1) return 'male'
      if (val === 2) return 'female'
      return ''
    }
    if (typeof val === 'boolean') {
      // Prefer true=male for IsMale; for IsFemale, true=female will be handled separately by key order
      return val ? 'male' : ''
    }
    return ''
  }
  // Try a list of known fields in priority order
  const genderKeys: string[] = [
    'Gender', 'gender', 'Sex', 'sex',
    'GenderText', 'GenderLabel',
    'GenderCode', 'GenderNumeric', 'GenderValue',
    'IsMale', 'IsFemale'
  ]
  let gender: Gender = ''
  for (const key of genderKeys) {
    const v = (data as Record<string, unknown>)[key]
    const mapped = toGender(v)
    if (mapped) {
      // Special-case IsFemale boolean
      if ((key === 'IsFemale' || key === 'isFemale') && typeof v === 'boolean') {
        gender = v ? 'female' : ''
      } else {
        gender = mapped
      }
      if (gender) break
    }
  }
  const bd = data['BirthDate'] || data['Birthday'] || data['DateOfBirth'] || data['DOB']
  let birthDate: string | null = null
  if (typeof bd === 'string' && /\d{4}-\d{2}-\d{2}/.test(bd)) birthDate = bd
  // support firestore Timestamp
  const isTimestamp = (v: unknown): v is Timestamp => !!v && typeof (v as Timestamp).toDate === 'function'
  if (!birthDate && isTimestamp(bd)) {
    const d = bd.toDate()
    birthDate = d.toISOString().slice(0, 10)
  }
  const ageVal = data['Age']
  const ageNumber = typeof ageVal === 'number' ? ageVal : Number(ageVal as unknown) || null
  const photoUrl = asString(
    (data['ProfilePicture'] as string) || (data['ProfileImage'] as string) || (data['ProfilePhoto'] as string) ||
    (data['Avatar'] as string) || (data['AvatarUrl'] as string) || (data['AvatarURL'] as string) ||
    (data['PhotoURL'] as string) || (data['PhotoUrl'] as string) || (data['photoURL'] as string)
  ) || null
  return { fullName, email, gender, birthDate, ageNumber, photoUrl }
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  // Build payload with optional photo fields only when provided, to avoid overwriting unintentionally
  const payload: Record<string, unknown> = {
    FullName: profile.fullName,
    Email: profile.email,
    Gender: profile.gender,
    // Back-compat numeric mirrors for other clients
    GenderCode: profile.gender === 'male' ? 1 : profile.gender === 'female' ? 2 : 0,
    GenderNumeric: profile.gender === 'male' ? 1 : profile.gender === 'female' ? 2 : 0,
    GenderValue: profile.gender === 'male' ? 1 : profile.gender === 'female' ? 2 : 0,
    BirthDate: profile.birthDate || null,
    ProfileUpdatedAt: serverTimestamp(),
  }
  // Support multiple legacy-compatible fields for photo URL so other clients can pick it up
  if (Object.prototype.hasOwnProperty.call(profile, 'photoUrl')) {
    const url = profile.photoUrl ?? null
    payload['PhotoURL'] = url
    payload['PhotoUrl'] = url
    payload['ProfilePicture'] = url
    payload['AvatarUrl'] = url
    payload['AvatarURL'] = url
    payload['ProfileImage'] = url
    payload['ProfilePhoto'] = url
    payload['PhotoUpdatedAt'] = serverTimestamp()
  }
  await setDoc(ref, payload, { merge: true })
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const db = getFirestoreDb()
  const ref = doc(db, 'users_v2', userId)
  const snap = await getDoc(ref)
  const data = (snap.data() as Record<string, unknown>) || {}
  const asNum = (v: unknown, def = 0) => (typeof v === 'number' ? v : Number(v ?? def) || def)
  const asPct = (v: unknown) => {
    const n = asNum(v, 0)
    return n > 1 ? Math.min(1, n / 100) : Math.max(0, n)
  }
  const totalCompleted = asNum(
    (data['ActivitiesCompleted'] as number) ?? (data['TotalCompletedActivities'] as number) ?? (data['CompletedActivities'] as number) ?? (data['CompletedTotal'] as number),
    0,
  )
  const lvlRaw = asNum(data['Level'], 0)
  const level = lvlRaw > 0 ? lvlRaw : calculateLevel(totalCompleted)
  return {
    level,
    currentStreak: asNum(data['CurrentStreak'], 0),
    completionRate: asPct(data['CompletionRate']),
    activitiesCompleted: totalCompleted,
    perfectDays: asNum(data['PerfectDays'] ?? data['TotalPerfectDays'], 0),
    totalActivities: asNum(data['TotalActivities'], totalCompleted),
  }
}
