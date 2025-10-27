"use client"

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useActivities } from '@/hooks/useActivities'
import { getActivityMeta } from '@/data/activityMeta'

function hexToRgba(hex?: string | null, a = 1) {
  if (!hex || !hex.startsWith('#')) return `rgba(163,133,233,${a})`
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-text-primary mb-3">{title}</h2>
      <div className="text-sm leading-6 text-text-primary/90">{children}</div>
    </section>
  )
}

function buildDefaultSteps(category?: string, name?: string): string[] {
  const c = (category || '').toLowerCase()
  if (c.includes('skin')) {
    return [
      'Cleanse your face with lukewarm water and a gentle cleanser.',
      'Apply toner with a cotton pad and let it absorb.',
      'Use a targeted serum and massage in upward motions.',
      'Seal with moisturizer; dab eye cream if used.',
      'Finish with SPF if performed in the daytime.',
    ]
  }
  if (c.includes('hair')) {
    return [
      'Brush hair gently to detangle and distribute oils.',
      'Apply treatment (mask/serum) focusing on mid-lengths and ends.',
      'Massage scalp for 1–2 minutes to boost circulation.',
      'Rinse or leave-in based on product instructions.',
      'Style with heat protection if using hot tools.',
    ]
  }
  if (c.includes('mental')) {
    return [
      'Find a calm spot and set a timer (5–10 minutes).',
      'Close eyes and take 5 deep breaths through the nose.',
      'Focus attention on your breath; label thoughts gently and return.',
      'Optionally journal one gratitude and one intention for today.',
      'Conclude with a slow body scan and open your eyes.',
    ]
  }
  if (c.includes('physical')) {
    return [
      'Warm up for 2–3 minutes: neck rolls, shoulder circles, hip openers.',
      'Main set: 2–3 rounds of selected movements with controlled tempo.',
      'Keep steady breathing; avoid holding breath on effort.',
      'Cooldown with light stretching (hamstrings, chest, hip flexors).',
      'Hydrate and log how you feel afterwards.',
    ]
  }
  return [
    `Prepare for: ${name || 'your routine'}.`,
    'Read steps fully before starting; gather any needed tools.',
    'Follow each step mindfully at a comfortable pace.',
    'Note any reactions or improvements for next time.',
    'Celebrate completion—consistency beats intensity.',
  ]
}

function splitNoteToBlocks(note?: string) {
  if (!note) return [] as Array<{ type: 'p' | 'li'; text: string }>
  const lines = note.split(/\r?\n/)
  const out: Array<{ type: 'p' | 'li'; text: string }> = []
  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (/^[-*•]/.test(t)) out.push({ type: 'li', text: t.replace(/^[-*•]\s*/, '') })
    else out.push({ type: 'p', text: t })
  }
  return out
}

function ProcedureDetail() {
  const { user } = useAuth()
  const { data: activities } = useActivities(user?.uid)
  const sp = useSearchParams()
  const id = sp.get('id') || ''
  const activity = useMemo(() => (activities ?? []).find(a => a.id === id), [activities, id])

  const meta = getActivityMeta(activity?.categoryId || activity?.id || '', activity?.name)
  const color = activity?.color || meta.primary
  const grad = `linear-gradient(135deg, ${hexToRgba(color, 0.22)} 0%, ${hexToRgba(color, 0.08)} 100%)`

  const steps = activity?.note ? undefined : buildDefaultSteps(activity?.category, activity?.name)
  const noteBlocks = splitNoteToBlocks(activity?.note || '')
  const displayTime = activity?.time ? `${String(activity.time.hour).padStart(2,'0')}:${String(activity.time.minute).padStart(2,'0')}` : undefined
  const dateStr = sp.get('date') || undefined

  return (
    <div className="container-page py-6 space-y-8">
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <Link href="/dashboard" className="hover:text-text-primary">← Back to Dashboard</Link>
        <span>/</span>
        <span className="text-text-primary">Procedure</span>
      </div>

      <div className="bg-surface border border-border-subtle rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden" style={{ background: grad }}>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={meta.iconPath} alt={activity?.name || 'Activity'} width={44} height={44}
      className="rounded-full shadow-md icon-auto" style={{ backgroundColor: hexToRgba(color, 0.35) }} />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">{activity?.name || 'Activity'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
              {activity?.category && <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">{activity.category}</span>}
              {displayTime && <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Time: {displayTime}</span>}
              {dateStr && <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle">Date: {dateStr}</span>}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard" className="rounded-full px-3 py-2 text-sm bg-surface border border-border-subtle hover:bg-surface-hover">Close</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,560px),1fr] gap-6 items-start">
        <div className="space-y-6">
          <Section title="How to do it">
            {noteBlocks.length > 0 ? (
              <div>
                {noteBlocks.map((b, i) => b.type === 'p' ? (
                  <p key={i} className="mb-3 last:mb-0">{b.text}</p>
                ) : (
                  <ul key={i} className="list-disc pl-5 my-1">
                    <li>{b.text}</li>
                  </ul>
                ))}
              </div>
            ) : (
              <ol className="list-decimal pl-5 space-y-2">
                {steps!.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            )}
          </Section>

          <Section title="Tips">
            <ul className="list-disc pl-5 space-y-2">
              <li>Prepare everything you need in advance to maintain flow.</li>
              <li>Move slowly and breathe evenly—comfort over speed.</li>
              <li>Log what worked well to refine future sessions.</li>
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="What you’ll need">
            <ul className="list-disc pl-5 space-y-2">
              <li>Mirror and good lighting</li>
              <li>Towel or headband</li>
              <li>Products specific to this routine (if any)</li>
            </ul>
          </Section>
          <Section title="Safety & notes">
            <p>Stop if you experience discomfort or irritation. Patch-test new products on a small area first.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default function ProcedurePage() {
  return (
    <Suspense fallback={<div className="container-page py-10"><div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">Loading…</div></div>}>
      <ProcedureDetail />
    </Suspense>
  )
}
