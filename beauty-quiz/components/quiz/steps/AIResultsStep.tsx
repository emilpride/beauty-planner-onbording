'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { motion, useMotionValue } from 'framer-motion'

const normalizeIdentifier = (value?: string | null) =>
  typeof value === 'string' ? value.trim() : ''

export default function AIResultsStep() {
  const { answers: storeAnswers, setAnalysis, nextStep } = useQuizStore()
  const effectiveUserId =
    normalizeIdentifier(storeAnswers.Id) ||
    normalizeIdentifier(storeAnswers.sessionId) ||
    'web-anonymous'
  
  const [status, setStatus] = useState<'running' | 'success' | 'error'>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Testimonials data copied from RegularCareResultsStep
  const testimonials = [
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
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearIntervalSafe()
          return 100
        }
        // If analysis is done, accelerate to 100
        if (status === 'success') {
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
  }, [status])

  // Effect to transition when done
  useEffect(() => {
    if (progress >= 100 && status === 'success') {
      // A short delay to let the user see 100% before navigating
      setTimeout(() => {
        nextStep()
      }, 400)
    }
  }, [progress, status, nextStep])

  const runAnalysis = async () => {
    setStatus('running')
    setErrorMessage(null)
    setProgress(0) // Reset progress on retry

    try {
      const payload = {
        userId: effectiveUserId,
        sessionId: storeAnswers.sessionId,
        events: storeAnswers.events,
        answers: storeAnswers,
        photoUrls: {
          face: storeAnswers.FaceImageUrl,
          hair: storeAnswers.HairImageUrl,
          body: storeAnswers.BodyImageUrl,
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
        setAnalysis(json.analysis)
        setStatus('success')
      } else {
        throw new Error(json?.error || 'Invalid response from analysis server.')
      }
    } catch (e: any) {
      console.error('Analysis failed:', e)
      setErrorMessage(e?.message || 'An unknown network error occurred.')
      setStatus('error')
    }
  }

  // Kick off the analysis immediately
  useEffect(() => {
    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          {status === 'running' && (
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">{Math.floor(progress)}%</p>
              <p className="text-xs text-text-secondary">Analyzing...</p>
            </div>
          )}
          {status === 'success' && (
             <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">100%</p>
              <p className="text-xs text-text-secondary">Done!</p>
            </div>
          )}
          {status === 'error' && (
            <button onClick={runAnalysis} className="flex flex-col items-center">
               <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-semibold text-red-500 mt-2">Retry</span>
            </button>
          )}
        </div>
      </div>

      {status !== 'error' ? (
        <div className="w-full overflow-hidden">
          <p className="text-sm font-semibold text-text-secondary mb-3">What our users say</p>
          <motion.div
            className="flex gap-3"
            drag="x"
            dragConstraints={{ left: -totalWidth, right: 0 }}
            onDragStart={() => (draggingRef.current = true)}
            onDragEnd={() => (draggingRef.current = false)}
            style={{ x }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-32 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md text-left">
                <div className="flex items-center mb-2">
                  <Image src={t.image} alt={t.name} width={28} height={28} className="rounded-full mr-2" />
                  <p className="text-xs font-bold text-text-primary">{t.name}</p>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">{t.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
           <p className="text-xs text-red-700 dark:text-red-300">Please check your internet connection and try again. If the problem persists, you can contact our support team.</p>
        </div>
      )}
    </div>
  )
}


