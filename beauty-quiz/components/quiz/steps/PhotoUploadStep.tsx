'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuizStore } from '@/store/quizStore'
import OnboardingStep from '@/components/quiz/OnboardingStep'
import { useSearchParams } from 'next/navigation'

export default function PhotoUploadStep() {
  const { answers, setAnswer } = useQuizStore()
  const searchParams = useSearchParams()
  const assistant = searchParams.get('assistant') || 'ellie'

  const handleUpload = async (
    file: File, 
    type: 'face' | 'hair' | 'body',
  ) => {
    try {
      // Fake upload for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      const previewUrl = URL.createObjectURL(file);
      setAnswer(`${type}ImageUrl`, previewUrl);
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
    }
  }

  const handleFileSelect = (type: 'face' | 'hair' | 'body') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleUpload(file, type);
      }
    };
    input.click();
  }

  const handleCameraOpen = (type: 'face' | 'hair' | 'body') => {
    // TODO: Implement camera logic
    console.log(`Opening camera for ${type}`);
    alert('Camera functionality is not implemented yet.');
  }

  const handleToggleSkip = (type: 'face' | 'hair' | 'body') => {
    const isCurrentlySkipped = answers[`${type}ImageSkipped`];
    if (isCurrentlySkipped) {
      setAnswer(`${type}ImageSkipped`, false);
    } else {
      setAnswer(`${type}ImageUrl`, '');
      setAnswer(`${type}ImageSkipped`, true);
    }
  };

  const getIllustrationImage = (type: 'face' | 'hair' | 'body') => {
    const gender = assistant === 'max' ? 'female' : 'male';
    return `/images/on_boarding_images/${type}_${gender}.png`;
  }

  const isComplete = (type: 'face' | 'hair' | 'body') => {
    return !!answers[`${type}ImageUrl`] || answers[`${type}ImageSkipped`];
  };

  const canProceed = isComplete('face') && isComplete('hair') && isComplete('body');

  const renderUploadBox = (type: 'face' | 'hair' | 'body', label: string) => {
    const imageUrl = answers[`${type}ImageUrl`];
    const isSkipped = answers[`${type}ImageSkipped`];

    return (
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-20 text-center">
          <div className="w-20 h-20 relative">
            <Image
              src={getIllustrationImage(type)}
              alt={`${label} illustration`}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm font-bold text-purple-800 mt-1">{label}</p>
        </div>
        <div 
          className="flex-1 h-28 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center transition-colors duration-200 p-2"
        >
          {imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={`${label} preview`}
                fill
                className="object-cover rounded-xl"
              />
               <button 
                onClick={() => setAnswer(`${type}ImageUrl`, '')}
                className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1.5 text-black hover:bg-opacity-100 transition-all duration-200"
                title="Change photo"
              >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : isSkipped ? (
            <button
              onClick={() => handleToggleSkip(type)}
              className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
                <p className="font-semibold text-text-secondary">Skipped</p>
                <p className="text-xs text-gray-400 mt-1">Click to undo</p>
            </button>
          ) : (
            <div className="flex items-center justify-around w-full">
                <button onClick={() => handleFileSelect(type)} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="text-xs font-semibold text-purple-800">Upload</p>
                </button>
                <button onClick={() => handleCameraOpen(type)} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Camera</p>
                </button>
                 <button onClick={() => handleToggleSkip(type)} className="flex flex-col items-center space-y-1 p-1 group">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Skip</p>
                </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <OnboardingStep
      title="Upload Clear Photos Of Your Face, Hair, And Full Body"
      condition={canProceed}
    >
        <div className="p-1 border-2 border-dotted border-blue-300 rounded-2xl">
            <div className="space-y-4 p-3">
                {renderUploadBox('face', 'Face')}
                {renderUploadBox('hair', 'Hair')}
                {renderUploadBox('body', 'Body')}
            </div>
        </div>
    </OnboardingStep>
  )
}

