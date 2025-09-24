'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-5.58a1.012 1.012 0 011.59 0l4.418 5.58a1.012 1.012 0 010 .639l-4.418 5.58a1.012 1.012 0 01-1.59 0l-4.418-5.58z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
)


export default function SignUpStep() {
  const router = useRouter()
  const { nextStep, currentStep } = useQuizStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email, password })
    const nextStepIndex = currentStep + 1
    nextStep()
    router.push(`/quiz/${nextStepIndex}`)
  }
  
  const handleSocialSignUp = (provider: string) => {
    console.log(`Signing up with ${provider}`)
    const nextStepIndex = currentStep + 1
    nextStep()
    router.push(`/quiz/${nextStepIndex}`)
  }

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F5F5F5] h-screen font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 shrink-0">
        <button onClick={() => router.back()} className="p-2">
           <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5382 18.4615L2.07666 10L10.5382 1.53845" stroke="#5C4688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-[#5C4688] font-bold text-2xl -ml-8">
          Sign Up
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6">
        <div className="flex flex-col items-center pt-2">
          <Image
            src="/logos/app_icon.png"
            alt="Beauty Mirror Logo"
            width={100}
            height={100}
            className="mb-6"
          />
          <div className="w-full bg-white rounded-t-3xl p-8">
            <h2 className="text-2xl font-bold text-[#5C4688] text-left">Join Beauty Mirror Today</h2>
            <p className="text-gray-500 mt-2 mb-6 text-left text-sm">
              Start your Activity journey with Beauty Mirror. It's quick, easy, and free!
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Image src="/icons/login/email.svg" alt="email icon" width={18} height={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Image src="/icons/login/lock.svg" alt="password icon" width={18} height={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                   </button>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-[#A385E9] text-white font-bold py-3.5 rounded-lg text-lg mt-6">
                Sign Up
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 my-4">
              Already have an account? <a href="#" className="font-semibold text-[#A385E9]">Sign in</a>
            </p>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-400">or</span>
              <hr className="flex-grow border-t border-gray-200" />
            </div>

            <div className="space-y-3">
              <button onClick={() => handleSocialSignUp('Google')} className="w-full flex items-center justify-center py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                <Image src="/logos/google-icon.png" alt="Google" width={20} height={20} className="mr-3" />
                Continue with Google
              </button>
               <button onClick={() => handleSocialSignUp('Apple')} className="w-full flex items-center justify-center py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                <Image src="/logos/apple-icon.png" alt="Apple" width={20} height={20} className="mr-3" />
                Continue with Apple
              </button>
               <button onClick={() => handleSocialSignUp('Facebook')} className="w-full flex items-center justify-center py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                <Image src="/logos/facebook-icon.png" alt="Facebook" width={20} height={20} className="mr-3" />
                Continue with Facebook
              </button>
            </div>

             <p className="text-center text-xs text-gray-500 mt-8">
              By proceeding, you agree with the <a href="#" className="font-semibold text-gray-800">Terms of Use</a> and <a href="#" className="font-semibold text-gray-800">Privacy Policy</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
