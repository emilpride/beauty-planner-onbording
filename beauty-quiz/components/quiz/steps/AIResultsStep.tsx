'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'

const normalizeIdentifier = (value?: string | null) =>
  typeof value === 'string' ? value.trim() : ''

// Memoized testimonials scroller to avoid flicker on parent re-renders
const TestimonialsScroller = memo(function TestimonialsScroller() {
  // Same dataset as in RegularCareResultsStep
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

  // Motion + drag state
  // Use precise stride: card width (141px) + gap (10px = gap-2.5)
  const STRIDE = 151 // 141 + 10
  const nCards = testimonials.length
  const totalWidth = STRIDE * nCards
  const x = useMotionValue(-totalWidth)
  const draggingRef = useRef(false)
  const reducedMotion = useReducedMotion()

  // Cache DPR for subpixel rounding to reduce shimmer
  const dprRef = useRef<number>(1)
  useEffect(() => {
    dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const speed = 12 // px/sec auto drift to the left (slower for stability)

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!draggingRef.current && !reducedMotion) {
        const current = x.get()
        const nextRaw = current - speed * dt
        // Round to device pixels to avoid sub-pixel jitter
        const dpr = dprRef.current
        const next = Math.round(nextRaw * dpr) / dpr
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
  }, [totalWidth, x, reducedMotion])

  return (
    <motion.div className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing">
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
              <div
                key={`${copy}-${index}`}
                className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none"
                style={{ width: '141px', height: '298px' }}
              >
                <Image
                  src={review.image}
                  alt={`User review ${review.name}`}
                  width={125}
                  height={125}
                  className="w-full h-auto object-cover flex-none rounded-md pointer-events-none"
                  draggable={false}
                />
                <div className="flex flex-row items-center gap-1 flex-none">
                  <span className="font-bold text-sm text-text-primary">{review.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="font-bold text-xs" style={{ color: '#A385E9' }}>
                      Verified
                    </span>
                  </div>
                </div>
                <div className="flex-none self-stretch border border-border-subtle/60" />
                <div className="flex flex-row items-center gap-2 flex-none">
                  <div className="flex flex-row items-start flex-none">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                        <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z" />
                      </svg>
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
})

export default function AIResultsStep() {
  const router = useRouter()
  const { answers: storeAnswers, setAnalysis } = useQuizStore()
  const effectiveUserId =
    normalizeIdentifier(storeAnswers.Id) ||
    normalizeIdentifier(storeAnswers.sessionId) ||
    'web-anonymous'
  
  const [status, setStatus] = useState<'running' | 'success' | 'error'>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shownInterludesCountRef = useRef(0)
  const hasNavigatedRef = useRef(false)

  // Remove testimonials on loading per request

  const clearIntervalSafe = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  // Rotate through lightweight questions for interactivity
  const questions = [
    'Analyzing sleep and stress patterns…',
    'Reviewing your goals and focus areas…',
    'Measuring skin and hair indicators…',
    'Personalizing daily energy plan…',
    'Calibrating reminders and cadence…',
  ]

  // Micro interlude yes/no questions during analysis (dummy – no DB writes)
  const interludes: Array<{ key: 'UsesAlcohol'|'Smokes'|'HasChildren'; prompt: string }> = [
    { key: 'UsesAlcohol', prompt: 'Do you consume alcohol?' },
    { key: 'Smokes', prompt: 'Do you smoke?' },
    { key: 'HasChildren', prompt: 'Do you have children?' },
  ]
  const [interludeIndex, setInterludeIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  // Interleaving control to avoid back-to-back prompts
  const checkpoints = [22, 55, 80]
  const [nextInterludeCheckpointIdx, setNextInterludeCheckpointIdx] = useState(0)
  const [interludeCooldownUntil, setInterludeCooldownUntil] = useState<number>(0)
  const [lastInterludeProgress, setLastInterludeProgress] = useState<number>(0)
  const [shownInterludes, setShownInterludes] = useState(0)
  const interludeHeartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const runningHeartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status !== 'running') return
    const q = setInterval(() => {
      setQuestionIndex((i) => (i + 1) % questions.length)
    }, 2500)
    return () => clearInterval(q)
  }, [status])

  // Simplified progress simulation
  useEffect(() => {
    clearIntervalSafe()
    if (isPaused) return
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearIntervalSafe()
          return 100
        }
        // If analysis is done, accelerate toward 100 but keep a moment for interludes
        if (status === 'success') {
          if (shownInterludesCountRef.current < interludes.length) {
            // hold around 98-99 to allow remaining prompts to show
            if (prev < 98) return prev + 4
            return Math.min(prev + 0.3, 99)
          }
          return prev + 8
        }
        // If running, move slowly and hold at 99%
        if (status === 'running') {
          if (prev < 90) return prev + 1
          if (prev < 99) return prev + 0.2
          return 99
        }
        // If error, stay where it is
        return prev
      })
  }, 100)

    return () => clearIntervalSafe()
  }, [status, isPaused])

  // Trigger micro interludes at spaced checkpoints (~22%, ~55%, ~80%) with cooldown
  useEffect(() => {
    // Show interludes both while running and after success (until all three are shown)
    const allowShowing = (status === 'running') || (status === 'success' && shownInterludesCountRef.current < interludes.length)
    if (!allowShowing || isPaused) return
    if (interludeIndex !== null) return
    const now = Date.now()
    // Respect cooldown and require a minimum progress gap to feel spaced
  const minProgressGap = status === 'running' && progress < 98 ? 8 : 0
    if (now < interludeCooldownUntil) return
    if (progress - lastInterludeProgress < minProgressGap) return
    const cp = checkpoints[nextInterludeCheckpointIdx]
    if (cp !== undefined && progress >= cp) {
      // Dummy behavior: always show the next interlude (if available),
      // do not write anything to the store/DB.
      if (nextInterludeCheckpointIdx < interludes.length) {
        setIsPaused(true)
        setInterludeIndex(nextInterludeCheckpointIdx)
      } else {
        setNextInterludeCheckpointIdx((i) => Math.min(i + 1, checkpoints.length))
      }
    }
  }, [progress, status, isPaused, interludeIndex, nextInterludeCheckpointIdx, interludeCooldownUntil, lastInterludeProgress])

  // Heartbeat to ensure interludes continue after success even if progress is flat at 99%
  useEffect(() => {
    const needMoreInterludes = shownInterludes < interludes.length
    if (status === 'success' && needMoreInterludes) {
      if (interludeHeartbeatRef.current) clearInterval(interludeHeartbeatRef.current)
      interludeHeartbeatRef.current = setInterval(() => {
        if (isPaused || interludeIndex !== null) return
        const now = Date.now()
        if (now >= interludeCooldownUntil) {
          // Show next interlude if we still have checkpoints left
          if (nextInterludeCheckpointIdx < interludes.length) {
            setIsPaused(true)
            setInterludeIndex(nextInterludeCheckpointIdx)
          }
        }
      }, 500)
    } else {
      if (interludeHeartbeatRef.current) {
        clearInterval(interludeHeartbeatRef.current)
        interludeHeartbeatRef.current = null
      }
    }
    return () => {
      if (interludeHeartbeatRef.current) {
        clearInterval(interludeHeartbeatRef.current)
        interludeHeartbeatRef.current = null
      }
    }
  }, [status, shownInterludes, interludeIndex, isPaused, interludeCooldownUntil, nextInterludeCheckpointIdx])

  // Heartbeat for running state when progress is high and flat (>=98, held at 99)
  useEffect(() => {
    const needMore = shownInterludes < interludes.length
    if (status === 'running' && needMore && progress >= 98) {
      if (runningHeartbeatRef.current) clearInterval(runningHeartbeatRef.current)
      runningHeartbeatRef.current = setInterval(() => {
        if (isPaused || interludeIndex !== null) return
        const now = Date.now()
        if (now >= interludeCooldownUntil) {
          if (nextInterludeCheckpointIdx < interludes.length) {
            setIsPaused(true)
            setInterludeIndex(nextInterludeCheckpointIdx)
          }
        }
      }, 700)
    } else {
      if (runningHeartbeatRef.current) {
        clearInterval(runningHeartbeatRef.current)
        runningHeartbeatRef.current = null
      }
    }
    return () => {
      if (runningHeartbeatRef.current) {
        clearInterval(runningHeartbeatRef.current)
        runningHeartbeatRef.current = null
      }
    }
  }, [status, shownInterludes, progress, isPaused, interludeIndex, interludeCooldownUntil, nextInterludeCheckpointIdx])

  // Effect to transition when done
  useEffect(() => {
    const allInterludesShown = shownInterludesCountRef.current >= interludes.length
    // Primary path: success + 100% + all interludes handled
    if (progress >= 100 && status === 'success' && allInterludesShown && !hasNavigatedRef.current) {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true
          router.push('/signup')
        }
      }, 400)
    }
    // Fallback: if we reached 100% (or success) but for any reason interludes are not visible/blocked, proceed after a grace period
    if ((progress >= 100 || status === 'success') && !hasNavigatedRef.current) {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = setTimeout(() => {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true
          router.push('/signup')
        }
      }, 2000)
    }
    return () => {
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current)
        navTimeoutRef.current = null
      }
    }
  }, [progress, status, router])

  const runAnalysis = async () => {
    setStatus('running')
    setErrorMessage(null)
    setProgress(0) // Reset progress on retry
    setInterludeIndex(null)
    setIsPaused(false)

    try {
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current)
      analysisTimeoutRef.current = setTimeout(() => {
        // If server is too slow, continue with fallback to avoid endless 99%
        if (typeof window !== 'undefined') {
          continueWithBasicAnalysis()
        }
      }, 25000)
      const { BodyImageUrl, BodyImageSkipped, ...sanitizedAnswers } = storeAnswers as any;
      const payload = {
        userId: effectiveUserId,
        sessionId: storeAnswers.sessionId,
        events: storeAnswers.events,
        answers: sanitizedAnswers,
        photoUrls: {
          face: storeAnswers.FaceImageUrl,
          hair: storeAnswers.HairImageUrl,
        },
      }
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const errorJson = await resp.json().catch(() => ({}))
        throw new Error(errorJson?.error || `Analysis failed with status: ${resp.status}`)
      }

      const json = await resp.json()
      if (json?.analysis) {
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current)
          analysisTimeoutRef.current = null
        }
        setAnalysis(json.analysis)
        // Ensure we unpause and mark success but don't force 100 until interludes are shown
        setIsPaused(false)
        setStatus('success')
        // If no interludes remain to be shown, finalize progress to 100%
        if (shownInterludesCountRef.current >= interludes.length) {
          setProgress(100)
        }
      } else {
        throw new Error(json?.error || 'Invalid response from analysis server.')
      }
    } catch (e: any) {
      console.error('Analysis failed:', e)
      // Fall back to basic analysis to unblock flow
      continueWithBasicAnalysis()
    }
  }

  // Kick off the analysis immediately
  useEffect(() => {
    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup on unmount to avoid stray timers causing double navigation
  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [])

  // Client-side fallback: proceed with a safe default model if server analysis fails
  const continueWithBasicAnalysis = () => {
    const fallback = {
      bmi: null,
      bmiCategory: 'Unknown',
      bmiDescription: '',
      bmiImageId: '',
      skinCondition: { score: 6, explanation: 'Basic analysis due to network issue.', recommendations: ['cleanse-hydrate','deep-hydration'] },
      hairCondition: { score: 6, explanation: 'Basic analysis due to network issue.', recommendations: ['wash-care','deep-nourishment'] },
      physicalCondition: { score: 6, explanation: 'Basic analysis due to network issue.', recommendations: ['morning-stretch','cardio-boost'] },
      mentalCondition: { score: 6, explanation: 'Basic analysis due to network issue.', recommendations: ['mindful-meditation','breathing-exercises'] },
      bmsScore: 6,
      bmsCategory: 'On the Path to Balance',
      bmsDescription: ''
    }
    setAnalysis(fallback)
    setIsPaused(false)
    setStatus('success')
  }

  // Testimonials scroller (copied from Procedures step with identical behavior)
  // count shown interludes when user responds

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 pt-8 text-center">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-text-primary">
          {status === 'error' ? 'Something Went Wrong' : 'Analyzing Your Profile'}
        </h1>
        <p className="text-text-secondary mt-2">
          {status === 'error' ? errorMessage : questions[questionIndex]}
        </p>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center my-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <motion.circle
            className={status === 'error' ? 'text-red-500' : 'text-blue-600'}
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {(status === 'running' || (status === 'success' && shownInterludes < interludes.length)) && !isPaused && (
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">{Math.floor(progress)}%</p>
              <p className="text-xs text-text-secondary">Analyzing...</p>
            </div>
          )}
          {(status === 'running' || status === 'success') && isPaused && interludeIndex !== null && (
            <div className="text-center">
              <p className="text-base font-semibold text-text-primary mb-2">{interludes[interludeIndex].prompt}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-semibold"
                  onClick={() => {
                    // Dummy: do not persist, just continue
                    setIsPaused(false)
                    setInterludeIndex(null)
                    setLastInterludeProgress(progress)
                    setNextInterludeCheckpointIdx((i) => Math.min(i + 1, checkpoints.length))
                    setInterludeCooldownUntil(Date.now() + 3000)
                    shownInterludesCountRef.current += 1
                    setShownInterludes((c) => {
                      const next = c + 1
                      const isAnalysisSucceeded = status === 'success'
                      if (isAnalysisSucceeded && next >= interludes.length) {
                        setProgress(100)
                      }
                      return next
                    })
                  }}
                >Yes</button>
                <button
                  className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-800 text-sm font-semibold"
                  onClick={() => {
                    // Dummy: do not persist, just continue
                    setIsPaused(false)
                    setInterludeIndex(null)
                    setLastInterludeProgress(progress)
                    setNextInterludeCheckpointIdx((i) => Math.min(i + 1, checkpoints.length))
                    setInterludeCooldownUntil(Date.now() + 3000)
                    shownInterludesCountRef.current += 1
                    setShownInterludes((c) => {
                      const next = c + 1
                      const isAnalysisSucceeded = status === 'success'
                      if (isAnalysisSucceeded && next >= interludes.length) {
                        setProgress(100)
                      }
                      return next
                    })
                  }}
                >No</button>
              </div>
            </div>
          )}
          {status === 'success' && !isPaused && shownInterludes >= interludes.length && (
             <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">100%</p>
              <p className="text-xs text-text-secondary">Done!</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <button onClick={runAnalysis} className="flex flex-col items-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-semibold text-red-500 mt-2">Retry</span>
              </button>
              <button onClick={continueWithBasicAnalysis} className="text-xs font-semibold text-blue-600 underline">
                Continue with basic analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {status === 'error' && (
        <div className="w-full max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
           <p className="text-xs text-red-700 dark:text-red-300">Please check your internet connection and try again. If the problem persists, you can contact our support team.</p>
        </div>
      )}
      {/* Keep testimonials scroller mounted regardless of status to avoid flicker */}
      <div className="w-full max-w-md mx-auto mt-auto">
        <TestimonialsScroller />
      </div>
    </div>
  )
}


