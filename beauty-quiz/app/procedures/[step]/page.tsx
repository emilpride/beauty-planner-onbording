import ProceduresFlow from '@/components/procedures/ProceduresFlow'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Suspense } from 'react'

interface ProceduresPageProps {
  params: Promise<{
    step: string
  }>
}

export async function generateStaticParams() {
  // Generate static params for all possible procedure steps
  return Array.from({ length: 10 }, (_, i) => ({
    step: (i + 1).toString(),
  }))
}

export default async function ProceduresPage({ params }: ProceduresPageProps) {
  const { step: stepParam } = await params
  const step = parseInt(stepParam, 10)
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ProceduresFlow step={step} />
        </Suspense>
      </div>
    </div>
  )
}
