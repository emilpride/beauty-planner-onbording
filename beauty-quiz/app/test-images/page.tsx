'use client'

import Image from 'next/image'

export default function TestImagePage() {
  const testImages = [
    '/images/on_boarding_images/onboarding_img_Congratulations_on_taking_the_first_step_max.png',
    '/images/on_boarding_images/onboarding_img_Congratulations_on_taking_the_first_step_and_Let\'s_Create_Your_Schedule_ellie.png'
  ]

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">Test Images</h1>
      
      {testImages.map((imageSrc, index) => (
        <div key={index} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {index === 0 ? 'Max - Congratulations' : 'Ellie - Congratulations'}
          </h2>
          <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-700 rounded">
            <Image
              src={imageSrc}
              alt={`Test image ${index + 1}`}
              fill
              className="object-contain"
              onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
              onError={() => console.error(`Image ${index + 1} failed to load: ${imageSrc}`)}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-all">
            Path: {imageSrc}
          </p>
        </div>
      ))}
    </div>
  )
}