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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const pointsRef = useRef<Array<{ x: number; y: number }>>([])
  const drewAnythingRef = useRef(false)
  const { theme } = useTheme()
  // Store initializer so we can re-run after clearing
  const initCanvasRef = useRef<() => void>(() => {})
  // Touch fallback state
  const touchActiveRef = useRef(false)
  const activeTouchIdRef = useRef<number | null>(null)
  // Track last point for smoothing
  const lastPtRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Instrumentation to ensure new code really loaded in user's environment
      console.info('[Signature] ContractAgreementStep mounted v3.3 (instrumented)')
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = (containerRef.current ?? canvas).getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      const cssW = Math.round(rect.width)
      const cssH = Math.round(rect.height)
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr)
        canvas.height = Math.round(cssH * dpr)
        canvas.style.width = cssW + 'px'
        canvas.style.height = cssH + 'px'
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.strokeStyle = theme === 'dark' ? '#FAFAFA' : '#212121'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    const init = () => {
      setCanvasSize()
      ctx.beginPath()
    }
    initCanvasRef.current = init
    // Initial sizing (with retry if zero)
    let rafId: number | null = null
    const ensureSized = () => {
      init()
      const rect = (containerRef.current ?? canvas).getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) {
        rafId = requestAnimationFrame(ensureSized)
      }
    }
    ensureSized()

    const handleResize = () => {
      init()
    }
    const obsTarget = containerRef.current ?? canvas
    const ro = new ResizeObserver(() => init())
    try { ro.observe(obsTarget) } catch {}
    window.addEventListener('resize', handleResize)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      try { ro.disconnect() } catch {}
      window.removeEventListener('resize', handleResize)
    }
  }, [theme])

  // Native touch fallback for mobile browsers that throttle pointer events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getNormalizedPos = (clientX: number, clientY: number) => {
      // Map client coordinates to canvas drawing coordinates in CSS pixels,
      // independent of DPR and CSS scaling.
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cssX = clientX - rect.left
      const cssY = clientY - rect.top
      // If canvas backing size != rect size (due to DPR/resize), compensate.
      const scaleX = rect.width > 0 ? canvas.width / rect.width : dpr
      const scaleY = rect.height > 0 ? canvas.height / rect.height : dpr
      // Our ctx is scaled by dpr (see init), so convert back to CSS space.
      const x = cssX * (scaleX / dpr)
      const y = cssY * (scaleY / dpr)
      return { x, y }
    }

    const onTouchStart = (ev: TouchEvent) => {
      if (!canvas) return
      ev.preventDefault()
      const t = ev.changedTouches && ev.changedTouches.length > 0 ? ev.changedTouches[0] : undefined
      if (!t) return
      activeTouchIdRef.current = t.identifier
      touchActiveRef.current = true
      const { x, y } = getNormalizedPos(t.clientX, t.clientY)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
      pointsRef.current = [{ x, y }]
      lastPtRef.current = { x, y }
      drewAnythingRef.current = false
      setIsDrawing(true)
      // keep touch action disabled while drawing
      canvas.style.touchAction = 'none'
    }

    const onTouchMove = (ev: TouchEvent) => {
      if (!touchActiveRef.current) return
      if (!canvas) return
      ev.preventDefault()
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const id = activeTouchIdRef.current
      let targetTouch: Touch | undefined
      if (id != null) {
        for (let i = 0; i < ev.touches.length; i++) {
          const tt = ev.touches[i]
          if (!tt) continue
          if (tt.identifier === id) { targetTouch = tt; break }
        }
      }
      const t = targetTouch ?? ev.touches[0]
      if (!t) return
      const { x, y } = getNormalizedPos(t.clientX, t.clientY)
      pointsRef.current.push({ x, y })
      // Draw smoothed segment using quadratic curve to midpoint
      const last = lastPtRef.current
      if (last) {
        const mx = (last.x + x) / 2
        const my = (last.y + y) / 2
        ctx.quadraticCurveTo(last.x, last.y, mx, my)
        ctx.stroke()
      } else {
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      lastPtRef.current = { x, y }
      drewAnythingRef.current = true
      setHasSignature(true)
      if ((window as any).__SIG_DEBUG__) {
        console.log('[Signature][touch] points', pointsRef.current.length)
      }
    }

    const finishTouch = () => {
      // Draw a dot if no movement
      if (isDrawing && !drewAnythingRef.current) {
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
      pointsRef.current = []
      lastPtRef.current = null
      setIsDrawing(false)
      touchActiveRef.current = false
      activeTouchIdRef.current = null
      // keep canvas non-scrollable to avoid gesture interference
      if (canvas) canvas.style.touchAction = 'none'
    }

    const onTouchEnd = (ev: TouchEvent) => {
      if (!touchActiveRef.current) return
      ev.preventDefault()
      finishTouch()
    }
    const onTouchCancel = (ev: TouchEvent) => {
      if (!touchActiveRef.current) return
      ev.preventDefault()
      finishTouch()
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', onTouchCancel, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [isDrawing])

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if ((e as any).pointerType === 'touch') return // use touch handlers on mobile
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    // Re-initialize in case DPR or theme changed silently since last stroke or after clear
    initCanvasRef.current?.()
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const scaleX = rect.width > 0 ? canvas.width / rect.width : dpr
    const scaleY = rect.height > 0 ? canvas.height / rect.height : dpr
    const x = (e.clientX - rect.left) * (scaleX / dpr)
    const y = (e.clientY - rect.top) * (scaleY / dpr)

    // capture pointer to continue receiving events
    e.currentTarget.setPointerCapture?.(e.pointerId)
    // Start a fresh path
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    pointsRef.current = [{ x, y }]
    lastPtRef.current = { x, y }
    drewAnythingRef.current = false
    setIsDrawing(true)
  }

  const DEBUG = false
  const drawSegment = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Continuous path drawing using lineTo for robustness
    ctx.lineTo(x, y)
    ctx.stroke()
    drewAnythingRef.current = true
    setHasSignature(true)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if ((e as any).pointerType === 'touch') return // handled by touch handlers
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const scaleX = rect.width > 0 ? canvas.width / rect.width : dpr
    const scaleY = rect.height > 0 ? canvas.height / rect.height : dpr
    const processPoint = (clientX: number, clientY: number) => {
      const x = (clientX - rect.left) * (scaleX / dpr)
      const y = (clientY - rect.top) * (scaleY / dpr)
      pointsRef.current.push({ x, y })
      // Smooth with quadratic curve to midpoint
      const last = lastPtRef.current
      if (last) {
        const mx = (last.x + x) / 2
        const my = (last.y + y) / 2
        ctx.quadraticCurveTo(last.x, last.y, mx, my)
        ctx.stroke()
      } else {
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      lastPtRef.current = { x, y }
      drewAnythingRef.current = true
      setHasSignature(true)
    }

    // Use coalesced events (if supported) for smoother line, otherwise fallback
    const coalesced = (e.nativeEvent as any).getCoalescedEvents?.() as PointerEvent[] | undefined
    if (coalesced && coalesced.length > 0) {
      for (const ev of coalesced) {
        processPoint(ev.clientX, ev.clientY)
      }
    } else {
      processPoint(e.clientX, e.clientY)
    }
    if ((window as any).__SIG_DEBUG__) {
      console.log('[Signature] points', pointsRef.current.length)
    }
  }

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) {
      if ((e as any).pointerType === 'touch') return // handled by touch handlers
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
    // Keep touch action disabled to avoid mobile gesture interference
    if (canvasRef.current) canvasRef.current.style.touchAction = 'none'
    pointsRef.current = []
    lastPtRef.current = null
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Full reset: clear, reset path data & internal refs so next stroke is fresh
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    // Re-apply stylistic settings (in case any were mutated)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.5
    ctx.strokeStyle = theme === 'dark' ? '#FAFAFA' : '#212121'
    pointsRef.current = []
    drewAnythingRef.current = false
    setIsDrawing(false)
    setHasSignature(false)
    // Re-run full initialization (resizing + smoothing flags) to be extra safe
    initCanvasRef.current?.()
  }

  const handleFinish = () => {
    if (hasSignature) {
      setAnswer('ContractSignature', 'signed')
      router.push('/procedures/4')
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
          <div className="px-4 pt-2 pb-2 flex-none flex flex-col">
            <p className="text-sm font-semibold text-text-secondary mb-2 flex-shrink-0">
              Sign using your finger:
            </p>
            <div className="mb-1 -mt-1 text-[10px] uppercase tracking-wider text-text-secondary/50 select-none">Signature v3.3</div>
            <div className="rounded-lg border border-border-subtle bg-surface-muted p-3 flex-none flex flex-col">
              <div
                className="relative w-full h-[28vh] sm:h-[24vh] md:h-[22vh]" 
                ref={containerRef}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full rounded-md cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onPointerDown={e => {
                    if (canvasRef.current) canvasRef.current.style.touchAction = 'none';
                    startDrawing(e);
                  }}
                  onPointerMove={e => {
                    draw(e);
                  }}
                  onPointerUp={e => {
                    stopDrawing(e);
                  }}
                  onPointerCancel={e => {
                    stopDrawing(e);
                  }}
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
