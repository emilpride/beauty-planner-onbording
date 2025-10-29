"use client"

import { useRef, useEffect, useState } from "react"
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'

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
  const containerRef = useRef<HTMLDivElement>(null)
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
  const [topInstruction, setTopInstruction] = useState<string>('Center your face and press the camera button')
  const [flash, setFlash] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [videoBox, setVideoBox] = useState<{ w: number; h: number } | null>(null)
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({})
  // Mirror preview only for the front camera (selfie) to match user expectations.
  const mirrorPreview = facingMode === 'user'
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null)
  const [detectorReady, setDetectorReady] = useState(false)
  const [faceLandmarks, setFaceLandmarks] = useState<faceLandmarksDetection.Keypoint[] | null>(null)

  // Choose sensible mobile-first constraints to reduce letterboxing
  const buildConstraints = (fm: 'user' | 'environment'): MediaStreamConstraints => {
    // Match the stream aspect to the current viewport to avoid heavy cropping/zoom on mobile.
    const w = typeof window !== 'undefined' ? Math.max(360, Math.min(1280, window.innerWidth)) : 720
    const h = typeof window !== 'undefined' ? Math.max(640, Math.min(1920, window.innerHeight)) : 1280
    // Suggest aspect ratio ~3:4; some browsers may ignore this. Test on iOS/Android.
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

  // Request camera with the desired facingMode
  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      setVideoReady(false)
      const s = await navigator.mediaDevices.getUserMedia(buildConstraints(mode))
      // Stop any existing tracks before swapping streams
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      activeStreamRef.current = s
      setStream(s)
      // Try to force digital zoom to minimum if supported to avoid over-zoomed preview on some devices
      try {
        const [track] = s.getVideoTracks()
        if (track && typeof (track as any).getCapabilities === 'function') {
          const caps: any = (track as any).getCapabilities()
          if (caps && typeof caps.zoom !== 'undefined') {
            const minZoom = (caps as any).min ?? 1
            if (typeof (track as any).applyConstraints === 'function') {
              await (track as any).applyConstraints({ advanced: [{ zoom: minZoom }] } as any)
            }
          }
        }
      } catch (_) {
        // Ignore failures; not all browsers support zoom constraint
      }
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
  // Keep preview unmirrored for both cameras; captured image is also unmirrored
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

  // Load Face Mesh AI model once when component mounts
  useEffect(() => {
    const loadDetector = async () => {
      try {
        await tf.setBackend('webgl')
        await tf.ready()
        
        const detectorConfig = {
          runtime: 'tfjs' as const,
          maxFaces: 1,
          refineLandmarks: true,
        }
        
        const loadedDetector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          detectorConfig
        )
        detectorRef.current = loadedDetector
        setDetectorReady(true)
        console.log('Face Mesh model loaded.')
      } catch (error) {
        console.error("Error loading face mesh model", error)
      }
    }
    loadDetector()

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose()
      }
    }
  }, [])

  // Track when the video element has enough data to capture frames and adjust layout
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const adjustLayout = () => {
      if (!video.videoWidth || !video.videoHeight) return

      const container = containerRef.current
      if (!container) return

      // On mobile, stretch to full screen
      if (window.innerWidth < 768) {
        setContainerStyle({
          width: '100vw',
          height: '100dvh',
        })
        setVideoBox({ w: window.innerWidth, h: window.innerHeight })
        return
      }

      // On desktop, compute proportions to match video aspect ratio
      const videoAspectRatio = video.videoWidth / video.videoHeight
      const screen_w = window.innerWidth * 0.9  // 90vw
      const screen_h = window.innerHeight * 0.9 // 90vh

      let newWidth = screen_h * videoAspectRatio
      let newHeight = screen_h

      if (newWidth > screen_w) {
        newWidth = screen_w
        newHeight = screen_w / videoAspectRatio
      }

      setContainerStyle({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      })
      setVideoBox({ w: newWidth, h: newHeight })
    }

    const handleReady = () => {
      setVideoReady(true)
      const playPromise = video.play?.()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          /* noop – user gesture will resume playback */
        })
      }
      adjustLayout()
    }

    video.addEventListener('loadedmetadata', handleReady)
    window.addEventListener('resize', adjustLayout)

    return () => {
      video.removeEventListener('loadedmetadata', handleReady)
      window.removeEventListener('resize', adjustLayout)
    }
  }, [stream])

  // Face detection loop using Face Mesh AI model
  useEffect(() => {
    if (!videoReady || !detectorReady) return

    const video = videoRef.current
    if (!video || !detectorRef.current) return

    if (detectTimerRef.current) window.clearInterval(detectTimerRef.current)

    detectTimerRef.current = window.setInterval(async () => {
      if (!video.videoWidth || !video.videoHeight || !detectorRef.current) {
        setFaceLandmarks(null)
        return
      }

      const w = video.videoWidth
      const h = video.videoHeight
      let ok = false
      let nextHint: string | null = null
      let distanceHint: string | null = null

      try {
        const faces = await detectorRef.current!.estimateFaces(video, {
          flipHorizontal: false,
        })

        if (faces.length > 0 && faces[0]?.keypoints && faces[0]?.box) {
          setFaceLandmarks(faces[0].keypoints)

          const box = faces[0].box
          const b = { left: box.xMin, top: box.yMin, width: box.width, height: box.height }

          // Evaluate positioning using existing logic
          const boxes = [b]
          const cx = b.left + b.width / 2
          const cy = b.top + b.height / 2
          const centerDx = Math.abs(cx - w / 2) / w
          const centerDy = Math.abs(cy - h / 2) / h
          const sizeRatio = Math.max(b.width / w, b.height / h)

          if (mode === 'face' || mode === 'hair') {
            ok = centerDx < 0.20 && centerDy < 0.22 && sizeRatio > 0.22 && sizeRatio < 0.60
            if (!ok) {
              if (Math.abs(centerDy) > Math.abs(centerDx)) {
                nextHint = centerDy > 0 ? 'A bit higher' : 'A bit lower'
              } else {
                nextHint = centerDx > 0 ? 'A bit left' : 'A bit right'
              }
              if (sizeRatio < 0.28) distanceHint = 'Move closer'
              else if (sizeRatio > 0.56) distanceHint = 'Move farther'
            }
          } else {
            ok = centerDx < 0.28 && cy / h < 0.62 && sizeRatio > 0.07 && sizeRatio < 0.38
          }
        } else {
          setFaceLandmarks(null)
          ok = false
        }
      } catch (error) {
        console.error("Face detection error:", error)
        setFaceLandmarks(null)
        ok = false
      }

      setGuideOk(ok)
      if (ok) {
        setHint(null)
        setTopInstruction('Ready — tap the shutter')
      } else {
        setTopInstruction(
          mode === 'body'
            ? 'Stand straight; keep whole body in frame'
            : 'Center your face and press the camera button'
        )
        setHint(distanceHint ? `${distanceHint}${nextHint ? ' · ' + nextHint : ''}` : nextHint)
      }
    }, 100)

    return () => {
      if (detectTimerRef.current) {
        window.clearInterval(detectTimerRef.current)
        detectTimerRef.current = null
      }
    }
  }, [videoReady, mode, detectorReady])

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
    // Always save unmirrored
    ctx.drawImage(video, 0, 0, width, height)
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
  // Switch from flex centering to absolute centering to avoid layout conflicts
  <div className="fixed inset-0 z-50 bg-black/95" style={{ height: '100dvh', overscrollBehavior: 'contain' as any }}>
      {/* Full-bleed camera on mobile; centered card on larger screens */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-black transition-all duration-300 ease-in-out"
        style={{
          ...containerStyle,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          touchAction: 'none' as any,
        }}
      >
        {error ? (
          <div className="text-white p-8">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-contain object-center bg-black [transform:translateZ(0)] ${mirrorPreview ? 'scale-x-[-1]' : ''} ${previewUrl && previewBlob ? 'opacity-0' : 'opacity-100'}`}
          />
        )}
  {/* Overlay guides aligned to the displayed video box */}
  <CameraOverlay mode={mode} ok={guideOk} videoBox={videoBox || undefined} faceLandmarks={faceLandmarks} mirrorPreview={mirrorPreview} />
        {/* Flash overlay */}
        {flash && (
          <div
            className="absolute inset-0 bg-white animate-flash pointer-events-none"
            onAnimationEnd={() => setFlash(false)}
          />
        )}
        <button
          onClick={handleCapture}
          disabled={!!error || capturing || !!previewUrl || !!previewBlob || finalizing}
          className="absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-black rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-xl border-4 border-white active:scale-95 transition"
          style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
          aria-label="Take a photo"
        >
          {capturing ? (
            <span className="text-lg animate-pulse">•••</span>
          ) : (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-zinc-300 shadow-inner" />
          )}
        </button>
        {!error && !previewUrl && (
          <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 md:px-4 rounded-full bg-black/60 text-white text-xs md:text-sm font-medium shadow"
               style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 118px, 118px)' }}>
            {topInstruction}{hint ? <span className="opacity-80"> · {hint}</span> : null}
          </div>
        )}
        <button
          onClick={handleSwitchCamera}
          className="absolute bg-black/60 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/80 border border-white/30"
          style={{ right: '16px', bottom: 'max(env(safe-area-inset-bottom, 0px) + 20px, 20px)' }}
          title="Switch camera"
          aria-label="Switch camera"
        >
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          className="absolute bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80"
          style={{ top: 'max(env(safe-area-inset-top, 0px) + 8px, 8px)', right: '10px' }}
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
