export interface AIAnalysisModel {
  id: string
  bmi: number
  bmi_score: number
  skin_condition_score: number
  skin_condition_explanation: string
  hair_condition_score: number
  hair_condition_explanation: string
  physical_condition_score: number
  physical_condition_explanation: string
  mental_condition_score: number
  mental_condition_explanation: string
  bms_score: number
  recommended_activities: string[]
  date: Date
}

export function parseAIAnalysis(data: Record<string, unknown>): AIAnalysisModel {
  const tsToDate = (v: unknown) =>
    (typeof v === 'object' && v !== null && 'toDate' in (v as { toDate?: unknown }) && typeof (v as { toDate?: unknown }).toDate === 'function'
      ? (v as { toDate: () => Date }).toDate()
      : typeof v === 'string'
        ? new Date(v)
        : new Date())
  const asNumber = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0))
  const asString = (v: unknown) => (typeof v === 'string' ? v : '')
  const asStringArray = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).map((x) => String(x)) : [])
  return {
    id: asString(data.id),
    bmi: asNumber(data.bmi),
    bmi_score: asNumber(data.bmi_score),
    skin_condition_score: asNumber(data.skin_condition_score),
    skin_condition_explanation: asString(data.skin_condition_explanation),
    hair_condition_score: asNumber(data.hair_condition_score),
    hair_condition_explanation: asString(data.hair_condition_explanation),
    physical_condition_score: asNumber(data.physical_condition_score),
    physical_condition_explanation: asString(data.physical_condition_explanation),
    mental_condition_score: asNumber(data.mental_condition_score),
    mental_condition_explanation: asString(data.mental_condition_explanation),
    bms_score: asNumber(data.bms_score),
    recommended_activities: asStringArray(data.recommended_activities),
    date: tsToDate(data.date ?? new Date()),
  }
}
