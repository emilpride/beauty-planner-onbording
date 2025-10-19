'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useEffect } from 'react'

export default function WakeUpStep() {
  const { answers, setAnswer } = useQuizStore()

  useEffect(() => {
    // Default to 12h for US-friendly experience if not set
    if (answers.TimeFormat !== '12h' && answers.TimeFormat !== '24h') {
      setAnswer('TimeFormat', '12h')
    }
    if (!answers.WakeUp) {
      setAnswer('WakeUp', '07:30')
    }
  }, [answers.TimeFormat, answers.WakeUp, setAnswer])

  const presets = ['06:30', '07:00', '07:30', '08:00', '08:30']

  const adjustMinutes = (value: string, delta: number) => {
    const [hStr, mStr] = (value || '00:00').split(':')
    const hh = Number(hStr ?? '00')
    const mm = Number(mStr ?? '00')
    let total = hh * 60 + mm + delta
    total = (total % (24 * 60) + (24 * 60)) % (24 * 60) // wrap around 0..1439
    const nh = Math.floor(total / 60)
    const nm = total % 60
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
  }

  const toLabel = (value: string) => {
    const [hStr, mStr] = (value || '00:00').split(':')
    const hh = Number(hStr ?? '00')
    const mm = Number(mStr ?? '00')
    if ((answers.TimeFormat || '12h') === '24h') return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`
    const isAM = hh < 12
    const h12 = hh % 12 === 0 ? 12 : hh % 12
    return `${h12}:${String(mm).padStart(2,'0')} ${isAM ? 'AM' : 'PM'}`
  }

  return (
    <OnboardingStep
      title="What time do you usually wake up?"
      subtitle="Setting your wake-up time helps us create your personalized Activity schedule."
      condition={answers.WakeUp !== ''}
    >
      <div className="space-y-4 py-1">
        {/* Toggle only on the first time step */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-semibold">
            {[{ value: '12h', label: '12h' }, { value: '24h', label: '24h' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setAnswer('TimeFormat', opt.value as '12h' | '24h')}
                className={`px-3 py-1.5 rounded-full transition-colors ${answers.TimeFormat === opt.value ? 'bg-primary text-white' : 'text-text-secondary'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Header with big current time and +/-5 controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnswer('WakeUp', adjustMinutes(answers.WakeUp || '07:30', -5))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-text-secondary hover:border-primary/60"
            aria-label="Decrease time by 5 minutes"
            title="-5 min"
          >
            -5
          </button>
          <div className="text-3xl sm:text-4xl font-bold text-text-primary tabular-nums">
            {toLabel(answers.WakeUp || '07:30')}
          </div>
          <button
            type="button"
            onClick={() => setAnswer('WakeUp', adjustMinutes(answers.WakeUp || '07:30', +5))}
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
              onClick={() => setAnswer('WakeUp', p)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                (answers.WakeUp || '') === p ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
              }`}
            >
              {toLabel(p)}
            </button>
          ))}
          {/* additional fixed time options */}
          {['09:00','09:30'].map((t) => (
            <button
              key={`fixed-${t}`}
              type="button"
              onClick={() => setAnswer('WakeUp', t)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                (answers.WakeUp || '') === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:border-primary/60'
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
