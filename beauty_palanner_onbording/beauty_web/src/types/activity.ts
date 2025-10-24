export interface ActivityTime { hour: number; minute: number }

export type ActivityType = 'regular' | 'one_time' | 'calendar' | string

export interface Activity {
  id: string
  name: string
  category?: string
  categoryId?: string
  illustration?: string | null
  note?: string
  isRecommended?: boolean
  type: ActivityType
  activeStatus: boolean
  time?: ActivityTime | null
  frequency?: string
  selectedDays?: number[]
  weeksInterval?: number
  selectedMonthDays?: number[]
  notifyBefore?: string
  cost?: number
  color?: string | null // hex like #FFAABBCC
  enabledAt?: Date | null
  lastModifiedAt?: Date | null
  endBeforeUnit?: string | null
  endBeforeType?: 'date' | 'days' | string
  selectedEndBeforeDate?: Date | null
}

export function parseActivity(data: Record<string, unknown>): Activity {
  const asString = (v: unknown) => (typeof v === 'string' ? v : '')
  const asBool = (v: unknown) => (typeof v === 'boolean' ? v : Boolean(v))
  const asNumber = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0))
  const asDate = (v: unknown): Date | null =>
    typeof v === 'string' ? new Date(v) : null
  const asNumArray = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).map((x) => Number(x)) : [])
  const time = (v: unknown): ActivityTime | null => {
    if (!v || typeof v !== 'object') return null
    const t = v as { Hour?: unknown; Minute?: unknown }
    if (typeof t.Hour === 'undefined' || typeof t.Minute === 'undefined') return null
    return { hour: Number(t.Hour), minute: Number(t.Minute) }
  }

  return {
    id: asString(data['Id']),
    name: asString(data['Name']),
    category: asString(data['Category']),
    categoryId: asString(data['CategoryId']),
    illustration: asString(data['Illustration']) || null,
    note: asString(data['Note']),
    isRecommended: asBool(data['IsRecommended']),
    type: (asString(data['Type']) || 'regular') as ActivityType,
    activeStatus: asBool(data['ActiveStatus']),
  time: time((data as { [k: string]: unknown })['Time']),
    frequency: asString(data['Frequency']),
    selectedDays: asNumArray(data['SelectedDays']),
    weeksInterval: asNumber(data['WeeksInterval']) || 1,
    selectedMonthDays: asNumArray(data['SelectedMonthDays']),
    notifyBefore: asString(data['NotifyBefore']),
    cost: asNumber(data['Cost']),
    color: asString(data['Color']) || null,
    enabledAt: asDate(data['EnabledAt']),
    lastModifiedAt: asDate(data['LastModifiedAt']),
    endBeforeUnit: asString(data['EndBeforeUnit']) || null,
    endBeforeType: asString(data['EndBeforeType']) || 'date',
    selectedEndBeforeDate: asDate(data['SelectedEndBeforeDate']),
  }
}

export function toFirebaseActivity(a: Activity): Record<string, unknown> {
  const t: { Hour: number; Minute: number } | null = a.time ? { Hour: a.time.hour, Minute: a.time.minute } : null
  return {
    Id: a.id,
    Name: a.name,
    Category: a.category ?? '',
    CategoryId: a.categoryId ?? '',
    Illustration: a.illustration ?? '',
    Note: a.note ?? '',
    IsRecommended: a.isRecommended ?? false,
    Type: a.type ?? 'regular',
    ActiveStatus: a.activeStatus ?? false,
    Time: t,
    Frequency: a.frequency ?? '',
    SelectedDays: a.selectedDays ?? [],
    WeeksInterval: a.weeksInterval ?? 1,
    SelectedMonthDays: a.selectedMonthDays ?? [],
    NotifyBefore: a.notifyBefore ?? '',
    Cost: a.cost ?? 0,
    Color: a.color ?? '#FF7C4DFF',
    EnabledAt: a.enabledAt ? a.enabledAt.toISOString() : undefined,
    LastModifiedAt: a.lastModifiedAt ? a.lastModifiedAt.toISOString() : undefined,
    EndBeforeUnit: a.endBeforeUnit ?? '',
    EndBeforeType: a.endBeforeType ?? 'date',
    SelectedEndBeforeDate: a.selectedEndBeforeDate ? a.selectedEndBeforeDate.toISOString() : undefined,
  }
}
