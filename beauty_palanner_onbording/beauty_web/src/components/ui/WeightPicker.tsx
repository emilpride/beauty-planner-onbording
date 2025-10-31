'use client'

import { useEffect, useRef, useState } from 'react'

type WeightPickerProps = {
  valueKg?: number | null
  onConfirm: (kg: number) => void
  onCancel?: () => void
}

const MIN_KG = 30
const MAX_KG = 150

export default function WeightPicker({ valueKg = 80, onConfirm, onCancel }: WeightPickerProps) {
  const [kg, setKg] = useState(Math.max(MIN_KG, Math.min(MAX_KG, Math.round(valueKg ?? 80))))
  const pounds = Math.round(kg * 2.20462)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const draggingRef = useRef(false)
  const [angleDeg, setAngleDeg] = useState<number>(() => {
    const startAngle = 180
    const endAngle = 0
    const initKg = Math.max(MIN_KG, Math.min(MAX_KG, Math.round(valueKg ?? 80)))
    const normalized = (initKg - MIN_KG) / (MAX_KG - MIN_KG)
    return startAngle + normalized * (endAngle - startAngle)
  })

  useEffect(() => {
    setKg(Math.max(MIN_KG, Math.min(MAX_KG, Math.round(valueKg ?? 80))))
  }, [valueKg])

  // Semicircle geometry - centered at bottom of container
  const centerX = 200
  const centerY = 300
  const radius = 180
  const startAngle = 180
  const endAngle = 0

  const valueToAngle = (weight: number) => {
    const normalized = (weight - MIN_KG) / (MAX_KG - MIN_KG)
    return startAngle + normalized * (endAngle - startAngle)
  }

  const angleToValue = (angle: number) => {
    const normalized = (angle - startAngle) / (endAngle - startAngle)
    return Math.round(MIN_KG + normalized * (MAX_KG - MIN_KG))
  }

  const currentAngle = angleDeg
  
  useEffect(() => {
    if (!draggingRef.current) {
      setAngleDeg(valueToAngle(kg))
    }
  }, [kg])

  const updateFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const { x: sx, y: sy } = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const x = sx - centerX
    const y = sy - centerY
    let angle = Math.atan2(-y, x) * (180 / Math.PI)
    if (angle < 0) angle += 360
    if (angle > 180) angle = 180
    if (angle < 0) angle = 0
    setAngleDeg(angle)
    const newWeight = Math.max(MIN_KG, Math.min(MAX_KG, angleToValue(angle)))
    setKg(newWeight)
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    updateFromPointer(e.clientX, e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return
    updateFromPointer(e.clientX, e.clientY)
  }

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const onPointerCancel = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const ticks: JSX.Element[] = []
  const poundLabels = [80, 120, 160, 200, 240, 280, 320]
  for (let weight = MIN_KG; weight <= MAX_KG; weight += 5) {
    const angle = valueToAngle(weight)
    const isMain = weight % 10 === 0
    const tickRadius = isMain ? radius - 12 : radius - 7
    
    const x1 = centerX + tickRadius * Math.cos(angle * Math.PI / 180)
    const y1 = centerY - tickRadius * Math.sin(angle * Math.PI / 180)
    const x2 = centerX + radius * Math.cos(angle * Math.PI / 180)
    const y2 = centerY - radius * Math.sin(angle * Math.PI / 180)
    
    ticks.push(
      <line
        key={weight}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`rgb(var(--border-subtle))`}
        strokeOpacity={isMain ? 0.9 : 0.55}
        strokeWidth={isMain ? 2 : 1}
        strokeLinecap="round"
      />
    )
  }

  poundLabels.forEach((lb) => {
    const kgForLb = lb / 2.20462
    const angle = valueToAngle(kgForLb)
    const lr = radius - 22
    const lx = centerX + lr * Math.cos(angle * Math.PI / 180)
    const ly = centerY - lr * Math.sin(angle * Math.PI / 180)
    const rot = -angle + 90
    ticks.push(
      <g key={`label-lb-${lb}`} transform={`translate(${lx}, ${ly}) rotate(${rot})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={`rgb(var(--text-secondary))`}
          fontSize={10}
          fontWeight={500}
        >
          {lb}
        </text>
      </g>
    )
  })

  const shaftLen = radius - 28
  const tipX = centerX + shaftLen * Math.cos(currentAngle * Math.PI / 180)
  const tipY = centerY - shaftLen * Math.sin(currentAngle * Math.PI / 180)

  return (
    <div className="w-full h-full bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface">
        <button 
          onClick={onCancel} 
          className="text-text-secondary hover:opacity-90 text-base"
        >
          Cancel
        </button>
        <h2 className="text-lg font-medium text-text-primary">
          What’s your weight?
        </h2>
        <button 
          onClick={() => onConfirm(kg)} 
          className="text-accent hover:opacity-90 font-medium text-base"
        >
          Done
        </button>
      </div>

      <div className="flex-1 relative bg-surface overflow-hidden touch-none select-none">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 400 350"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{ touchAction: 'none', cursor: 'grab' }}
        >
          <defs>
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`rgb(var(--accent))`} stopOpacity={0.9} />
              <stop offset="100%" stopColor={`rgb(var(--accent))`} stopOpacity={1} />
            </linearGradient>
            <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.18)" />
            </filter>
            <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={`M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 0 0 ${centerX - radius} ${centerY}`}
            fill="none"
            stroke={`rgb(var(--border-subtle))`}
            strokeWidth="3"
            filter="url(#arcGlow)"
          />

          {ticks}

          {(() => {
            const rad = (currentAngle * Math.PI) / 180
            const ux = Math.cos(rad)
            const uy = -Math.sin(rad)
            const px = Math.sin(rad)
            const py = Math.cos(rad)
            const baseOffset = 12
            const baseHalf = 9
            const bx = centerX + baseOffset * ux
            const by = centerY + baseOffset * uy
            const leftX = bx - baseHalf * px
            const leftY = by - baseHalf * py
            const rightX = bx + baseHalf * px
            const rightY = by + baseHalf * py
            const tipX2 = tipX
            const tipY2 = tipY
            const points = `${leftX},${leftY} ${rightX},${rightY} ${tipX2},${tipY2}`
            return (
              <g filter="url(#needleShadow)">
                <polygon points={points} fill="url(#needleGrad)" />
                <circle cx={tipX2} cy={tipY2} r={2.2} fill={`rgb(var(--accent))`} />
              </g>
            )
          })()}

          <circle
            cx={centerX}
            cy={centerY}
            r={7}
            fill="#ffffff"
            stroke={`rgb(var(--border-subtle))`}
            strokeWidth={2}
          />
          <circle cx={centerX} cy={centerY} r={2.5} fill={`rgb(var(--accent))`} />
        </svg>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ top: '2.5rem' }}>
          <div className="flex items-end justify-center gap-3">
            <span className="text-5xl font-extrabold text-text-primary tracking-tight" style={{ lineHeight: 1 }}>{pounds}</span>
            <span className="text-2xl text-text-secondary mb-1">lb</span>
            <span className="text-lg text-text-secondary mb-1">({kg} kg)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
