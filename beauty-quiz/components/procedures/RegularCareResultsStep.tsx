'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function RegularCareResultsStep() {
  const router = useRouter()

  const handlePricePlans = () => {
    router.push('/payment')
  }

  // Mock data for independent version
  const mockAnswers = {
    gender: 1, // female by default
    name: 'Test User'
  }

  // Get BMI images based on user's gender
  const getBMIImages = () => {
    const isFemale = mockAnswers.gender === 1 // 1 = female, 0 = male
    const prefix = isFemale ? 'bmi_female' : 'bmi_male'
    
    return {
      current: `/images/on_boarding_images/${prefix}_1.png`, // User's current result
      target: `/images/on_boarding_images/${prefix}_3.png`   // Target goal
    }
  }

  const bmiImages = getBMIImages()

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Start using the app:",
      description: "Get personalized routines for skin, hair, fitness & self-care."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      title: "Stay consistent with your routine:",
      description: "Automatic reminders help you build healthy habits."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Complete daily self-care rituals:",
      description: "Follow your plan to nurture beauty & well-being."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Unlock achievements & stay motivated:",
      description: "Reach new milestones as you stick to your routine."
    }
  ]

  const struggles = [
    "Struggle to stay consistent with self-care",
    "Forget important skincare, haircare, or wellness steps",
    "No clear way to track your beauty habits"
  ];

  const solutions = [
    "Follow a structured beauty & wellness routine effortlessly",
    "Get reminders to keep up with your personalized plan",
    "See your completed routines and progress over time",
    "Unlock achievements and stay inspired"
  ];

  const benefitsRef = useRef(null);
  const strugglesRef = useRef(null);
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.3 });
  const strugglesInView = useInView(strugglesRef, { once: true, amount: 0.3 });

  const pathLength = useMotionValue(0);
  const withoutAppX = useTransform(pathLength, [0, 1], [65, 315]);
  const withoutAppY = useTransform(pathLength, [0, 1], [200, 170]);
  const withAppX = useTransform(pathLength, [0, 1], [65, 315]);
  const withAppY = useTransform(pathLength, [0, 1], [200, 80]);

  useEffect(() => {
    const animation = animate(pathLength, 1, {
      duration: 2,
      ease: "easeInOut",
      delay: 0.5
    });
    return animation.stop;
  }, [pathLength]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  const testimonials = [
    { name: 'Emily', image: '/images/reviews/review_1.png', text: 'This service is a real find! Thanks for the accuracy and professionalism!' },
    { name: 'Aisha', image: '/images/reviews/review_2.png', text: 'I\'m stoked! The results have been a source of inspiration.' },
    { name: 'Mira', image: '/images/reviews/review_3.png', text: 'I\'m more beautiful than the average in my country!' },
    { name: 'Lisa', image: '/images/reviews/review_1.png', text: 'The planning feature is amazing! My routine is perfectly organized now.' },
    { name: 'Sofia', image: '/images/reviews/review_1.png', text: 'Finally found the perfect beauty routine planner! It\'s so easy to follow.' },
    { name: 'Anna', image: '/images/reviews/review_1.png', text: 'My beauty routine has never been this organized! Love the planning tools.' },
  ];

  return (
    <motion.div
      className="w-full h-screen bg-surface flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-md mx-auto p-6 space-y-6">
          {/* Header */}
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-text-primary mb-3">Regular Care = Better Results!</h1>
            <p className="text-text-secondary">
              On average, our users improve their well-being by 30% within the first month!
            </p>
          </motion.div>

          {/* Progress Graph */}
        <motion.div
            className="flex flex-col justify-center items-start p-4"
            style={{
              width: '350px',
              background: '#F7F6FF',
              borderRadius: '10.77px',
            }}
            variants={itemVariants}
          >
            <svg viewBox="0 0 350 270" className="w-full h-full">
                <defs>
                <linearGradient id="withAppGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#84DE54" />
                    <stop offset="100%" stopColor="#2AEA5C" />
                  </linearGradient>
                <linearGradient id="withoutAppGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFA64D" />
                  <stop offset="100%" stopColor="#FE6C6C" />
                </linearGradient>
                <linearGradient id="verticalBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="1.04%" stopColor="rgba(111, 221, 141, 0)" />
                  <stop offset="28.13%" stopColor="#2BAE70" />
                  <stop offset="66.67%" stopColor="#FE464B" />
                  <stop offset="98.44%" stopColor="rgba(254, 108, 108, 0)" />
                  </linearGradient>
                </defs>

              {/* Vertical Bar */}
              <motion.rect 
                x="260" y="40" width="70" height="190" 
                fill="url(#verticalBarGradient)" 
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.25, scaleY: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />

              {/* Axis Line */}
              <line x1="20" y1="230" x2="330" y2="230" stroke="#B3D2E8" strokeWidth="2" />
              <circle cx="35" cy="230" r="5" fill="#7798C3" />
              <circle cx="315" cy="230" r="5" fill="#7798C3" />
              <text x="35" y="250" textAnchor="middle" fill="#69798E" fontWeight="600" fontSize="16">Today</text>
              <text x="315" y="250" textAnchor="middle" fill="#69798E" fontWeight="600" fontSize="16">30 Days</text>

              {/* Graph Lines */}
              <motion.path 
                d="M 65 200 C 150 220, 200 200, 315 170" 
                stroke="url(#withoutAppGradient)" strokeWidth="3" fill="none" 
                style={{ pathLength }}
              />
              <motion.path 
                d="M 65 200 C 150 220, 200 100, 315 80" 
                stroke="url(#withAppGradient)" strokeWidth="3" fill="none" 
                style={{ pathLength }}
              />

              {/* Line Labels */}
              <text x="190" y="195" textAnchor="middle" fill="#333333" fontWeight="500" fontSize="15">Without app</text>
              <text x="190" y="60" textAnchor="middle" fill="#476B9A" fontWeight="700" fontSize="17">With app</text>

              {/* Score Circles */}
              <motion.g 
                style={{ x: withoutAppX, y: withoutAppY }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <circle r="34" fill="#F0D1C8" />
                <circle r="30" fill="none" stroke="#84DE54" strokeWidth="6" strokeDasharray="113 188.4" transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#3C7C1A">
                  6<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </motion.g>

              <motion.g 
                style={{ x: withAppX, y: withAppY }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <circle r="34" fill="#F9FAFF" />
                <circle r="30" fill="none" stroke="#2AEA5C" strokeWidth="6" strokeDasharray="150.7 188.4" transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#187348">
                  8<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </motion.g>

              {/* Static 5/10 circle at the start */}
              <g transform="translate(65, 200)">
                <circle r="34" fill="#FFF2E5" />
                <circle r="30" fill="none" stroke="#FFA64D" strokeWidth="6" strokeDasharray="94.2 188.4" transform="rotate(-90 0 0)" />
                <text textAnchor="middle" y="10" fontWeight="700" fontSize="32" fill="#DA7C1D">
                  5<tspan fontSize="16" dy="-12" dx="2">/10</tspan>
                </text>
              </g>

              {/* Triangles */}
              <motion.text 
                x="315" y="115" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 0,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              <motion.text 
                x="315" y="130" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 0.5,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              <motion.text 
                x="315" y="145" textAnchor="middle" fill="white" fontSize="12"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: 1,
                  ease: "easeInOut"
                }}
              >▲</motion.text>
              </svg>
          </motion.div>

          {/* Before/After Images */}
          <motion.div 
            className="rounded-xl p-4 -mt-8" style={{ backgroundColor: '#F7F6FF' }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-0">
              {/* User's Current Result */}
              <motion.div
                className="text-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="relative w-40 h-56 mx-auto">
                  <Image
                    src={bmiImages.current}
                    alt="User's current BMI result"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="text-sm text-text-secondary font-medium mt-2">Your Current</div>
              </motion.div>
              
              {/* Arrow */}
              <motion.div
                className="flex items-center justify-center self-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <div
                  style={{
                    width: '124.33px',
                    height: '124.33px',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/images/content/improvement_arrow.png"
                    alt="Improvement arrow"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </motion.div>

              {/* Target Goal */}
              <motion.div
                className="text-center"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="relative w-40 h-56 mx-auto">
                  <Image
                    src={bmiImages.target}
                    alt="Target goal BMI"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="text-sm text-text-secondary font-medium mt-2">Target Goal</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Motivational Text */}
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-gray-800 text-lg">
              The more consistently you follow your routine, the better your beauty level becomes. See the difference for yourself!
            </p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div 
            className="space-y-4" 
            ref={benefitsRef}
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
              hidden: {}
            }}
          >
            <h3 className="text-xl font-bold text-center text-text-primary">Noticeable Improvements In One Month:</h3>
            {benefits.map((benefit, index) => (
              <motion.div key={index} className="flex items-center space-x-4 bg-surface p-4 rounded-lg shadow-sm" variants={itemVariants}>
                <div className="flex-shrink-0 w-10 h-10 bg-[#A385E9] rounded-full flex items-center justify-center text-white">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{benefit.title}</h4>
                  <p className="text-sm text-text-secondary">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
          </motion.div>

          {/* Struggles vs Solutions */}
          <motion.div 
            className="bg-surface-muted/80 rounded-xl p-6" 
            ref={strugglesRef}
            initial={{ opacity: 0, y: 50 }}
            animate={strugglesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Struggles Column */}
              <motion.div 
                className="space-y-4"
                initial={{ x: -50, opacity: 0 }}
                animate={strugglesInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h4 className="font-bold text-center text-gray-800">Your Struggles</h4>
                {struggles.map((struggle, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-text-secondary">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </div>
                    <span className="text-text-primary">{struggle}</span>
                  </div>
                ))}
              </motion.div>
              {/* Solutions Column */}
              <motion.div 
                className="space-y-4"
                initial={{ x: 50, opacity: 0 }}
                animate={strugglesInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h4 className="font-bold text-center text-gray-800">Our Solutions</h4>
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-5 h-5 bg-[#A385E9] rounded-full flex items-center justify-center text-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-text-primary">{solution}</span>
            </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div className="w-full overflow-hidden relative" variants={itemVariants}>
            <div 
              className="flex flex-row items-start gap-2.5"
              style={{
                width: 'max-content',
                animation: 'scroll-left 40s linear infinite'
              }}
            >
              {testimonials.map((review, index) => (
                 <div 
                  key={index}
                  className="flex flex-col items-start p-2 gap-2 bg-surface flex-none"
                  style={{
                    width: '141px',
                    height: '298px',
                    boxShadow: '0.764602px 1.5292px 11.469px rgba(88, 66, 124, 0.1)',
                    borderRadius: '13.5929px'
                  }}
                >
                  <Image
                    src={review.image}
                    alt={`User review ${review.name}`}
                    width={125}
                    height={125}
                    className="w-full h-auto object-cover flex-none"
                    style={{ borderRadius: '7px' }}
                  />
                  <div className="flex flex-row items-center gap-1 flex-none">
                    <span className="font-bold text-sm" style={{ color: '#5C4688' }}>
                      {review.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
                      <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                    </div>
                  </div>
                  <div className="flex-none self-stretch" style={{ height: '0px', border: '1px solid rgba(234, 234, 234, 0.92)' }}/>
                  <div className="flex flex-row items-center gap-2 flex-none">
                    <div className="flex flex-row items-start flex-none">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                          <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/>
                          </svg>
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: '#969AB7' }}>5.0 rating</span>
                  </div>
                  <p className="flex-none self-stretch text-sm" style={{ fontWeight: '500', color: '#333333' }}>
                    {review.text}
                  </p>
                </div>
              ))}
              {/* Duplicate cards for infinite scroll effect */}
              {testimonials.map((review, index) => (
                 <div 
                  key={`duplicate-${index}`}
                  className="flex flex-col items-start p-2 gap-2 bg-surface flex-none"
                  style={{
                    width: '141px',
                    height: '298px',
                    boxShadow: '0.764602px 1.5292px 11.469px rgba(88, 66, 124, 0.1)',
                    borderRadius: '13.5929px'
                  }}
                >
                  <Image
                    src={review.image}
                    alt={`User review ${review.name}`}
                    width={125}
                    height={125}
                    className="w-full h-auto object-cover flex-none"
                    style={{ borderRadius: '7px' }}
                  />
                  <div className="flex flex-row items-center gap-1 flex-none">
                    <span className="font-bold text-sm" style={{ color: '#5C4688' }}>
                      {review.name}
                        </span>
                    <div className="flex items-center gap-1">
                      <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                    </div>
                  </div>
                  <div className="flex-none self-stretch" style={{ height: '0px', border: '1px solid rgba(234, 234, 234, 0.92)' }}/>
                  <div className="flex flex-row items-center gap-2 flex-none">
                    <div className="flex flex-row items-start flex-none">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                          <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/>
                          </svg>
                        ))}
                    </div>
                    <span className="text-xs" style={{ color: '#969AB7' }}>5.0 rating</span>
                  </div>
                  <p className="flex-none self-stretch text-sm" style={{ fontWeight: '500', color: '#333333' }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
        </div>

      {/* Fixed Bottom Button */}
      <motion.div 
        className="bg-surface p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-center"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
      >
          <motion.button
            onClick={handlePricePlans}
          className="w-full max-w-md bg-[#A385E9] text-white py-3.5 rounded-xl text-lg font-semibold"
          whileHover={{ scale: 1.05, backgroundColor: '#906fe2' }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: ['0px 0px 0px rgba(163, 133, 233, 0)', '0px 0px 20px rgba(163, 133, 233, 0.7)', '0px 0px 0px rgba(163, 133, 233, 0)'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
          >
            Price Plans
          </motion.button>
        </motion.div>
    </motion.div>
  )
}
