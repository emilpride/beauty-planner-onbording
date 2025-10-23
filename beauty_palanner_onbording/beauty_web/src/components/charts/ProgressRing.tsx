"use client"

import React from 'react'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number // 0..1
  trackColor?: string
  strokeColor?: string
}

export function ProgressRing({
  size = 160,
  strokeWidth = 14,
  progress,
  trackColor = 'rgba(0,0,0,0.1)',
  strokeColor = 'rgb(var(--accent))',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = Math.max(0, Math.min(1, progress)) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
