import type { UserModel } from '@/store/quizStore'

export type GenderDetail = { code: number; text: 'male' | 'female' | 'other' | '' }

const MALE_TOKENS = ['male', 'man', 'men', 'm', 'муж', 'мужской']
const FEMALE_TOKENS = ['female', 'woman', 'women', 'f', 'жен', 'женский']

function getCategoryForActivity(id: string): string {
  const skinActivities = ['cleanse-hydrate', 'deep-hydration', 'vitamin-boost', 'overnight-repair', 'exfoliate-renew']
  const hairActivities = ['wash-care', 'deep-nourishment', 'scalp-massage', 'protective-style', 'hair-mask']
  const physicalActivities = ['morning-stretch', 'cardio-boost', 'strength-training', 'yoga-flow', 'evening-walk']
  const mentalActivities = ['mindful-meditation', 'breathing-exercises', 'gratitude-journal', 'digital-detox', 'power-nap']

  if (skinActivities.includes(id)) return 'skin'
  if (hairActivities.includes(id)) return 'hair'
  if (physicalActivities.includes(id)) return 'physical'
  if (mentalActivities.includes(id)) return 'mental'
  return 'skin'
}

export function buildActivitiesForFinalize(answers: UserModel) {
  const selectedIds = Array.isArray(answers.SelectedActivities) ? answers.SelectedActivities : []
  if (selectedIds.length === 0) return []

  const metaOverrides = answers.ActivityMetaOverrides || {}
  const notes = answers.ActivityNotes || {}

  return selectedIds.map((id: string) => {
    const meta = metaOverrides[id] || {}
    const note = notes[id] || ''
    const preConfig = (meta as any).preConfig || {}

    return {
      Id: id,
      id,
      Name: meta.name || id,
      name: meta.name || id,
      Note: note,
      note,
      Illustration: meta.iconId || '',
      illustration: meta.iconId || '',
      Category: getCategoryForActivity(id),
      category: getCategoryForActivity(id),
      CategoryId: id,
      categoryId: id,
      Color: meta.primary || '#FFA385E9',
      color: meta.primary || '#FFA385E9',
      ActiveStatus: true,
      active: true,
      Type: 'regular',
      type: 'regular',
      Frequency: preConfig.repeat === 'weekly' ? 'weekly' : preConfig.repeat === 'monthly' ? 'monthly' : 'daily',
      frequency: preConfig.repeat === 'weekly' ? 'weekly' : preConfig.repeat === 'monthly' ? 'monthly' : 'daily',
      SelectedDays: Array.isArray(preConfig.weekdays) ? preConfig.weekdays : [],
      selectedDays: Array.isArray(preConfig.weekdays) ? preConfig.weekdays : [],
      WeeksInterval: typeof preConfig.weeklyInterval === 'number' ? preConfig.weeklyInterval : 1,
      weeksInterval: typeof preConfig.weeklyInterval === 'number' ? preConfig.weeklyInterval : 1,
      SelectedMonthDays: Array.isArray(preConfig.monthlyDays) ? preConfig.monthlyDays : [],
      selectedMonthDays: Array.isArray(preConfig.monthlyDays) ? preConfig.monthlyDays : [],
      Time: preConfig.time ? { Hour: parseInt(preConfig.time.split(':')[0] || '7'), Minute: parseInt(preConfig.time.split(':')[1] || '0') } : { Hour: 7, Minute: 0 },
      time: preConfig.time || '07:00',
      NotifyBefore: '',
      notifyBefore: '',
      SelectedNotifyBeforeUnit: '',
      selectedNotifyBeforeUnit: '',
      SelectedNotifyBeforeFrequency: '',
      selectedNotifyBeforeFrequency: '',
      Cost: 0,
      cost: 0,
      IsRecommended: false,
      isRecommended: false,
      EnabledAt: new Date().toISOString(),
      enabledAt: new Date().toISOString(),
      LastModifiedAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
    }
  })
}

function parseNumberInput(value?: string | null): number | null {
  if (!value) return null
  const normalised = String(value).replace(/[^0-9.,-]/g, '').replace(',', '.')
  const parsed = Number(normalised)
  return Number.isFinite(parsed) ? parsed : null
}

function toHeightCm(heightValue?: string | null, unit?: 'cm' | 'ft&in' | null): number | null {
  if (!heightValue) return null
  const u = unit || 'cm'
  if (u === 'cm') {
    const numeric = parseNumberInput(heightValue)
    return numeric && numeric > 0 ? numeric : null
  }
  const match = heightValue.match(/(\d+)[^\d]+(\d+)?/)
  if (!match) return null
  const feet = Number(match[1])
  const inches = Number(match[2] ?? 0)
  const totalInches = feet * 12 + inches
  if (!Number.isFinite(totalInches) || totalInches <= 0) return null
  return parseFloat((totalInches * 2.54).toFixed(1))
}

function toWeightKg(weightValue?: string | null, unit?: 'kg' | 'lbs' | null): number | null {
  const numeric = parseNumberInput(weightValue)
  if (!numeric || numeric <= 0) return null
  return (unit || 'kg') === 'kg' ? numeric : parseFloat((numeric * 0.453592).toFixed(1))
}

function computeBmiValue(heightCm?: number | null, weightKg?: number | null): number | null {
  if (!heightCm || !weightKg) return null
  const meters = heightCm / 100
  if (!meters || meters <= 0) return null
  const bmi = weightKg / (meters * meters)
  return Number.isFinite(bmi) ? parseFloat(bmi.toFixed(1)) : null
}

function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const month = today.getMonth() - date.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) age -= 1
  return age >= 0 ? age : null
}

export function resolveGender(value: unknown): GenderDetail {
  if (typeof value === 'number') {
    if (value === 2) return { code: 2, text: 'female' }
    if (value === 1) return { code: 1, text: 'male' }
    if (value > 0) return { code: value, text: 'other' }
    return { code: 0, text: '' }
  }
  if (typeof value === 'string') {
    const norm = value.trim().toLowerCase()
    if (FEMALE_TOKENS.includes(norm)) return { code: 2, text: 'female' }
    if (MALE_TOKENS.includes(norm)) return { code: 1, text: 'male' }
    if (norm) return { code: 3, text: 'other' }
  }
  return { code: 0, text: '' }
}

export function buildFinalizeProfilePayload(answers: UserModel) {
  const activities = buildActivitiesForFinalize(answers)
  const genderDetail = resolveGender((answers as any)?.Gender)
  const birthDate = typeof answers.BirthDate === 'string' && /\d{4}-\d{2}-\d{2}/.test(answers.BirthDate)
    ? answers.BirthDate
    : null
  const explicitAge = typeof answers.Age === 'number' && Number.isFinite(answers.Age)
    ? answers.Age
    : null
  const inferredAge = explicitAge ?? ageFromBirthDate(birthDate)
  const heightCm = toHeightCm(answers.Height, (answers.HeightUnit as any) || 'cm')
  const weightKg = toWeightKg(answers.Weight, (answers.WeightUnit as any) || 'kg')
  const bmi = computeBmiValue(heightCm, weightKg)
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
  const profilePicture = answers.ProfilePicture || answers.FaceImageUrl || answers.HairImageUrl || ''

  const profile: Record<string, any> = {
    name: answers.Name || '',
    email: answers.Email || '',
    gender: genderDetail.text || undefined,
    genderLabel: genderDetail.text || undefined,
    genderCode: genderDetail.code || undefined,
    birthDate: birthDate || undefined,
    age: inferredAge ?? undefined,
    heightInput: answers.Height || undefined,
    heightUnit: answers.HeightUnit || undefined,
    heightCm: heightCm ?? undefined,
    weightInput: answers.Weight || undefined,
    weightUnit: answers.WeightUnit || undefined,
    weightKg: weightKg ?? undefined,
    bmi: bmi ?? undefined,
    timeFormat: answers.TimeFormat || undefined,
    wakeUp: answers.WakeUp || undefined,
    endDay: answers.EndDay || undefined,
    timezone: timezone || undefined,
    faceImageUrl: answers.FaceImageUrl || undefined,
    hairImageUrl: answers.HairImageUrl || undefined,
    photoUrl: profilePicture || undefined,
    profilePicture: profilePicture || undefined,
  }

  if (activities.length > 0) {
    profile['activities'] = activities
  }

  Object.keys(profile).forEach((key) => {
    const value = profile[key]
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '' && key !== 'name' && key !== 'email')) {
      delete profile[key]
    }
  })

  return profile
}
