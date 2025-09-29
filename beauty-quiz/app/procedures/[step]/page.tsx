import ProceduresFlow from '@/components/procedures/ProceduresFlow'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Suspense } from 'react'

const SUPPORTED_STEPS = ['0', '1', '2', '3', '4', '5']

export const dynamicParams = false

export function generateStaticParams() {
  return SUPPORTED_STEPS.map((step) => ({ step }))
}

interface ProceduresPageProps {
  params: {
    step: string
  }
}

export default function ProceduresPage({ params }: ProceduresPageProps) {
  const step = Number(params.step)

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