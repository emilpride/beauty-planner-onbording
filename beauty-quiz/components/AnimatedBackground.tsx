'use client'

type AnimatedBackgroundProps = {
  paused?: boolean
}

export default function AnimatedBackground({ paused = false }: AnimatedBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ellipse 46 */}
      <div 
        className="absolute w-[600px] h-[900px] opacity-40"
        style={{ 
          left: '200px',
          top: '-100px',
          background: '#53E5FF',
          filter: 'blur(120px)',
          transform: 'rotate(14.51deg)',
          animation: 'float1 8s ease-in-out infinite',
          animationPlayState: paused ? 'paused' : 'running'
        }}
      />
      {/* Ellipse 47 */}
      <div 
        className="absolute w-[600px] h-[1000px] opacity-40"
        style={{ 
          left: '450px',
          top: '-150px',
          background: '#FF99CC',
          filter: 'blur(120px)',
          transform: 'matrix(-0.97, 0.25, 0.25, 0.97, 0, 0)',
          animation: 'float2 10s ease-in-out infinite',
          animationPlayState: paused ? 'paused' : 'running'
        }}
      />
    </div>
  )
}
