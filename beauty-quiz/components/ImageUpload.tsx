'use client'

import { useState, useRef } from 'react'
import { useQuizStore } from '@/store/quizStore'

interface ImageUploadProps {
  type: 'face' | 'hair'
  currentImageUrl?: string
  onUploadComplete?: (url: string) => void
}

export default function ImageUpload({ type, currentImageUrl, onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setAnswer } = useQuizStore()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    if (!file) return

    // Ensure we only process images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    // Reject files over 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must not exceed 10MB.')
      return
    }

    setIsUploading(true)

    try {
      // Create a preview and persist the base64 string for now
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Url = e.target?.result as string
        setPreviewUrl(base64Url)

        // Store the image in the quiz state
        setAnswer(`${type}ImageUrl`, base64Url)

        // Notify parent components
        onUploadComplete?.(base64Url)

        console.log('File uploaded successfully (base64)')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setAnswer(`${type}ImageUrl`, '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTypeLabel = () => (type === 'face' ? 'face' : 'hair')

  const getBenefitCopy = () =>
    type === 'face'
      ? 'This helps our AI review your skin more accurately.'
      : 'This helps our AI understand your hair condition.'

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload a photo of your {getTypeLabel()}
        </h3>
        <p className="text-sm text-gray-600">
          {getBenefitCopy()}
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-64 rounded-lg object-cover"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isUploading ? 'Uploading…' : 'Change photo'}
              </button>
              <button
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📷</div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isUploading ? 'Uploading…' : 'Select photo'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              JPG or PNG up to 10MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
