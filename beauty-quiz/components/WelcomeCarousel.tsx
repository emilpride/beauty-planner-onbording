'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const welcomeSlides = [
  {
    id: 1,
    image: '/images/on_boarding_images/welcome_img_1.png',
    title: "Beauty is more than routine. It's your mind and body too.",
    showSignIn: true
  },
  {
    id: 2,
    image: '/images/on_boarding_images/welcome_img_2.png',
    title: "Welcome! I'm Your Beauty & Wellness Guide! Let's start your journey to holistic self-care!"
  },
  {
    id: 3,
    image: '/images/on_boarding_images/welcome_img_3.png',
    title: "Beauty Mirror: smart tracking and personalized routines for a balanced you."
  },
  {
    id: 4,
    image: '/images/on_boarding_images/welcome_img_4.png',
    title: "Unlock your best self with Beauty Mirror—stay consistent, build healthy habits, and glow inside and out."
  }
]

export default function WelcomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const router = useRouter()
  const [webmSupported, setWebmSupported] = useState<boolean | null>(null)

  // Detect WebM support on client to decide whether to render the video or fallback image
  useEffect(() => {
    try {
      const v = document.createElement('video')
      const result = typeof v.canPlayType === 'function' ? (v.canPlayType('video/webm; codecs="vp9, vorbis"') || v.canPlayType('video/webm')) : ''
      setWebmSupported(result === 'probably' || result === 'maybe')
    } catch (_) {
      setWebmSupported(false)
    }
  }, [])

  const nextSlide = () => {
    if (isTransitioning) return
    
    if (currentSlide < welcomeSlides.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1)
        setIsTransitioning(false)
      }, 150)
    } else {
      // Last slide - go to assistant selection page
      router.push('/assistant-selection')
    }
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 150)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.targetTouches
    if (touches && touches.length > 0) {
      const x = touches[0]?.clientX
      if (typeof x === 'number') {
        setTouchStart(x)
        setTouchEnd(x)
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touches = e.targetTouches
    if (touches && touches.length > 0) {
      const x = touches[0]?.clientX
      if (typeof x === 'number') {
        setTouchEnd(x)
      }
    }
  }

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < welcomeSlides.length - 1) {
      nextSlide()
    } else if (isRightSwipe && currentSlide > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const currentSlideData = welcomeSlides[currentSlide]

  return (
  <div className="h-[100dvh] bg-surface flex flex-col overflow-hidden">
      {/* Slider Container */}
      <div 
        className="relative sm:flex-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {welcomeSlides.map((slide, index) => (
            <div key={slide.id} className="w-full flex-shrink-0 flex flex-col items-center px-6 pt-3">
              {/* Media (Video for slide 1 with WebM support, otherwise image) */}
              <div className="w-full max-w-sm">
                <div className="relative w-full h-[55vh] sm:h-[55vh] md:h-[55vh] max-h-[520px] rounded-[40px] sm:rounded-[44px] md:rounded-[48px] overflow-hidden">
                  {slide.id === 1 && webmSupported ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                      poster="/images/on_boarding_images/welcome_img_1.png"
                    >
                      <source src="/animations/welcome.webm" type="video/webm" />
                    </video>
                  ) : (
                    <Image
                      src={slide.image}
                      alt={`Welcome slide ${slide.id}`}
                      fill
                      className="object-cover transition-opacity duration-300"
                      priority={index === 0}
                    />
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full max-w-sm text-center mt-3 mb-4 flex flex-col items-center gap-2">
                <h1 className="text-[17px] font-bold text-text-primary leading-relaxed transition-opacity duration-300">
                  {slide.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        {/* Page Indicators */}
        <div className="flex justify-center space-x-2 mb-3">
          {welcomeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="max-w-sm mx-auto">
          {/* Next Button */}
          <div className="flex justify-center">
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-[15px]"
            >
              Next
            </button>
          </div>

          {/* Sign In Link - Reserve space even when hidden to prevent layout shift */}
          <div className="mt-3 min-h-[24px]">
            {currentSlideData?.showSignIn ? (
              <p className="text-center text-text-secondary">
                Already have an account?{' '}
                <button className="text-primary font-semibold">Sign in</button>
              </p>
            ) : (
              <p className="text-center text-text-secondary invisible pointer-events-none select-none">
                Already have an account? Sign in
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
