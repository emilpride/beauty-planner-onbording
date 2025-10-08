'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import AnimatedBackground from '@/components/AnimatedBackground'

const ASSISTANT_ABILITIES = {
  1: [
    {
      icon: '/icons/misc/analysis.svg',
      title: 'Motivational Boost',
      desc: 'Keeps you on track and celebrates your progress.'
    },
    {
      icon: '/icons/misc/ai.svg',
      title: 'Science Guru',
      desc: 'Delivers recommendations based on the latest research.'
    },
    {
      icon: '/icons/misc/goal_img_1.png',
      title: 'Structured Approach',
      desc: 'Helps you build healthy routines step by step.'
    }
  ],
  2: [
    {
      icon: '/icons/misc/assistant.png',
      title: 'Empathy Engine',
      desc: 'Understands your mood and supports your well-being.'
    },
    {
      icon: '/icons/misc/goal_img_2.png',
      title: 'Personal Touch',
      desc: 'Gives advice tailored to your unique needs.'
    },
    {
      icon: '/icons/misc/goal_img_3.png',
      title: 'Positive Vibes',
      desc: 'Keeps you inspired and motivated every day.'
    }
  ]
}

export default function AssistantSelectionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<1 | 2 | null>(null)
  const { hydrate, setAnswer } = useQuizStore()

  const animationStyles = `
    @keyframes moderate-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.75;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
    }
    .animate-moderate-pulse {
      animation: moderate-pulse 2.5s infinite ease-in-out;
    }
      @keyframes aura {
        0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); }
        70% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
      }
      .ability-dot {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        flex: 0 0 auto;
        transform: scale(1.4);
        position: relative;
      }
      .ability-dot::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: inherit;
        animation: aura 1.8s ease-out infinite;
      }
    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .shine:before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
      transform: translateX(-100%);
      animation: shine 1.6s linear infinite;
      border-radius: inherit;
      pointer-events: none;
    }
  `
  const dotGradient = selectedAssistant === 2
    ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' // Ellie (pink -> red)
    : 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)' // Max (indigo -> cyan)
  const dotAura = selectedAssistant === 2
    ? 'rgba(236,72,153,0.35)'
    : 'rgba(99,102,241,0.35)'

  useEffect(() => {
    hydrate()
    setIsHydrated(true)
  }, [hydrate])

  const startQuiz = () => {
    if (selectedAssistant === null) return;
    setIsLoading(true)
    setAnswer('assistant', selectedAssistant)
    // Auto-assign gender based on assistant selection (1=Max -> male, 2=Ellie -> female, 3=Dave -> male)
    setAnswer('gender', selectedAssistant === 2 ? 2 : 1)
    router.push('/assistant-welcome')
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
  <div className="max-w-md w-full text-center rounded-3xl border border-border-subtle/70 bg-surface/90 p-8 shadow-elevated backdrop-blur relative z-10 -translate-y-[10vh] sm:-translate-y-[5vh] md:-translate-y-[1vh]">
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.push('/welcome')}
              className="glass-button w-10 h-10 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">Choose your AI Assistant</h1>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Your AI assistant learns your needs and guides you with expert, science-backed recommendations—personalized just for you.
          </p>


          <div className="flex justify-center space-x-6 mb-8">
            <div
              onClick={() => setSelectedAssistant(1)}
              className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 1 ? 'transform scale-105' : 'opacity-50 hover:scale-102'}`}
            >
              <div className="w-32 h-32 relative flex items-center justify-center">
                {selectedAssistant === 1 && (
                  <div className="absolute inset-0 bg-primary rounded-full blur-2xl animate-moderate-pulse"></div>
                )}
                <div className={`w-full h-full rounded-full p-1 transition-colors duration-300 relative ${selectedAssistant === 1 ? 'bg-primary/30' : 'bg-gray-200 dark:bg-surface-muted/60'}`}>
                  <Image src="/images/content/choose_assistant_max.png" alt="Max" width={128} height={128} className="rounded-full" style={{ filter: selectedAssistant === 1 ? 'none' : 'grayscale(60%)' }} />
                </div>
              </div>
              <p className="text-lg font-semibold text-text-primary mt-8">Max</p>
            </div>

            <div
              onClick={() => setSelectedAssistant(2)}
              className={`cursor-pointer transition-all duration-300 ${selectedAssistant === 2 ? 'transform scale-105' : 'opacity-50 hover:scale-102'}`}
            >
              <div className="w-32 h-32 relative flex items-center justify-center">
                {selectedAssistant === 2 && (
                  <div className="absolute inset-0 bg-[#EC4899] rounded-full blur-2xl animate-moderate-pulse"></div>
                )}
                <div className={`w-full h-full rounded-full p-1 transition-colors duration-300 relative ${selectedAssistant === 2 ? 'bg-[#EC4899]/30' : 'bg-gray-200 dark:bg-surface-muted/60'}`}>
                  <Image src="/images/content/choose_assistant_ellie.png" alt="Ellie" width={128} height={128} className="rounded-full" style={{ filter: selectedAssistant === 2 ? 'none' : 'grayscale(60%)' }} />
                </div>
              </div>
              <p className="text-lg font-semibold text-text-primary mt-8">Ellie</p>
            </div>
          </div>
          {/* Abilities block (compact, stylish, animated) */}
          <AnimatePresence mode="wait">
            {selectedAssistant && (
              <motion.div
                key={selectedAssistant}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mb-5"
              >
                <div className="mb-2 text-[11px] tracking-wide uppercase text-text-secondary/80">Abilities</div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 1 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                  }}
                  className="flex flex-wrap justify-center items-center gap-2"
                >
                  {ASSISTANT_ABILITIES[selectedAssistant].map((ability, idx) => (
                    <motion.div
                      variants={{ hidden: { opacity: 0, scale: 0.95, y: 6 }, visible: { opacity: 1, scale: 1, y: 0 } }}
                      key={idx}
                      className="group relative shine overflow-hidden flex items-center gap-2 rounded-full border border-border-subtle/60 bg-surface/70 backdrop-blur px-2.5 py-1 text-[11px] leading-tight shadow-soft hover:border-primary/50 transition-colors"
                    >
                        <div
                          className="ability-dot"
                          style={{ background: dotGradient, boxShadow: `0 0 0 0 ${dotAura}` }}
                        />
                      <span className="font-medium text-text-primary/90">{ability.title}</span>
                      <span className="hidden sm:inline text-text-secondary/90">· {ability.desc}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={startQuiz}
            disabled={isLoading || selectedAssistant === null}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  )
}
