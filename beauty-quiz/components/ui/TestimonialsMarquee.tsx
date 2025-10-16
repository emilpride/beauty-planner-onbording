"use client"

import Image from 'next/image'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function TestimonialsMarquee({ className }: { className?: string }) {
  // Same dataset used elsewhere for consistency
  const testimonials = [
    { name: 'Emily', image: '/images/reviews/review_1.png', text: 'This service is a real find! Thanks for the accuracy and professionalism!' },
    { name: 'Aisha', image: '/images/reviews/review_2.png', text: "I'm stoked! The results have been a source of inspiration." },
    { name: 'Mira', image: '/images/reviews/review_3.png', text: 'The plan keeps me consistent—real results.' },
    { name: 'Lisa', image: '/images/reviews/review_4.png', text: 'The planning feature is amazing! My routine is perfectly organized now.' },
    { name: 'Sofia', image: '/images/reviews/review_5.png', text: "Finally found the perfect beauty routine planner! It's so easy to follow." },
    { name: 'Anna', image: '/images/reviews/review_6_old_woman.png', text: 'My beauty routine has never been this organized! Love the planning tools.' },
    { name: 'Chloe', image: '/images/reviews/review_4.png', text: 'Planning made it click—quick wins and real results.' },
    { name: 'Jasmine', image: '/images/reviews/review_5.png', text: 'So easy to stick with—my routine finally feels effortless.' },
    { name: 'Noah', image: '/images/reviews/review_6_man.png', text: 'Clean UI, smart reminders—results showed up fast.' },
    { name: 'Evelyn', image: '/images/reviews/review_6_old_woman.png', text: 'Simple plan, big payoff. Loving the glow-up.' },
  ]

  // Use precise stride: card width (141px) + gap (10px = gap-2.5)
  const STRIDE = 151
  const nCards = testimonials.length
  const totalWidth = STRIDE * nCards
  const x = useMotionValue(-totalWidth)
  const draggingRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const dprRef = useRef<number>(1)

  useEffect(() => {
    dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const speed = 12 // px/sec auto drift to the left

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      // Keep marquee moving unless user is dragging; allow motion even with reduced motion here per UX request
      if (!draggingRef.current) {
        const current = x.get()
        const nextRaw = current - speed * dt
        const dpr = dprRef.current
        const next = Math.round(nextRaw * dpr) / dpr
        x.set(next)
        const curr = x.get()
        if (curr < -2 * totalWidth) x.set(curr + totalWidth)
        if (curr > 0) x.set(curr - totalWidth)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [totalWidth, x, reducedMotion])

  return (
    <motion.div className={`w-full overflow-hidden relative cursor-grab active:cursor-grabbing ${className ?? ''}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10" style={{ background: 'linear-gradient(90deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10" style={{ background: 'linear-gradient(270deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)' }} />
      <motion.div
        className="flex flex-row items-start gap-2.5"
        style={{ width: 'max-content', x, willChange: 'transform', transform: 'translateZ(0)' }}
        drag="x"
        dragConstraints={{ left: -2 * totalWidth, right: 0 }}
        dragElastic={0.04}
        onDragStart={() => (draggingRef.current = true)}
        onDragEnd={() => {
          draggingRef.current = false
          const val = x.get()
          if (val > 0) {
            x.set(val - totalWidth)
          } else if (val < -2 * totalWidth) {
            x.set(val + totalWidth)
          }
        }}
      >
        {[0, 1, 2].map((copy) => (
          <div key={`copy-${copy}`} className="flex flex-row items-start gap-2.5">
            {testimonials.map((review, index) => (
              <div key={`${copy}-${index}`} className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none" style={{ width: '141px', height: '298px' }}>
                <Image src={review.image} alt={`User review ${review.name}`} width={125} height={125} className="w-full h-auto object-cover flex-none rounded-md pointer-events-none" draggable={false} />
                <div className="flex flex-row items-center gap-1 flex-none">
                  <span className="font-bold text-sm text-text-primary">{review.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                  </div>
                </div>
                <div className="flex-none self-stretch border border-border-subtle/60" />
                <div className="flex flex-row items-center gap-2 flex-none">
                  <div className="flex flex-row items-start flex-none">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05"><path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/></svg>
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">5.0 rating</span>
                </div>
                <p className="flex-none self-stretch text-sm text-text-primary" style={{ fontWeight: 500 }}>{review.text}</p>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
