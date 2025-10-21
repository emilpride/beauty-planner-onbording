'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import LoadingAnimation from '@/components/LoadingAnimation'

export default function Home() {
  const router = useRouter()
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)

  // Гарантируем минимальное время отображения анимации (2 сек)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Проверяем готовность приложения и обновляем прогресс
  useEffect(() => {
    let progress = 10
    let isCheckingReady = true

    const interval = setInterval(() => {
      const increment = Math.random() * (100 - progress) * 0.05
      progress = Math.min(progress + increment, 90)
      setLoadingProgress(progress)
    }, 300)

    // Гарантированный таймаут через 5 сек
    const fallbackTimer = setTimeout(() => {
      if (isCheckingReady) {
        // Force completion and stop the progress ticker so it can't overwrite back to 90%
        clearInterval(interval)
        progress = 100
        setLoadingProgress(100)
        setIsReady(true)
        isCheckingReady = false
      }
    }, 5000)

    const checkReady = () => {
      // Ждём window load event
      const handleLoad = () => {
        setTimeout(() => {
          if (isCheckingReady) {
            clearInterval(interval)
            progress = 100
            setLoadingProgress(100)
            setIsReady(true)
            isCheckingReady = false
          }
        }, 500)
      }

      if (document.readyState === 'complete') {
        handleLoad()
      } else {
        window.addEventListener('load', handleLoad, { once: true })
      }
    }

    checkReady()

    // Safety net: if we sit at >=90% for too long, promote to 100%
    const highWaterTimer = setTimeout(() => {
      if (isCheckingReady && progress >= 90) {
        clearInterval(interval)
        progress = 100
        setLoadingProgress(100)
        setIsReady(true)
        isCheckingReady = false
      }
    }, 4000)

    return () => {
      clearInterval(interval)
      clearTimeout(fallbackTimer)
      clearTimeout(highWaterTimer)
    }
  }, [])

  const handleLoadingComplete = () => {
    // Переходим только когда приложение реально готово И прошло минимальное время
    if (isReady && minimumTimeElapsed) {
      // If user already picked theme earlier, skip straight to Welcome
      let nextRoute = '/theme-selection'
      try {
        if (typeof window !== 'undefined' && sessionStorage.getItem('themeSelected') === '1') {
          nextRoute = '/welcome'
        }
      } catch {}
      router.push(nextRoute)
    }
  }

  // Когда готово и прошло минимальное время - переходим
  useEffect(() => {
    if (isReady && minimumTimeElapsed && loadingProgress === 100) {
      const timer = setTimeout(() => {
        let nextRoute = '/theme-selection'
        try {
          if (typeof window !== 'undefined' && sessionStorage.getItem('themeSelected') === '1') {
            nextRoute = '/welcome'
          }
        } catch {}
        router.push(nextRoute)
      }, 300)
      return () => clearTimeout(timer)
    }
    return () => {}
  }, [isReady, minimumTimeElapsed, loadingProgress, router])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <LoadingAnimation progress={loadingProgress} isComplete={isReady && minimumTimeElapsed} />
      </div>
    </div>
  )
}

