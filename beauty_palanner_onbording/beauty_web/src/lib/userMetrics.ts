import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import { parseTaskInstance, type TaskInstance } from '@/types/task'

export type UserMetricsDoc = {
  heightCm?: number
  weightKg?: number
  bmsBase?: number
}

function userDocRef(userId: string) {
  return doc(getFirestoreDb(), 'users_v2', userId)
}

export async function fetchUserMetrics(userId: string): Promise<UserMetricsDoc> {
  const ref = userDocRef(userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return {}
  const data = snap.data() as Record<string, unknown>
  const heightCm = typeof data['heightCm'] === 'number' ? (data['heightCm'] as number)
    : typeof data['HeightCm'] === 'number' ? (data['HeightCm'] as number)
    : typeof data['Height'] === 'number' ? (data['Height'] as number) : undefined
  const weightKg = typeof data['weightKg'] === 'number' ? (data['weightKg'] as number)
    : typeof data['WeightKg'] === 'number' ? (data['WeightKg'] as number)
    : typeof data['Weight'] === 'number' ? (data['Weight'] as number) : undefined
  const bmsBase = typeof data['bmsBase'] === 'number' ? (data['bmsBase'] as number)
    : typeof data['BmsBase'] === 'number' ? (data['BmsBase'] as number)
    : 7
  return { heightCm, weightKg, bmsBase }
}

export async function saveUserMetrics(userId: string, patch: Partial<UserMetricsDoc>): Promise<void> {
  const ref = userDocRef(userId)
  await setDoc(ref, patch, { merge: true })
}

export async function fetchAllUpdates(userId: string): Promise<TaskInstance[]> {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'users_v2'), userId), 'Updates')
  const qs = await getDocs(col)
  const out: TaskInstance[] = []
  qs.forEach(d => {
    const data = d.data() as Record<string, unknown>
    out.push(parseTaskInstance(d.id, data))
  })
  return out
}

export type BmsTimeseriesPoint = { date: string; delta: number; value: number }

export function calculateBmsTimeseries(
  base: number,
  updates: TaskInstance[],
): BmsTimeseriesPoint[] {
  // group by date
  const byDate = new Map<string, TaskInstance[]>()
  for (const u of updates) {
    if (!u.date) continue
    const list = byDate.get(u.date) || []
    list.push(u)
    byDate.set(u.date, list)
  }
  const dates = Array.from(byDate.keys()).sort()
  let prev = base
  const series: BmsTimeseriesPoint[] = []
  for (const ymd of dates) {
    const list = byDate.get(ymd) || []
    const completed = list.filter(u => u.status === 'completed').length
    const skipped = list.filter(u => u.status === 'skipped').length
    // Algorithm: each completed task gives +0.002; each skipped gives -0.003
    // Clamp daily delta between -0.02 and +0.02
    let delta = completed * 0.002 - skipped * 0.003
    if (delta > 0.02) delta = 0.02
    if (delta < -0.02) delta = -0.02
    const value = Math.max(0, Math.min(10, prev + delta))
    series.push({ date: ymd, delta, value })
    prev = value
  }
  return series
}

export function computeBmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg) return null
  const m = heightCm / 100
  if (m <= 0) return null
  return weightKg / (m * m)
}

export function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const d = new Date(birthDate)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return Math.max(0, age)
}

/**
 * Deurenberg equation for adult body fat % estimate from BMI, age, and sex.
 * sexFactor: male=1, female=0; for other/unknown assume 0.
 * Returns null if inputs are insufficient.
 */
export function computeBodyFatPct(bmi: number | null | undefined, age: number | null | undefined, gender: 'male' | 'female' | 'other' | '' | undefined): number | null {
  if (bmi == null || !Number.isFinite(bmi)) return null
  if (age == null || !Number.isFinite(age)) return null
  const sexFactor = gender === 'male' ? 1 : 0 // 'female' and others -> 0
  const pct = 1.20 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4
  if (!Number.isFinite(pct)) return null
  return Math.max(2, Math.min(70, pct))
}

export function formatBmiCategory(bmi: number | null): string {
  if (bmi == null) return '—'
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obesity'
}
