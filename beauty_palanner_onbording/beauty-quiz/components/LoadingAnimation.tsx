'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingAnimationProps {
  progress?: number
  isComplete?: boolean
  onComplete?: () => void
  duration?: number
}

export default function LoadingAnimation(props: LoadingAnimationProps) {
  const { onComplete, duration = 3000 } = props
  const isComplete = props.isComplete ?? false
  const hasExternalProgress = typeof props.progress === 'number' && !Number.isNaN(props.progress)
  const externalProgress = hasExternalProgress ? (props.progress as number) : 0

  const [internalProgress, setInternalProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const displayProgress = hasExternalProgress ? externalProgress : internalProgress

  useEffect(() => {
    // If external progress is provided (even 0), never run internal duration-based animation
    if (hasExternalProgress) return

    const startTime = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setInternalProgress(newProgress)

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress)
      } else {
        setTimeout(() => {
          setIsVisible(false)
          if (onComplete) {
            setTimeout(onComplete, 500)
          }
        }, 200)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [duration, onComplete, hasExternalProgress])

  useEffect(() => {
    if (isComplete && displayProgress >= 100) {
      const t = setTimeout(() => {
        setIsVisible(false)
        if (onComplete) {
          setTimeout(onComplete, 300)
        }
      }, 200)
      return () => clearTimeout(t)
    }
    // If not complete, ensure overlay stays visible
    setIsVisible(true)
    return () => {}
  }, [isComplete, displayProgress, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-overlay/80 backdrop-blur-md" />

      <div className="relative w-[490px] h-[490px] flex items-center justify-center">
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.15);
              opacity: 0.9;
            }
          }

          .ellipse-container {
            position: absolute;
            width: 490px;
            height: 490px;
            animation: pulse 3s ease-in-out infinite;
          }

          .ellipse-29 {
            position: absolute;
            width: 613px;
            height: 613px;
            left: -61px;
            top: -61px;
            background: rgb(var(--color-primary));
            border-radius: 50%;
            opacity: 0.38;
          }

          .ellipse-25 {
            position: absolute;
            width: 490px;
            height: 490px;
            left: 0;
            top: 0;
            /* slightly lighter than primary */
            background: color-mix(in srgb, rgb(var(--color-primary)) 85%, white);
            border-radius: 50%;
          }

          .ellipse-28 {
            position: absolute;
            width: 385px;
            height: 385px;
            left: 53px;
            top: 53px;
            /* even lighter ring */
            background: color-mix(in srgb, rgb(var(--color-primary)) 65%, white);
            border-radius: 50%;
          }

          .ellipse-27 {
            position: absolute;
            width: 279px;
            height: 279px;
            left: 106px;
            top: 106px;
            background: rgba(255, 255, 255, 0.82);
            border-radius: 50%;
          }

          .ellipse-26 {
            position: absolute;
            width: 210px;
            height: 210px;
            left: 140px;
            top: 140px;
            background: rgba(255, 255, 255, 0.66);
            border-radius: 50%;
          }

          .ellipse-24 {
            position: absolute;
            width: 136px;
            height: 136px;
            left: 177px;
            top: 177px;
            background: #f5f3ff;
            border-radius: 50%;
          }

          .ellipse-30 {
            position: absolute;
            width: 613px;
            height: 613px;
            left: -61px;
            top: -61px;
            /* strong primary tint for color blend */
            background: color-mix(in srgb, rgb(var(--color-primary)) 90%, black);
            border-radius: 50%;
            mix-blend-mode: color;
            opacity: 0.4;
          }

          .ellipse-31 {
            position: absolute;
            width: 85px;
            height: 185px;
            left: 202px;
            top: -109px;
            background: #fff;
            border-radius: 50%;
            filter: blur(50px);
            opacity: 0.8;
          }

          .ellipse-32 {
            position: absolute;
            width: 760px;
            height: 760px;
            left: -135px;
            top: -135px;
            /* darker halo */
            background: color-mix(in srgb, rgb(var(--color-primary)) 70%, black);
            border-radius: 50%;
            opacity: 0.18;
            filter: blur(2px);
          }

          .ellipse-33 {
            position: absolute;
            width: 920px;
            height: 920px;
            left: -215px;
            top: -215px;
            background: rgb(var(--color-primary));
            border-radius: 50%;
            opacity: 0.12;
            mix-blend-mode: screen;
            filter: blur(1px);
          }

          .ellipse-34 {
            position: absolute;
            width: 1100px;
            height: 1100px;
            left: -305px;
            top: -305px;
            background: rgb(var(--color-accent-1));
            border-radius: 50%;
            opacity: 0.08;
            mix-blend-mode: screen;
            filter: blur(1px);
          }

          .ellipse-35 {
            position: absolute;
            width: 1280px;
            height: 1280px;
            left: -395px;
            top: -395px;
            background: rgb(var(--color-accent-2));
            border-radius: 50%;
            opacity: 0.06;
            mix-blend-mode: screen;
            filter: blur(1px);
          }
        `}</style>

        <div className="ellipse-container">
          <div className="ellipse-35" />
          <div className="ellipse-34" />
          <div className="ellipse-33" />
          <div className="ellipse-32" />
          <div className="ellipse-29" />
          <div className="ellipse-25" />
          <div className="ellipse-28" />
          <div className="ellipse-27" />
          <div className="ellipse-26" />
          <div className="ellipse-24" />
          <div className="ellipse-30" />
          <div className="ellipse-31" />
        </div>
      </div>

      <div
        className="absolute z-10 flex flex-col items-center justify-center"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="relative w-24 h-24 mb-4">
          <Image
            src="/logos/app_icon.png"
            alt="Beauty Mirror"
            fill
            className="object-contain drop-shadow-lg"
          />
        </div>

        <div className="text-center">
          <p className="text-primary text-lg font-semibold mb-2">
            Preparing your quiz...
          </p>
          <div className="w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <p className="text-text-secondary text-sm mt-2">
            {Math.round(displayProgress)}%
          </p>
        </div>
      </div>
    </div>
  )
}
