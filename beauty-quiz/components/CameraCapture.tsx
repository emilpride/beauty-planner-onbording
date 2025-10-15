"use client"

import { useRef, useEffect, useState } from "react"

interface CameraCaptureProps {
  onCapture: (blobUrl: string, blob: Blob) => void
  onCancel: () => void
  mode?: 'face' | 'hair' | 'body'
}

import dynamic from 'next/dynamic'
const CameraOverlay = dynamic(() => import('./CameraOverlay'), { ssr: false })
const PreviewModal = dynamic(() => import('./PreviewModal'), { ssr: false })

export default function CameraCapture({ onCapture, onCancel, mode = 'face' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user') // default: selfie
  const [videoReady, setVideoReady] = useState(false)
  const activeStreamRef = useRef<MediaStream | null>(null)
  const [guideOk, setGuideOk] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const detectTimerRef = useRef<number | null>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [topInstruction, setTopInstruction] = useState<string>('Align your face within the guide')
  const [flash, setFlash] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  // Request camera with the desired facingMode
  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      setVideoReady(false)
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      // Stop any existing tracks before swapping streams
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      activeStreamRef.current = s
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        const playPromise = videoRef.current.play?.()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            /* Ignore autoplay rejections – user interaction will trigger play */
          })
        }
      }
      setError(null)
    } catch (e) {
      setError("Unable to access the camera.")
    }
  }

  // Restart camera when facingMode changes
  useEffect(() => {
    startCamera(facingMode)
    return () => {
      activeStreamRef.current?.getTracks().forEach((track) => track.stop())
      activeStreamRef.current = null
      if (detectTimerRef.current) {
        window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = null
      }
    }
    // eslint-disable-next-line
  }, [facingMode])

  // Track when the video element has enough data to capture frames
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleReady = () => {
      setVideoReady(true)
      const playPromise = video.play?.()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          /* noop – user gesture will resume playback */
        })
      }
    }

    video.addEventListener('loadedmetadata', handleReady)
    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('canplay', handleReady)

    return () => {
      video.removeEventListener('loadedmetadata', handleReady)
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('canplay', handleReady)
    }
  }, [stream])

  // Lightweight detection to turn overlay green when well-positioned
  useEffect(() => {
    if (!videoReady) return

    const video = videoRef.current
    if (!video) return

    // Prepare a small offscreen canvas for sampling
    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas')
    }

    const hasFaceDetector = typeof (window as any).FaceDetector !== 'undefined'
    const faceDetector = hasFaceDetector ? new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null

    const evaluateFaceBoxes = (w: number, h: number, boxes: { width: number; height: number; top: number; left: number }[]) => {
      if (!boxes || boxes.length === 0) return false
      const b = boxes[0]
      const cx = b.left + b.width / 2
      const cy = b.top + b.height / 2
      const centerDx = Math.abs(cx - w / 2) / w // 0..0.5
      const centerDy = Math.abs(cy - h / 2) / h
      const sizeRatio = Math.max(b.width / w, b.height / h)
      if (mode === 'face' || mode === 'hair') {
        // Slightly relaxed center threshold for iOS Safari variability
        return centerDx < 0.22 && centerDy < 0.22 && sizeRatio > 0.24 && sizeRatio < 0.62
      }
      // body: face should be smaller and slightly upper half
      return centerDx < 0.28 && cy / h < 0.62 && sizeRatio > 0.07 && sizeRatio < 0.38
    }

    const luminanceHeuristic = (w: number, h: number) => {
      // Fallback: analyze a center crop for brightness and variance
      const canvas = sampleCanvasRef.current!
      const ctx = canvas.getContext('2d')
      if (!ctx) return false
      const cropW = Math.floor(w * (mode === 'body' ? 0.32 : 0.42))
      const cropH = Math.floor(h * (mode === 'body' ? 0.52 : 0.52))
      canvas.width = cropW
      canvas.height = cropH
      const sx = Math.floor((w - cropW) / 2)
      const sy = Math.floor((h - cropH) / 2)
      try {
        ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)
      } catch {
        return false
      }
      const img = ctx.getImageData(0, 0, cropW, cropH)
      const data = img.data
      let sum = 0
      let sumSq = 0
      const n = cropW * cropH
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // Rec. 601 luma approximation
        const y = 0.299 * r + 0.587 * g + 0.114 * b
        sum += y
        sumSq += y * y
      }
      const mean = sum / n
      const variance = Math.max(0, sumSq / n - mean * mean)
      // Thresholds a чуть мягче для реальных условий и iOS
      const meanOk = mean > 50 && mean < 210
      const varOk = variance > 800
      return meanOk && varOk
    }

    // Run at ~6Hz to limit CPU
    if (detectTimerRef.current) window.clearInterval(detectTimerRef.current)
    detectTimerRef.current = window.setInterval(async () => {
      if (!video.videoWidth || !video.videoHeight) return
      const w = video.videoWidth
      const h = video.videoHeight

      let ok = false
      let nextHint: string | null = null
      let distanceHint: string | null = null
      if (faceDetector) {
        try {
          // Draw to an offscreen canvas to feed detector with bitmap
          const off = sampleCanvasRef.current!
          const ctx = off.getContext('2d')
          if (ctx) {
            off.width = w
            off.height = h
            ctx.drawImage(video, 0, 0, w, h)
            // Prefer detect on ImageBitmap if supported
            let source: any = off
            if ('createImageBitmap' in window) {
              try {
                source = await createImageBitmap(off)
              } catch {}
            }
            const faces: any[] = await faceDetector.detect(source)
            const boxes = faces.map((f: any) => (f.boundingBox ? f.boundingBox : f))
            ok = evaluateFaceBoxes(w, h, boxes)
            if (!ok && boxes.length) {
              const b = boxes[0]
              const cx = b.left + b.width / 2
              const cy = b.top + b.height / 2
              const centerDx = (cx - w / 2) / w
              const centerDy = (cy - h / 2) / h
              const sizeRatio = Math.max(b.width / w, b.height / h)
              // Предложение: куда сдвинуться
              if (Math.abs(centerDy) > Math.abs(centerDx)) {
                nextHint = centerDy > 0 ? 'A bit higher' : 'A bit lower'
              } else {
                nextHint = centerDx > 0 ? 'A bit left' : 'A bit right'
              }
              // Distance suggestions for face/hair
              if (mode === 'face' || mode === 'hair') {
                if (sizeRatio < 0.28) distanceHint = 'Move closer'
                else if (sizeRatio > 0.56) distanceHint = 'Move farther'
              }
            }
          }
        } catch {
          // Ignore detector errors; fallback below
        }
      }
      if (!ok) {
        ok = luminanceHeuristic(w, h)
        if (!ok && !nextHint) {
          nextHint = mode === 'body' ? 'Step back a little' : 'Move closer to the center'
        }
      }
      setGuideOk(ok)
      if (ok) {
        setHint(null)
        setTopInstruction('Ready – tap the shutter')
      } else {
        setTopInstruction(
          mode === 'body'
            ? 'Stand straight; keep your whole body within the outline'
            : 'Align your face within the guide'
        )
        setHint(distanceHint ? `${distanceHint}${nextHint ? ' · ' + nextHint : ''}` : nextHint)
      }
    }, 160)

    return () => {
      if (detectTimerRef.current) {
        window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = null
      }
    }
  }, [videoReady, mode])

  // Camera switch button
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const handleCapture = async () => {
    const video = videoRef.current
    if (!video) return
    // Ensure playback on user gesture (required by some browsers)
    try { await video.play?.() } catch {}

    // Wait briefly if metadata isn't ready yet
    let attempts = 0
    while (attempts < 10 && (!video.videoWidth || !video.videoHeight) && !videoReady) {
      await new Promise(r => setTimeout(r, 100))
      attempts++
    }

    const width = video.videoWidth || video.clientWidth
    const height = video.videoHeight || video.clientHeight
    if (!width || !height) {
      setError('Camera not ready yet. Please wait a moment and try again.')
      return
    }

  setCapturing(true)
  setFlash(true)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCapturing(false)
      setError('Failed to capture image. Please try again.')
      return
    }
    // If mirrored preview (user-facing), un-mirror on capture so the saved photo is correct
    if (facingMode === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, width, height)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    } else {
      ctx.drawImage(video, 0, 0, width, height)
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setPreviewBlob(blob)
      }
      // brief flash effect then stop capturing
      setTimeout(() => setFlash(false), 120)
      setCapturing(false)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
      <div className="relative bg-black rounded-xl overflow-hidden flex flex-col items-center sm:rounded-none sm:justify-center sm:items-center"
           style={{ width: 'min(90vw, 56vmin)', height: 'min(90vh, 74vmin)', aspectRatio: '3 / 4' }}>
        {error ? (
          <div className="text-white p-8">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover bg-black ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${previewUrl && previewBlob ? 'opacity-0' : 'opacity-100'}`}
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' as any : undefined }}
          />
        )}
        {/* Overlay guides */}
        <CameraOverlay mode={mode} ok={guideOk} />
        {/* Top instructions */}
        {!error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/55 text-white text-sm font-medium shadow">
            {topInstruction}
          </div>
        )}
        {/* Flash overlay */}
        {flash && <div className="absolute inset-0 bg-white/70 animate-pulse" />}
        <button
          onClick={handleCapture}
          disabled={!!error || capturing || !!previewUrl || !!previewBlob || finalizing}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-black rounded-full w-20 h-20 flex items-center justify-center shadow-xl border-4 border-white active:scale-95 transition"
          aria-label="Take a photo"
        >
          {capturing ? (
            <span className="text-lg animate-pulse">•••</span>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white border-2 border-zinc-300 shadow-inner" />
          )}
        </button>
        {!guideOk && !capturing && !error && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/55 text-white text-sm font-medium shadow">
            {hint || (mode === 'body' ? 'Step back a bit · keep centered' : 'Move closer · center your face')}
          </div>
        )}
        <button
          onClick={handleSwitchCamera}
          className="absolute bottom-6 right-6 bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 border border-white/30"
          title="Switch camera"
          aria-label="Switch camera"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14a7 7 0 0 1 7-7h2.17l-1.59-1.59a1 1 0 1 1 1.42-1.42l3.3 3.3a1 1 0 0 1 0 1.42l-3.3 3.3a1 1 0 1 1-1.42-1.42L16.17 9H14a5 5 0 0 0-5 5 1 1 0 1 1-2 0Zm14 0a1 1 0 1 1-2 0 7 7 0 0 1-7 7h-2.17l1.59 1.59a1 1 0 1 1-1.42 1.42l-3.3-3.3a1 1 0 0 1 0-1.42l3.3-3.3a1 1 0 1 1 1.42 1.42L11.83 19H14a5 5 0 0 0 5-5 1 1 0 1 1 2 0Z" fill="#fff"/>
          </svg>
        </button>
        <button
          onClick={() => {
            // Stop camera immediately to avoid reappearing
            if (activeStreamRef.current) {
              activeStreamRef.current.getTracks().forEach((t) => t.stop())
              activeStreamRef.current = null
            }
            if (detectTimerRef.current) {
              window.clearInterval(detectTimerRef.current)
              detectTimerRef.current = null
            }
            onCancel()
          }}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80"
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="10" fill="#18181b" stroke="#a1a1aa" strokeWidth="1.5"/>
            <path d="M7.7 7.7l6.6 6.6M14.3 7.7l-6.6 6.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {previewUrl && previewBlob && (
        <PreviewModal
          src={previewUrl}
          disabled={finalizing}
          onRetake={async () => {
            if (finalizing) return
            setPreviewUrl(null)
            setPreviewBlob(null)
            // If stream was stopped (e.g., after cancel or finalize), restart for a smooth retake
            if (!activeStreamRef.current) {
              await startCamera(facingMode)
            }
          }}
          onUse={() => {
            if (finalizing) return
            setFinalizing(true)
            // Stop detection and camera immediately so it doesn't flash back
            if (detectTimerRef.current) {
              window.clearInterval(detectTimerRef.current)
              detectTimerRef.current = null
            }
            if (activeStreamRef.current) {
              activeStreamRef.current.getTracks().forEach((t) => t.stop())
              activeStreamRef.current = null
            }
            // Keep preview open; parent should unmount this component shortly
            onCapture(previewUrl, previewBlob)
          }}
          variant={mode === 'face' ? 'circle' : 'card'}
        />
      )}
    </div>
  )
}
