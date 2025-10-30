"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

type Mode = 'face' | 'hair' | 'body'

interface ModernCameraProps {
  mode?: Mode
  onCapture: (blobUrl: string, blob: Blob) => void
  onCancel: () => void
}

// Lazy types to avoid importing heavy types at module load
type Detector = any

export default function ModernCamera({ mode = 'face', onCapture, onCancel }: ModernCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<Detector | null>(null)
  const detectTimerRef = useRef<number | null>(null)

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [videoReady, setVideoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null)
  // Mirror preview only for selfie/front camera for natural movement
  const mirrorPreview = facingMode === 'user'

  const guideTitle = useMemo(() => {
    switch (mode) {
      case 'hair':
        return 'Align the top of your head'
      case 'body':
        return 'Center your full body'
      default:
        return 'Center your face'
    }
  }, [mode])

  const buildConstraints = (fm: 'user' | 'environment'): MediaStreamConstraints => {
    const w = typeof window !== 'undefined' ? Math.max(360, Math.min(1280, window.innerWidth)) : 720
    const h = typeof window !== 'undefined' ? Math.max(640, Math.min(1920, window.innerHeight)) : 1280
    return {
      audio: false,
      video: {
        facingMode: fm,
        width: { ideal: w },
        height: { ideal: h },
        aspectRatio: { ideal: 3 / 4 } as any,
      },
    }
  }

  const startCamera = async (fm: 'user' | 'environment') => {
    try {
      setVideoReady(false)
      const s = await navigator.mediaDevices.getUserMedia(buildConstraints(fm))
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        try { await videoRef.current.play?.() } catch {}
      }
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Unable to access the camera. Please check permissions and try again.')
    }
  }

  // Restart camera on facingMode change
  useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (detectTimerRef.current) {
        window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  // Prepare canvases when metadata ready
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onReady = () => {
      setVideoReady(true)
      const w = v.videoWidth || v.clientWidth
      const h = v.videoHeight || v.clientHeight
      if (!w || !h) return
      if (canvasRef.current) {
        canvasRef.current.width = w
        canvasRef.current.height = h
      }
      if (overlayRef.current) {
        overlayRef.current.width = w
        overlayRef.current.height = h
      }
    }

    v.addEventListener('loadedmetadata', onReady)
    return () => v.removeEventListener('loadedmetadata', onReady)
  }, [streamRef.current])

  // Lazy load face detector and run guidance
  useEffect(() => {
    let cancelled = false
    const loadAndRun = async () => {
      try {
        // Only load model for face/hair modes
        if (mode === 'body') return
        const tf = await import('@tensorflow/tfjs-core')
        await import('@tensorflow/tfjs-backend-webgl')
        const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection')
        await tf.setBackend('webgl')
        await tf.ready()
        if (cancelled) return
        detectorRef.current = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', maxFaces: 1, refineLandmarks: true }
        )
        if (!videoRef.current) return

        if (detectTimerRef.current) window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = window.setInterval(async () => {
          const video = videoRef.current!
          if (!video.videoWidth || !video.videoHeight) return
          if (!detectorRef.current) return
          try {
            const faces = await detectorRef.current.estimateFaces(video, { flipHorizontal: false })
            const overlay = overlayRef.current
            if (!overlay) return
            const ctx = overlay.getContext('2d')
            if (!ctx) return
            ctx.clearRect(0, 0, overlay.width, overlay.height)

            let isOk = false
            let nextHint: string | null = null

            if (faces && faces.length > 0) {
              const face: any = faces[0]
              const box = face.box
              if (box) {
                const w = overlay.width
                const h = overlay.height
                const b = { x: box.xMin, y: box.yMin, width: box.width, height: box.height }
                const cx = b.x + b.width / 2
                const cy = b.y + b.height / 2
                const centerDx = Math.abs(cx - w / 2) / w
                const centerDy = Math.abs(cy - h / 2) / h
                const sizeRatio = Math.max(b.width / w, b.height / h)

                if (mode === 'face') {
                  isOk = centerDx < 0.20 && centerDy < 0.22 && sizeRatio > 0.22 && sizeRatio < 0.60
                } else {
                  // hair: a bit farther and higher in frame
                  isOk = centerDx < 0.22 && cy / h < 0.58 && sizeRatio > 0.15 && sizeRatio < 0.50
                }

                if (!isOk) {
                  if (Math.abs(centerDy) > Math.abs(centerDx)) {
                    nextHint = centerDy > 0 ? 'Raise camera' : 'Lower camera'
                  } else {
                    nextHint = centerDx > 0 ? 'Move left' : 'Move right'
                  }
                }

                // Draw guide box for debug/UX
                ctx.strokeStyle = 'rgba(255,255,255,0.35)'
                ctx.lineWidth = 2
                ctx.strokeRect(b.x, b.y, b.width, b.height)
              }
            }

            setOk(isOk)
            setHint(isOk ? null : nextHint)
            drawGuide()
          } catch (e) {
            // detection errors are non-fatal; keep UI working
          }
        }, 120)
      } catch (e) {
        // If loading fails, still draw static guides
        drawGuide()
      }
    }

    const drawGuide = () => {
      const overlay = overlayRef.current
      if (!overlay) return
      const ctx = overlay.getContext('2d')
      if (!ctx) return
      const w = overlay.width
      const h = overlay.height
      // Dim background with vignette
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, w, h)

      // Cutout area
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      if (mode === 'body') {
        const rx = w * 0.28
        const ry = h * 0.44
        roundedRect(ctx, w / 2 - rx, h / 2 - ry, rx * 2, ry * 2, 24)
        ctx.fill()
      } else {
        ctx.beginPath()
        const rx = w * (mode === 'face' ? 0.28 : 0.27)
        const ry = h * (mode === 'face' ? 0.33 : 0.35)
        ctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Outline
      ctx.save()
      ctx.strokeStyle = ok ? 'rgba(34,197,94,0.95)' : 'rgba(250,204,21,0.95)'
      ctx.lineWidth = 3
      if (mode !== 'body') {
        const rx = w * (mode === 'face' ? 0.28 : 0.27)
        const ry = h * (mode === 'face' ? 0.33 : 0.35)
        ctx.beginPath()
        ctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        const rx = w * 0.28
        const ry = h * 0.44
        roundedRect(ctx, w / 2 - rx, h / 2 - ry, rx * 2, ry * 2, 24)
        ctx.stroke()
      }
      ctx.restore()
    }

    const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
    }

    loadAndRun()
    drawGuide()
    return () => {
      cancelled = true
      if (detectorRef.current?.dispose) detectorRef.current.dispose()
      detectorRef.current = null
      if (detectTimerRef.current) {
        window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady, mode])

  const handleCapture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || video.clientWidth
    const h = video.videoHeight || video.clientHeight
    if (!w || !h) return

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setFlash(true)

    // Always save unmirrored
    ctx.drawImage(video, 0, 0, w, h)

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setPreview({ url, blob })
      }
      setTimeout(() => setFlash(false), 120)
    }, 'image/jpeg', 0.95)
  }

  const [accepting, setAccepting] = useState(false)
  const acceptPreview = () => {
    if (!preview) return
    if (accepting) return
    setAccepting(true)
    // stop camera and timers before returning
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (detectTimerRef.current) {
      window.clearInterval(detectTimerRef.current)
      detectTimerRef.current = null
    }
    onCapture(preview.url, preview.blob)
  }

  const retake = async () => {
    setPreview(null)
    if (!streamRef.current) await startCamera(facingMode)
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (detectTimerRef.current) {
      window.clearInterval(detectTimerRef.current)
      detectTimerRef.current = null
    }
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95" style={{ height: '100dvh' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {error ? (
            <div className="text-white p-8">{error}</div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-contain ${mirrorPreview ? 'scale-x-[-1]' : ''}`}
                onCanPlay={() => setVideoReady(true)}
              />
              {/* overlay for guides */}
              <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
            </>
          )}

          {/* interaction layer */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top HUD */}
            <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs md:text-sm font-medium shadow pointer-events-auto"
                 style={{ top: 'max(env(safe-area-inset-top, 0px) + 10px, 10px)' }}>
              {guideTitle}{hint ? <span className="opacity-80"> · {hint}</span> : null}
            </div>

            {/* Close */}
            <button
              onClick={closeCamera}
              className="absolute bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80 pointer-events-auto"
              style={{ top: 'max(env(safe-area-inset-top, 0px) + 8px, 8px)', right: '10px' }}
              aria-label="Close"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="10" fill="#18181b" stroke="#a1a1aa" strokeWidth="1.5"/>
                <path d="M7.7 7.7l6.6 6.6M14.3 7.7l-6.6 6.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Switch camera */}
            <button
              onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
              className="absolute bg-black/60 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/80 border border-white/30 pointer-events-auto"
              style={{ right: '16px', bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
              title="Switch camera"
              aria-label="Switch camera"
            >
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14a7 7 0 0 1 7-7h2.17l-1.59-1.59a1 1 0 1 1 1.42-1.42l3.3 3.3a1 1 0 0 1 0 1.42l-3.3 3.3a1 1 0 1 1-1.42-1.42L16.17 9H14a5 5 0 0 0-5 5 1 1 0 1 1-2 0Zm14 0a1 1 0 1 1-2 0 7 7 0 0 1-7 7h-2.17l1.59 1.59a1 1 0 1 1-1.42 1.42l-3.3-3.3a1 1 0 0 1 0-1.42l3.3-3.3a1 1 0 1 1 1.42 1.42L11.83 19H14a5 5 0 0 0 5-5 1 1 0 1 1 2 0Z" fill="#fff"/>
              </svg>
            </button>

            {/* Shutter */}
            <button
              onClick={handleCapture}
              disabled={!!error || !!preview}
              className="absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-black rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-xl border-4 border-white active:scale-95 transition pointer-events-auto"
              style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
              aria-label="Take a photo"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-zinc-300 shadow-inner" />
            </button>
          </div>

          {/* Flash */}
          {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none" onAnimationEnd={() => setFlash(false)} />}

          {/* Offscreen capture canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      {/* Preview overlay */}
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-full flex items-center justify-center mb-4">
              <div className={`relative ${mode === 'face' ? 'w-48 h-48 rounded-full' : 'w-60 aspect-[3/4] rounded-2xl'} overflow-hidden ring-4 ring-purple-100 shadow-lg`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="Preview" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={retake} disabled={accepting} className={`flex-1 h-11 rounded-xl font-semibold border border-gray-300 bg-white text-gray-800 ${accepting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}>Retake</button>
              <button onClick={acceptPreview} disabled={accepting} className={`flex-1 h-11 rounded-xl text-white font-semibold shadow-md bg-gradient-to-r from-purple-600 to-pink-600 ${accepting ? 'opacity-70 cursor-wait' : 'hover:brightness-110'}`}>{accepting ? 'Using…' : 'Use this photo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
