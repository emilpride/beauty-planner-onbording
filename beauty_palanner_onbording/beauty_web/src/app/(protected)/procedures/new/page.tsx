"use client"

import { PageContainer } from '@/components/common/PageContainer'
import { Protected } from '@/components/auth/Protected'
// import { ActivityForm } from '@/components/procedures/ActivityForm'
import { InlineProcedurePicker } from '@/components/procedures/InlineProcedurePicker'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useSaveActivity } from '@/hooks/useActivities'
import { v4 as uuidv4 } from 'uuid'
import type { Activity } from '@/types/activity'
import Link from 'next/link'

export default function NewActivityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const save = useSaveActivity()

  async function onSubmitMany(list: Activity[]) {
    if (!user) return
    try {
      for (const a of list) {
        const withId: Activity = { ...a, id: a.id || uuidv4(), lastModifiedAt: new Date() }
        await save.mutateAsync({ userId: user.uid, activity: withId })
      }
      router.push('/procedures')
    } catch (e) {
      // Surface error to user
      const message = e instanceof Error ? e.message : 'Unknown error while saving procedures'
      alert(`Failed to save: ${message}`)
    }
  }

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[900px] mx-auto py-6">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/procedures"
              className="inline-flex items-center gap-2 text-accent hover:brightness-95 font-medium mb-4 transition"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M12 16L6 10L12 4" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Back to Procedures
            </Link>
            <h1 className="text-3xl font-bold text-text-primary">Add New Procedure</h1>
            <p className="text-text-secondary mt-2">
              Choose from our preset procedures or create your own custom routine
            </p>
          </div>

          {/* Inline Picker Card */}
          <div className="bg-surface border border-border-subtle rounded-2xl shadow-lg p-8">
            <InlineProcedurePicker onSubmit={onSubmitMany} saving={save.isPending} />
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
