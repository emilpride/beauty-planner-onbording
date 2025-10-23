type Ring = { pct: number; color: string; width?: number }

export function ProgressRings({ size = 270, rings }: { size?: number; rings: Ring[] }) {
  const cx = size / 2
  const cy = size / 2
  const gap = 10
  const maxStroke = 18
  const baseRadius = (size - rings.length * (maxStroke + gap) - 40) / 2

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      className="overflow-visible"
      style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.08))' }}
    >
      <defs>
        {/* Radial gradient for inner glow */}
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f5f5f5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner white circle with subtle glow */}
      <circle cx={cx} cy={cy} r={baseRadius - 15} fill="url(#innerGlow)" />

      {/* Progress rings */}
      {rings.map((r, idx) => {
        const stroke = r.width ?? maxStroke
        const radius = baseRadius + idx * (maxStroke + gap) + stroke / 2
        const circumference = 2 * Math.PI * radius
        const progress = Math.max(0, Math.min(1, r.pct))
        const dash = progress * circumference
        const dashArray = `${dash} ${circumference}`
        
        return (
          <g key={idx}>
            {/* Background track - very light version of the color */}
            <circle 
              cx={cx} 
              cy={cy} 
              r={radius} 
              stroke={r.color}
              strokeWidth={stroke} 
              fill="none" 
              opacity="0.12"
            />
            
            {/* Main progress arc - solid and vibrant */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={r.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ 
                transition: 'stroke-dasharray 0.6s ease-out',
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}
