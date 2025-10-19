"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { saveOnboardingSession } from '@/lib/firebase'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useQuizStore } from '@/store/quizStore'

// Initialize firebase client (safe to call multiple times)
const firebaseConfig = {
  apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
  authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
}
const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)
const clientAuth = getAuth(app)
const clientDb = getFirestore(app)

export default function SignUpStep() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { goToStep, currentStep, totalSteps } = useQuizStore()

  const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e)

  const handleSignUp = async () => {
    setError(null)
    if (!isValidEmail(email)) return setError('Please enter a valid email')
    if (password.length < 6) return setError('Password must be at least 6 characters')

    setLoading(true)
    try {
      const userCred = await createUserWithEmailAndPassword(clientAuth, email, password)
      const user = userCred.user

      // Save a minimal user object to Firestore so the rest of the app can use it
      try {
        await setDoc(doc(clientDb, 'users', user.uid), {
          Id: user.uid,
          Email: user.email || '',
          createdAt: serverTimestamp(),
        }, { merge: true })
      } catch (saveErr) {
        console.warn('Failed to save user to Firestore:', saveErr)
      }

  // After successful signup, take the user to Current Condition Analysis
  goToStep(32)
  router.push('/quiz/32')
    } catch (err: any) {
      console.error('Sign up error', err)
      setError(err?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignUp = async (providerName: string) => {
    setError(null)
    setLoading(true)
    try {
      if (providerName === 'Google') {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(clientAuth, provider)
        const user = result.user
        try {
          await setDoc(doc(clientDb, 'users', user.uid), {
            Id: user.uid,
            Email: user.email || '',
            createdAt: serverTimestamp(),
          }, { merge: true })
        } catch (saveErr) {
          console.warn('Failed to save social user to Firestore:', saveErr)
        }
  // After social signup, take the user to Current Condition Analysis
  goToStep(32)
  router.push('/quiz/32')
        return
      }

      // Placeholder for other providers
      console.warn('Provider not implemented yet:', providerName)
      setError(`${providerName} sign-in is not implemented yet`)
    } catch (err: any) {
      console.error('Social sign up error', err)
      setError(err?.message || `Failed to sign in with ${providerName}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      const sessionId = typeof window !== 'undefined' ? (localStorage.getItem('sessionId') || localStorage.getItem('onboardingSessionId') || 'anon') : 'anon'
      await saveOnboardingSession(sessionId as string, [
        { eventName: 'signupSkipped', timestamp: new Date().toISOString() }
      ])
    } catch (e) {
      console.warn('Failed to record skip event', e)
    } finally {
  // If user skips signup, go to Current Condition Analysis as well
  goToStep(32)
  router.push('/quiz/32')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Back Button */}
      <div className="sticky top-0 left-0 z-20 px-6 pt-6" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 16px, 16px)' }}>
        <button
          onClick={() => {
            const target = Math.max(0, Math.min(totalSteps - 1, currentStep))
            router.push(`/quiz/${target}`)
          }}
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
      
      {/* Main Content */}
      <div className="px-6 pt-4 pb-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 24px, 24px)' }}>
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
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold text-text-primary">Save your personalized beauty analysis</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Create your account to keep your results safe and synced across devices.
              </p>
              <ul className="mt-1 space-y-1 text-xs text-text-secondary">
                <li>• Access your AI analysis anytime</li>
                <li>• Get gentle daily reminders</li>
                <li>• Track your progress over time</li>
              </ul>
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
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-colors shadow-soft disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>

            {error && (
              <div className="text-center text-sm text-red-500">{error}</div>
            )}

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

              {/* Apple sign-up temporarily hidden */}

              {/* Facebook and Twitter temporarily hidden */}

              {/* Skip button (temporary) */}
              <button
                onClick={handleSkip}
                className="w-full bg-surface text-text-primary py-3 rounded-xl font-semibold text-sm hover:bg-surface-muted transition-colors border border-border-subtle/60"
              >
                Skip for now
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