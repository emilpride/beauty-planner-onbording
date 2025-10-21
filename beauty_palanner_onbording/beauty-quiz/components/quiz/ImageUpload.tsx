'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  previewUrl: string | null;
}

export default function ImageUpload({ onUpload, uploadStatus, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  const getStatusContent = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-text-secondary">Uploading...</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-600">Upload successful!</p>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Upload failed. Please try again.</p>
          </>
        );
      case 'idle':
      default:
        return (
          <>
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </>
        );
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div
        onClick={handleAreaClick}
        className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary transition"
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="Preview" width={192} height={192} className="max-h-48 rounded-md" />
        ) : (
          <div className="text-center">
            {getStatusContent()}
          </div>
        )}
      </div>
    </div>
  )
}


