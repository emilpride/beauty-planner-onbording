'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { UploadCloud, X } from 'lucide-react'

interface SkinImageUploadProps {
  onImageSelect: (file: File, base64: string) => void;
}

export default function SkinImageUpload({ onImageSelect }: SkinImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size must not exceed 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        onImageSelect(file, base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png"
        className="hidden"
      />
      {previewUrl ? (
        <div className="text-center">
          <div className="relative inline-block">
            <Image src={previewUrl} alt="Skin preview" width={300} height={300} className="rounded-lg mx-auto shadow-md" />
            <Button onClick={handleRemoveImage} variant="destructive" size="icon" className="absolute -top-2 -right-2 rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to upload a photo</p>
          <p className="mt-1 text-xs text-gray-500">PNG or JPG up to 8MB</p>
        </div>
      )}
    </div>
  );
}
