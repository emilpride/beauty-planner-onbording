"use client"

import dynamic from 'next/dynamic'
import React, { useState } from 'react'

const PhotoCapture = dynamic(() => import('@/components/camera/PhotoCapture'), { ssr: false })

export default function PhotoCaptureDemoPage() {
  const [open, setOpen] = useState(false)
  const [imgUrl, setImgUrl] = useState<string | null>(null)

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 12 }}>PhotoCapture demo</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>A lightweight, brandable camera with preview.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '10px 14px', borderRadius: 12, background: '#111827', color: '#fff', fontWeight: 700,
          }}
        >Open camera</button>
        {imgUrl && (
          <a href={imgUrl} download style={{ color: '#2563EB', fontWeight: 700 }}>Download last photo</a>
        )}
      </div>
      {imgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgUrl} alt="last" style={{ width: 280, height: 'auto', marginTop: 16, borderRadius: 12, border: '1px solid #e5e7eb' }} />
      )}

      {open && (
        <PhotoCapture
          aspectRatio={4/3}
          brandingColors={{ primary: '#111827', overlay: 'rgba(0,0,0,0.5)', text: '#fff' }}
          guideText="Center your face in the frame"
          onClose={() => setOpen(false)}
          onCapture={(data) => {
            if (data instanceof Blob) {
              setImgUrl(URL.createObjectURL(data))
            } else {
              setImgUrl(data)
            }
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
