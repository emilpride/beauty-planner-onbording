cd beauty_web; npm run dev"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Link from 'next/link'

export default function PreferencesPage() {
  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto space-y-3 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Preferences</h1>

          {/* App Appearance */}
          <Link
            href="/preferences/appearance"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 33.33C29.6024 33.33 33.33 29.6024 33.33 25C33.33 20.3976 29.6024 16.67 25 16.67C20.3976 16.67 16.67 20.3976 16.67 25C16.67 29.6024 20.3976 33.33 25 33.33Z"
                  stroke="#907FB1"
                  strokeWidth="0.167"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.17 25H12.5M37.5 25H45.83M25 4.17V12.5M25 37.5V45.83"
                  stroke="#907FB1"
                  strokeWidth="0.167"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              App Appearance
            </h3>

            <div className="w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="rotate-180">
                <path
                  d="M6.5 3L11.5 9L6.5 15"
                  stroke="#907FB1"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* Notifications */}
          <Link
            href="/preferences/notifications"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 10.42V14.58M33.75 16.67C33.75 12.48 30.19 9.17 25 9.17C19.81 9.17 16.25 12.48 16.25 16.67C16.25 22.71 13.75 24.79 11.67 27.08C10.83 28.02 10.42 29.38 11.25 30.83C12.08 32.29 13.54 33.33 15.42 33.33H34.58C36.46 33.33 37.92 32.29 38.75 30.83C39.58 29.38 39.17 28.02 38.33 27.08C36.25 24.79 33.75 22.71 33.75 16.67Z"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                />
                <path
                  d="M29.58 35.42C29.58 38.13 27.71 40.42 25 40.42C23.65 40.42 22.42 39.79 21.56 38.83C20.69 37.88 20.42 36.67 20.42 35.42"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeMiterlimit="10"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Notifications
            </h3>

            <div className="w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="rotate-180">
                <path
                  d="M6.5 3L11.5 9L6.5 15"
                  stroke="#907FB1"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* Language & Region */}
          <Link
            href="/preferences/language"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 43.75C35.3553 43.75 43.75 35.3553 43.75 25C43.75 14.6447 35.3553 6.25 25 6.25C14.6447 6.25 6.25 14.6447 6.25 25C6.25 35.3553 14.6447 43.75 25 43.75Z"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.67 8.33H18.75C16.04 17.5 16.04 26.67 18.75 35.42H16.67M31.25 8.33C33.96 17.5 33.96 26.67 31.25 35.42M8.33 33.33V31.25C17.5 33.96 26.67 33.96 35.42 31.25V33.33M8.33 18.75C17.5 16.04 26.67 16.04 35.42 18.75"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Language & Region
            </h3>

            <div className="w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="rotate-180">
                <path
                  d="M6.5 3L11.5 9L6.5 15"
                  stroke="#907FB1"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* Privacy */}
          <Link
            href="/preferences/privacy"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M20.83 22.92L23.44 25.54L29.17 19.79M25 4.17L12.5 10.42V18.75C12.5 28.75 18.75 38.13 25 41.67C31.25 38.13 37.5 28.75 37.5 18.75V10.42L25 4.17Z"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Privacy
            </h3>

            <div className="w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="rotate-180">
                <path
                  d="M6.5 3L11.5 9L6.5 15"
                  stroke="#907FB1"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* Data & Storage */}
          <Link
            href="/preferences/data-storage"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 6.25C14.58 6.25 6.25 10.83 6.25 16.67V33.33C6.25 39.17 14.58 43.75 25 43.75C35.42 43.75 43.75 39.17 43.75 33.33V16.67C43.75 10.83 35.42 6.25 25 6.25Z"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M43.75 25C43.75 30.83 35.42 35.42 25 35.42C14.58 35.42 6.25 30.83 6.25 25"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Data & Storage
            </h3>

            <div className="w-5 h-5">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="rotate-180">
                <path
                  d="M6.5 3L11.5 9L6.5 15"
                  stroke="#907FB1"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>
      </PageContainer>
    </Protected>
  )
}
