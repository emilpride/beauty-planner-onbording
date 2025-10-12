"use client"

import { useRef, useEffect, useState } from "react"

interface CameraCaptureProps {
  onCapture: (blobUrl: string, blob: Blob) => void
  onCancel: () => void
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user') // default: selfie
  const [videoReady, setVideoReady] = useState(false)
  const activeStreamRef = useRef<MediaStream | null>(null)

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
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCapturing(false)
      setError('Failed to capture image. Please try again.')
      return
    }
    ctx.drawImage(video, 0, 0, width, height)
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        onCapture(url, blob)
      }
      setCapturing(false)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95">
  <div className="relative w-full max-w-xs aspect-[3/4] bg-black rounded-xl overflow-hidden flex flex-col items-center md:w-full md:max-w-xs md:aspect-[3/4] md:rounded-xl md:justify-start md:items-center sm:w-screen sm:h-screen sm:max-w-none sm:aspect-auto sm:rounded-none sm:justify-center sm:items-center">
        {error ? (
          <div className="text-white p-8">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black sm:absolute sm:inset-0 md:static"
            style={{}}
          />
        )}
        <button
          onClick={handleCapture}
          disabled={!!error || capturing}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white/80 active:scale-95 transition"
          aria-label="Take a photo"
        >
          {capturing ? (
            <span className="text-lg animate-pulse">•••</span>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="20" height="14" rx="4" fill="#18181b" stroke="#a1a1aa" strokeWidth="2"/>
              <circle cx="16" cy="17" r="4" fill="#fff" stroke="#a1a1aa" strokeWidth="2"/>
              <rect x="12" y="6" width="8" height="4" rx="2" fill="#18181b" stroke="#a1a1aa" strokeWidth="2"/>
            </svg>
          )}
        </button>
        <button
          onClick={handleSwitchCamera}
          className="absolute bottom-4 right-4 bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 border border-white/30"
          title="Switch camera"
          aria-label="Switch camera"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14a7 7 0 0 1 7-7h2.17l-1.59-1.59a1 1 0 1 1 1.42-1.42l3.3 3.3a1 1 0 0 1 0 1.42l-3.3 3.3a1 1 0 1 1-1.42-1.42L16.17 9H14a5 5 0 0 0-5 5 1 1 0 1 1-2 0Zm14 0a1 1 0 1 1-2 0 7 7 0 0 1-7 7h-2.17l1.59 1.59a1 1 0 1 1-1.42 1.42l-3.3-3.3a1 1 0 0 1 0-1.42l3.3-3.3a1 1 0 1 1 1.42 1.42L11.83 19H14a5 5 0 0 0 5-5 1 1 0 1 1 2 0Z" fill="#fff"/>
          </svg>
        </button>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80"
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="10" fill="#18181b" stroke="#a1a1aa" strokeWidth="1.5"/>
            <path d="M7.7 7.7l6.6 6.6M14.3 7.7l-6.6 6.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
