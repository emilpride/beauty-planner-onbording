"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'

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
            href={'/account/personal-info' as Route}
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <Image src="/custom-icons/profile/profile.svg" alt="Personal Info" width={40} height={40} className="object-contain icon-auto" />
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
            href={'/account/billing' as Route}
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <Image src="/custom-icons/misc/contract_star.svg" alt="Billing & Subscriptions" width={40} height={40} className="object-contain icon-auto" />
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
            href={'/account/security' as Route}
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <Image src="/custom-icons/profile/security.svg" alt="Account & Security" width={40} height={40} className="object-contain icon-auto" />
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
            href={'/account/help' as Route}
            className="bg-surface border border-border-subtle rounded-lg shadow-sm p-4 flex items-center gap-2 hover:bg-surface-hover transition"
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
              <Image src="/custom-icons/profile/support.svg" alt="Help & Support" width={40} height={40} className="object-contain icon-auto" />
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
