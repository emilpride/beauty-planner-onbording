'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'
import { motion, useInView, useMotionValue, useTransform, animate, useScroll } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function ChoosePlanStep() {
  const { currentStep, nextStep, answers } = useQuizStore()
  const router = useRouter()

  const handlePricePlans = () => {
    router.push('/payment')
  }

  // Get BMI images based on user's gender
  const getBMIImages = () => {
    const isFemale = answers.gender === 1 // 1 = female, 0 = male
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
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Start using the app:",
      description: "Get personalized routines for skin, hair, fitness & self-care."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      title: "Stay consistent with your routine:",
      description: "Automatic reminders help you build healthy habits."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Complete daily self-care rituals:",
      description: "Follow your plan to nurture beauty & well-being."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-current" fill="currentColor" viewBox="0 0 24 24">
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
  const testimonialsRef = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.3 });
  const strugglesInView = useInView(strugglesRef, { once: true, amount: 0.3 });
  
  // Remove old horizontal progress bar logic and implement vertical timeline progress
  // const { scrollYProgress } = useScroll({ target: benefitsRef, offset: ["start end", "end start"] });
  // const progressWidth = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: timelineProgress } = useScroll({ container: scrollContainerRef, target: timelineRef, offset: ["start 0.85", "end 0.15"] });
  const progressHeight = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);

  // Testimonials drag
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);

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
    { name: 'Aisha', image: '/images/reviews/review_2.png', text: "I'm stoked! The results have been a source of inspiration." },
    { name: 'Mira', image: '/images/reviews/review_3.png', text: 'The plan keeps me consistent—real results.' },
    { name: 'Lisa', image: '/images/reviews/review_1.png', text: 'The planning feature is amazing! My routine is perfectly organized now.' },
    { name: 'Sofia', image: '/images/reviews/review_1.png', text: "Finally found the perfect beauty routine planner! It's so easy to follow." },
    { name: 'Anna', image: '/images/reviews/review_1.png', text: 'My beauty routine has never been this organized! Love the planning tools.' },
    // New short American English reviews
    { name: 'Chloe', image: '/images/reviews/review_4.png', text: 'Planning made it click—quick wins and real results.' },
    { name: 'Jasmine', image: '/images/reviews/review_5.png', text: 'So easy to stick with—my routine finally feels effortless.' },
    { name: 'Noah', image: '/images/reviews/review_6_man.png', text: 'Clean UI, smart reminders—results showed up fast.' },
    { name: 'Evelyn', image: '/images/reviews/review_6_old_woman.png', text: 'Simple plan, big payoff. Loving the glow-up.' },
  ];

  // Timeline item component to animate icon when in view
  const TimelineItem = ({ title, description, icon, index, rootRef }: { title: string; description: string; icon: React.ReactNode; index: number; rootRef: React.RefObject<HTMLDivElement | null> }) => {
    const itemRef = useRef<HTMLLIElement | null>(null);
    // Use the actual scroll container as the IntersectionObserver root for stability; fire once to avoid flicker
    const itemInView = useInView(itemRef, { root: rootRef.current ?? undefined, amount: 0.25, margin: '-10% 0% -10% 0%', once: true });

    return (
      <li ref={itemRef} className="relative grid grid-cols-[36px_1fr] gap-3">
        <div className="relative">
          {/* Burst effect */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ filter: 'blur(2px)' }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={itemInView ? { opacity: [0.25, 0], scale: [0.6, 1.8] } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Icon wrapper */}
          <motion.div
            className="mt-0 flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white/40 shadow-soft"
            initial={false}
            animate={itemInView
              ? { backgroundColor: 'rgb(var(--color-primary))', color: '#fff', scale: [1, 1.22, 0.96, 1] }
              : { backgroundColor: 'rgba(var(--color-primary),0.08)', color: 'rgb(var(--color-primary))', opacity: 0.6 }}
            transition={{ duration: 0.55, times: [0, 0.35, 0.7, 1], ease: 'easeOut' }}
          >
            {icon}
          </motion.div>
        </div>
         {/* Text is always rendered; apply a light fade-only effect to avoid big chunks popping late */}
         <motion.div
           initial={false}
           animate={{ opacity: itemInView ? 1 : 1 }}
           className="pt-0.5"
         >
           <h4 className="font-semibold text-text-primary text-sm">{title}</h4>
           <p className="text-xs text-text-secondary">{description}</p>
         </motion.div>
       </li>
    );
  };

  return (
    <motion.div 
      className="w-full h-[100dvh] bg-surface flex flex-col overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="max-w-md mx-auto p-6 pb-28 space-y-6">
          {/* Header */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-text-primary">Regular Care = Better Results!</h1>
            <p className="text-text-secondary">
              On average, our users improve their well-being by
              {' '}
              <span className="font-semibold text-text-primary">30%</span>
              {' '}within the first month!
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-muted text-text-primary text-xs border border-border-subtle/60">
                <svg aria-hidden className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /></svg>
                30 days to visible change
              </span>
            </div>
          </motion.div>

          {/* Progress Graph */}
          <motion.div
            className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--color-card-muted), 1) 0%, rgba(var(--color-primary), 0.08) 100%)',
            }}
            variants={itemVariants}
          >
            {/* Legend */}
            <div className="mb-3 flex items-center justify-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #84DE54 0%, #2AEA5C 100%)' }} />
                With app
              </span>
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #FFA64D 0%, #FE6C6C 100%)' }} />
                Without app
              </span>
            </div>
            <div className="relative w-full aspect-[350/270]">
              <svg viewBox="0 0 350 270" className="absolute inset-0 w-full h-full">
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
            </div>
           </motion.div>

          {/* Before/After Images */}
          <motion.div 
            className="w-full rounded-xl p-4 border border-border-subtle/60 shadow-soft" style={{ backgroundColor: 'rgb(var(--color-card-muted))' }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-4">
              {/* User's Current Result */}
              <motion.div 
                className="text-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="relative w-36 h-52 sm:w-40 sm:h-56 mx-auto">
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
                <div className="relative w-20 h-20 sm:w-28 sm:h-28">
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
                <div className="relative w-36 h-52 sm:w-40 sm:h-56 mx-auto">
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
            <p className="text-text-primary text-lg">
               The more consistently you follow your routine, the better your beauty level becomes. See the difference for yourself!
             </p>
          </motion.div>

          {/* Benefits Section as a vertical timeline (stabilized: text shows immediately, icons animate on reach) */}
          <div 
            className="space-y-4" 
            ref={benefitsRef}
          >
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-text-primary">Noticeable Improvements In One Month:</h3>
            </div>

            <div ref={timelineRef} className="relative py-1">
              {/* Background track */}
              <div className="absolute left-[18px] top-0 bottom-0 w-[3px] rounded-full bg-primary/10" />
              {/* Foreground progress line */}
              <motion.div
                className="absolute left-[18px] top-0 w-[3px] rounded-full"
                style={{ height: progressHeight, background: 'linear-gradient(180deg, #A385E9 0%, rgba(163,133,233,0.4) 100%)' }}
              >
                {/* Moving cap */}
                <motion.span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
                  style={{ background: 'radial-gradient(circle, #A385E9 0%, rgba(163,133,233,0.5) 60%, rgba(163,133,233,0) 70%)' }}
                  animate={{ scale: [0.9, 1.1, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>

              <ul className="space-y-7">
                {benefits.map((b, i) => (
                  <TimelineItem key={i} title={b.title} description={b.description} icon={b.icon} index={i} rootRef={scrollContainerRef} />
                ))}
              </ul>
            </div>
          </div>

          {/* Struggles vs Solutions */}
          <motion.div 
            className="bg-surface rounded-xl p-6 border border-border-subtle/60" 
            ref={strugglesRef}
            initial={{ opacity: 0, y: 50 }}
            animate={strugglesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Struggles Column */}
              <motion.div 
                className="space-y-4"
                initial={{ x: -50, opacity: 0 }}
                animate={strugglesInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h4 className="font-bold text-center text-text-primary">Your Struggles</h4>
                {struggles.map((struggle, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-surface-muted/80 ring-1 ring-border-subtle/50 text-text-primary flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </div>
                    <span className="text-text-primary leading-tight">{struggle}</span>
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
                <h4 className="font-bold text-center text-text-primary">Our Solutions</h4>
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white ring-1 ring-primary/25 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text-primary leading-tight">{solution}</span>
                  </div>
                ))}
               </motion.div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div 
            className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing" 
            variants={itemVariants}
            ref={testimonialsRef}
            onMouseEnter={() => setIsDragging(false)}
          >
            {/* Edge gradient masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10" style={{background: 'linear-gradient(90deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)'}} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10" style={{background: 'linear-gradient(270deg, rgb(var(--color-surface)) 0%, rgba(255,255,255,0) 100%)'}} />
            
            <motion.div 
              className="flex flex-row items-start gap-2.5"
              style={{ 
                width: 'max-content',
                x: dragX
              }}
              drag="x"
              dragConstraints={{
                left: -testimonials.length * 145,
                right: 0
              }}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              animate={!isDragging ? {
                x: [0, -testimonials.length * 145]
              } : {}}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Original testimonials */}
              {testimonials.map((review, index) => (
                 <div 
                  key={index}
                  className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none"
                  style={{ width: '141px', height: '298px' }}
                >
                  <Image
                    src={review.image}
                    alt={`User review ${review.name}`}
                    width={125}
                    height={125}
                    className="w-full h-auto object-cover flex-none rounded-md pointer-events-none"
                    draggable={false}
                  />
                  <div className="flex flex-row items-center gap-1 flex-none">
                    <span className="font-bold text-sm text-text-primary">
                      {review.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                    </div>
                  </div>
                  <div className="flex-none self-stretch border border-border-subtle/60" />
                  <div className="flex flex-row items-center gap-2 flex-none">
                    <div className="flex flex-row items-start flex-none">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                          <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary">5.0 rating</span>
                  </div>
                  <p className="flex-none self-stretch text-sm text-text-primary" style={{ fontWeight: 500 }}>
                    {review.text}
                  </p>
                </div>
              ))}
              
              {/* Duplicate testimonials for seamless loop */}
              {testimonials.map((review, index) => (
                 <div 
                  key={`duplicate-${index}`}
                  className="flex flex-col items-start p-2 gap-2 bg-surface flex-none border border-border-subtle/60 shadow-soft rounded-lg select-none"
                  style={{ width: '141px', height: '298px' }}
                >
                  <Image
                    src={review.image}
                    alt={`User review ${review.name}`}
                    width={125}
                    height={125}
                    className="w-full h-auto object-cover flex-none rounded-md pointer-events-none"
                    draggable={false}
                  />
                  <div className="flex flex-row items-center gap-1 flex-none">
                    <span className="font-bold text-sm text-text-primary">
                      {review.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex-none flex items-center justify-center w-4 h-4" style={{ background: '#A385E9', borderRadius: '50%' }}>
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L2.5 4.5L5 1.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="font-bold text-xs" style={{ color: '#A385E9' }}>Verified</span>
                    </div>
                  </div>
                  <div className="flex-none self-stretch border border-border-subtle/60" />
                  <div className="flex flex-row items-center gap-2 flex-none">
                    <div className="flex flex-row items-start flex-none">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="flex-none" width="10" height="10" viewBox="0 0 10 10" fill="#FABB05">
                          <path d="M5 0L6.18 3.82L10 3.82L7.27 6.18L8.45 10L5 7.64L1.55 10L2.73 6.18L0 3.82L3.82 3.82L5 0Z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary">5.0 rating</span>
                  </div>
                  <p className="flex-none self-stretch text-sm text-text-primary" style={{ fontWeight: 500 }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Fixed Bottom Button */}
      <motion.div 
        className="fixed inset-x-0 bottom-0 bg-surface p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 pointer-events-none"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto">
          <motion.button 
            onClick={handlePricePlans}
            className="w-full bg-primary text-white py-3.5 rounded-xl text-lg font-semibold pointer-events-auto"
            whileHover={{ scale: 1.05, backgroundColor: 'rgb(var(--color-primary))' }}
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
        </div>
      </motion.div>
    </motion.div>
  )
}