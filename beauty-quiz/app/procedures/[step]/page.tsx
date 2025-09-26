import ProceduresFlow from '@/components/procedures/ProceduresFlow'

interface ProceduresPageProps {
  params: {
    step: string
  }
}

export default function ProceduresPage({ params }: ProceduresPageProps) {
  const step = parseInt(params.step, 10)
  
  return <ProceduresFlow step={step} />
}
