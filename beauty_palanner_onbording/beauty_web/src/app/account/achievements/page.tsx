"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import Image from 'next/image'
import Link from 'next/link'

export default function AchievementsPage() {
  const unlockedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const totalLevels = 15

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[800px] mx-auto py-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link href="/account" className="text-[#907FB1] hover:text-[#5C4688]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-[#5C4688]">Achievements</h1>
          </div>

          {/* Current Level Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-5 mb-4">
              <div className="relative w-[90px] h-[90px] shrink-0">
                <Image
                  src="/icons/achievements/level_9.png"
                  alt="Level 9"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-[40px] font-bold leading-tight text-[#5C4688]">
                  Level 9
                </h2>
                <p className="text-lg font-semibold text-[#969AB7]">
                  You are a rising star! Keep going!
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#5C4688]">
                  Level Progress
                </span>
                <span className="text-sm font-semibold text-[#969AB7]">
                  {unlockedLevels.length}/{totalLevels}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#A385E9] to-[#8965D6] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(unlockedLevels.length / totalLevels) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* All Achievements Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#5C4688]">
                All Levels ({unlockedLevels.length}/{totalLevels})
              </h3>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: totalLevels }, (_, i) => i + 1).map((level) => {
                const isUnlocked = unlockedLevels.includes(level)
                const iconPath = isUnlocked
                  ? `/icons/achievements/level_${level}.png`
                  : '/icons/achievements/level_locked.png'

                return (
                  <div
                    key={level}
                    className="relative group"
                  >
                    <div
                      className={`
                        relative aspect-square rounded-lg overflow-hidden
                        ${isUnlocked 
                          ? 'ring-2 ring-[#A385E9] ring-opacity-50' 
                          : 'opacity-40 grayscale'
                        }
                        transition-all duration-200 hover:scale-105
                      `}
                    >
                      <Image
                        src={iconPath}
                        alt={`Level ${level}`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Level {level} {isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>

                    {/* Level Number */}
                    <div className="text-center mt-2">
                      <span className={`text-sm font-semibold ${isUnlocked ? 'text-[#5C4688]' : 'text-gray-400'}`}>
                        Level {level}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Achievement Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#5C4688]">{unlockedLevels.length}</div>
                <div className="text-sm font-semibold text-[#969AB7] mt-1">Unlocked</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#5C4688]">{totalLevels - unlockedLevels.length}</div>
                <div className="text-sm font-semibold text-[#969AB7] mt-1">Remaining</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#5C4688]">
                  {Math.round((unlockedLevels.length / totalLevels) * 100)}%
                </div>
                <div className="text-sm font-semibold text-[#969AB7] mt-1">Complete</div>
              </div>
            </div>

            {/* Next Achievement */}
            {unlockedLevels.length < totalLevels && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-[#A385E9] border-opacity-30">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <Image
                      src="/icons/achievements/level_locked.png"
                      alt="Next Level"
                      fill
                      className="object-contain opacity-60"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-[#5C4688]">
                      Next: Level {unlockedLevels.length + 1}
                    </h4>
                    <p className="text-sm text-[#969AB7]">
                      Complete more activities to unlock the next level!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
