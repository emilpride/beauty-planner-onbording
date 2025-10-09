'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { motion, useMotionValue } from 'framer-motion'

export default function AIResultsStep() {
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(-1) // -1 means no question
  const [answers, setAnswers] = useState<Array<'yes' | 'no'>>([])
  const router = useRouter()
  const { nextStep, currentStep } = useQuizStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Testimonials data copied from RegularCareResultsStep
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

  // Horizontal auto-scroll + drag logic (same as RegularCareResultsStep)
  const STRIDE = 145 // card width + gap approximation
  const nCards = testimonials.length
  const totalWidth = STRIDE * nCards
  const x = useMotionValue(-totalWidth)
  const draggingRef = useRef(false)

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const speed = 20 // px/sec auto drift to the left

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!draggingRef.current) {
        const next = x.get() - speed * dt
        x.set(next)
        const curr = x.get()
        // normalize into [-2*totalWidth, 0]
        if (curr < -2 * totalWidth) x.set(curr + totalWidth)
        if (curr > 0) x.set(curr - totalWidth)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [totalWidth, x])

  const questionStops = [22, 55, 82] // when to pause and ask
  const questions = [
    'Do you smoke?',
    'Do you drink alcohol?',
    'Do you have kids?'
  ]

  const startTimer = () => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1, 100)

        // If next crosses a stop and we have remaining questions, pause
        const nextStop = questionStops[answers.length] // next expected stop index
        if (!paused && answers.length < questionStops.length && next >= nextStop) {
          // Pause exactly at the stop
          clearIntervalSafe()
          setPaused(true)
          setQuestionIndex(answers.length)
          return nextStop
        }

        if (next >= 100) {
          clearIntervalSafe()
          // Small delay for UX and then navigate
          setTimeout(() => {
            nextStep()
            // Go directly to CurrentConditionAnalysis page
            router.push('/quiz/34')
          }, 600)
          return 100
        }
        return next
      })
    }, 80)
  }

  const clearIntervalSafe = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (!paused && questionIndex === -1) {
      startTimer()
    }
    return () => clearIntervalSafe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!paused && questionIndex === -1) {
      startTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, questionIndex])

  const getAnalysisMessage = () => {
    if (progress < 20) return 'Analyzing selected procedures...'
    if (progress < 40) return 'Building your personalized calendar and schedule...'
    if (progress < 60) return 'Setting priorities and reminders...'
    if (progress < 80) return 'Estimating expected impact and timeline...'
    if (progress < 100) return 'Finalizing recommendations and your plan...'
    return 'Your personalized plan is ready!'
  }

  const answerQuestion = (ans: 'yes' | 'no') => {
    setAnswers((prev) => [...prev, ans])
    setPaused(false)
    setQuestionIndex(-1)
    // Resume timer; the effect above will restart it
  }

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Analysis block - centered in viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Analyzing your answers</h1>
          <p className="text-text-secondary mb-8 text-center">
            We’re preparing your personalized plan: reviewing procedures, building your calendar, and estimating impact.
          </p>

          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center font-semibold text-primary text-lg mb-4">{progress}%</p>
            <p className="text-center text-text-secondary h-10">{getAnalysisMessage()}</p>
          </div>
        </div>
      </div>

      {/* Testimonials block - separate container at bottom */}
      <div className="bg-surface border-t border-border-subtle/60 p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10"
              style={{ background: 'linear-gradient(90deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)' }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10"
              style={{ background: 'linear-gradient(270deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)' }}
            />
            <motion.div
              className="flex flex-row items-start gap-2.5"
              style={{ width: 'max-content', x }}
              drag="x"
              dragConstraints={{ left: -2 * totalWidth, right: 0 }}
              dragElastic={0.08}
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
                    <div
                      key={`${copy}-${index}`}
                      className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none"
                      style={{ width: '141px', height: '200px' }}
                    >
                      <Image
                        src={review.image}
                        alt={`User review ${review.name}`}
                        width={125}
                        height={80}
                        className="w-full h-auto object-cover flex-none rounded-md pointer-events-none"
                        draggable={false}
                      />
                      <div className="flex flex-row items-center gap-1 flex-none">
                        <span className="font-bold text-sm text-text-primary">{review.name}</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="flex-none flex items-center justify-center w-4 h-4"
                            style={{ background: '#A385E9', borderRadius: '50%' }}
                          >
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                              <path
                                d="M1 3L2.5 4.5L5 1.5"
                                stroke="white"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <span className="font-bold text-xs" style={{ color: '#A385E9' }}>
                            Verified
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-none self-stretch border border-border-subtle/60" />
                      <div className="flex flex-row items-center gap-2 flex-none">
                        <div className="flex flex-row items-start flex-none">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                              <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-text-secondary">5.0</span>
                      </div>
                      <p className="flex-1 text-sm text-text-primary overflow-hidden" style={{ fontWeight: 500 }}>
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>      {paused && questionIndex >= 0 && (
        <div
          className="fixed inset-x-4 z-50"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
        >
          <div
            className="mx-auto w-[min(100%,32rem)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border-subtle/60 bg-surface/95 dark:bg-surface/90 px-4 py-3 shadow-elevated backdrop-blur-md"
          >
            <span className="text-base sm:text-lg font-semibold text-text-primary text-center sm:text-left">
              {questions[questionIndex]}
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => answerQuestion('yes')}
                className="min-w-[84px] px-4 py-2 rounded-xl bg-primary text-white text-base font-semibold shadow-soft hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]"
              >
                Yes
              </button>
              <button
                onClick={() => answerQuestion('no')}
                className="min-w-[84px] px-4 py-2 rounded-xl bg-gray-200 text-text-primary dark:bg-white/10 dark:text-white text-base font-semibold hover:bg-gray-300 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


