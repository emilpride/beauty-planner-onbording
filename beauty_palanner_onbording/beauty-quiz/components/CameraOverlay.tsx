"use client"

import React, { useRef, useEffect } from 'react'
import { TRIANGULATION } from './triangulation'

type Mode = 'face' | 'hair' | 'body'
type Keypoint = { x: number; y: number; z?: number; name?: string }

interface CameraOverlayProps {
  mode: Mode
  ok: boolean
  videoBox?: { w: number; h: number }
  faceLandmarks?: Keypoint[] | null
  mirrorPreview?: boolean
}

export default function CameraOverlay({ mode, ok, videoBox, faceLandmarks, mirrorPreview = false }: CameraOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Use brand-like colors: amber when guiding, green when ready
  const color = ok ? 'rgba(34,197,94,0.95)' : 'rgba(250,204,21,0.95)'

  // Ellipse radii as percentages of viewport
  const dims = (() => {
    switch (mode) {
      case 'body':
        return { rx: 26, ry: 44 } // slimmer, taller
      case 'hair':
        return { rx: 27, ry: 35 }
      default:
        return { rx: 28, ry: 33 } // face (wider)
    }
  })()

  // Draw face mesh on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoBox) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = videoBox.w
    canvas.height = videoBox.h
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (faceLandmarks && faceLandmarks.length >= 468) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 0.5

      // Draw triangulation mesh
      for (let i = 0; i < TRIANGULATION.length; i += 3) {
        const idx0 = TRIANGULATION[i] as unknown as number
        const idx1 = TRIANGULATION[i + 1] as unknown as number
        const idx2 = TRIANGULATION[i + 2] as unknown as number

        const p0 = faceLandmarks[idx0]
        const p1 = faceLandmarks[idx1]
        const p2 = faceLandmarks[idx2]

        if (p0 && p1 && p2) {
          ctx.beginPath()

          // Mirror X coordinates if in selfie mode
          const x0 = mirrorPreview ? videoBox.w - p0.x : p0.x
          const x1 = mirrorPreview ? videoBox.w - p1.x : p1.x
          const x2 = mirrorPreview ? videoBox.w - p2.x : p2.x

          ctx.moveTo(x0, p0.y)
          ctx.lineTo(x1, p1.y)
          ctx.lineTo(x2, p2.y)

          ctx.closePath()
          ctx.stroke()
        }
      }
    }
  }, [faceLandmarks, videoBox, mirrorPreview])

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="overlay-mask">
            <rect x="0" y="0" width="100" height="100" fill="#fff" />
            <ellipse cx="50" cy="50" rx={dims.rx} ry={dims.ry} fill="#000" />
          </mask>
        </defs>
        {/* Vignette across full screen with a hole */}
        <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.35)" mask="url(#overlay-mask)" />
        {/* Guide outline */}
        {mode !== 'body' ? (
          <ellipse cx="50" cy="50" rx={dims.rx} ry={dims.ry} fill="none" stroke={color} strokeWidth={1.8} />
        ) : (
          <g stroke={color} fill="none" strokeWidth={1}>
            {/* Simplified body hint: head + shoulders */}
            <ellipse cx="50" cy={18} rx={5.5} ry={5.5} />
            <path d="M33 28 C42 23, 58 23, 67 28" />
          </g>
        )}
      </svg>

      {/* Canvas for drawing face mesh */}
      {videoBox && (
        <canvas
          ref={canvasRef}
          width={videoBox.w}
          height={videoBox.h}
          className="absolute top-0 left-0"
        />
      )}
    </div>
  )
}