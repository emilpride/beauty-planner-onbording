'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import SkinImageUpload from '../components/SkinImageUpload'
import SkinAnalysisVisualizer from '../components/SkinAnalysisVisualizer'

type SkinAnalysisResult = any

async function analyzeSkinApi(base64Data: string): Promise<SkinAnalysisResult> {
  const res = await fetch('/api/skin-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data }),
  })
  if (!res.ok) throw new Error(await res.text() || `Failed with ${res.status}`)
  return res.json()
}

export default function SkinAppPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SkinAnalysisResult | null>(null)
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['face_rectangle'])

  const onSelect = (file: File, base64: string) => {
    setImageFile(file)
    setImageBase64(base64)
    setData(null)
    setError(null)
  }

  const onAnalyze = async () => {
    if (!imageBase64) return
    setLoading(true); setError(null)
    try {
      const pure = imageBase64.split(',')[1] || imageBase64
      const d = await analyzeSkinApi(pure)
      setData(d)
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const toggleOverlay = (key: string) => {
    setActiveOverlays(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const acneKeys = [
    { key: 'acne', name: 'Papules' },
    { key: 'acne_pustule', name: 'Pustules' },
    { key: 'acne_nodule', name: 'Nodules' },
    { key: 'closed_comedones', name: 'Whiteheads' },
    { key: 'blackhead', name: 'Blackheads' },
    { key: 'pores_mark', name: 'Pores' },
  ]

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Advanced Skin Analysis</h1>
        <p style={{ color: '#4b5563', marginTop: 8 }}>Upload a clear face photo to get a visual and numeric report.</p>
      </header>

      <div className="card">
        <SkinImageUpload onImageSelect={onSelect} />
        {imageFile && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn" onClick={onAnalyze} disabled={loading}>{loading ? 'Analyzing…' : 'Analyze My Skin'}</button>
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginTop: 16, borderColor: '#fecaca', background: '#fee2e2' }}>
          <strong><AlertCircle style={{ verticalAlign: 'text-bottom' }} /> Error:</strong> {error}
        </div>
      )}

      {data && imageBase64 && (
        <div style={{ marginTop: 24 }} className="grid grid-2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Visual Analysis</h3>
            <SkinAnalysisVisualizer result={data.result} originalImage={imageBase64} activeOverlays={activeOverlays} />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Toggle Overlays:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {acneKeys.map(a => (
                  <button key={a.key} className="btn btn-ghost" onClick={() => toggleOverlay(a.key)}>{a.name}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Overall Scores</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {data.result?.score_info && Object.entries(data.result.score_info).map(([k, v]) => {
                const val = typeof v === 'number' ? v : 0
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize' }}>{k.replace('_score', '').replaceAll('_', ' ')}</span>
                      <strong>{val} / 100</strong>
                    </div>
                    <div className="progress"><div style={{ width: `${Math.max(0, Math.min(100, val))}%` }} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
