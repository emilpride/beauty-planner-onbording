'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'

type SegmentKey = 'skin' | 'hair' | 'physic' | 'mental'

export type BmsRingProps = {
  size?: number
  thickness?: number
  scores: Partial<Record<SegmentKey, number>>
  overall: number
  icons: Partial<Record<SegmentKey, string>>
  colors?: Partial<Record<SegmentKey, string>>
  gapDeg?: number
}

// Map score (0..10) to traffic-light band colors
const getBandColor = (score: number | undefined | null) => {
  if (score == null || isNaN(score as number)) return '#9CA3AF' // gray
  const s = Number(score)
  if (s <= 3) return '#FF4D4F'
  if (s <= 5) return '#FF9800'
  if (s <= 7) return '#FBF447'
  return '#33C75A'
}

// Utility to convert polar coordinates (angle, radius) to Cartesian coordinates (x, y)
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180.0 // 0deg is at 12 o'clock
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

// Function to describe an SVG arc path
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export default function BmsRing({ size = 240, thickness = 28, scores, overall, icons, colors, gapDeg = 4 }: BmsRingProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const radius = size / 2 - thickness / 2

  const skin = scores.skin ?? 0
  const hair = scores.hair ?? 0
  const physic = scores.physic ?? 0
  const mental = scores.mental ?? 0

  const [animOverall, setAnimOverall] = useState(0)
  const [animSeg, setAnimSeg] = useState({ skin: 0, hair: 0, physic: 0, mental: 0 })

  useEffect(() => {
    if (!inView) return
    let raf: number
    const start = performance.now()
    const dur = 900
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimOverall(overall * eased)
      setAnimSeg({
        skin: skin * eased,
        hair: hair * eased,
        physic: physic * eased,
        mental: mental * eased,
      })
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, overall, skin, hair, physic, mental])

  const computed = useMemo(() => {
    const segments = [
      { key: 'skin' as SegmentKey, score: animSeg.skin, color: colors?.skin ?? getBandColor(scores.skin) },
      { key: 'hair' as SegmentKey, score: animSeg.hair, color: colors?.hair ?? getBandColor(scores.hair) },
      { key: 'physic' as SegmentKey, score: animSeg.physic, color: colors?.physic ?? getBandColor(scores.physic) },
      { key: 'mental' as SegmentKey, score: animSeg.mental, color: colors?.mental ?? getBandColor(scores.mental) },
    ].filter(s => s.score > 0)

    const totalScore = segments.reduce((acc, s) => acc + s.score, 0)
    if (totalScore === 0) return { items: [], iconPositions: {} as Record<SegmentKey, { cx: number; cy: number; }> }
    
    const totalGap = gapDeg * segments.length
    const angleAvailable = 360 - totalGap
    
    let cursor = 0
    const items = segments.map(s => {
      const portion = s.score / totalScore
      const segAngle = angleAvailable * portion
      
      const startAngle = cursor + gapDeg / 2
      const endAngle = startAngle + segAngle
      const midAngle = startAngle + segAngle / 2
      
      const pathData = describeArc(size / 2, size / 2, radius, startAngle, endAngle)
      
      cursor = endAngle + gapDeg / 2
      
      return {
        key: s.key,
        pathData,
        color: s.color,
        midAngle
      }
    })

    const iconPositions = (['skin', 'hair', 'physic', 'mental'] as SegmentKey[]).reduce((acc, key) => {
        const item = items.find(it => it.key === key)
        // If an item has score 0, it won't be in `items`. We need to calculate a default position.
        // This part is simplified for clarity. If you need icons for 0-score items, this logic can be expanded.
        const angle = item ? item.midAngle : 0 
        const pos = polarToCartesian(size / 2, size / 2, radius, angle);
        acc[key] = { cx: pos.x, cy: pos.y };
        return acc;
    }, {} as Record<SegmentKey, { cx: number; cy: number }>)

    return { items, iconPositions }
  }, [animSeg, size, radius, gapDeg, colors, scores])

  const iconSize = Math.round(thickness * 1.6)

  return (
    <div ref={ref} className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          className="dark:stroke-white/10"
          strokeWidth={thickness}
        />
        {/* Segments drawn as individual paths */}
        {computed.items.map((it) => (
          <motion.path
            key={it.key}
            d={it.pathData}
            fill="none"
            stroke={it.color}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Center overall value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">BMS</span>
        <span className="text-4xl font-bold text-text-primary" style={{ lineHeight: 1 }}>{animOverall.toFixed(1)}</span>
        <span className="text-[10px] text-text-secondary">/10</span>
      </div>

      {/* Icons */}
      {(Object.keys(computed.iconPositions) as SegmentKey[]).map((k) => {
        if (!scores[k] || scores[k]! <= 0) return null; // Only show icons for segments with a score
        const pos = computed.iconPositions[k]
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
            title={`${k.charAt(0).toUpperCase()}${k.slice(1)}: ${scores[k]?.toFixed(1)}/10`}
          >
            <Image src={src} alt={`${k} icon`} width={iconSize * 0.7} height={iconSize * 0.7} className="w-[70%] h-[70%] object-contain" />
          </div>
        )
      })}
    </div>
  )
}
