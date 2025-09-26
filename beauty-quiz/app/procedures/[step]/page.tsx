import ProceduresFlow from '@/components/procedures/ProceduresFlow'

interface ProceduresPageProps {
  params: Promise<{
    step: string
  }>
}

export default async function ProceduresPage({ params }: ProceduresPageProps) {
  const { step: stepParam } = await params
  const step = parseInt(stepParam, 10)
  
  return <ProceduresFlow step={step} />
}
