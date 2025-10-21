import ProceduresFlow from '@/components/procedures/ProceduresFlow'
import AnimatedBackground from '@/components/AnimatedBackground'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Suspense } from 'react'

const SUPPORTED_STEPS = ['0', '1', '2', '3', '4', '5']

export const dynamicParams = false

export function generateStaticParams() {
  return SUPPORTED_STEPS.map((step) => ({ step }))
}

interface ProceduresPageProps {
  params: Promise<{
    step: string
  }>
}

export default async function ProceduresPage({ params }: ProceduresPageProps) {
  const { step: stepParam } = await params
  const step = Number(stepParam)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ProceduresFlow step={step} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}