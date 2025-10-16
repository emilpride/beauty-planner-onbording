import ClientOnly from './ClientOnly'

// Generate static params for all quiz steps and post-quiz screens
export async function generateStaticParams() {
  const steps = Array.from({ length: 33 }, (_, i) => i) // 0..32 inclusive
  return steps.map((step) => ({
    step: step.toString(),
  }))
}

interface QuizStepPageProps {
  params: Promise<{
    step: string
  }>
}

export default async function QuizStepPage({ params }: QuizStepPageProps) {
  const { step } = await params
  const stepNumber = parseInt(step)
  
  return <ClientOnly stepNumber={stepNumber} />
}
