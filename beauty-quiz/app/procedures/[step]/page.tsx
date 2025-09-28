import ProceduresFlow from '@/components/procedures/ProceduresFlow'
import AnimatedBackground from '@/components/AnimatedBackground'

interface ProceduresPageProps {
  params: Promise<{
    step: string
  }>
}

export default async function ProceduresPage({ params }: ProceduresPageProps) {
  const { step: stepParam } = await params
  const step = parseInt(stepParam, 10)
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <ProceduresFlow step={step} />
      </div>
    </div>
  )
}
