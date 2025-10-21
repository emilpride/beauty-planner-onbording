'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'

// Import all procedure steps
import ChooseProceduresStep from './ChooseProceduresStep'
import ProcedureSetupStep from './ProcedureSetupStep'
import GeneratingScheduleStep from './GeneratingScheduleStep'
import NotificationsConsentStep from './NotificationsConsentStep'
import ContractAgreementStep from './ContractAgreementStep'
import RegularCareResultsStep from './RegularCareResultsStep'

interface ProceduresFlowProps {
  step: number
}

const procedureSteps: { [key: number]: React.ComponentType } = {
  0: ChooseProceduresStep,
  1: ProcedureSetupStep,
  2: GeneratingScheduleStep,
  3: NotificationsConsentStep,
  4: ContractAgreementStep,
  5: RegularCareResultsStep,         // Regular Care = Better Results!
}

export default function ProceduresFlow({ step }: ProceduresFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isReady, setIsReady] = useState(false)
  const { saveUiSnapshot, getUiSnapshot } = useQuizStore()

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [step])

  // Restore scroll position for this step
  useEffect(() => {
    const key = `procedures-${step}`
    const snap = getUiSnapshot(key)
    if (snap && typeof snap.scrollY === 'number') {
      requestAnimationFrame(() => window.scrollTo(0, snap.scrollY))
    }
    const onBeforeUnload = () => {
      saveUiSnapshot(key, { scrollY: window.scrollY })
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      saveUiSnapshot(key, { scrollY: window.scrollY })
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [step, getUiSnapshot, saveUiSnapshot])

  const StepComponent = procedureSteps[step]

  if (!StepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-primaryenter p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Step {step}: Component not found</h1>
          <p className="text-text-secondary">This procedure step is under construction.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-background">
      <StepComponent />
    </div>
  )
}
