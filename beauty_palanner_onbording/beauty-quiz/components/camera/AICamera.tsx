"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Mode = 'face' | 'hair' | 'body'

interface AICameraProps {
  mode?: Mode
  onCapture: (blobUrl: string, blob: Blob) => void
  onCancel: () => void
}

type Detector = any

// Theme per mode for a radically different visual identity
const THEME: Record<Mode, { primary: string; accent: string; label: string }> = {
  face: { primary: '#7C3AED', accent: '#F472B6', label: 'FACE' },
  hair: { primary: '#0EA5A4', accent: '#22D3EE', label: 'HAIR' },
  body: { primary: '#F59E0B', accent: '#FBBF24', label: 'BODY' },
}

export default function AICamera({ mode = 'face', onCapture, onCancel }: AICameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const sampleRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<Detector | null>(null)
  const detectTimerRef = useRef<number | null>(null)
  const lightTimerRef = useRef<number | null>(null)

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(mode === 'body' ? 'environment' : 'user')
  const [videoReady, setVideoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null)
  const [light, setLight] = useState<'dark' | 'ok' | 'bright'>('ok')
  const [stableMs, setStableMs] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Mirror preview only for selfie/front camera; feels natural
  const mirrorPreview = facingMode === 'user'
  const theme = THEME[mode]

  const guideTitle = useMemo(() => {
    switch (mode) {
      case 'hair':
        return 'Align the crown area; hold still'
      case 'body':
        return 'Stand centered; full body in frame'
      default:
        return 'Center your face; hold still'
    }
  }, [mode])

  const buildConstraints = (fm: 'user' | 'environment'): MediaStreamConstraints => {
    const w = typeof window !== 'undefined' ? Math.max(360, Math.min(1280, window.innerWidth)) : 720
    const h = typeof window !== 'undefined' ? Math.max(640, Math.min(1920, window.innerHeight)) : 1280
    return { audio: false, video: { facingMode: fm, width: { ideal: w }, height: { ideal: h }, aspectRatio: { ideal: 3 / 4 } as any } }
  }

  const speak = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'en-US'
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u)
      }
    } catch {}
  }

  const startCamera = async (fm: 'user' | 'environment') => {
    try {
      setVideoReady(false)
      const s = await navigator.mediaDevices.getUserMedia(buildConstraints(fm))
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        try { await videoRef.current.play?.() } catch {}
      }
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Camera permission needed. Please allow access and try again.')
    }
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
      if (detectTimerRef.current) { window.clearInterval(detectTimerRef.current); detectTimerRef.current = null }
      if (lightTimerRef.current) { window.clearInterval(lightTimerRef.current); lightTimerRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  // Prepare canvas sizes when metadata is ready
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onReady = () => {
      setVideoReady(true)
      const w = v.videoWidth || v.clientWidth
      const h = v.videoHeight || v.clientHeight
      if (!w || !h) return
      ;[captureRef.current, overlayRef.current, sampleRef.current].forEach((c) => { if (c) { c.width = w; c.height = h } })
    }
    v.addEventListener('loadedmetadata', onReady)
    return () => v.removeEventListener('loadedmetadata', onReady)
  }, [streamRef.current])

  // Lighting meter via downscaled sampling
  useEffect(() => {
    if (!videoReady) return
    lightTimerRef.current && window.clearInterval(lightTimerRef.current)
    lightTimerRef.current = window.setInterval(() => {
      const v = videoRef.current, s = sampleRef.current
      if (!v || !s) return
      const ctx = s.getContext('2d'); if (!ctx) return
      const w = s.width, h = s.height
      ctx.drawImage(v, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data as Uint8ClampedArray
      let sum = 0
      // ensure i+2 is in bounds to satisfy TS
      for (let i = 0; i + 2 < data.length; i += 4) {
        // luminance
        const r = data[i] ?? 0
        const g = data[i + 1] ?? 0
        const b = data[i + 2] ?? 0
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const avg = sum / (data.length / 4)
      if (avg < 70) setLight('dark')
      else if (avg > 200) setLight('bright')
      else setLight('ok')
    }, 600)
    return () => { if (lightTimerRef.current) { window.clearInterval(lightTimerRef.current); lightTimerRef.current = null } }
  }, [videoReady])

  // Lazy load TFJS detector for face/hair guidance + radically different overlay drawing
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (mode === 'body') return
        const tf = await import('@tensorflow/tfjs-core')
        await import('@tensorflow/tfjs-backend-webgl')
        const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection')
        await tf.setBackend('webgl'); await tf.ready()
        if (cancelled) return
        detectorRef.current = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', maxFaces: 1, refineLandmarks: true }
        )
        startDetectLoop()
      } catch (e) {
        drawOverlay(null)
      }
    }
    const startDetectLoop = () => {
      if (detectTimerRef.current) window.clearInterval(detectTimerRef.current)
      detectTimerRef.current = window.setInterval(async () => {
        const v = videoRef.current
        const overlay = overlayRef.current
        if (!v || !overlay) return
        if (!v.videoWidth || !v.videoHeight) return
        try {
          let isOk = false
          let nextHint: string | null = null
          let sizeRatio = 0
          if (detectorRef.current) {
            const faces = await detectorRef.current.estimateFaces(v, { flipHorizontal: false })
            if (faces && faces.length > 0) {
              const box = faces[0].box
              if (box) {
                const w = overlay.width, h = overlay.height
                const b = { x: box.xMin, y: box.yMin, width: box.width, height: box.height }
                const cx = b.x + b.width / 2
                const cy = b.y + b.height / 2
                const centerDx = Math.abs(cx - w / 2) / w
                const centerDy = Math.abs(cy - h / 2) / h
                sizeRatio = Math.max(b.width / w, b.height / h)
                if (mode === 'face') {
                  isOk = centerDx < 0.18 && centerDy < 0.20 && sizeRatio > 0.20 && sizeRatio < 0.60
                } else {
                  // hair mode: higher head position and moderate distance
                  isOk = centerDx < 0.18 && cy / h < 0.55 && sizeRatio > 0.18 && sizeRatio < 0.50
                }
                if (!isOk) {
                  if (Math.abs(centerDy) > Math.abs(centerDx)) nextHint = centerDy > 0 ? 'Raise camera' : 'Lower camera'
                  else nextHint = centerDx > 0 ? 'Move left' : 'Move right'
                }
              }
            }
          }
          setOk(isOk)
          setHint(isOk ? null : nextHint)
          setStableMs((prev) => (isOk ? Math.min(prev + 120, 3000) : 0))
          drawOverlay(sizeRatio)
        } catch {
          drawOverlay(null)
        }
      }, 120)
    }
    const drawOverlay = (sizeRatio: number | null) => {
      const overlay = overlayRef.current
      if (!overlay) return
      const ctx = overlay.getContext('2d'); if (!ctx) return
      const w = overlay.width, h = overlay.height
      ctx.clearRect(0, 0, w, h)
      // gradient backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(0,0,0,0.30)')
      grad.addColorStop(1, 'rgba(0,0,0,0.50)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      if (mode === 'body') {
        const rx = w * 0.32, ry = h * 0.46
        roundRect(ctx, w / 2 - rx, h / 2 - ry, rx * 2, ry * 2, 28)
        ctx.fill()
      } else if (mode === 'face') {
        // Much wider and taller ellipse for face
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.42, 0, 0, Math.PI * 2); ctx.fill()
      } else {
        // hair crown: cutout higher and larger horizontally
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.40, w * 0.38, h * 0.28, 0, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()

      // outline with theme color + pulsing effect when ready
      ctx.strokeStyle = ok ? 'rgba(34,197,94,0.95)' : theme.primary
      ctx.lineWidth = ok ? 5 : 4
      if (mode === 'body') {
        const rx = w * 0.32, ry = h * 0.46
        roundRect(ctx, w / 2 - rx, h / 2 - ry, rx * 2, ry * 2, 28); ctx.stroke()
      } else if (mode === 'face') {
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.42, 0, 0, Math.PI * 2); ctx.stroke()
        // Add corner tick marks for better alignment
        if (ok) {
          ctx.strokeStyle = 'rgba(34,197,94,0.75)'; ctx.lineWidth = 3
          const rx = w * 0.38, ry = h * 0.42
          const ticks = [
            { ang: -Math.PI / 4, dx: 0.85, dy: 0.85 },
            { ang: Math.PI / 4, dx: 0.85, dy: -0.85 },
            { ang: 3 * Math.PI / 4, dx: -0.85, dy: -0.85 },
            { ang: 5 * Math.PI / 4, dx: -0.85, dy: 0.85 },
          ]
          ticks.forEach(({ ang, dx, dy }) => {
            const x = w / 2 + rx * Math.cos(ang)
            const y = h / 2 + ry * Math.sin(ang)
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + dx * 18, y + dy * 18)
            ctx.stroke()
          })
        }
      } else {
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.40, w * 0.38, h * 0.28, 0, 0, Math.PI * 2); ctx.stroke()
        // add crown tick marks
        ctx.strokeStyle = ok ? 'rgba(34,197,94,0.95)' : theme.accent
        ctx.lineWidth = 2
        const cx = w / 2, cy = h * 0.18, r = Math.min(w, h) * 0.10
        for (let i = -60; i <= 60; i += 15) {
          const ang = (i * Math.PI) / 180
          const x1 = cx + Math.cos(ang) * (r - 6)
          const y1 = cy + Math.sin(ang) * (r - 6)
          const x2 = cx + Math.cos(ang) * (r + 6)
          const y2 = cy + Math.sin(ang) * (r + 6)
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        }
      }

      // countdown ring when imminent
      if (countdown !== null) {
        const radius = Math.min(w, h) * 0.10
        ctx.lineWidth = 10
        ctx.strokeStyle = theme.accent
        const pct = Math.max(0, Math.min(1, countdown / 3))
        ctx.beginPath()
        ctx.arc(w / 2, h * 0.85, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
        ctx.stroke()
      }

      // light indicator
      const lightText = light === 'dark' ? 'Too dark' : light === 'bright' ? 'Too bright' : 'Good light'
      const lightColor = light === 'ok' ? '#22c55e' : '#f59e0b'
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      roundRect(ctx, 12, 12, 120, 32, 10); ctx.fill()
      ctx.fillStyle = lightColor; ctx.font = 'bold 14px ui-sans-serif, system-ui'
      ctx.fillText(lightText, 24, 34)
      ctx.fillStyle = lightColor
      ctx.beginPath(); ctx.arc(24, 28, 5, 0, Math.PI * 2); ctx.fill()

      // distance indicator (based on sizeRatio)
      if (sizeRatio !== null && mode !== 'body') {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        roundRect(ctx, w - 140, 12, 128, 32, 10); ctx.fill()
        const label = sizeRatio < 0.22 ? 'Too far' : sizeRatio > 0.56 ? 'Too close' : 'Distance OK'
        const col = label === 'Distance OK' ? '#22c55e' : '#f59e0b'
        ctx.fillStyle = col; ctx.font = 'bold 14px ui-sans-serif, system-ui'
        ctx.fillText(label, w - 128, 34)
      }
    }
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath(); ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
    }
    load()
    return () => { cancelled = true; if (detectorRef.current?.dispose) detectorRef.current.dispose(); detectorRef.current = null; if (detectTimerRef.current) { window.clearInterval(detectTimerRef.current); detectTimerRef.current = null } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady, mode, light])

  // Auto-capture flow: when stable long enough, run a 3..2..1 visual and capture
  useEffect(() => {
    const STABLE_TARGET = 1400 // ms
    if (preview) return
    if (stableMs >= STABLE_TARGET && countdown === null) {
      speak('Hold still, capturing')
      setCountdown(3)
      let n = 3
      const id = window.setInterval(() => {
        n -= 1
        if (n <= 0) {
          window.clearInterval(id)
          setCountdown(null)
          doCapture()
        } else {
          setCountdown(n)
        }
      }, 500)
      return () => window.clearInterval(id)
    }
    return undefined
  }, [stableMs, countdown, preview])

  const doCapture = async () => {
    const v = videoRef.current, c = captureRef.current
    if (!v || !c) return
    const w = v.videoWidth || v.clientWidth
    const h = v.videoHeight || v.clientHeight
    c.width = w; c.height = h
    const ctx = c.getContext('2d'); if (!ctx) return
    setFlash(true)
  // Always save unmirrored
  ctx.drawImage(v, 0, 0, w, h)
    c.toBlob((blob) => { if (blob) { const url = URL.createObjectURL(blob); setPreview({ url, blob }) } setTimeout(() => setFlash(false), 130) }, 'image/jpeg', 0.95)
  }

  const [accepting, setAccepting] = useState(false)
  const acceptPreview = () => {
    if (!preview) return
    if (accepting) return
    setAccepting(true)
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    if (detectTimerRef.current) { window.clearInterval(detectTimerRef.current); detectTimerRef.current = null }
    onCapture(preview.url, preview.blob)
  }

  const retake = async () => {
    setPreview(null)
    setStableMs(0)
    if (!streamRef.current) await startCamera(facingMode)
  }

  const closeCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    if (detectTimerRef.current) { window.clearInterval(detectTimerRef.current); detectTimerRef.current = null }
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50" style={{ height: '100dvh', background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.accent} 100%)` }}>
      <div className="absolute inset-0 bg-black/60" />
      {/* Video layer */}
      <video ref={videoRef} autoPlay playsInline muted onCanPlay={() => setVideoReady(true)}
             className={`absolute inset-0 w-full h-full object-contain ${mirrorPreview ? 'scale-x-[-1]' : ''}`} />
      {/* Overlay */}
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 6px, 6px)' }}>
        <div className="px-3 py-1.5 rounded-full text-white font-bold text-xs tracking-widest" style={{ background: 'rgba(0,0,0,0.35)' }}>{theme.label}</div>
        <div className="flex-1 text-center text-white/95 font-semibold text-sm">{guideTitle}{hint ? <span className="opacity-80"> · {hint}</span> : null}</div>
        <button onClick={closeCamera} className="bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center border border-white/30 hover:bg-black/70"
                aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L16 16M16 6L6 16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 10px, 10px)' }}>
        <button onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
                className="bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center border border-white/30 hover:bg-black/70"
                title="Switch camera" aria-label="Switch camera">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14a7 7 0 0 1 7-7h2.17l-1.59-1.59a1 1 0 1 1 1.42-1.42l3.3 3.3a1 1 0 0 1 0 1.42l-3.3 3.3a1 1 0 1 1-1.42-1.42L16.17 9H14a5 5 0 0 0-5 5 1 1 0 1 1-2 0Zm14 0a1 1 0 1 1-2 0 7 7 0 0 1-7 7h-2.17l1.59 1.59a1 1 0 1 1-1.42 1.42l-3.3-3.3a1 1 0 0 1 0-1.42l3.3-3.3a1 1 0 1 1 1.42 1.42L11.83 19H14a5 5 0 0 0 5-5 1 1 0 1 1 2 0Z" fill="#fff"/>
          </svg>
        </button>
        {/* Manual shutter button - always visible */}
        <button onClick={() => doCapture()} disabled={!!error || !!preview}
                className="bg-white text-black rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-4 border-white active:scale-95 transition disabled:opacity-50"
                aria-label="Take photo">
          <div className="w-14 h-14 rounded-full border-2 border-gray-300 shadow-inner" style={{ background: ok ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'conic-gradient(from 0deg, #fff 0%, #f3f4f6 100%)' }} />
        </button>
        {/* Stability indicator on right */}
        <div className="w-12 h-12 rounded-full bg-black/50 border border-white/30 flex items-center justify-center">
          {stableMs > 0 && (
            <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center">
              <div className="text-white text-xs font-bold">{Math.min(3, Math.floor(stableMs / 500))}</div>
            </div>
          )}
          {stableMs === 0 && <div className="w-2 h-2 rounded-full bg-white/40" />}
        </div>
      </div>

      {/* Flash */}
      {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none" onAnimationEnd={() => setFlash(false)} />}

      {/* Offscreen canvases */}
      <canvas ref={captureRef} className="hidden" />
      <canvas ref={sampleRef} className="hidden" />

      {/* Preview overlay */}
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-full flex items-center justify-center mb-4">
              <div className={`relative ${mode === 'face' ? 'w-48 h-48 rounded-full' : 'w-60 aspect-[3/4] rounded-2xl'} overflow-hidden ring-4`} style={{ borderColor: theme.accent }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="Preview" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={retake} disabled={accepting} className={`flex-1 h-11 rounded-xl font-semibold border border-gray-300 bg-white text-gray-800 ${accepting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}>Retake</button>
              <button onClick={acceptPreview} disabled={accepting} className={`flex-1 h-11 rounded-xl text-white font-semibold shadow-md ${accepting ? 'opacity-70 cursor-wait' : ''}`} style={{ background: `linear-gradient(160deg, ${theme.primary}, ${theme.accent})` }}>{accepting ? 'Using…' : 'Use this photo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

