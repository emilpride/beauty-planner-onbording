'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useQuizStore } from '@/store/quizStore'

const getBeautyProfile = (skinType: string, skinProblems: string[], hairType: string, hairProblems: string[]) => {
  const skinScore = skinProblems?.length || 0
  const hairScore = hairProblems?.length || 0
  
  if (skinScore <= 1 && hairScore <= 1) {
    return {
      type: 'radiant',
      title: 'Natural Radiance',
      description: 'Your skin and hair are in great condition!',
      color: 'from-rose-400/60 to-pink-300/40',
      icon: '✨',
      score: 9,
      message: 'Your natural beauty shines through. We\'ll enhance what you already have with gentle, nourishing routines.',
      recommendations: ['Gentle cleansing', 'Hydration boost', 'Protection focus']
    }
  } else if (skinScore <= 2 && hairScore <= 2) {
    return {
      type: 'balanced',
      title: 'Balanced Beauty',
      description: 'Good foundation with room for enhancement.',
      color: 'from-purple-400/60 to-indigo-300/40',
      icon: '🌺',
      score: 7,
      message: 'You have a solid beauty foundation. We\'ll create targeted routines to address specific needs.',
      recommendations: ['Targeted treatments', 'Balance restoration', 'Prevention care']
    }
  } else {
    return {
      type: 'transformation',
      title: 'Beauty Transformation',
      description: 'Ready for a complete beauty journey.',
      color: 'from-amber-400/60 to-orange-300/40',
      icon: '🌟',
      score: 5,
      message: 'Every beauty journey starts somewhere. We\'ll create a comprehensive plan to transform your skin and hair.',
      recommendations: ['Deep treatments', 'Intensive care', 'Holistic approach']
    }
  }
}

export default function BeautyAnalysisStep() {
  const { answers } = useQuizStore()
  
  const beautyProfile = useMemo(() => 
    getBeautyProfile(
      answers.skinType, 
      answers.skinProblems || [], 
      answers.hairType, 
      answers.hairProblems || []
    ), 
    [answers.skinType, answers.skinProblems, answers.hairType, answers.hairProblems]
  )

  return (
    <OnboardingStep
      title="Beauty Analysis"
      subtitle={beautyProfile.title}
      buttonText="Continue"
      condition
    >
      <div className="space-y-6 text-left">
        {/* Main Beauty Card */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-surface/95 p-8 shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated Background */}
          <motion.div
            className={`absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br ${beautyProfile.color}`}
            animate={{ 
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`
              }}
            />
          ))}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  className="text-6xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {beautyProfile.icon}
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-2xl font-bold text-text-primary mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {beautyProfile.title}
                  </motion.h3>
                  <motion.p 
                    className="text-text-secondary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {beautyProfile.description}
                  </motion.p>
                </div>
              </div>
              
              {/* Beauty Score */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.6, type: "spring", stiffness: 200 }}
              >
                <div className="text-4xl font-bold text-primary mb-1">
                  {beautyProfile.score}/10
                </div>
                <div className="text-sm text-text-secondary">Beauty Score</div>
              </motion.div>
            </div>
            
            {/* Beauty Message */}
            <motion.p 
              className="text-center text-text-secondary leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {beautyProfile.message}
            </motion.p>
          </div>
        </motion.div>

        {/* Skin & Hair Analysis */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Skin Analysis */}
          <motion.div 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                🧴
              </motion.div>
              <div>
                <h4 className="text-lg font-semibold text-text-primary">Skin Profile</h4>
                <p className="text-sm text-text-secondary">{answers.skinType || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Areas of Focus</p>
              <div className="flex flex-wrap gap-2">
                {(answers.skinProblems || []).slice(0, 3).map((problem, index) => (
                  <motion.span
                    key={problem}
                    className="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 1.3 + (index * 0.1), 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {problem.replace(/_/g, ' ')}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Hair Analysis */}
          <motion.div 
            className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl"
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                💇‍♀️
              </motion.div>
              <div>
                <h4 className="text-lg font-semibold text-text-primary">Hair Profile</h4>
                <p className="text-sm text-text-secondary">{answers.hairType || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Areas of Focus</p>
              <div className="flex flex-wrap gap-2">
                {(answers.hairProblems || []).slice(0, 3).map((problem, index) => (
                  <motion.span
                    key={problem}
                    className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 1.4 + (index * 0.1), 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {problem.replace(/_/g, ' ')}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div 
          className="rounded-3xl border border-border-subtle/60 bg-surface/95 p-6 shadow-soft"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-text-primary mb-4 text-center">Your Beauty Strategy</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {beautyProfile.recommendations.map((rec, index) => (
              <motion.div
                key={rec}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + (index * 0.1), duration: 0.4 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
                <span className="text-sm font-medium text-text-primary">{rec}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  )
}

