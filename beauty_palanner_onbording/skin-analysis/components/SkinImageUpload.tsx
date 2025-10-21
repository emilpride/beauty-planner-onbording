'use client'

import { useState, useRef, useCallback } from 'react'

export default function SkinImageUpload({ onImageSelect }: { onImageSelect: (file: File, base64: string) => void }) {
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      {previewUrl ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Skin preview" width={300} height={300} style={{ borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.1)' }} />
            <button onClick={handleRemoveImage} className="btn btn-danger" style={{ position: 'absolute', top: -10, right: -10 }}>✕</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
          <div style={{ color: '#6b7280', marginTop: 8 }}>Click to upload a photo</div>
          <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Any image up to 8MB</div>
        </div>
      )}
    </div>
  )
}
