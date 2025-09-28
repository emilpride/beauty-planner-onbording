'use client'

import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PricingStep() {
  const { currentStep, nextStep } = useQuizStore()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('6month')
  const [promoCode, setPromoCode] = useState('')

  const handleTryForFree = () => {
    // Simulate payment processing
    console.log('Processing payment for plan:', selectedPlan)
    
    // Update quiz store with selected plan
    const { setAnswer } = useQuizStore.getState()
    setAnswer('selectedPlan', selectedPlan)
    setAnswer('paymentCompleted', true)
    setAnswer('subscriptionPlan', selectedPlan)
    
    // Redirect to success page
    router.push('/success')
  }

  const handleApplyPromo = () => {
    // Handle promo code application
    console.log('Applying promo code:', promoCode)
  }

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      originalPrice: '$0.63/day',
      salePrice: '$0.49/day',
      popular: false,
      bgColor: 'bg-white'
    },
    {
      id: '6month',
      name: '6 month',
      originalPrice: '$0.45/day',
      salePrice: '$0.38/day',
      popular: true,
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'annual',
      name: 'Annual',
      originalPrice: '$0.38/day',
      salePrice: '$0.27/day',
      popular: false,
      bgColor: 'bg-white'
    }
  ]

  const features = [
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          </div>
        </div>
      ),
      title: 'Personal AI assistant'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Unlimited Activity tracking'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Smart routine planning and Reminders'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
      ),
      title: 'Advanced progress tracking and reports'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      ),
      title: 'AI Beauty Analysis'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Personalized calendar to manage treatments'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm4 0a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Achievements & Motivation'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Ad-free experience'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          </div>
        </div>
      ),
      title: 'Advanced mood stat options'
    },
    {
      icon: (
        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </div>
      ),
      title: 'Customization options (themes, notifications)'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div 
      className="w-full h-screen bg-gray-50 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 bg-white">
        <span className="text-black font-medium">9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-6 space-y-6">
          {/* Header */}
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-2xl font-bold text-[#5C4688]">Choose Your Plan</h1>
          </motion.div>

          {/* Pricing Plans */}
          <motion.div className="space-y-3" variants={itemVariants}>
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                className={`relative p-4 rounded-xl border-2 ${
                  selectedPlan === plan.id 
                    ? 'border-[#A385E9] bg-purple-50' 
                    : 'border-gray-200 bg-white'
                } ${plan.bgColor}`}
                onClick={() => setSelectedPlan(plan.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.popular && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-medium">
                    Most popular
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-[#5C4688]">{plan.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 line-through">{plan.originalPrice}</span>
                      <span className="text-lg font-bold text-[#A385E9]">{plan.salePrice}</span>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id 
                      ? 'border-[#A385E9] bg-[#A385E9]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-lg font-bold text-[#5C4688]">Here's What You'll Receive:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100"
                  variants={itemVariants}
                >
                  {feature.icon}
                  <span className="text-gray-800 font-medium">{feature.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
            <div className="bg-white p-4 rounded-lg text-center border border-gray-100">
              <div className="text-2xl font-bold text-[#A385E9]">4.9</div>
              <div className="text-sm text-gray-600">/5</div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">1k+ reviews</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg text-center border border-gray-100">
              <div className="text-2xl font-bold text-[#5C4688]">10k+</div>
              <div className="text-sm text-gray-600">users</div>
              <div className="flex justify-center mt-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full border-2 border-white"></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Special Offer */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="text-center">
              <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                Special Offer
              </span>
            </div>
            
            <motion.button 
              onClick={handleTryForFree}
              className="w-full bg-green-500 text-white py-4 rounded-xl text-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: ['0px 0px 0px rgba(34, 197, 94, 0)', '0px 0px 20px rgba(34, 197, 94, 0.7)', '0px 0px 0px rgba(34, 197, 94, 0)'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              Get Started
            </motion.button>
            
            <p className="text-center text-sm text-gray-600">
              Enjoy one week free, then $15/month after!
            </p>
          </motion.div>

          {/* Promo Code */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent"
              />
              <motion.button 
                onClick={handleApplyPromo}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
                whileHover={{ backgroundColor: '#d1d5db' }}
                whileTap={{ scale: 0.95 }}
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
