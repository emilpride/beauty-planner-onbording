"use client"

import { useMemo, useState } from 'react'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useLatestAIAnalysis } from '@/hooks/useAIAnalysis'
import { useUpdatesSince } from '@/hooks/useUpdates'
import { useMoodsInRange } from '@/hooks/useMoods'
import {
  activitiesCompletedData,
  calendarStats,
  completionRateData,
  computeGeneralStats,
  getStartDate,
  moodLineData,
  type PeriodOption,
} from '@/lib/report'
import { ReportCard } from '@/components/report/ReportCard'
import { ActivityStats } from '@/components/report/ActivityStats'
import { ActivitiesCompletedChart } from '@/components/report/charts/ActivitiesCompletedChart'
import { CompletionRateChart } from '@/components/report/charts/CompletionRateChart'
import { CalendarStatsCard } from '@/components/report/CalendarStats'
import { MoodChart } from '@/components/report/charts/MoodChart'
import { uploadReportPhoto } from '@/lib/storage'
import { recordPhotoUpload } from '@/lib/aiAnalysis'
import { useAnalysisUploads } from '@/hooks/useAnalysisUploads'
import { useEffect } from 'react'

export default function ReportPage() {
  const { user } = useAuth()

  // Period state (mirrors Flutter defaults)
  const [activityPeriod, setActivityPeriod] = useState<PeriodOption>('This Week')
  const [completionPeriod, setCompletionPeriod] = useState<PeriodOption>('Last 6 Months')
  const [moodPeriod, setMoodPeriod] = useState<PeriodOption>('This Week')
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // Fetch AI overview (for BMS card)
  const { data: ai, isLoading: loadingAI, refetch: refetchAI } = useLatestAIAnalysis(user?.uid)
  const { data: uploads } = useAnalysisUploads(user?.uid)

  // If any recent upload is marked completed/ready, refresh the latest AI analysis
  useEffect(() => {
    if (!uploads) return
    const hasReady = uploads.some((u) => {
      const s = (u.status || '').toLowerCase()
      return s.includes('ready') || s.includes('complete') || s.includes('success') || s === 'done'
    })
    if (hasReady) {
      void refetchAI()
    }
  }, [uploads, refetchAI])

  // Determine earliest data window to fetch updates once
  const earliest = useMemo(() => {
    const a = getStartDate(activityPeriod)
    const c = getStartDate(completionPeriod)
    const m = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    return [a, c, m].sort((x, y) => x.getTime() - y.getTime())[0]
  }, [activityPeriod, completionPeriod, calendarMonth])

  const { data: updates } = useUpdatesSince(user?.uid, earliest)

  // Moods fetch window based on selected period
  const moodsStart = useMemo(() => getStartDate(moodPeriod), [moodPeriod])
  const { data: moods } = useMoodsInRange(user?.uid, moodsStart, new Date())

  const instances = useMemo(() => updates?.items ?? [], [updates?.items])
  const general = useMemo(() => computeGeneralStats(instances), [instances])

  const actData = useMemo(() => activitiesCompletedData(instances, activityPeriod), [instances, activityPeriod])
  const compData = useMemo(() => completionRateData(instances, completionPeriod), [instances, completionPeriod])
  const calStats = useMemo(() => calendarStats(instances, calendarMonth), [instances, calendarMonth])
  const moodData = useMemo(() => moodLineData(moods ?? [], moodPeriod), [moods, moodPeriod])

  const monthLabel = useMemo(
    () => calendarMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
    [calendarMonth],
  )

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Report</h1>

        {/* BMS overview */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ReportCard>
            <div className="text-sm opacity-70">BMS</div>
            <div className="text-3xl font-bold mt-1">
              {loadingAI ? '…' : ai ? round(ai.bms_score) : '—'}
            </div>
          </ReportCard>
          <ReportCard>
            <div className="text-sm opacity-70">BMI</div>
            <div className="text-3xl font-bold mt-1">{loadingAI ? '…' : ai ? round(ai.bmi) : '—'}</div>
            <div className="text-sm opacity-70">Score: {loadingAI ? '…' : ai ? round(ai.bmi_score) : '—'}</div>
          </ReportCard>
          <ReportCard>
            <div className="text-sm opacity-70">Updated</div>
            <div className="text-lg mt-1">{ai?.date ? ai.date.toLocaleString() : '—'}</div>
          </ReportCard>
        </div>

        {/* Photo upload for analysis */}
        <div className="mt-6">
          <ReportCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm opacity-70">Skin analysis</div>
                <div className="text-lg font-semibold mt-1">Upload a photo</div>
              </div>
              <UploadButton userId={user?.uid ?? null} />
            </div>
            <UploadsList uploads={uploads ?? []} />
          </ReportCard>
        </div>

        {/* Activity stats */}
        <div className="mt-6">
          <ActivityStats
            completionRate={general.overallCompletionRate}
            activitiesCompleted={general.totalActivitiesCompleted}
            perfectDays={general.currentStreak}
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-4">
          <ActivitiesCompletedChart period={activityPeriod} onChange={(v) => setActivityPeriod(v as PeriodOption)} data={actData} />
          <CompletionRateChart period={completionPeriod} onChange={(v) => setCompletionPeriod(v as PeriodOption)} data={compData} />
          <CalendarStatsCard
            monthLabel={monthLabel}
            onMonthChange={(label) => {
              const parsed = new Date(label)
              if (!isNaN(parsed.getTime())) setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
            }}
            stats={calStats}
            monthDate={calendarMonth}
          />
          <MoodChart period={moodPeriod} onChange={(v) => setMoodPeriod(v as PeriodOption)} data={moodData} />
        </div>
      </PageContainer>
    </Protected>
  )
}

function round(n: number, d = 2) {
  return Number(n.toFixed(d))
}

function UploadButton({ userId }: { userId: string | null }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onPick() {
    if (!userId) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        setBusy(true)
        setMsg('Uploading…')
        const { path, url } = await uploadReportPhoto(userId, file)
        await recordPhotoUpload(userId, path, url)
        setMsg('Uploaded. Analysis will appear when ready.')
      } catch (e) {
        console.error(e)
        setMsg('Upload failed')
      } finally {
        setBusy(false)
      }
    }
    input.click()
  }

  return (
    <div className="flex items-center gap-3">
      <button className="btn" disabled={!userId || busy} onClick={onPick}>
        {busy ? 'Uploading…' : 'Choose photo'}
      </button>
      {msg && <span className="text-sm opacity-70">{msg}</span>}
    </div>
  )
}

function UploadsList({ uploads }: { uploads: { id: string; status: string; createdAt?: Date; path: string }[] }) {
  if (!uploads || uploads.length === 0) return null
  return (
    <div className="mt-4">
      <div className="text-sm opacity-70 mb-1">Recent uploads</div>
      <ul className="space-y-1">
        {uploads.map((u) => (
          <li key={u.id} className="text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor(u.status) }}
              aria-label={u.status}
            />
            <span className="font-medium capitalize">{u.status || 'uploaded'}</span>
            <span className="opacity-60">
              {u.createdAt ? '· ' + u.createdAt.toLocaleString() : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function statusColor(status: string) {
  const s = (status || '').toLowerCase()
  if (s.includes('ready') || s.includes('complete') || s.includes('success') || s === 'done') return '#22c55e' // green
  if (s.includes('process') || s.includes('queue')) return '#f59e0b' // amber
  if (s.includes('fail') || s.includes('error')) return '#ef4444' // red
  return '#64748b' // slate
}
