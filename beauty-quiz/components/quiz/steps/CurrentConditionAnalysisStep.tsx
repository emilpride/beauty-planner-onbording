'use client'

import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'

export default function CurrentConditionAnalysisStep() {
  const { answers } = useQuizStore()
  
  const getBMIIllustration = () => {
    const gender = answers.gender === 2 ? 'female' : 'male'
    return `/images/bmi/bmi_${gender}_1.png`
  }

  const getConditionScore = (condition: string) => {
    // Mock scores based on answers - in real app this would come from AI analysis
    const scores = {
      skin: 8,
      hair: 7,
      body: 6,
      overall: 7
    }
    return scores[condition as keyof typeof scores] || 7
  }

  const ScoreCircle = ({ score, size = 'w-16 h-16' }: { score: number, size?: string }) => {
    const percentage = (score / 10) * 100
    const circumference = 2 * Math.PI * 20 // radius = 20
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={`${size} relative`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="22"
            cy="22"
            r="20"
            stroke="#8A60FF"
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text-primary">{score}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-light p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Your Current Condition Analysis
          </h1>
          <p className="text-lg text-text-secondary">
            Based on your photos and answers, here's what I found
          </p>
        </div>

        {/* BMI Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-32 bg-gradient-to-t from-green-400 to-blue-500 rounded-lg flex flex-col justify-end p-2">
                <div className="w-full h-3/4 bg-white rounded"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">BMI</h3>
                <p className="text-3xl font-bold text-primary">22.5</p>
                <p className="text-sm text-text-secondary">Normal weight</p>
              </div>
            </div>
            <div className="w-24 h-32">
              <Image
                src={getBMIIllustration()}
                alt="BMI illustration"
                width={96}
                height={128}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Condition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skin Condition */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Skin Condition</h3>
              <button className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                i
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Your skin shows good overall health with some areas for improvement
            </p>
            <div className="flex items-center justify-center">
              <ScoreCircle score={getConditionScore('skin')} />
            </div>
          </div>

          {/* Hair Condition */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Hair Condition</h3>
              <button className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                i
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Your hair has good texture but could benefit from targeted care
            </p>
            <div className="flex items-center justify-center">
              <ScoreCircle score={getConditionScore('hair')} />
            </div>
          </div>
        </div>

        {/* BMS Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Beauty Mirror Score</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 relative">
                <ScoreCircle score={getConditionScore('overall')} size="w-24 h-24" />
              </div>
            </div>
            <p className="text-lg mb-6">7/10 - Good foundation with room for improvement</p>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000 ease-out"
                style={{ width: `${getConditionScore('overall') * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* To The Activities Button */}
        <div className="text-center">
          <button className="bg-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-primary-700 transition-colors duration-200">
            To The Activities
          </button>
        </div>
      </div>
    </div>
  )
}
