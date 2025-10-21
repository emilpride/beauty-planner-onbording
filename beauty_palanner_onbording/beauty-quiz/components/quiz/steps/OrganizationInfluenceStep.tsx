'use client'

import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const influences = [
  'Family',
  'Friends',
  'Work',
  'Social Media',
  'News',
  'Health',
  'Nothing', // special value that clears the rest
]

export default function OrganizationInfluenceStep() {
  const { answers, setAnswer } = useQuizStore()
  const hasSelection = Array.isArray(answers.Influence) ? answers.Influence.length > 0 : false

  const handleToggleInfluence = (influence: string) => {
    const current = Array.isArray(answers.Influence) ? answers.Influence : []
    // If user selects 'Nothing', make it the only selection
    if (influence === 'Nothing') {
      const next = current.includes('Nothing') ? [] : ['Nothing']
      setAnswer('Influence', next)
      return
    }
    // Otherwise remove 'Nothing' and toggle the chosen one
    const base = current.filter((i) => i !== 'Nothing')
    const next = base.includes(influence)
      ? base.filter((i) => i !== influence)
      : [...base, influence]
    setAnswer('Influence', next)
  }

  return (
    <OnboardingStep
      title="What influences your sense of organization and planning the most?"
      subtitle="Select all that apply."
      condition={hasSelection}
      onDisabledTap={() => {
        // light haptic-like feedback via brief class toggle could be added here in the future
        if (typeof window !== 'undefined') {
          const el = document.getElementById('influence-hint')
          if (el) {
            el.classList.remove('opacity-0')
            el.classList.add('opacity-100')
            setTimeout(() => {
              el.classList.remove('opacity-100')
              el.classList.add('opacity-0')
            }, 1800)
          }
        }
      }}
    >
      <div className="flex flex-wrap gap-2 py-1">
        {influences.map((influence) => (
          <button
            key={influence}
            onClick={() => handleToggleInfluence(influence)}
            className={`px-4 py-2 border-2 rounded-full text-center transition-all duration-200 font-medium ${
              (Array.isArray(answers.Influence) ? answers.Influence : []).includes(influence)
                ? 'border-primary bg-primary bg-opacity-10 text-primary'
                : 'border-border-subtle/60 bg-surface/80 hover:border-primary/40 text-text-secondary hover:text-text-primary'
            }`}
          >
            {influence}
          </button>
        ))}
      </div>
      {!hasSelection && (
        <div id="influence-hint" className="text-sm text-text-secondary mt-2 transition-opacity duration-300 opacity-0">
          Please select at least one option to continue.
        </div>
      )}
    </OnboardingStep>
  )
}


