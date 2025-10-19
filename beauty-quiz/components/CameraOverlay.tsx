"use client"

import React from 'react'

type Mode = 'face' | 'hair' | 'body'

export default function CameraOverlay({ mode, ok, videoBox }: { mode: Mode; ok: boolean; videoBox?: { w: number; h: number } }) {
  const color = ok ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.8)'

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 md:p-6"
      style={videoBox ? { alignItems: 'center', justifyContent: 'center' } : undefined}
    >
      {/* darken edges slightly to focus */}
      <div className="absolute inset-0 bg-black/10" />
      {mode === 'face' && (
        <div
          aria-label="face-guide"
          className="relative"
          style={videoBox
            ? { width: Math.min(videoBox.w * 0.78, 520), aspectRatio: '3 / 4' as any }
            : { width: 'min(78vw, 68vmin)', aspectRatio: '3 / 4' as any }
          }
        >
          <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Slightly larger oval to encourage proper distance */}
            <ellipse cx="150" cy="190" rx="112" ry="148" fill="none" stroke={color} strokeWidth={4} />
          </svg>
        </div>
      )}
      {mode === 'hair' && (
        <div
          aria-label="hair-guide"
          className="relative"
          style={videoBox
            ? { width: Math.min(videoBox.w * 0.76, 500), aspectRatio: '3 / 4' as any }
            : { width: 'min(76vw, 64vmin)', aspectRatio: '3 / 4' as any }
          }
        >
          <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Top focus arc */}
            <path d="M40 120 C150 30, 150 30, 260 120" fill="none" stroke={color} strokeWidth={4} />
            {/* side rails */}
            <path d="M40 120 L40 300" fill="none" stroke={color} strokeWidth={3} strokeDasharray="8 8" />
            <path d="M260 120 L260 300" fill="none" stroke={color} strokeWidth={3} strokeDasharray="8 8" />
          </svg>
        </div>
      )}
      {mode === 'body' && (
        <div
          aria-label="body-guide"
          className="relative"
          style={videoBox
            ? { width: Math.min(videoBox.w * 0.88, 540), aspectRatio: '9 / 16' as any }
            : { width: 'min(84vw, 58vmin)', aspectRatio: '9 / 16' as any }
          }
        >
          <svg viewBox="0 0 300 533" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Head */}
            <circle cx="150" cy="70" r="32" fill="none" stroke={color} strokeWidth={3} />
            {/* Shoulders */}
            <path d="M80 140 C110 120, 190 120, 220 140" fill="none" stroke={color} strokeWidth={3} />
            {/* Torso outline */}
            <path d="M110 145 C105 200, 105 250, 105 320 L105 430 L195 430 L195 320 C195 250, 195 200, 190 145" fill="none" stroke={color} strokeWidth={3} />
            {/* Arms (suggested) */}
            <path d="M80 150 L95 250" fill="none" stroke={color} strokeWidth={3} strokeDasharray="6 8" />
            <path d="M220 150 L205 250" fill="none" stroke={color} strokeWidth={3} strokeDasharray="6 8" />
            {/* Feet baseline */}
            <path d="M110 455 L190 455" fill="none" stroke={color} strokeWidth={3} strokeDasharray="10 10" />
          </svg>
        </div>
      )}
    </div>
  )}
