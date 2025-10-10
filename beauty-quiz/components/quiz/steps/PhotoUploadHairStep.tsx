'use client'

import Image from 'next/image'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import imageCompression from 'browser-image-compression'
import { storage } from '@/lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const CameraCapture = dynamic(() => import('@/components/CameraCapture'), { ssr: false })

export default function PhotoUploadHairStep() {
  const { answers, setAnswer } = useQuizStore()
  const genderStr = answers.Gender === 2 ? 'female' : 'male'
  const [showCamera, setShowCamera] = useState(false)

  const handleUpload = async (file: File) => {
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.8 }
  const compressed = await imageCompression(file, options)
  const uid = (answers?.Id) ? answers.Id : 'anonymous'
  const path = `user-uploads/${uid}/hair/${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`
      const sRef = storageRef(storage, path)
      const uploaded = await uploadBytes(sRef, compressed)
      const downloadUrl = await getDownloadURL(uploaded.ref)
      setAnswer('HairImageUrl', downloadUrl)
      setAnswer('HairImageSkipped', false)
    } catch (e) {
      console.error('Error uploading hair image', e)
    }
  }

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleUpload(file)
    }
    input.click()
  }

  const handleCameraOpen = () => {
    setShowCamera(true)
  }

  const handleCameraCapture = async (blobUrl: string, blob: Blob) => {
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.8 }
      const fileLike = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
  const compressed = await imageCompression(fileLike, options)
  const uid = (answers?.Id) ? answers.Id : 'anonymous'
  const path = `user-uploads/${uid}/hair/${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`
      const sRef = storageRef(storage, path)
      const uploaded = await uploadBytes(sRef, compressed)
      const downloadUrl = await getDownloadURL(uploaded.ref)
      setAnswer('HairImageUrl', downloadUrl)
      setAnswer('HairImageSkipped', false)
    } catch (e) {
      console.error('Error uploading captured hair image', e)
      setAnswer('HairImageUrl', blobUrl)
      setAnswer('HairImageSkipped', false)
    } finally {
      setShowCamera(false)
    }
  }

  const handleCameraCancel = () => {
    setShowCamera(false)
  }

  const toggleSkip = () => {
    const skipped = answers.HairImageSkipped
    if (skipped) {
      setAnswer('HairImageSkipped', false)
    } else {
      setAnswer('HairImageUrl', '')
      setAnswer('HairImageSkipped', true)
    }
  }

  const isComplete = Boolean(answers.HairImageUrl) || answers.HairImageSkipped

  const title = 'Upload a clear photo of your hair'
  const subtitle = 'Why we ask: It helps tailor hair care tips for your density, texture, and scalp condition. We use it only to personalize your plan.'

  const imageUrl = answers.HairImageUrl

  return (
    <>
      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onCancel={handleCameraCancel} />
      )}
      <OnboardingStep title={title} subtitle={subtitle} condition={isComplete}>
        <div className="p-1 border-2 border-dotted border-blue-300 rounded-2xl">
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-transparent flex-shrink-0">
                <Image src={`/images/on_boarding_images/hair_${genderStr}.png`} alt="Hair reference" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary mb-1">Tips:</div>
                <ul className="list-disc pl-5 text-sm text-text-secondary space-y-1">
                  <li>Natural light, hair fully visible</li>
                  <li>Avoid heavy styling products</li>
                  <li>Front or side view with good focus</li>
                </ul>
              </div>
            </div>

            <div className="relative h-36 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center transition-colors duration-200 p-2">
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <Image src={imageUrl} alt="Hair preview" fill className="object-cover rounded-xl" />
                  <button
                    onClick={() => setAnswer('HairImageUrl', '')}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 text-black hover:bg-white shadow"
                    title="Change photo"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : answers.HairImageSkipped ? (
                <button
                  onClick={toggleSkip}
                  className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="font-semibold text-red-600 dark:text-red-400">Skipped</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 text-center">
                    You won't get an accurate hair analysis.
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Tap to undo</p>
                </button>
              ) : (
                <div className="flex items-center justify-around w-full">
                  <button onClick={handleFileSelect} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-purple-800">Upload</p>
                  </button>
                  <button onClick={handleCameraOpen} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Camera</p>
                  </button>
                  <button onClick={toggleSkip} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Skip</p>
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">Used only to personalize your hair routine. You can skip if you prefer.</p>
          </div>
        </div>
      </OnboardingStep>
    </>
  )
}
