'use client'

import Image from 'next/image'

export default function JoinBeautyMirrorStep() {
  return (
    <div className="w-full min-h-screen bg-light p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Regular Care = Better Results!
            </h1>
            <p className="text-lg text-text-secondary">
              See how Beauty Mirror can transform your daily routine
            </p>
          </div>

          {/* Graph */}
          <div className="mb-8">
            <Image
              src="/images/graph.png"
              alt="Progress graph"
              width={800}
              height={400}
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Before/After Comparison */}
          <div className="mb-8 text-center">
            <Image
              src="/images/improvement_arrow.png"
              alt="Before and after comparison"
              width={600}
              height={300}
              className="w-full h-auto rounded-xl mx-auto"
            />
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
              Your Improvement Journey
            </h3>
            <div className="space-y-3">
              {[
                { week: "Week 1", title: "Foundation Building", desc: "Establish healthy habits" },
                { week: "Week 4", title: "Visible Changes", desc: "First improvements appear" },
                { week: "Week 8", title: "Significant Progress", desc: "Major transformations" },
                { week: "Week 12", title: "Optimal Results", desc: "Peak performance achieved" }
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-text-primary">{step.week}: {step.title}</h4>
                    <p className="text-text-secondary">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* With/Without Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Positives */}
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                With Beauty Mirror
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Personalized daily routines
                </li>
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  AI-powered recommendations
                </li>
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Progress tracking
                </li>
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Expert guidance
                </li>
              </ul>
            </div>

            {/* Negatives */}
            <div className="bg-red-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Without Beauty Mirror
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Inconsistent routines
                </li>
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Generic advice
                </li>
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  No progress tracking
                </li>
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Trial and error approach
                </li>
              </ul>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
              What Our Users Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Sarah M.", rating: 5, review: "Amazing results in just 2 weeks!" },
                { name: "Mike R.", rating: 5, review: "Finally found my perfect routine" },
                { name: "Emma L.", rating: 5, review: "The AI recommendations are spot on" }
              ].map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">"{review.review}"</p>
                  <p className="text-xs font-semibold text-text-primary">- {review.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Plans Button */}
          <div className="text-center">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg">
              View Price Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
