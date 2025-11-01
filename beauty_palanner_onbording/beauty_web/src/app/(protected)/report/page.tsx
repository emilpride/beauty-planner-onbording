"use client"

import { useMemo, useState, useEffect } from 'react'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'
import { useLatestAIAnalysis } from '@/hooks/useAIAnalysis'
import { useUpdatesInDateRange } from '@/hooks/useUpdates'
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
import { BMSCard } from '@/components/report/BMSCard'
import { CurrentStreakCard } from '@/components/report/CurrentStreakCard'
import { ActivitiesCompletedChart } from '@/components/report/charts/ActivitiesCompletedChart'
import { CompletionRateChart } from '@/components/report/charts/CompletionRateChart'
import { CalendarStatsCard } from '@/components/report/CalendarStats'
import { MoodChart } from '@/components/report/charts/MoodChart'
// removed unused imports
import { useAnalysisUploads } from '@/hooks/useAnalysisUploads'
import { useMetrics, useSaveMetrics } from '@/hooks/useUserMetrics'
import BMICard from '@/components/report/BMICard'

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
  const { data: metrics } = useMetrics(user?.uid)
  const saveMetrics = useSaveMetrics()

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

  // Determine earliest data window to fetch updates once for charts/calendar
  const earliest = useMemo(() => {
    const a = getStartDate(activityPeriod)
    const c = getStartDate(completionPeriod)
    const m = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    return [a, c, m].sort((x, y) => x.getTime() - y.getTime())[0]
  }, [activityPeriod, completionPeriod, calendarMonth])

  const { data: updates } = useUpdatesInDateRange(user?.uid, earliest, new Date())
  // Fetch all-time updates for header stats (streak, all-time completion, perfect days)
  const { data: updatesAll } = useUpdatesInDateRange(user?.uid, new Date(2000, 0, 1), new Date())

  // Moods fetch window based on selected period
  const moodsStart = useMemo(() => getStartDate(moodPeriod), [moodPeriod])
  const { data: moods } = useMoodsInRange(user?.uid, moodsStart, new Date())

  const instances = useMemo(() => updates?.items ?? [], [updates?.items])
  const instancesAll = useMemo(() => updatesAll?.items ?? [], [updatesAll?.items])
  const general = useMemo(() => computeGeneralStats(instancesAll), [instancesAll])

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
        {/* Debug overlay when ?debug=report */}
        {(() => {
          try {
            const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
            const show = params?.get('debug') === 'report'
            if (!show) return null
          } catch { /* ignore */ }
          const sample = (instancesAll.slice(0, 3) || []).map((i) => ({ id: i.id, date: i.date, status: i.status }))
          return (
            <pre className="mb-4 whitespace-pre-wrap text-xs rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200">
{`DEBUG report
updates (period): ${instances.length}
updates (all): ${instancesAll.length}
moods in range: ${(moods ?? []).length}
sample: ${JSON.stringify(sample, null, 2)}`}
            </pre>
          )
        })()}
        {/* Grid Layout matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Row 1: BMS Card & Current Streak */}
          <div className="xl:col-span-1">
            {(() => {
              const computedScore = metrics?.bms ?? (ai ? ai.bms_score : 7.2)
              const computedStatus = getStatusFromScore(computedScore)
              return (
                <BMSCard 
                  score={computedScore}
                  status={loadingAI ? 'Loading...' : computedStatus}
                  delta={metrics?.bmsDelta}
              description="Keep up with consistent routine!"
                />
              )
            })()}
          </div>

          {/* BMI Card */}
          <div className="xl:col-span-1">
            <BMICard
              bmi={metrics?.bmi ?? null}
              bmiCategory={metrics?.bmiCategory ?? null}
              bodyFatPct={metrics?.bodyFatPct ?? null}
              initialHeightCm={metrics?.heightCm}
              initialWeightKg={metrics?.weightKg}
              gender={metrics?.gender}
              disabled={!user || saveMetrics.isPending}
              onUpdate={(heightCm, weightKg) => {
                if (!user) return
                saveMetrics.mutate({ userId: user.uid, heightCm, weightKg })
              }}
            />
          </div>
          
          <div className="xl:col-span-1">
            <CurrentStreakCard 
              currentStreak={general.currentStreak}
              completionRate={Math.round((general.overallCompletionRate || 0) * 100)}
              activitiesCompleted={general.totalActivitiesCompleted}
              totalPerfectDays={general.totalPerfectDays}
            />
          </div>

          {/* Row 1 Col 3: Activities Completed Chart */}
          <div className="xl:col-span-1">
            <ActivitiesCompletedChart 
              period={activityPeriod} 
              onChange={(v) => setActivityPeriod(v as PeriodOption)} 
              data={actData} 
            />
          </div>

          {/* Row 2: Completion Rate Chart & Calendar Stats */}
          <div className="xl:col-span-1">
            <CompletionRateChart 
              period={completionPeriod} 
              onChange={(v) => setCompletionPeriod(v as PeriodOption)} 
              data={compData} 
            />
          </div>

          <div className="xl:col-span-1">
            <CalendarStatsCard
              monthLabel={monthLabel}
              onMonthChange={(label) => {
                const parsed = new Date(label)
                if (!isNaN(parsed.getTime())) setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
              }}
              stats={calStats}
              monthDate={calendarMonth}
            />
          </div>

          {/* Row 2 Col 3: Mood Chart */}
          <div className="xl:col-span-1">
            <MoodChart 
              period={moodPeriod} 
              onChange={(v) => setMoodPeriod(v as PeriodOption)} 
              data={moodData} 
            />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}

function getStatusFromScore(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Balanced'
  if (score >= 5) return 'Good'
  if (score >= 3) return 'Fair'
  return 'Needs Attention'
}

// remove unused helper
