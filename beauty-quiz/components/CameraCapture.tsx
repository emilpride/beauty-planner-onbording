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

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      } catch (e) {
        setError("Не удалось получить доступ к камере.")
      }
    })()
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
    // eslint-disable-next-line
  }, [])

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      <div className="relative w-full max-w-xs aspect-[3/4] bg-black rounded-xl overflow-hidden flex flex-col items-center">
        {error ? (
          <div className="text-white p-8">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
            style={{ aspectRatio: "3/4" }}
          />
        )}
        <button
          onClick={handleCapture}
          disabled={!!error || capturing}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white/80 active:scale-95 transition"
        >
          {capturing ? "..." : <span className="text-2xl">📸</span>}
        </button>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl hover:bg-black/80"
        >
          ×
        </button>
      </div>
    </div>
  )
}
