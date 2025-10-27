"use client"

import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'

export function ProfileCard() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile(user?.uid)

  const displayName = profile?.name || user?.displayName || '—'
  const avatarUrl = profile?.profilePicture || user?.photoURL || ''
  const initial = (profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()
  const level = profile?.level ?? 1
  const activities = profile?.activitiesCount ?? 0

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="grid h-[90px] w-[90px] place-items-center overflow-hidden rounded-full ring-4 ring-white shadow-[0_0_0_4px_rgba(163,133,233,0.2)] dark:ring-gray-800">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={90}
                height={90}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#A385E9] to-[#E8B1EB] text-2xl font-bold text-white grid place-items-center">
                {initial}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-2 text-lg font-semibold text-text-primary">{displayName}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-surface-hover px-2 py-1 font-semibold text-[rgb(var(--accent))]">
              <span className="text-base">🏆</span> Level {level}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#E1FAED] px-2 py-1 font-semibold text-[#2BAE70]">
              <span className="text-base">⭐</span> {activities} Activities
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
