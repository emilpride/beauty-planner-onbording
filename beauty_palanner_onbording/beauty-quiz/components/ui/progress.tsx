'use client'

import * as React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className = '', ...props }) => {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`} {...props}>
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${clamped}%`, transition: 'width 200ms ease' }}
      />
    </div>
  )
}

export default Progress
