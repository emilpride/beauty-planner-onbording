'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingAnimationProps {
  onComplete: () => void
  duration?: number // в миллисекундах
}

export default function LoadingAnimation({ onComplete, duration = 3000 }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startTime = Date.now()
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress)
      } else {
        // Небольшая задержка перед завершением
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(onComplete, 500) // Даем время на fade out
        }, 200)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [duration, onComplete])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-purple-100" />
      
      {/* Animated Circles - Based on Design */}
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
            background: #8B5CF6;
            border-radius: 50%;
            opacity: 0.42;
          }
          
          .ellipse-25 {
            position: absolute;
            width: 490px;
            height: 490px;
            left: 0px;
            top: 0px;
            background: #A78BFA;
            border-radius: 50%;
          }
          
          .ellipse-28 {
            position: absolute;
            width: 385px;
            height: 385px;
            left: 53px;
            top: 53px;
            background: #C4B5FD;
            border-radius: 50%;
          }
          
          .ellipse-27 {
            position: absolute;
            width: 279px;
            height: 279px;
            left: 106px;
            top: 106px;
            background: #DDD6FE;
            border-radius: 50%;
          }
          
          .ellipse-26 {
            position: absolute;
            width: 210px;
            height: 210px;
            left: 140px;
            top: 140px;
            background: #EDE9FE;
            border-radius: 50%;
          }
          
          .ellipse-24 {
            position: absolute;
            width: 136px;
            height: 136px;
            left: 177px;
            top: 177px;
            background: #F5F3FF;
            border-radius: 50%;
          }
          
          .ellipse-30 {
            position: absolute;
            width: 613px;
            height: 613px;
            left: -61px;
            top: -61px;
            background: #7C3AED;
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
            background: #FFFFFF;
            border-radius: 50%;
            filter: blur(50px);
            opacity: 0.8;
          }
        `}</style>
        
        <div className="ellipse-container">
          <div className="ellipse-29"></div>
          <div className="ellipse-25"></div>
          <div className="ellipse-28"></div>
          <div className="ellipse-27"></div>
          <div className="ellipse-26"></div>
          <div className="ellipse-24"></div>
          <div className="ellipse-30"></div>
          <div className="ellipse-31"></div>
        </div>
      </div>

      {/* Logo in center of animation */}
      <div className="absolute z-10 flex flex-col items-center justify-center" style={{ 
        left: '50%', 
        top: '50%', 
        transform: 'translate(-50%, -50%)' 
      }}>
        <div className="relative w-24 h-24 mb-4">
          <Image
            src="/logos/app_icon.png"
            alt="Beauty Mirror"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
        
        {/* Progress text */}
        <div className="text-center">
          <p className="text-purple-800 text-lg font-semibold mb-2">
            Preparing your quiz...
          </p>
          <div className="w-48 h-1 bg-purple-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-purple-600 text-sm mt-2">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  )
}
