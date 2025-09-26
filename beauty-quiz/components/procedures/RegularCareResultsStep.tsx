'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function RegularCareResultsStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assistant = searchParams.get('assistant') || 'ellie'

  const handleContinue = () => {
    // Navigate to the main app or complete the flow
    router.push('/dashboard') // or wherever the flow should continue
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FCE4EC 50%, #FFFFFF 100%)' }}>
      
      {/* Character and Content Container */}
      <div className="relative w-full max-w-sm mx-auto">
        
        {/* Character Image */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[179px]">
          <Image
            src={`/images/on_boarding_images/onboarding_img_4${assistant === 'max' ? '_max' : ''}.png`}
            alt="Character"
            width={179}
            height={179}
            className="object-contain"
            priority
          />
        </div>

        {/* Main Content Card */}
        <div 
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between" 
          style={{ height: '396px' }}
        >
          {/* Content */}
          <div className="flex flex-col gap-6">
            
            {/* Title and Description */}
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#5C4688] leading-tight">
                Regular Care = Better Results!
              </h1>
              <p className="text-base text-[#333333] mt-3 font-semibold leading-relaxed">
                Consistency is the key to achieving your beauty goals. Your personalized routine is ready to help you stay on track.
              </p>
            </div>

            {/* Benefits List */}
            <div className="flex flex-col gap-4">
              {/* Benefit 1 */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <defs>
                      <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#8A6EDA' }} />
                        <stop offset="100%" style={{ stopColor: '#DB75E0' }} />
                      </linearGradient>
                    </defs>
                    <path fill="url(#iconGradient)" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <p className="text-base text-[#5C4688] font-medium flex-1">
                  Your personalized routine is ready
                </p>
              </div>

              {/* Divider */}
              <hr className="border-gray-200/90" />

              {/* Benefit 2 */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <defs>
                      <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#8A6EDA' }} />
                        <stop offset="100%" style={{ stopColor: '#DB75E0' }} />
                      </linearGradient>
                    </defs>
                    <path fill="url(#iconGradient2)" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <p className="text-base text-[#5C4688] font-medium flex-1">
                  Stay consistent and see amazing results
                </p>
              </div>
            </div>
          </div>
          
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-[#A385E9] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#906fe2] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
