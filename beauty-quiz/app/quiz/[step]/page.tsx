import QuizStepClient from './QuizStepClient'

// Generate static params for all quiz steps and post-quiz screens
export async function generateStaticParams() {
  const steps = Array.from({ length: 37 }, (_, i) => i)
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
  
  return <QuizStepClient stepNumber={stepNumber} />
}
