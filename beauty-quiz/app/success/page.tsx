'use client'

import { useQuizStore } from '@/store/quizStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SuccessPage() {
  const { answers, resetQuiz } = useQuizStore()
  const router = useRouter()

  useEffect(() => {
    // Если пользователь не завершил оплату, перенаправляем на страницу оплаты
    if (!answers.paymentCompleted) {
      router.push('/payment')
    }
  }, [answers.paymentCompleted, router])

  const handleStartApp = () => {
    // Здесь будет логика интеграции с Flutter приложением
    // Пока что просто показываем сообщение
    alert('Flutter app integration will be implemented in future versions')
  }

  const handleRestartQuiz = () => {
    resetQuiz()
    router.push('/')
  }

  if (!answers.paymentCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to payment...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Анимация успеха */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your personalized plan is ready
            </p>
            <p className="text-lg text-gray-500">
              Thank you, {answers.name}! We've created your custom recommendations
            </p>
          </div>

          {/* Информация о подписке */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Your subscription is active
            </h2>
            <p className="text-blue-700">
              Plan: <span className="font-semibold">
                {answers.subscriptionPlan === 'basic' && 'Basic'}
                {answers.subscriptionPlan === 'premium' && 'Premium'}
                {answers.subscriptionPlan === 'pro' && 'Professional'}
              </span>
            </p>
          </div>

          {/* Что дальше */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-medium text-gray-900 mb-1">Download the app</h4>
                <p className="text-sm text-gray-600">
                  Get full access to features in the mobile app
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📧</div>
                <h4 className="font-medium text-gray-900 mb-1">Check your email</h4>
                <p className="text-sm text-gray-600">
                  We've sent your detailed care plan to your email
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-medium text-gray-900 mb-1">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Your photos are being analyzed for personalized recommendations
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900 mb-1">Track Progress</h4>
                <p className="text-sm text-gray-600">
                  Monitor changes in your skin and hair condition
                </p>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-4">
            <button
              onClick={handleStartApp}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200"
            >
              Open App
            </button>
            
            <button
              onClick={handleRestartQuiz}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Take Quiz Again
            </button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p>
              Your data is saved and will be available in the Beauty Mirror app. 
              You can change your settings anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
