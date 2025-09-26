'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ContractAgreementStep() {
  const { currentStep, nextStep, answers, setAnswer } = useQuizStore()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.strokeStyle = '#A385E9'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      ctx.strokeStyle = '#A385E9'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleFinish = () => {
    if (hasSignature) {
      setAnswer('contractSignature', 'signed')
      router.push('/procedures/5') // Переходим к RegularCareResultsStep
    }
  }

  return (
    <div className="h-full bg-white flex flex-col scrollbar-hide">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#5C4688]">Let's Make A Contract</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contract Terms */}
        <div className="space-y-4">
          <motion.div
            className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 bg-[#A385E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Commitment to Consistency</h3>
              <p className="text-sm text-gray-600">I commit to following my personalized beauty routine consistently for the next 30 days.</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-8 bg-[#A385E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Daily Progress Tracking</h3>
              <p className="text-sm text-gray-600">I will log my daily activities and mood to track my progress and stay motivated.</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-8 bg-[#A385E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Mindful Self-Care</h3>
              <p className="text-sm text-gray-600">I will approach my beauty routine with mindfulness and self-compassion.</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-8 h-8 bg-[#A385E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Celebrate Progress</h3>
              <p className="text-sm text-gray-600">I will celebrate small wins and acknowledge my progress along this journey.</p>
            </div>
          </motion.div>
        </div>

        {/* Signature Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Digital Signature</h3>
          <div className="border-2 border-gray-200 rounded-xl p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-32 border border-gray-300 rounded-lg cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearSignature}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear and sign again
              </button>
              <span className="text-xs text-gray-400">Sign above to continue</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={handleFinish}
          disabled={!hasSignature}
          className="w-full bg-[#A385E9] text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Finish
        </button>
      </div>
    </div>
  )
}