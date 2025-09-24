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

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Создаем превью и сохраняем как base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Url = e.target?.result as string
        setPreviewUrl(base64Url)
        
        // Сохраняем в store как base64
        setAnswer(`${type}ImageUrl`, base64Url)
        
        // Вызываем callback
        onUploadComplete?.(base64Url)
        
        console.log('File uploaded successfully (base64)')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Ошибка при загрузке файла. Попробуйте еще раз.')
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

  const getTypeLabel = () => {
    return type === 'face' ? 'лица' : 'волос'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Загрузите фото {getTypeLabel()}
        </h3>
        <p className="text-sm text-gray-600">
          Это поможет AI проанализировать состояние вашей кожи
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt={`Preview ${type}`}
              className="mx-auto max-h-64 rounded-lg object-cover"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Изменить фото'}
              </button>
              <button
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📸</div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Выбрать фото'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              JPG, PNG до 10MB
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
