"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { MoodStat } from '@/components/dashboard/MoodStat'

export default function MoodsPage() {
  return (
    <Protected>
      <PageContainer>
        <div className="max-w-6xl mx-auto w-full">
          <MoodStat />
        </div>
      </PageContainer>
    </Protected>
  )
}
