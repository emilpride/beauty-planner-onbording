'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'

type HeightPickerProps = {
  value?: number // height in cm
  gender: 0 | 1 | 2 // 0 = not selected, 1 = male, 2 = female
  onConfirm: (height: number) => void
  onCancel?: () => void
}

export default function HeightPicker({ value = 177, gender, onConfirm, onCancel }: HeightPickerProps) {
  const clamp = (v: number) => Math.max(0, Math.min(250, Math.round(v)))
  const [height, setHeight] = useState(clamp(value))
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [stageH, setStageH] = useState(0)
  const baseSilhouette: number = 320 // px, image natural height used for scaling
  const minScale = 0.05 // allow very small heights near 0

  // Derived UI values
  const lineBottom = useMemo(() => (stageH * height) / 250, [stageH, height])
  const desiredScale = useMemo(() => {
    return Math.max(minScale, lineBottom / baseSilhouette)
  }, [lineBottom, baseSilhouette])

  useLayoutEffect(() => {
    const measure = () => setStageH(stageRef.current?.clientHeight ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Keep local height synced if parent value changes
  useEffect(() => {
    setHeight(clamp(value))
  }, [value])

  // Drag logic
  const draggingRef = useRef(false)
  const startDrag = (clientY: number) => {
    updateFromPointer(clientY)
    draggingRef.current = true
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', endDrag)
  }
  const onMove = (e: PointerEvent) => updateFromPointer(e.clientY)
  const endDrag = () => {
    draggingRef.current = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', endDrag)
  }
  const updateFromPointer = (clientY: number) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    let yFromTop = clientY - rect.top
    yFromTop = Math.max(0, Math.min(rect.height, yFromTop))
    const yFromBottom = rect.height - yFromTop
    // Map line position (from bottom) directly to cm 0..250
    const h = Math.round((yFromBottom / rect.height) * 250)
    setHeight(h)
  }

  const getCharacterImage = () => {
    if (gender === 2) return '/images/on_boarding_images/bmi_female_2.png'
    return '/images/on_boarding_images/bmi_male_2.png'
  }

  // Positions
  const knobTop = Math.max(0, stageH - lineBottom - 6) // center 12px knob

  const onKnobKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHeight((h) => Math.min(250, h + step))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHeight((h) => Math.max(0, h - step))
    }
  }

  // Helpers for labels
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}'${inches}`
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
  <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
        <h2 className="text-base font-semibold text-text-primary">How tall are you?</h2>
        <button onClick={() => onConfirm(height)} className="text-primary font-semibold">Done</button>
      </div>

      {/* Stage */}
      <div ref={stageRef} className="relative flex-1 min-h-0 overflow-hidden touch-none" onPointerDown={(e) => startDrag(e.clientY)}>
        {/* Left ruler: ticks only (no numeric labels) */}
        <div className="absolute left-0 top-0 bottom-0 w-12">
          {/* ticks every 10cm with minor grid via gradient */}
          <div
            className="absolute inset-0"
            style={{ background: 'repeating-linear-gradient(to bottom, #e5e7eb 0 1px, transparent 1px 9px)' }}
          />
        </div>

        {/* Drag knob */}
        <button
          type="button"
          aria-label="Adjust height"
          className="absolute left-10 z-20 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow"
          style={{ top: knobTop }}
          onPointerDown={(e) => startDrag(e.clientY)}
          onKeyDown={onKnobKeyDown}
        />

        {/* Horizontal dotted line */}
        <div
          className="absolute left-12 right-20 border-t border-dotted border-primary/60 z-10"
          style={{ bottom: lineBottom }}
        />

        {/* Value bubble on right */}
        <div
          className="absolute right-4 z-20 rounded-2xl bg-primary text-white text-sm font-semibold px-3 py-1 shadow"
          style={{ bottom: lineBottom - 16 }}
        >
          {cmToFeetInches(height)} <span className="text-white/80 text-[11px]">({height})</span>
        </div>

        {/* Silhouette centered */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
          <div
            className="transition-transform duration-200 ease-out"
            style={{ transform: `scale(${desiredScale})`, transformOrigin: 'bottom center' }}
          >
            <img
              src={getCharacterImage()}
              alt="Character silhouette"
              className="h-[320px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}