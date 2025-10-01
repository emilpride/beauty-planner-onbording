'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/theme/ThemeProvider'

function StarIcon() {
  const id = useId().replace(/:/g, '')
  const gradId = `grad_${id}`
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A6EDA" />
          <stop offset="45%" stopColor="#B76EDA" />
          <stop offset="90%" stopColor="#DB75E0" />
          <stop offset="100%" stopColor="#EBB1EB" />
        </linearGradient>
      </defs>
      <path d="M11 1.5l2.33 4.725 5.215.758-3.772 3.678.89 5.187L11 13.9l-4.663 2.948.89-5.187L3.455 6.983l5.215-.758L11 1.5z" fill={`url(#${gradId})`} />
    </svg>
  )
}

export default function ContractAgreementStep() {
  const { currentStep, nextStep, answers, setAnswer } = useQuizStore()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  const drewAnythingRef = useRef(false)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.strokeStyle = theme === 'dark' ? '#FAFAFA' : '#212121'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    setCanvasSize()

    const handleResize = () => setCanvasSize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [theme])

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // capture pointer to continue receiving events
    e.currentTarget.setPointerCapture?.(e.pointerId)

    pointsRef.current = [{ x, y }]
    drewAnythingRef.current = false
    setIsDrawing(true)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pts = pointsRef.current
    pts.push({ x, y })

    // Smooth using quadratic Bezier between midpoints
    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3]
      const p1 = pts[pts.length - 2]
      const p2 = pts[pts.length - 1]
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      ctx.beginPath()
      ctx.moveTo(mid1.x, mid1.y)
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y)
      ctx.stroke()
      drewAnythingRef.current = true
      setHasSignature(true)
    } else if (pts.length === 2) {
      // draw a tiny segment for the first movement to avoid a sharp start
      const p0 = pts[0]
      const p1 = pts[1]
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
      drewAnythingRef.current = true
      setHasSignature(true)
    }
  }

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault()
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
    // If no movement (tap), draw a dot
    if (isDrawing && !drewAnythingRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx && pointsRef.current[0]) {
          const p = pointsRef.current[0]
          ctx.beginPath()
          ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2)
          const prev = ctx.strokeStyle as string
          ctx.fillStyle = typeof prev === 'string' ? prev : '#000'
          ctx.fill()
          setHasSignature(true)
        }
      }
    }
    // restore scrolling on canvas
    if (canvasRef.current) {
      canvasRef.current.style.touchAction = 'pan-y'
    }
    pointsRef.current = []
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleFinish = () => {
    if (hasSignature) {
      setAnswer('contractSignature', 'signed')
      router.push('/procedures/5')
    }
  }

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar with back arrow */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 rounded-full text-text-primary hover:bg-surface/70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 px-3 pb-3 min-h-0 flex flex-col">
        <div className="mx-auto w-full max-w-md rounded-lg bg-surface shadow-soft border border-border-subtle/60 flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold leading-tight text-text-primary">Let&apos;s Make A Contract</h1>
            <p className="mt-1 text-sm font-semibold leading-tight text-text-secondary">
              Review & sign your commitment to achieving your goals.
            </p>
          </div>

          {/* Bullets */}
          <div className="px-4 py-1 flex-shrink-0">
            {[
              'I commit to tracking my Activities daily',
              'I promise to prioritize my well-being',
              'I will strive for consistency and progress',
              'I understand that change takes time and effort',
            ].map((text, idx, arr) => (
              <div key={text} className="">
                <div className="flex items-center gap-2 py-1.5">
                  <div className="relative h-4 w-4 flex items-center justify-center flex-shrink-0">
                    <StarIcon />
                  </div>
                  <span className="text-sm font-medium text-text-primary leading-tight">{text}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="h-px w-full bg-border-subtle/90" />
                )}
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="px-4 pt-2 pb-2 flex-1 flex flex-col min-h-0">
            <p className="text-sm font-semibold text-text-secondary mb-2 flex-shrink-0">
              Sign using your finger:
            </p>
            <div className="rounded-lg border border-border-subtle bg-surface-muted p-3 flex-1 flex flex-col">
              <div className="relative w-full h-32 sm:h-40 rounded-md">
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full rounded-md cursor-crosshair ${isDrawing ? 'touch-none' : 'touch-pan-y'}`}
                  onPointerDown={(e) => { 
                    // disable scrolling immediately while drawing
                    if (canvasRef.current) canvasRef.current.style.touchAction = 'none'
                    startDrawing(e)
                  }}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  onPointerCancel={stopDrawing}
                />
              </div>
              <div className="mt-3 flex items-center justify-between flex-shrink-0">
                <button onClick={clearSignature} className="text-sm text-text-secondary hover:text-text-primary underline">
                  Clear
                </button>
                <span className="text-xs text-text-secondary/70">Sign above to continue</span>
              </div>
            </div>
          </div>

          {/* Finish button inside card */}
          <div className="px-4 py-4 flex-shrink-0">
            <button
              onClick={handleFinish}
              disabled={!hasSignature}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-soft transition-colors disabled:cursor-not-allowed disabled:bg-border-subtle"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
