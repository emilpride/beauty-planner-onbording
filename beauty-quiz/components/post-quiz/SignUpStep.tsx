'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignUpStep() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSignUp = () => {
    // Handle sign up logic here
    console.log('Sign up with:', { email, password })
    // Navigate to premium intro screen
    router.push('/premium-intro')
  }

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`)
    // Handle social sign up logic here
    router.push('/premium-intro')
  }

  return (
    <div className="min-h-screen relative bg-background">
      {/* Back Button */}
      <div className="absolute top-8 left-6 z-20">
        <button
          onClick={() => router.push('/quiz/27')}
          className="w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-text-primary"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
      
      {/* Removed top title */}

      {/* Main Content */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="w-32 h-32 mb-4">
            <Image
              src="/logos/app_icon.png"
              alt="Beauty Mirror"
              width={128}
              height={128}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sign Up Card */}
          <div className="w-full max-w-sm bg-surface rounded-2xl p-6 space-y-6 border border-border-subtle/60 shadow-soft">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-text-primary">Create your account</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Don’t lose your progress — create an account to keep everything in sync.
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 3H3C2.45 3 2 3.45 2 4V14C2 14.55 2.45 15 3 15H15C15.55 15 16 14.55 16 14V4C16 3.45 15.55 3 15 3ZM15 5L9 9.5L3 5V4L9 8.5L15 4V5Z" fill="#969AB7"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-subtle/60 bg-surface text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 8H14V6C14 3.79 12.21 2 10 2S6 3.79 6 6V8H5C4.45 8 4 8.45 4 9V17C4 17.55 4.45 18 5 18H15C15.55 18 16 17.55 16 17V9C16 8.45 15.55 8 15 8ZM10 14C9.45 14 9 13.55 9 13S9.45 12 10 12S11 12.45 11 13S10.55 14 10 14ZM12 8H8V6C8 4.9 8.9 4 10 4S12 4.9 12 6V8Z" fill="#969AB7"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-border-subtle/60 bg-surface text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4C3 4 0.73 7.11 0.73 7.11S2.73 9.11 5.73 10.11C8.73 11.11 10 4 10 4Z" fill="#969AB7"/>
                    <path d="M10 4C17 4 19.27 7.11 19.27 7.11S17.27 9.11 14.27 10.11C11.27 11.11 10 4 10 4Z" fill="#969AB7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              onClick={handleSignUp}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-colors shadow-soft"
            >
              Sign Up
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-text-secondary text-sm">Already have an account? </span>
              <button className="text-primary text-sm font-medium hover:underline">
                Sign in
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-border-subtle/60"></div>
              <span className="text-text-secondary text-sm font-semibold">or</span>
              <div className="flex-1 h-px bg-border-subtle/60"></div>
            </div>

            {/* Social Sign Up Buttons (single neat column) */}
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => handleSocialSignUp('Google')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border-subtle/60 bg-surface hover:bg-surface-muted transition-colors"
              >
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EB4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="text-text-primary text-sm font-semibold">Continue with Google</span>
                <div className="w-5"></div>
              </button>

              {/* Apple */}
              <button
                onClick={() => handleSocialSignUp('Apple')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border-subtle/60 bg-surface hover:bg-surface-muted transition-colors"
              >
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#000000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <span className="text-text-primary text-sm font-semibold">Continue with Apple</span>
                <div className="w-5"></div>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialSignUp('Facebook')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border-subtle/60 bg-surface hover:bg-surface-muted transition-colors"
              >
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-text-primary text-sm font-semibold">Continue with Facebook</span>
                <div className="w-5"></div>
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleSocialSignUp('Twitter')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border-subtle/60 bg-surface hover:bg-surface-muted transition-colors"
              >
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#1DA1F2" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span className="text-text-primary text-sm font-semibold">Continue with Twitter</span>
                <div className="w-6"></div>
              </button>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-text-secondary leading-relaxed">
              By proceeding, you agree with the{' '}
              <a 
                href="https://beautymirror.app/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms of Use
              </a>
              {' '}and{' '}
              <a 
                href="https://beautymirror.app/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}