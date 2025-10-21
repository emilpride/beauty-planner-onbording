'use client'

import dynamic from 'next/dynamic'

const QuizStepClient = dynamic(() => import('./QuizStepClient'), {
  ssr: false,
  // Optional: keep it minimal to avoid layout shifts until client mounts
  loading: () => null,
})

export default function ClientOnly({ stepNumber }: { stepNumber: number }) {
  return <QuizStepClient stepNumber={stepNumber} />
}
