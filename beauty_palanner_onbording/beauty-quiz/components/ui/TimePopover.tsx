"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import TimePicker from './TimePicker'

export interface TimePopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement>
  value: string
  onCancel: () => void
  onApply: (value: string, fmt?: '12h' | '24h') => void
  timeFormat?: '12h' | '24h'
  onTimeFormatChange?: (fmt: '12h' | '24h') => void
}

export default function TimePopover({
  open,
  anchorRef,
  value,
  onCancel,
  onApply,
  timeFormat = '24h',
  onTimeFormatChange,
}: TimePopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [localValue, setLocalValue] = useState<string>(value)
  const [localFormat, setLocalFormat] = useState<'12h' | '24h'>(timeFormat)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [panelWidth, setPanelWidth] = useState<number>(360)
  const [arrowLeft, setArrowLeft] = useState<number>(24)
  const [ready, setReady] = useState(false)
  const openedAtRef = useRef<number>(0)

  // Recompute position when opened, scrolled, or resized
  const computePos = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const gap = 8
    const width = Math.min(360, Math.floor(window.innerWidth * 0.92))
    const left = Math.min(Math.max(8, rect.left), (window.innerWidth - width - 8))
    const top = Math.min(rect.bottom + gap, window.innerHeight - 8)

    // Arrow horizontally centered to anchor, clamped to panel
    const anchorCenter = rect.left + rect.width / 2
    const idealArrowLeft = anchorCenter - left - 6 // 6px half of arrow width
    const clampedArrowLeft = Math.max(12, Math.min(width - 12, idealArrowLeft))

    setPanelWidth(width)
    setPos({ top, left })
    setArrowLeft(clampedArrowLeft)
  }, [anchorRef])

  useEffect(() => {
    if (open) {
      setLocalValue(value)
      setLocalFormat(timeFormat)
      setReady(false)
      openedAtRef.current = Date.now()
      computePos()
      // Delay to allow transition from initial state
      requestAnimationFrame(() => setReady(true))
      const onScroll = () => computePos()
      const onResize = () => computePos()
      window.addEventListener('scroll', onScroll, true)
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('scroll', onScroll, true)
        window.removeEventListener('resize', onResize)
      }
    }
    // Ensure a cleanup function is returned for all code paths
    return () => {}
  }, [open, value, timeFormat, computePos])

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    const onMouseDownDoc = (e: MouseEvent) => {
      const target = e.target as Node
      // If click is inside panel or on the anchor, ignore
      if (panelRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onCancel()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDownDoc)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouseDownDoc)
    }
  }, [open, onCancel, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className={`fixed z-[120] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl transition-all duration-150 ease-out ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
      style={{ top: pos.top, left: pos.left, width: panelWidth, maxWidth: '92vw' }}
      role="dialog"
      aria-modal="false"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow pointer */}
      <div
        className="absolute -top-1.5 h-3 w-3 rotate-45 bg-white border-l border-t border-gray-200"
        style={{ left: arrowLeft }}
        aria-hidden
      />
      <TimePicker
        value={localValue}
        onChange={setLocalValue}
        timeFormat={localFormat}
        onTimeFormatChange={onTimeFormatChange ? (fmt) => { setLocalFormat(fmt); onTimeFormatChange?.(fmt) } : undefined}
        presets={[]}
      />
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => onApply(localValue, onTimeFormatChange ? localFormat : undefined)}
          className="flex-1 h-10 rounded-xl text-white font-semibold shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
