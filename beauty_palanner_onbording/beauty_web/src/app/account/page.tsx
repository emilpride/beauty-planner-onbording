"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Image from 'next/image'
import Link from 'next/link'

export default function AccountPage() {
  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto space-y-3 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Account</h1>

          {/* Level Card */}
          <Link
            href="/account/achievements"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-3 flex items-center gap-4 hover:bg-surface-hover transition"
          >
            {/* Achievement Badge */}
            <div className="relative w-[50px] h-[50px] shrink-0">
              <Image
                src="/icons/achievements/level_9.png"
                alt="Level 9"
                fill
                className="object-contain"
              />
            </div>

            {/* Level Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight text-text-primary">
                Level 9
              </h2>
              <p className="text-xs font-semibold text-text-secondary">
                You are a rising star! Keep going!
              </p>
            </div>

            {/* Arrow */}
            <div className="w-5 h-5 shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="rotate-180"
              >
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

          {/* Personal Info */}
          <Link
            href="/account/personal-info"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 8.33C19.94 8.33 15.83 12.44 15.83 17.5C15.83 22.48 19.73 26.52 24.73 26.65C24.9 26.63 25.08 26.63 25.23 26.65C25.27 26.65 25.29 26.65 25.33 26.65C25.35 26.65 25.35 26.65 25.37 26.65C30.27 26.52 34.17 22.48 34.17 17.5C34.17 12.44 30.06 8.33 25 8.33Z"
                  stroke="#907FB1"
                  strokeWidth="0.375"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M34.8 30C29.42 26.52 20.62 26.52 15.2 30C12.77 31.56 11.46 33.69 11.46 35.96C11.46 38.23 12.77 40.35 15.19 41.9C17.9 43.65 21.45 44.52 25 44.52C28.55 44.52 32.1 43.65 34.81 41.9C37.23 40.33 38.54 38.21 38.54 35.94C38.52 33.67 37.23 31.56 34.8 30Z"
                  stroke="#907FB1"
                  strokeWidth="0.375"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Personal Info
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

          {/* Billing & Subscriptions */}
          <Link
            href="/account/billing"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M18.75 35.42L25 31.25L31.23 35.42L29.38 28.13L35 22.92L27.58 22.19L25 15.21L22.42 22.17L15 22.92L20.63 28.13L18.75 35.42Z"
                  stroke="#907FB1"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Billing & Subscriptions
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

          {/* Account & Security */}
          <Link
            href="/account/security"
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
              Account & Security
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

          {/* Help & Support */}
          <Link
            href="/account/help"
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M17.71 37.5H15.63C9.38 37.5 6.25 35.42 6.25 28.13V17.71C6.25 10.42 9.38 8.33 15.63 8.33H34.38C40.63 8.33 43.75 10.42 43.75 17.71V28.13C43.75 35.42 40.63 37.5 34.38 37.5H32.29C31.9 37.5 31.52 37.69 31.25 38L28.13 41.67C26.67 43.44 24.33 43.44 22.88 41.67L19.75 38C19.52 37.73 19.02 37.5 18.75 37.5Z"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25 23.96V23.75C25 22.29 25.98 21.46 26.96 20.79C27.92 20.15 28.88 19.35 28.88 17.92C28.88 16.04 27.38 14.54 25.5 14.54C23.63 14.54 22.13 16.04 22.13 17.92M24.99 29.17H25.01"
                  stroke="#907FB1"
                  strokeWidth="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-text-primary flex-1">
              Help & Support
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
