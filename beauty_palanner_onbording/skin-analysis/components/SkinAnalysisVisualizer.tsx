'use client'

import { useEffect, useRef } from 'react'

const overlayStyles: { [key: string]: { color: string, type: 'rect' | 'circle' } } = {
  face_rectangle: { color: 'rgba(74, 144, 226, 0.7)', type: 'rect' },
  acne: { color: 'rgba(255, 0, 0, 0.7)', type: 'rect' },
  acne_pustule: { color: 'rgba(255, 100, 0, 0.7)', type: 'rect' },
  acne_nodule: { color: 'rgba(159, 33, 246, 0.7)', type: 'rect' },
  closed_comedones: { color: 'rgba(0, 255, 0, 0.7)', type: 'rect' },
  blackhead: { color: 'rgba(255, 0, 253, 0.7)', type: 'rect' },
  pores_mark: { color: 'rgba(0, 0, 255, 0.6)', type: 'circle' },
  enlarged_pore_count: { color: 'rgba(0, 0, 255, 0.6)', type: 'rect' },
}

export default function SkinAnalysisVisualizer({ result, originalImage, activeOverlays }: { result: any; originalImage: string; activeOverlays: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const container = containerRef.current
    if (!canvas || !ctx || !container) return

    const img = new window.Image()
    img.src = originalImage
    img.onload = () => {
      const containerWidth = container.offsetWidth
      const scale = containerWidth / img.naturalWidth
      const canvasWidth = containerWidth
      const canvasHeight = img.naturalHeight * scale
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      activeOverlays.forEach(key => {
        const style = overlayStyles[key]
        const data = (result as any)[key]
        if (!style || !data) return
        ctx.strokeStyle = style.color
        ctx.fillStyle = style.color
        ctx.lineWidth = 2

        const items = Array.isArray(data.rectangle) ? data.rectangle : (Array.isArray(data.coord) ? data.coord : [])
        if (key === 'face_rectangle') {
          ctx.strokeRect(data.left * scale, data.top * scale, data.width * scale, data.height * scale)
          return
        }
        items.forEach((item: any) => {
          if (style.type === 'rect' && item.top) {
            ctx.strokeRect(item.left * scale, item.top * scale, item.width * scale, item.height * scale)
          } else if (style.type === 'circle' && item.x) {
            ctx.beginPath()
            ctx.arc(item.x * scale, item.y * scale, (item.radius || 2) * scale, 0, 2 * Math.PI)
            ctx.fill()
          }
        })
      })
    }
  }, [result, originalImage, activeOverlays])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={originalImage} alt="Analyzed skin" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  )
}
