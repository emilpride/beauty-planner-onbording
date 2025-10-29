"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Branding = {
  primary?: string
  overlay?: string
  text?: string
}

interface PhotoCaptureProps {
  onCapture: (imageData: string | Blob) => void
  onClose?: () => void
  brandingColors?: Branding
  aspectRatio?: number // width/height, default 4/3
  guideText?: string
  guideShape?: 'oval' | 'square' // default 'oval'
}

// Utility: detect mobile devices (more robust than viewport width)
const isMobile = () => {
  if (typeof navigator === 'undefined') return false
  // Prefer User-Agent Client Hints when available
  const uaData: any = (navigator as any).userAgentData
  if (uaData && typeof uaData.mobile === 'boolean') {
    return uaData.mobile
  }
  const ua = navigator.userAgent || navigator.vendor || ''
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(String(ua))
}

export default function PhotoCapture({
  onCapture,
  onClose,
  brandingColors,
  aspectRatio = 4 / 3,
  guideText = 'Center your face in the frame',
  guideShape = 'oval'
}: PhotoCaptureProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rawCaptureRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  // Default to front camera everywhere; user can switch on mobile
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasBackCamera, setHasBackCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // No mirroring: keep preview and capture unmirrored on all devices

  const rootStyle = useMemo<React.CSSProperties>(() => ({
    // Allow outer CSS to override, but provide inline fallbacks via CSS variables (brand defaults)
    ['--brand-primary' as any]: brandingColors?.primary ?? '#5A45E1',
    ['--overlay-bg' as any]: brandingColors?.overlay ?? 'rgba(0,0,0,0.6)',
    ['--text-color' as any]: brandingColors?.text ?? '#FFFFFF',
  }), [brandingColors])

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setError(null)
    try {
      // Best-effort: some browsers require permission before enumerateDevices returns full list
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videos = devices.filter((d) => d.kind === 'videoinput')
          setHasBackCamera(videos.length > 1)
        }
      } catch {}

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Set srcObject BEFORE calling setStream to ensure video has stream immediately
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        try {
          const settings = newStream.getVideoTracks()[0]?.getSettings?.() || {}
          console.log('[PhotoCapture] Stream assigned', {
            readyState: videoRef.current.readyState,
            isMobile: isMobile(),
            facingMode: mode,
            trackFacingMode: settings.facingMode,
            label: newStream.getVideoTracks()[0]?.label,
          })
        } catch {}
        
        // Wait for video to load and then play
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[PhotoCapture] autoPlay blocked or failed:', err)
            // Attempt play on user interaction later
          })
        }
      }
      
      // Then update state
      setStream((prev) => {
        if (prev) prev.getTracks().forEach((t) => t.stop())
        return newStream
      })
    } catch (e) {
      console.error(e)
      setError('Unable to access the camera. Please allow permissions and try again.')
    }
  }, [aspectRatio])

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  // Lock body scroll when camera is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement
      const body = document.body
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      return () => {
        html.style.overflow = ''
        body.style.overflow = ''
      }
    }
    return () => {}
  }, [])

  // Monitor video playback state
  useEffect(() => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    
    const handlePlay = () => {
      console.log('[PhotoCapture] Video started playing')
    }
    
    const handlePause = () => {
      console.log('[PhotoCapture] Video paused')
    }
    
    const handleLoadedMetadata = () => {
      console.log('[PhotoCapture] Metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight)
    }
    
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    // Check if already playing
    if (!video.paused && video.currentTime > 0) {
      console.log('[PhotoCapture] Video is already playing')
    } else if (video.srcObject) {
      console.log('[PhotoCapture] srcObject exists but video not playing, attempting to play...')
      video.play().catch(e => {
        console.error('[PhotoCapture] Play failed:', e)
      })
    }
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [stream])


  const capture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || video.clientWidth
    const h = video.videoHeight || video.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // 1) Draw PREVIEW (mirrored for selfie)
    // Always draw unmirrored for consistent UX
    ctx.drawImage(video, 0, 0, w, h)
    // 2) Store RAW (non-mirrored) capture for saving
    const raw = document.createElement('canvas')
    raw.width = w
    raw.height = h
    const rctx = raw.getContext('2d')!
    rctx.imageSmoothingEnabled = true
    rctx.imageSmoothingQuality = 'high'
    rctx.drawImage(video, 0, 0, w, h)
    rawCaptureRef.current = raw
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    }, 'image/jpeg', 0.95)
  }

  // Compress current canvas content to max side and quality, then emit
  const accept = async () => {
    const source = rawCaptureRef.current || canvasRef.current
    if (!source) return
    try {
      const blob = await compressCanvas(source, 1200, 0.85)
      onCapture(blob)
    } catch (e) {
      console.error('Compression failed, falling back to original canvas', e)
      source.toBlob((blob) => blob && onCapture(blob), 'image/jpeg', 0.85)
    }
  }

  function compressCanvas(source: HTMLCanvasElement, maxSide = 1200, quality = 0.85): Promise<Blob> {
    const sW = source.width
    const sH = source.height
    if (!sW || !sH) return Promise.reject(new Error('Invalid source dimensions'))
    const scale = Math.min(1, maxSide / Math.max(sW, sH))
    const tW = Math.round(sW * scale)
    const tH = Math.round(sH * scale)
    const off = document.createElement('canvas')
    off.width = tW
    off.height = tH
    const ctx = off.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, sW, sH, 0, 0, tW, tH)
    return new Promise<Blob>((resolve, reject) => {
      off.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
    })
  }

  const retake = async () => {
    setPreviewUrl(null)
    rawCaptureRef.current = null
  }

  const toggleCamera = () => {
    // Stop current stream and switch
    stream?.getTracks().forEach((t) => t.stop())
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const close = () => {
    stream?.getTracks().forEach((t) => t.stop())
    onClose?.()
  }

  // Render outside normal DOM hierarchy using Portal
  if (typeof document === 'undefined') return null

  return createPortal(
    <div ref={containerRef} className="pc-root" style={rootStyle as React.CSSProperties}>
      {/* Header */}
      <div className="pc-topbar">
        <div className="pc-chip">CAMERA</div>
        <div className="pc-title">{guideText}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pc-iconbtn" onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L16 16M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content area with video and overlays */}
      <div className="pc-content-area">
        {!previewUrl && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`pc-video ${facingMode === 'user' ? 'pc-mirror' : ''}`} />
            
            {/* Vignette + Guide Overlay with proper SVG masking */}
            <svg className="pc-overlay-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <mask id="vignette-mask">
                  {/* White rectangle is visible, shape (oval or square) is cut out */}
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  {guideShape === 'square' ? (
                    <rect x="-25" y="-25" width="150" height="150" fill="black" />
                  ) : (
                    <ellipse cx="50" cy="50" rx="48" ry="50" fill="black" />
                  )}
                </mask>
              </defs>
              {/* Vignette: darkened area AROUND the shape (via mask) */}
              <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.6)" mask="url(#vignette-mask)" />
              {/* Guide shape border: visible in the cutout area */}
              {guideShape === 'square' ? (
                <rect x="-25" y="-25" width="150" height="150" fill="none" stroke="var(--brand-primary)" strokeWidth="1.5" />
              ) : (
                <ellipse cx="50" cy="50" rx="48" ry="50" fill="none" stroke="var(--brand-primary)" strokeWidth="1.5" />
              )}
            </svg>
          </>
        )}

        {previewUrl && (
          <div className="pc-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="pc-preview-img" />
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="pc-bottombar">
        <div className="pc-controls-container">
          {isMobile() && !previewUrl ? (
            <button className="pc-iconbtn pc-switch-cam" onClick={toggleCamera} aria-label="Switch camera" title="Switch camera">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M9 5a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 14h5m-2.5-2.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </button>
          ) : <div className="pc-spacer-small" />}

          {!previewUrl ? (
            <button className="pc-shutter" onClick={capture} aria-label="Take photo" />
          ) : (
            <div className="pc-preview-actions">
              <button className="pc-retake" onClick={retake}>↻ Retake</button>
              <button className="pc-accept" onClick={accept}>✓ Use</button>
            </div>
          )}

          <div className="pc-spacer-small" />
        </div>
      </div>

      {/* Offscreen capture canvas */}
      <canvas ref={canvasRef} className="pc-hidden" />

      <style jsx>{`
        .pc-root {
          --brand-primary: var(--brand-primary, ${brandingColors?.primary ?? '#5A45E1'});
          --overlay-bg: var(--overlay-bg, ${brandingColors?.overlay ?? 'rgba(0,0,0,0.6)'});
          --text-color: var(--text-color, ${brandingColors?.text ?? '#FFFFFF'});
          position: fixed;
          inset: 0;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: #000;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }

        .pc-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: max(10px, env(safe-area-inset-top)) 12px 10px 12px;
          color: var(--text-color);
          z-index: 3;
          flex-shrink: 0;
          min-height: 44px;
          background: rgba(0, 0, 0, 0.2);
        }

        .pc-chip {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          background: rgba(0, 0, 0, 0.35);
          color: var(--text-color);
        }

        .pc-title {
          font-weight: 600;
          font-size: 14px;
          opacity: 0.95;
          text-align: center;
          flex: 1;
        }

        .pc-iconbtn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.45);
          color: var(--text-color);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(6px);
          cursor: pointer;
          transition: all 200ms ease;
          flex-shrink: 0;
        }

        .pc-iconbtn:active {
          background: rgba(0, 0, 0, 0.65);
          transform: scale(0.95);
        }

        /* VIDEO + OVERLAYS: Flex grow to fill available space */
        .pc-content-area {
          flex: 1;
          position: relative;
          min-height: 0;
          overflow: hidden;
        }

        .pc-video {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }

        .pc-mirror {
          transform: scaleX(-1);
        }

        /* OVERLAY SVG: Contains vignette mask + guide oval */
        .pc-overlay-svg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .pc-preview {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          z-index: 2;
        }

        .pc-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* BOTTOM BAR: Fixed at bottom with safe area */
        .pc-bottombar {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.35) 40%,
            rgba(0, 0, 0, 0.65) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 12px max(12px, env(safe-area-inset-bottom));
          z-index: 3;
          flex-shrink: 0;
          min-height: 96px;
        }

        .pc-controls-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          max-width: 360px;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 50px;
          padding: 8px 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .pc-shutter {
          width: 76px;
          height: 76px;
          border-radius: 999px;
          border: 6px solid #fff;
          background: var(--brand-primary);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .pc-shutter:active {
          transform: scale(0.94);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }

        .pc-preview-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }

        .pc-retake {
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.9);
          color: #111;
          border: 1px solid #ddd;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .pc-retake:active {
          transform: scale(0.96);
        }

        .pc-accept {
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 700;
          background: var(--brand-primary);
          color: white;
          border: 1px solid var(--brand-primary);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .pc-accept:active {
          transform: scale(0.96);
          box-shadow: 0 0 12px rgba(90, 69, 225, 0.5);
        }

        .pc-spacer-small {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .pc-switch-cam {
          flex-shrink: 0;
        }

        .pc-switch-cam svg {
          width: 24px;
          height: 24px;
        }

        .pc-hidden {
          display: none;
        }

        @media (min-width: 768px) {
          .pc-root {
            position: fixed;
            inset: 0;
            display: grid;
            /* Ensure header, content, and footer rows with the content stretching */
            grid-template-rows: auto 1fr auto;
            align-items: stretch; /* let middle row fill available height */
            justify-items: center; /* center children horizontally where appropriate */
            background: rgba(0, 0, 0, 0.85);
          }
          .pc-root > :global(div.pc-card) {
            background: #000;
            border-radius: 16px;
            overflow: hidden;
          }
          .pc-content-area {
            max-width: 640px;
            margin: 0 auto;
            width: 100%;
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
