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
    const startAngle = 0
    const endAngle = 180
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
  const startAngle = 0  // right side
  const endAngle = 180  // left side

  // Convert weight to angle (0-180 degrees)
  const valueToAngle = (weight: number) => {
    const normalized = (weight - MIN_KG) / (MAX_KG - MIN_KG)
    return startAngle + normalized * (endAngle - startAngle)
  }

  // Convert angle to weight
  const angleToValue = (angle: number) => {
    const normalized = (angle - startAngle) / (endAngle - startAngle)
    return Math.round(MIN_KG + normalized * (MAX_KG - MIN_KG))
  }

  // Keep pointer angle in sync when not dragging
  const currentAngle = angleDeg
  
  useEffect(() => {
    if (!draggingRef.current) {
      setAngleDeg(valueToAngle(kg))
    }
  }, [kg])

  // Handle drag with Pointer Events for mobile + desktop
  const updateFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return
    // Convert client (px) to SVG local coordinates respecting viewBox
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const { x: sx, y: sy } = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const x = sx - centerX
    const y = sy - centerY
    let angle = Math.atan2(-y, x) * (180 / Math.PI)
    if (angle < 0) angle += 360
    // Clamp into semicircle range so стрелка всегда следует курсору
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

  // Generate tick marks (subtle minor, clearer major); labels only on key weights
  const ticks: JSX.Element[] = []
  // Pounds labels across range (rounded to nice values)
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
        stroke="#E7E9F3"
        strokeOpacity={isMain ? 0.9 : 0.55}
        strokeWidth={isMain ? 2 : 1}
        strokeLinecap="round"
      />
    )
    // Labels in pounds for selected values
    // We render labels separately below for exact lb positions
  }

  // Add pound labels
  poundLabels.forEach((lb) => {
    const kgForLb = lb / 2.20462
    const angle = valueToAngle(kgForLb)
    // Place labels inside the arc to avoid overflow
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
          fill="#A1A7B3"
          fontSize={10}
          fontWeight={500}
        >
          {lb}
        </text>
      </g>
    )
  })

  // Pointer (arrow) geometry
  const shaftLen = radius - 28
  const baseX = centerX + (shaftLen - 14) * Math.cos(currentAngle * Math.PI / 180)
  const baseY = centerY - (shaftLen - 14) * Math.sin(currentAngle * Math.PI / 180)
  const tipX = centerX + shaftLen * Math.cos(currentAngle * Math.PI / 180)
  const tipY = centerY - shaftLen * Math.sin(currentAngle * Math.PI / 180)

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button 
          onClick={onCancel} 
          className="text-gray-500 hover:text-gray-700 text-base"
        >
          Cancel
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          What's your weight?
        </h2>
        <button 
          onClick={() => onConfirm(kg)} 
          className="text-blue-500 hover:text-blue-700 font-medium text-base"
        >
          Done
        </button>
      </div>

      {/* Dial Container */}
      <div className="flex-1 relative bg-white overflow-hidden touch-none select-none">
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
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#8B5CF6" />
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

          {/* Background arc */}
          <path
            d={`M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 0 0 ${centerX - radius} ${centerY}`}
            fill="none"
            stroke="#F2F3F7"
            strokeWidth="3"
            filter="url(#arcGlow)"
          />

          {/* Tick marks + labels */}
          {ticks}

          {/* Tapered wedge needle */}
          {(() => {
            const rad = (currentAngle * Math.PI) / 180
            const ux = Math.cos(rad)
            const uy = -Math.sin(rad)
            const px = Math.sin(rad)
            const py = Math.cos(rad)
            const baseOffset = 12
            const baseHalf = 9
            const len = shaftLen
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
                <circle cx={tipX2} cy={tipY2} r={2.2} fill="#8B5CF6" />
              </g>
            )
          })()}
          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r={7}
            fill="#ffffff"
            stroke="#E5E7EB"
            strokeWidth={2}
          />
          <circle cx={centerX} cy={centerY} r={2.5} fill="#8B5CF6" />
        </svg>

        {/* Weight Display */}
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-5xl font-extrabold text-text-primary mb-1 tracking-tight">
            {pounds}
            <span className="text-2xl text-text-secondary ml-2">lb</span>
          </div>
          <div className="text-xl text-text-secondary">
            ({kg} kg)
          </div>
        </div>
      </div>
    </div>
  )
}
