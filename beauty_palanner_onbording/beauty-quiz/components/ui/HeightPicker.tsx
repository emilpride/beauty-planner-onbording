'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type React from 'react'

type HeightPickerProps = {
  value?: number // height in cm
  gender: 0 | 1 | 2 // 0 = not selected, 1 = male, 2 = female
  onConfirm: (height: number) => void
  onCancel?: () => void
}

// Constants for the ruler
const MIN_HEIGHT = 100 // cm
const MAX_HEIGHT = 250 // cm
const RULER_RANGE = MAX_HEIGHT - MIN_HEIGHT

export default function HeightPicker({ value = 170, gender, onConfirm, onCancel }: HeightPickerProps) {
  const clamp = (v: number) => Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(v)))
  const [height, setHeight] = useState(clamp(value))
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [stageH, setStageH] = useState(0)
  const baseSilhouetteH = 320 // px, image natural height

  // --- Derived values for positioning --- //
  const heightRatio = (height - MIN_HEIGHT) / RULER_RANGE
  const lineBottom = stageH * heightRatio
  const silhouetteScale = Math.max(0.1, lineBottom / baseSilhouetteH)

  useLayoutEffect(() => {
    const measure = () => setStageH(stageRef.current?.clientHeight ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    setHeight(clamp(value))
  }, [value])

  // --- Drag Logic --- //
  const isDragging = useRef(false)
  const animationFrame = useRef<number>()

  const updateHeightFromPointer = (clientY: number) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top))
    const newHeight = MIN_HEIGHT + ((rect.height - y) / rect.height) * RULER_RANGE
    setHeight(clamp(newHeight))
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return
    // Use rAF to prevent jank and improve performance
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    animationFrame.current = requestAnimationFrame(() => {
      updateHeightFromPointer(e.clientY)
    })
  }

  const onPointerUp = () => {
    isDragging.current = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true
    updateHeightFromPointer(e.clientY)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const getCharacterImage = () => {
    return gender === 2
      ? '/images/on_boarding_images/bmi_female_2.png'
      : '/images/on_boarding_images/bmi_male_2.png'
  }

  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return { feet, inches, label: `${feet}'${inches}"` }
  }

  const feetInches = cmToFeetInches(height)
  return (
    <div className="w-full h-full bg-background flex flex-col select-none touch-none">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface/80 backdrop-blur-sm z-10">
        <button onClick={onCancel} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
        <h2 className="text-base font-semibold text-text-primary">Your Height</h2>
        <button onClick={() => onConfirm(height)} className="text-sm text-primary font-bold transition-transform active:scale-95">Done</button>
      </header>

      {/* Stage */}
      <div ref={stageRef} className="relative flex-1 min-h-0 overflow-hidden" onPointerDown={onPointerDown}>
        {/* Ruler Marks */}
        <Ruler stageH={stageH} cmToFeetInches={cmToFeetInches} />

        {/* Main horizontal line and value display */}
        <div className="absolute left-0 right-0 z-[2] pointer-events-none" style={{ bottom: lineBottom }}>
          {/* Line */}
          <div className="h-0.5 bg-gradient-to-r from-primary to-purple-500" />
          {/* Value Bubble */}
          <div className="absolute right-4 -top-7 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-text-primary">{feetInches.label}</span>
            <span className="text-sm font-medium text-text-secondary relative" style={{ top: '-0.5em' }}>ft/in</span>
          </div>
          <div className="absolute right-4 top-6 text-lg font-medium text-text-secondary">
            {height} cm
          </div>
        </div>

        {/* Silhouette */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none z-[1]">
          <div style={{ transform: `scale(${silhouetteScale})`, transformOrigin: 'bottom center' }}>
            <Image
              src={getCharacterImage()}
              alt="Character silhouette"
              width={320}
              height={320}
              className="h-[320px] w-auto object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Ruler Component --- //
const Ruler = ({ stageH, cmToFeetInches }: { stageH: number, cmToFeetInches: (cm: number) => { feet: number, inches: number, label: string } }) => {
  const marks = useMemo(() => {
    if (!stageH) return null

    const numMarks = RULER_RANGE / 5 + 1 // A mark every 5cm
    return Array.from({ length: numMarks }, (_, i) => {
      const h = MIN_HEIGHT + i * 5
      const isMajor = h % 10 === 0
      const y = stageH * ((h - MIN_HEIGHT) / RULER_RANGE)

      return (
        <div key={h} className="absolute left-4 right-0 text-right" style={{ bottom: y }}>
          <div className="flex items-center justify-end gap-3">
            {isMajor && (
              <span className="text-xs font-medium text-text-secondary w-14">{cmToFeetInches(h).label}</span>
            )}
            <div className={`h-px ${isMajor ? 'w-6 bg-border-subtle' : 'w-4 bg-border-subtle'}`} />
          </div>
        </div>
      )
    })
  }, [stageH, cmToFeetInches])

  if (!marks) return null

  return <div className="absolute inset-y-0 left-0 w-24 pointer-events-none">{marks}</div>
}
