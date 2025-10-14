'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect } from 'react'

export default function EndDayStep() {
  const { answers, setAnswer } = useQuizStore()

  useEffect(() => {
    // Lock to existing format from the first step; default to 12h if unset
    if (answers.TimeFormat !== '12h' && answers.TimeFormat !== '24h') {
      setAnswer('TimeFormat', '12h')
    }
    if (!answers.EndDay) {
      setAnswer('EndDay', '23:00')
    }
  }, [answers.TimeFormat, answers.EndDay, setAnswer])

  const presets = ['21:00', '22:00', '22:30', '23:00', '23:30', '00:00']

  const adjustMinutes = (value: string, delta: number) => {
    const [hh, mm] = (value || '00:00').split(':').map(Number)
    let total = hh * 60 + mm + delta
    total = (total % (24 * 60) + (24 * 60)) % (24 * 60)
    const nh = Math.floor(total / 60)
    const nm = total % 60
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
  }

  const toLabel = (value: string) => {
    const [hh, mm] = (value || '00:00').split(':').map(Number)
    if ((answers.TimeFormat || '12h') === '24h') return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`
    const isAM = hh < 12
    const h12 = hh % 12 === 0 ? 12 : hh % 12
    return `${h12}:${String(mm).padStart(2,'0')} ${isAM ? 'AM' : 'PM'}`
  }

  return (
    <OnboardingStep
      title="What time do you usually go to sleep?"
      subtitle="Specify the time you usually go to sleep. This helps us better plan your schedule and recommendations."
      condition={answers.EndDay !== ''}
    >
      <div className="space-y-4 py-1">
        {/* Header with big current time and +/-5 controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnswer('EndDay', adjustMinutes(answers.EndDay || '23:00', -5))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-text-secondary hover:border-primary/60"
            aria-label="Decrease time by 5 minutes"
            title="-5 min"
          >
            -5
          </button>
          <div className="text-3xl sm:text-4xl font-bold text-text-primary tabular-nums">
            {toLabel(answers.EndDay || '23:00')}
          </div>
          <button
            type="button"
            onClick={() => setAnswer('EndDay', adjustMinutes(answers.EndDay || '23:00', +5))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-text-secondary hover:border-primary/60"
            aria-label="Increase time by 5 minutes"
            title="+5 min"
          >
            +5
          </button>
        </div>

        {/* Preset slots and quick adjust */}
        <div className="flex flex-wrap gap-2 justify-center">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAnswer('EndDay', p)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                (answers.EndDay || '') === p ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
              }`}
            >
              {toLabel(p)}
            </button>
          ))}
          {/* additional fixed time options */}
          {['00:30'].map((t) => (
            <button
              key={`fixed-${t}`}
              type="button"
              onClick={() => setAnswer('EndDay', t)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                (answers.EndDay || '') === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
              }`}
              aria-label={`Set time to ${toLabel(t)}`}
            >
              {toLabel(t)}
            </button>
          ))}
        </div>
      </div>
    </OnboardingStep>
  )
}
