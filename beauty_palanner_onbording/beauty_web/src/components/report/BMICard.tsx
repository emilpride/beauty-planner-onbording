"use client"

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import HeightPicker from '@/components/ui/HeightPicker'
import WeightPicker from '@/components/ui/WeightPicker'

type Props = {
  bmi?: number | null
  bmiCategory?: string | null
  bodyFatPct?: number | null
  initialHeightCm?: number
  initialWeightKg?: number
  gender?: 'male' | 'female' | 'other' | ''
  disabled?: boolean
  onUpdate?: (heightCm: number, weightKg: number) => void
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export default function BMICard({
  bmi,
  bmiCategory,
  bodyFatPct,
  initialHeightCm,
  initialWeightKg,
  gender,
  disabled,
  onUpdate,
}: Props) {
  const [heightCm, setHeightCm] = useState<number | undefined>(initialHeightCm)
  const [weightKg, setWeightKg] = useState<number | undefined>(initialWeightKg)
  const [openHeight, setOpenHeight] = useState(false)
  const [openWeight, setOpenWeight] = useState(false)
  const value = typeof bmi === 'number' && isFinite(bmi) ? bmi : null
  // BMI bands & colors per spec
  const bands = useMemo(() => ({ min: 15, max: 45, u: 18.5, n: 24.9, ow: 29.9, o1: 34.9, o2: 39.9 }), [])
  const colors = useMemo(
    () => ({ blue: '#2196F3', green: '#33C75A', yellow: '#FFEB3B', orange: '#FF9800', red: '#E53935' }),
    [],
  )
  const categoryColor = useMemo(() => {
    const v = value ?? 0
    if (v < bands.u) return colors.blue // Underweight
    if (v <= bands.n) return colors.green // Normal
    if (v <= bands.ow) return colors.yellow // Overweight
    if (v <= bands.o1) return colors.orange // Obesity I
    return colors.red // Obesity II+
  }, [value, bands, colors])

  const position = useMemo(() => {
    if (value == null) return 0.4
    return clamp((value - bands.min) / (bands.max - bands.min), 0, 1)
  }, [value, bands])

  // Smooth gradient across the whole band (no hard edges)
  const gradientCss = useMemo(() => {
    const pct = (x: number) => clamp(((x - bands.min) / (bands.max - bands.min)) * 100, 0, 100)
    // Place color stops roughly at band midpoints to create smooth transitions
    const pBlue = 0
    const pGreen = (pct(bands.u) + pct(bands.n)) / 2
    const pYellow = (pct(bands.n) + pct(bands.ow)) / 2
    const pOrange = (pct(bands.ow) + pct(bands.o1)) / 2
    const pRed = 100
    return `linear-gradient(90deg,
      ${colors.blue} ${pBlue}%,
      ${colors.green} ${pGreen}%,
      ${colors.yellow} ${pYellow}%,
      ${colors.orange} ${pOrange}%,
      ${colors.red} ${pRed}%)`
  }, [bands, colors])

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-6 shadow-md">
      {/* Large centered BMI value with chip */}
      <div className="flex flex-col items-center">
        <div className="text-6xl font-extrabold leading-none text-text-primary tabular-nums">
          {value != null ? value.toFixed(1) : '—'}
        </div>
        <div className="mt-1 text-xs tracking-wide uppercase text-text-secondary">Body Mass Index</div>
        {bmiCategory && (
          <span className="mt-2 px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: categoryColor }}>
            {bmiCategory}
          </span>
        )}
      </div>

      {/* Gradient scale */}
      <div className="mt-2">
        <div className="relative h-5 w-full">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: gradientCss }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white shadow-soft ring-1 ring-black/10"
            initial={{ left: '0%' }}
            animate={{ left: `${position * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
          <span>{bands.min}</span>
          <span>{Math.round((bands.min + bands.max) / 2)}</span>
          <span>{bands.max}</span>
        </div>

        {/* subtle boundary ticks for reference */}
        <div className="relative mt-1 h-3">
          {[bands.u, bands.n, bands.ow, bands.o1].map((tick) => (
            <div
              key={tick}
              className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-white/50"
              style={{ left: `${clamp(((tick - bands.min) / (bands.max - bands.min)) * 100, 0, 100)}%` }}
            />
          ))}
        </div>
      </div>

      {typeof bodyFatPct === 'number' && isFinite(bodyFatPct) && (
        <div className="mt-2 text-sm text-text-secondary">
          Estimated body fat: <span className="font-semibold tabular-nums">{bodyFatPct.toFixed(1)}%</span>
        </div>
      )}

      {/* Action row: Height / Weight / Update aligned and color-coordinated with BMI */}
      <div className="mt-2">
        <div className="flex flex-wrap items-stretch justify-center gap-2">
          {/* Height button */}
          <button
            type="button"
            onClick={() => setOpenHeight(true)}
            disabled={disabled}
            className={
              `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ` +
              `ring-1 ring-border-subtle bg-surface-hover text-text-primary ` +
              `hover:bg-surface active:opacity-90 transition-colors ` +
              `${disabled ? 'opacity-60 cursor-not-allowed' : ''}`
            }
          >
            {/* Ruler icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 9h2M8 12h3M8 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {typeof heightCm === 'number' ? `${heightCm} cm` : 'Height'}
          </button>

          {/* Weight button */}
          <button
            type="button"
            onClick={() => setOpenWeight(true)}
            disabled={disabled}
            className={
              `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ` +
              `ring-1 ring-border-subtle bg-surface-hover text-text-primary ` +
              `hover:bg-surface active:opacity-90 transition-colors ` +
              `${disabled ? 'opacity-60 cursor-not-allowed' : ''}`
            }
          >
            {/* Scale icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 7h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            {typeof weightKg === 'number' ? `${weightKg.toFixed(1)} kg` : 'Weight'}
          </button>

          {/* Update button */}
          <button
            className={
              `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm ` +
              `ring-1 ring-border-subtle text-white ` +
              `${disabled || typeof heightCm !== 'number' || typeof weightKg !== 'number' ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95 active:opacity-90 transition-opacity'}`
            }
            disabled={disabled || typeof heightCm !== 'number' || typeof weightKg !== 'number'}
            onClick={() => {
              if (!onUpdate || typeof heightCm !== 'number' || typeof weightKg !== 'number') return
              onUpdate(heightCm, weightKg)
            }}
            style={{ backgroundColor: categoryColor }}
          >
            Update BMI
          </button>
        </div>
      </div>

      {/* Height Picker Modal */}
      {openHeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenHeight(false)} />
          <div className="relative z-10 w-full max-w-md h-[520px] bg-surface rounded-2xl shadow-xl overflow-hidden">
            <HeightPicker
              value={heightCm ?? 170}
              gender={gender === 'male' ? 1 : gender === 'female' ? 2 : 0}
              onCancel={() => setOpenHeight(false)}
              onConfirm={(h) => { setHeightCm(h); setOpenHeight(false) }}
            />
          </div>
        </div>
      )}

      {/* Weight Picker Modal */}
      {openWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenWeight(false)} />
          <div className="relative z-10 w-full max-w-md h-[520px] bg-surface rounded-2xl shadow-xl overflow-hidden">
            <WeightPicker
              valueKg={weightKg ?? 70}
              onCancel={() => setOpenWeight(false)}
              onConfirm={(w) => { setWeightKg(w); setOpenWeight(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
