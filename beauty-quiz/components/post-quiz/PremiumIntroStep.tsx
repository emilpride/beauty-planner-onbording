'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

// Иконка-галочка с градиентом, соответствующая новому дизайну
const CheckIcon = () => (
  <div className="w-5 h-5 flex-shrink-0">
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#8A6EDA' }} />
          <stop offset="100%" style={{ stopColor: '#DB75E0' }} />
        </linearGradient>
      </defs>
      {/* Стандартный путь иконки "check" */}
      <path fill="url(#iconGradient)" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  </div>
);

export default function PremiumIntroStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assistant = searchParams.get('assistant') || 'ellie'

  const handleOK = () => {
    router.push('/quiz/27') // Переходим к ChooseActivitiesStep
  }

  return (
    // 1. Основной контейнер: центрирует весь контент по вертикали и горизонтали
    <div className="min-h-screen flex items-end justify-center p-4 pb-8" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FCE4EC 50%, #FFFFFF 100%)' }}>
      
      {/* 2. Обёртка для карточки и персонажа */}
      <div className="relative w-full max-w-sm mx-auto">
        
        {/* 3. Изображение персонажа: позиционируется абсолютно над карточкой */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[179px]">
          <Image
            src={`/images/on_boarding_images/onboarding_img_4${assistant === 'max' ? '_max' : ''}.png`}
            alt="Character"
            width={179}
            height={179}
            className="object-contain"
            priority
          />
        </div>

        {/* 4. Карточка с контентом: статична, с фиксированной высотой */}
        <div 
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between" 
          style={{ height: '396px' }}
        >
          {/* Верхняя часть с текстом */}
          <div className="flex flex-col gap-6">
            
            {/* Заголовок и описание */}
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#5C4688] leading-tight">
                Let's Create Your Schedule
              </h1>
              <p className="text-base text-[#333333] mt-3 font-semibold leading-relaxed">
                Our users save an average of 12 hours a year! Imagine what you could do with that time.
              </p>
            </div>

            {/* Список преимуществ */}
            <div className="flex flex-col gap-4">
              {/* Преимущество 1 */}
              <div className="flex items-center gap-3">
                <CheckIcon />
                <p className="text-base text-[#5C4688] font-medium flex-1">
                  We'll use your answers to plan procedures just for you
                </p>
              </div>

              {/* Разделитель */}
              <hr className="border-gray-200/90" />

              {/* Преимущество 2 */}
              <div className="flex items-center gap-3">
                <CheckIcon />
                <p className="text-base text-[#5C4688] font-medium flex-1">
                  Get a customized calendar to stay on top of your regular routine
                </p>
              </div>
            </div>
          </div>
          
          {/* 5. Кнопка "Let's Go": всегда внизу благодаря justify-between */}
          <button
            onClick={handleOK}
            className="w-full bg-[#A385E9] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#906fe2] transition-colors"
          >
            Let's Go
          </button>
        </div>
      </div>
    </div>
  )
}