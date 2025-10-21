"use client"

// Robust image normalization using pica (high-quality resize) and exifr (EXIF orientation)
// - Converts HEIC/HEIF via heic2any when needed
// - Reads EXIF to correct orientation
// - Resizes to target max dimension using pica
// - Outputs JPEG File with configurable quality

import pica from 'pica'
import * as exifr from 'exifr'

export async function normalizeAndCompressImage(
  file: File,
  opts?: {
    maxWidthOrHeight?: number
    quality?: number // 0..1
  }
): Promise<File> {
  const nameLower = (file.name || 'photo').toLowerCase()
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    nameLower.endsWith('.heic') ||
    nameLower.endsWith('.heif')

  let workingBlob: Blob = file
  // HEIC/HEIF -> JPEG
  if (isHeic) {
    try {
      const heic2any: any = (await import('heic2any')).default || (await import('heic2any'))
      const converted: Blob | Blob[] = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.98 })
      if (Array.isArray(converted)) {
        workingBlob = (converted[0] as Blob) || file
      } else {
        workingBlob = (converted as Blob) || file
      }
    } catch (err) {
      console.warn('HEIC conversion failed, proceeding without conversion', err)
    }
  }

  // Decode image
  const imgBitmap = await createImageBitmapSafe(workingBlob)
  const maxDim = opts?.maxWidthOrHeight ?? 1280

  // Read EXIF orientation if available
  let orientation = 1
  try {
    const o = await (exifr as any).orientation(workingBlob)
    orientation = o || 1
  } catch {}

  // Compute target dimensions
  let srcW = imgBitmap.width
  let srcH = imgBitmap.height
  let dstW = srcW
  let dstH = srcH
  const isPortraitRotated = orientation >= 5 && orientation <= 8
  const refW = isPortraitRotated ? srcH : srcW
  const refH = isPortraitRotated ? srcW : srcH
  if (refW > refH) {
    if (refW > maxDim) {
      const scale = maxDim / refW
      dstW = Math.round(srcW * scale)
      dstH = Math.round(srcH * scale)
    }
  } else if (refH > maxDim) {
    const scale = maxDim / refH
    dstW = Math.round(srcW * scale)
    dstH = Math.round(srcH * scale)
  }

  // Prepare source/destination canvases
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = srcW
  srcCanvas.height = srcH
  const sctx = srcCanvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D
  sctx.drawImage(imgBitmap, 0, 0)

  // Destination canvas may require rotation based on EXIF
  const destCanvas = document.createElement('canvas')
  const dctx = destCanvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D

  const setCanvasForOrientation = (o: number, w: number, h: number) => {
    switch (o) {
      case 2: // Horizontal flip
        destCanvas.width = w; destCanvas.height = h
        dctx.translate(w, 0); dctx.scale(-1, 1)
        break
      case 3: // 180°
        destCanvas.width = w; destCanvas.height = h
        dctx.translate(w, h); dctx.rotate(Math.PI)
        break
      case 4: // Vertical flip
        destCanvas.width = w; destCanvas.height = h
        dctx.translate(0, h); dctx.scale(1, -1)
        break
      case 5: // Vertical flip + 90° CW
        destCanvas.width = h; destCanvas.height = w
        dctx.rotate(0.5 * Math.PI); dctx.scale(1, -1); dctx.translate(0, -h)
        break
      case 6: // 90° CW
        destCanvas.width = h; destCanvas.height = w
        dctx.rotate(0.5 * Math.PI); dctx.translate(0, -h)
        break
      case 7: // Horizontal flip + 90° CW
        destCanvas.width = h; destCanvas.height = w
        dctx.rotate(0.5 * Math.PI); dctx.translate(w, -h); dctx.scale(-1, 1)
        break
      case 8: // 90° CCW
        destCanvas.width = h; destCanvas.height = w
        dctx.rotate(-0.5 * Math.PI); dctx.translate(-w, 0)
        break
      default: // 1
        destCanvas.width = w; destCanvas.height = h
    }
  }

  setCanvasForOrientation(orientation, dstW, dstH)

  // Use pica for high-quality resize into a temp canvas first
  const p = pica()
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = dstW
  tmpCanvas.height = dstH
  await p.resize(srcCanvas, tmpCanvas, { quality: 3, alpha: false })
  // Draw resized into oriented destination
  dctx.drawImage(tmpCanvas, 0, 0)

  const quality = opts?.quality ?? 0.85
  const blob: Blob = await new Promise((resolve, reject) => {
    destCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })

  const baseName = nameLower.replace(/\.(heic|heif|tiff|webp|png|gif|jpg|jpeg)$/i, '') || 'photo'
  return new File([blob], `${baseName}_${Date.now()}.jpg`, { type: 'image/jpeg' })
}

async function createImageBitmapSafe(blob: Blob): Promise<ImageBitmap> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(blob) } catch {}
  }
  // Fallback via HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (e) => reject(e)
    image.src = URL.createObjectURL(blob)
  })
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D
  ctx.drawImage(img, 0, 0)
  return await createImageBitmap(canvas)
}
