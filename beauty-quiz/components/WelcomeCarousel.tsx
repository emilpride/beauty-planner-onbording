'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const welcomeSlides = [
  {
    id: 1,
    image: '/images/on_boarding_images/welcome_img_1.png',
    title: "Beauty is not just about your routineвЂ”it's also about mental and physical well-being",
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
    title: "Discover Beauty Mirror Features for Your Journey! With smart tracking and personalized routines, Beauty Mirror keeps you motivated and balanced in beauty, mind, and body."
  },
  {
    id: 4,
    image: '/images/on_boarding_images/welcome_img_4.png',
    title: "Unlock Your Best Self with Beauty Mirror! Stay consistent, cultivate healthy beauty & wellness Activities, and unlock your natural glowвЂ”inside and out!"
  }
]

export default function WelcomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const router = useRouter()

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
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
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
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {welcomeSlides.map((slide, index) => (
            <div key={slide.id} className="w-full flex-shrink-0 flex flex-col items-center justify-center px-6">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center w-full max-w-sm">
                <div className="relative w-full h-[55vh] max-h-[450px] rounded-[40px] sm:rounded-[44px] md:rounded-[48px] overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={`Welcome slide ${slide.id}`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full max-w-sm text-center mb-6 flex flex-col justify-center items-center gap-3">
                <h1 className="text-xl font-bold text-text-primary leading-relaxed transition-opacity duration-300">
                  {slide.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-6">
        {/* Page Indicators */}
        <div className="flex justify-center space-x-2 mb-4">
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
              className="w-full bg-[#A385E9] hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-base"
            >
              Next
            </button>
          </div>

          {/* Sign In Link - Only on first slide */}
          {welcomeSlides[currentSlide].showSignIn && (
            <p className="text-center mt-4 text-text-secondary">
              Already have an account?{' '}
              <button className="text-primary font-semibold">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
