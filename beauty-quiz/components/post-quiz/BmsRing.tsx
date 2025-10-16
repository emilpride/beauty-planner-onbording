'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

type SegmentKey = 'skin' | 'hair' | 'physic' | 'mental'

export type BmsRingProps = {
  size?: number
  thickness?: number
  // 0-10 for each segment
  scores: Partial<Record<SegmentKey, number>>
  // Overall numeric score (0-10)
  overall: number
  // Icon paths in /public
  icons: Partial<Record<SegmentKey, string>>
  // Optional fixed colors per segment; when omitted, a band color will be derived from the score
  colors?: Partial<Record<SegmentKey, string>>
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

// Map score (0..10) to traffic-light band colors
const getBandColor = (score: number | undefined | null) => {
  if (score == null || isNaN(score as number)) return '#9CA3AF' // gray
  const s = Number(score)
  if (s <= 3) return '#FF4D4F'
  if (s <= 5) return '#FF9800'
  if (s <= 7) return '#FBF447'
  return '#33C75A'
}

// Stroke dash helpers for isolating a quadrant on a full circle
function quadrantDash(circumference: number, quadrantIndex: 0 | 1 | 2 | 3, progress01: number) {
  const seg = circumference / 4 // length of one quadrant
  const visible = seg * clamp01(progress01)
  const before = seg * quadrantIndex
  const after = circumference - before - seg
  // We want: skip 'before', then draw 'visible', then skip remainder of this quadrant, then skip 'after'.
  // Achieve by setting dasharray pattern starting from offset: [before, visible, seg-visible, after]
  // However SVG stroke-dasharray does not support a leading gap value directly, so we use dashoffset to rotate.
  // We'll return dasharray for one cycle (visible + (seg-visible) + after + 0) and use dashoffset=before to align start.
  return {
    dasharray: `${visible} ${seg - visible} ${after}`,
    dashoffset: before,
  }
}

export default function BmsRing({ size = 240, thickness = 14, scores, overall, icons, colors }: BmsRingProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const radius = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * radius

  const skin = typeof scores.skin === 'number' ? scores.skin! : 6
  const hair = typeof scores.hair === 'number' ? scores.hair! : 6
  const physic = typeof scores.physic === 'number' ? scores.physic! : 6
  const mental = typeof scores.mental === 'number' ? scores.mental! : 6

  const [animOverall, setAnimOverall] = useState(0)
  const [animSeg, setAnimSeg] = useState({ skin: 0, hair: 0, physic: 0, mental: 0 })

  useEffect(() => {
    if (!inView) return
    let raf: number | null = null
    const start = performance.now()
    const dur = 900
    const fromOverall = 0
    const toOverall = typeof overall === 'number' ? overall : 6
    const from = { skin: 0, hair: 0, physic: 0, mental: 0 }
    const to = { skin, hair, physic, mental }
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimOverall(fromOverall + (toOverall - fromOverall) * eased)
      setAnimSeg({
        skin: from.skin + (to.skin - from.skin) * eased,
        hair: from.hair + (to.hair - from.hair) * eased,
        physic: from.physic + (to.physic - from.physic) * eased,
        mental: from.mental + (to.mental - from.mental) * eased,
      })
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [inView, overall, skin, hair, physic, mental])

  const segs = useMemo(() => ([
    { key: 'skin' as SegmentKey, idx: 0 as const, score: animSeg.skin, color: colors?.skin ?? getBandColor(animSeg.skin) },
    { key: 'hair' as SegmentKey, idx: 1 as const, score: animSeg.hair, color: colors?.hair ?? getBandColor(animSeg.hair) },
    { key: 'physic' as SegmentKey, idx: 2 as const, score: animSeg.physic, color: colors?.physic ?? getBandColor(animSeg.physic) },
    { key: 'mental' as SegmentKey, idx: 3 as const, score: animSeg.mental, color: colors?.mental ?? getBandColor(animSeg.mental) },
  ]), [animSeg, colors])

  // Icon positions at each quadrant midpoint (starting at -90deg for top)
  const iconRadius = radius + thickness * 0.2
  const iconSize = Math.round(thickness * 1.6)

  const polar = (angleDeg: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180 // rotate so 0deg is at 12 o'clock
    const cx = size / 2 + iconRadius * Math.cos(a)
    const cy = size / 2 + iconRadius * Math.sin(a)
    return { cx, cy }
  }

  const iconPositions: Record<SegmentKey, { cx: number; cy: number }> = {
    skin: polar(45),
    hair: polar(135),
    physic: polar(225),
    mental: polar(315),
  }

  return (
    <div ref={ref} className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track (full circle) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          className="dark:stroke-white/10"
          strokeWidth={thickness}
        />

        {/* Four background quadrants in subtle grey for segmentation */}
        {[0, 1, 2, 3].map((idx) => {
          const segLen = circumference / 4
          const dash = `${segLen} ${circumference - segLen}`
          const dashoffset = (circumference / 4) * idx
          return (
            <circle
              key={`bg-${idx}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              className="dark:stroke-white/15"
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={dashoffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          )
        })}

        {/* Progress arcs per segment */}
        {segs.map(({ key, idx, score, color }) => {
          const p = clamp01((score || 0) / 10)
          const { dasharray, dashoffset } = quadrantDash(circumference, idx, p)
          return (
            <motion.circle
              key={key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeWidth={thickness}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          )
        })}
      </svg>

      {/* Center overall value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">BMS</span>
        <span className="text-4xl font-bold text-text-primary" style={{ lineHeight: 1 }}>{animOverall.toFixed(1)}</span>
        <span className="text-[10px] text-text-secondary">/10</span>
      </div>

      {/* Icons */}
      {(Object.keys(iconPositions) as SegmentKey[]).map((k) => {
        const pos = iconPositions[k]
        const src = icons[k]
        if (!src) return null
        return (
          <div
            key={`icon-${k}`}
            className="absolute rounded-full bg-white shadow-soft ring-1 ring-black/10 flex items-center justify-center dark:bg-surface/90"
            style={{
              width: iconSize,
              height: iconSize,
              left: pos.cx - iconSize / 2,
              top: pos.cy - iconSize / 2,
            }}
            aria-label={`${k} score: ${Math.round((scores[k] ?? 0) * 10) / 10}/10`}
            title={`${k.charAt(0).toUpperCase()}${k.slice(1)}: ${(scores[k] ?? 0).toFixed?.(1) ?? scores[k] ?? ''}/10`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${k} icon`} className="w-[70%] h-[70%] object-contain" />
          </div>
        )
      })}
    </div>
  )
}
