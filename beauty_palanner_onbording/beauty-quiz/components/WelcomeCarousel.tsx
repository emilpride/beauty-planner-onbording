'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import BmsRing from '@/components/post-quiz/BmsRing'

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

  // Demo BMS data for slide 2
  const [bmsDemo, setBmsDemo] = useState<{
    skin: number;
    hair: number;
    physic: number;
    mental: number;
  } | null>(null)

  // Demo Age Snapshot data for slide 3
  const [agesDemo, setAgesDemo] = useState<{
    current: number;
    biological: number;
    projected: number;
  } | null>(null)

  // Animation state for Age Snapshot
  const [ageAnimStart, setAgeAnimStart] = useState(false)
  const [ageCount, setAgeCount] = useState<{ current: number; biological: number; projected: number }>({ current: 0, biological: 0, projected: 0 })

  const CATEGORY_COLORS: Record<'skin'|'hair'|'physic'|'mental', string> = {
    skin: '#60A5FA',   // Skin — blue
    hair: '#6EE7B7',   // Hair — green/teal
    physic: '#FBBF24', // Physical — amber
    mental: '#F472B6', // Mental — pink
  }

  const randomScore = (min = 4, max = 9) => Number((min + Math.random() * (max - min)).toFixed(1))

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

  // Initialize random demo scores once
  useEffect(() => {
    setBmsDemo({
      skin: randomScore(6, 9),
      hair: randomScore(5.5, 9),
      physic: randomScore(5, 9),
      mental: randomScore(4.5, 9),
    })
    // Age snapshot randomization
    const current = Math.round(22 + Math.random() * 28) // 22..50
    const bioDelta = Math.round((Math.random() - 0.5) * 6) // -3..+3
    const biological = Math.max(14, Math.min(100, current + bioDelta + 1)) // keep >= current+1 in most cases
    const baseLife = 80 + Math.round(Math.random() * 6) // 80..86 baseline
    const projected = Math.max(current + 5, Math.min(100, baseLife + Math.round(Math.random() * 6))) // 85..92 typical
    setAgesDemo({ current, biological, projected })
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

  // Trigger number count-up when slide 3 is active
  useEffect(() => {
    let raf: number | null = null
    if (currentSlideData?.id === 3 && agesDemo) {
      setAgeAnimStart(true)
      const start = performance.now()
      const dur = 900
      const from = { current: 0, biological: 0, projected: 0 }
      const to = { ...agesDemo }
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        setAgeCount({
          current: Math.round(from.current + (to.current - from.current) * eased),
          biological: Math.round(from.biological + (to.biological - from.biological) * eased),
          projected: Math.round(from.projected + (to.projected - from.projected) * eased),
        })
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    } else {
      setAgeAnimStart(false)
      setAgeCount({ current: 0, biological: 0, projected: 0 })
    }
    return () => {
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [currentSlideData?.id, agesDemo])

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
                  ) : slide.id === 2 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-white/[0.03] backdrop-blur-[2px]">
                      {bmsDemo ? (
                        <>
                          {/* Framed square card */}
                          <div className="rounded-[28px] sm:rounded-[32px] border border-black/10 dark:border-white/15 bg-white/85 dark:bg-white/[0.08] shadow-soft overflow-hidden aspect-square w-[min(82%,320px)] sm:w-[min(82%,360px)] flex items-center justify-center">
                            <BmsRing
                              size={220}
                              thickness={24}
                              gapDeg={18}
                              overall={Number(((bmsDemo.skin + bmsDemo.hair + bmsDemo.physic + bmsDemo.mental) / 4).toFixed(1))}
                              scores={{
                                skin: bmsDemo.skin,
                                hair: bmsDemo.hair,
                                physic: bmsDemo.physic,
                                mental: bmsDemo.mental,
                              }}
                              icons={{
                                skin: '/custom-icons/bms/skin_bms.svg',
                                hair: '/custom-icons/bms/hair_bms.svg',
                                physic: '/custom-icons/bms/physical_bms.svg',
                                mental: '/custom-icons/bms/mental_bms.svg',
                              }}
                              colors={CATEGORY_COLORS}
                            />
                          </div>

                          {/* Legend */}
                          <div className="mt-5 grid grid-cols-2 gap-3 w-[min(520px,90%)]">
                            {([
                              ['Mental', 'mental'] as const,
                              ['Skin', 'skin'] as const,
                              ['Hair', 'hair'] as const,
                              ['Body', 'physic'] as const,
                            ]).map(([label, key]) => (
                              <div key={key} className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-2 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }} />
                                  <span className="text-sm font-medium text-text-primary">{label}</span>
                                </div>
                                <span className="text-sm font-semibold text-text-primary">{(bmsDemo as any)[key].toFixed(1)} / 10</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-56 w-56 rounded-3xl bg-black/5 dark:bg-white/10 animate-pulse" />
                          <div className="h-8 w-64 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ) : slide.id === 3 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-white/[0.03] backdrop-blur-[2px]">
                      {agesDemo ? (
                        <>
                          {/* Framed square card for Age Snapshot */}
                          <div className="rounded-[28px] sm:rounded-[32px] border border-black/10 dark:border-white/15 bg-white/85 dark:bg-white/[0.08] shadow-soft overflow-hidden aspect-square w-[min(82%,320px)] sm:w-[min(82%,360px)] flex items-center justify-center p-4">
                            {(() => {
                              const h = (years: number) => `${Math.min((years / 100) * 100 * 1.3, 100)}%`
                              const current = agesDemo.current
                              const biological = Math.max(current + 1, agesDemo.biological)
                              const projected = Math.max(biological + 1, agesDemo.projected)
                              const display = ageAnimStart ? ageCount : { current: 0, biological: 0, projected: 0 }
                              return (
                                <div className="relative w-full h-full">
                                  {/* Grid lines */}
                                  <div className="absolute inset-0 z-0">
                                    {[0, 25, 50, 75, 100].map((percent) => (
                                      <div key={percent} className="absolute w-full border-b border-dashed border-border-subtle/20" style={{ bottom: `${percent}%` }} />
                                    ))}
                                  </div>
                                  {/* Bars */}
                                  <div className="absolute inset-0 flex items-end justify-center gap-6 sm:gap-10 px-4 z-10">
                                    {/* Current */}
                                    <div className="relative flex items-end justify-center flex-1 max-w-[90px] h-full pb-8">
                                      <motion.div
                                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                                        style={{ background: 'linear-gradient(180deg, rgba(138,96,255,0.95) 0%, rgba(163,133,233,0.75) 100%)' }}
                                        initial={{ height: '0%' }}
                                        animate={{ height: ageAnimStart ? h(current) : '0%' }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
                                      >
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{display.current} yrs</div>
                                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                                      </motion.div>
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-text-secondary text-center pointer-events-none">Current</div>
                                    </div>
                                    {/* Biological */}
                                    <div className="relative flex items-end justify-center flex-1 max-w-[90px] h-full pb-8">
                                      <motion.div
                                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                                        style={{ background: 'linear-gradient(180deg, rgba(255,138,80,0.95) 0%, rgba(138,96,255,0.25) 100%)' }}
                                        initial={{ height: '0%' }}
                                        animate={{ height: ageAnimStart ? h(biological) : '0%' }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
                                      >
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{display.biological} yrs</div>
                                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                                      </motion.div>
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-text-secondary text-center pointer-events-none">Biological</div>
                                    </div>
                                    {/* Life Expectancy */}
                                    <div className="relative flex items-end justify-center flex-1 max-w-[90px] h-full pb-8">
                                      <motion.div
                                        className="w-full rounded-t-[12px] rounded-b-[6px] relative shadow-[0_6px_14px_rgba(0,0,0,0.12)] overflow-visible"
                                        style={{ background: 'linear-gradient(180deg, rgba(255,166,77,0.95) 0%, rgba(254,108,108,0.85) 100%)' }}
                                        initial={{ height: '0%' }}
                                        animate={{ height: ageAnimStart ? h(projected) : '0%' }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.19 }}
                                      >
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary">{display.projected} yrs</div>
                                        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[12px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)' }} />
                                      </motion.div>
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-text-secondary text-center pointer-events-none">Life Expectancy</div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-56 w-56 rounded-3xl bg-black/5 dark:bg-white/10 animate-pulse" />
                          <div className="h-8 w-64 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse" />
                        </div>
                      )}
                    </div>
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
                {slide.id === 2 ? (
                  <h1 className="text-[16px] sm:text-[17px] font-bold text-text-primary leading-relaxed transition-opacity duration-300">
                    <span className="sm:hidden">
                      Welcome! I'm your Beauty & Wellness Guide!
                      <br />
                      Let's start your journey to holistic self-care!
                    </span>
                    <span className="hidden sm:inline">Welcome! I'm Your Beauty & Wellness Guide! Let's start your journey to holistic self-care!</span>
                  </h1>
                ) : slide.id === 3 ? (
                  <h1 className="text-[16px] sm:text-[17px] font-bold text-text-primary leading-relaxed transition-opacity duration-300">
                    <span className="sm:hidden">
                      Your Beauty Mirror:
                      <br />
                      smarter insights, age awareness,
                      <br />
                      better routines.
                    </span>
                    <span className="hidden sm:inline">Your Beauty Mirror: smarter insights, age awareness, better routines.</span>
                  </h1>
                ) : (
                  <h1 className="text-[17px] font-bold text-text-primary leading-relaxed transition-opacity duration-300">
                    {slide.title}
                  </h1>
                )}
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
