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

  // Запросить камеру с нужным facingMode
  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
      setError(null)
    } catch (e) {
      setError("Не удалось получить доступ к камере.")
    }
  }

  // Перезапуск камеры при смене facingMode
  useEffect(() => {
    startCamera(facingMode)
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
    // eslint-disable-next-line
  }, [facingMode])

  // Кнопка переключения камеры
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const handleCapture = () => {
    if (!videoRef.current) return
    setCapturing(true)
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          onCapture(url, blob)
        }
        setCapturing(false)
      }, "image/jpeg", 0.95)
    }
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
          aria-label="Сделать снимок"
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
          title="Сменить камеру"
          aria-label="Сменить камеру"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14a7 7 0 0 1 7-7h2.17l-1.59-1.59a1 1 0 1 1 1.42-1.42l3.3 3.3a1 1 0 0 1 0 1.42l-3.3 3.3a1 1 0 1 1-1.42-1.42L16.17 9H14a5 5 0 0 0-5 5 1 1 0 1 1-2 0Zm14 0a1 1 0 1 1-2 0 7 7 0 0 1-7 7h-2.17l1.59 1.59a1 1 0 1 1-1.42 1.42l-3.3-3.3a1 1 0 0 1 0-1.42l3.3-3.3a1 1 0 1 1 1.42 1.42L11.83 19H14a5 5 0 0 0 5-5 1 1 0 1 1 2 0Z" fill="#fff"/>
          </svg>
        </button>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80"
          aria-label="Закрыть"
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
