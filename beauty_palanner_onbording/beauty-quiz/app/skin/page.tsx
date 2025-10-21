'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import ImageUpload from '@/components/skin/SkinImageUpload' // A new, simplified uploader
import SkinAnalysisReport from '@/components/skin/SkinAnalysisReport'
import { Button } from '@/components/ui/button'
import { Loader, AlertCircle } from 'lucide-react'

// Define the structure of the analysis result based on the Face++ API docs
// This helps with type safety when accessing the response data.
export type SkinAnalysisResult = any; // Using any for now, can be defined later

// This function will be called by the mutation
const analyzeSkinApi = async (base64Data: string): Promise<SkinAnalysisResult> => {
  const res = await fetch('/api/skin-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with ${res.status}`)
  }
  return res.json()
};

export default function SkinAnalysisPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const mutation = useMutation<SkinAnalysisResult, Error, string>({
    mutationFn: analyzeSkinApi,
  });

  const handleImageUpload = (file: File, base64: string) => {
    setImageFile(file);
    setImageBase64(base64);
    // Clear previous results when a new image is uploaded
    if (mutation.data) {
        mutation.reset();
    }
  };

  const handleAnalyzeClick = () => {
    if (imageBase64) {
      // remove the data URL prefix
      const pureBase64 = imageBase64.split(',')[1];
      if(pureBase64) {
        mutation.mutate(pureBase64);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Advanced Skin Analysis</h1>
          <p className="mt-2 text-lg text-gray-600">Upload a photo to get a detailed report of your skin condition.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <ImageUpload onImageSelect={handleImageUpload} />
          
          {imageFile && (
            <div className="text-center mt-6">
              <Button onClick={handleAnalyzeClick} disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  'Analyze My Skin'
                )}
              </Button>
            </div>
          )}
        </div>

        {mutation.isError && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold"><AlertCircle className="inline-block mr-2"/>Error: </strong>
            <span className="block sm:inline">{mutation.error.message || 'An unexpected error occurred.'}</span>
          </div>
        )}

        {mutation.isSuccess && imageBase64 && (
            <div className="mt-8">
                <SkinAnalysisReport result={mutation.data} originalImage={imageBase64} />
            </div>
        )}
      </div>
    </div>
  );
}
