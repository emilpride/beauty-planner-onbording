'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0L12.2451 7.75492H20L13.8776 12.5433L16.1224 20L10 15.2111L3.87755 20L6.12245 12.5433L0 7.75492H7.75492L10 0Z" fill="url(#paint0_linear_1_123)"/>
    <defs>
      <linearGradient id="paint0_linear_1_123" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A385E9"/>
        <stop offset="1" stopColor="#D985E5"/>
      </linearGradient>
    </defs>
  </svg>
)

export default function ScheduleIntroStep() {
  const router = useRouter()
  const { nextStep, currentStep, answers } = useQuizStore()

  const handleNext = () => {
    const nextStepIndex = currentStep + 1
    nextStep()
    router.push(`/quiz/${nextStepIndex}`)
  }

  const assistantImage = answers.assistant === 'max' 
    ? "/images/content/assistant_max.png" 
    : "/images/content/assistant_ellie.png";

  return (
    <div className="w-full max-w-[430px] mx-auto h-screen font-sans flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4 shrink-0 z-10">
        <button onClick={() => router.back()} className="p-2">
           <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5382 18.4615L2.07666 10L10.5382 1.53845" stroke="#5C4688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Image Section */}
      <div className="relative h-1/2 w-full -mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-white to-pink-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={assistantImage}
            alt="Assistant"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between p-8 bg-white rounded-t-3xl -mt-8 z-10">
        <div>
          <h1 className="text-3xl font-bold text-[#5C4688] mb-4">Let's Create Your Schedule</h1>
          <p className="text-gray-600 mb-6">
            Our users save an average of 12 hours a year! Imagine what you could do with that time.
          </p>

          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <div className="pt-1"><StarIcon /></div>
              <p className="text-gray-700">We'll use your answers to plan Activities just for you</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="pt-1"><StarIcon /></div>
              <p className="text-gray-700">Get a customized calendar to stay on top of your regular routine</p>
            </li>
          </ul>
        </div>

        <button onClick={handleNext} className="w-full bg-[#A385E9] text-white font-bold py-4 rounded-xl shadow-lg mt-6">
          Let's Go
        </button>
      </div>
    </div>
  )
}
