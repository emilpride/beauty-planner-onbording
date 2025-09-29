'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [step])

  const StepComponent = procedureSteps[step]

  if (!StepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-[#5C4688] mb-4">Step {step}: Component not found</h1>
          <p className="text-gray-600">This procedure step is under construction.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white">
      <StepComponent />
    </div>
  )
}
