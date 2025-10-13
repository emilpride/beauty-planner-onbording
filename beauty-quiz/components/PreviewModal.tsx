"use client"

import Image from 'next/image'

type Variant = 'circle' | 'card'

export default function PreviewModal({ src, onRetake, onUse, variant = 'circle', disabled = false }: { src: string; onRetake: () => void; onUse: () => void; variant?: Variant; disabled?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-full flex items-center justify-center mb-4">
          {variant === 'circle' ? (
            <div className="relative w-48 h-48 rounded-full overflow-hidden ring-4 ring-purple-100 shadow-lg">
              <Image src={src} alt="Preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="relative w-60 aspect-[3/4] rounded-2xl overflow-hidden ring-4 ring-purple-100 shadow-lg">
              <Image src={src} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onRetake}
            disabled={disabled}
            className={`flex-1 h-11 rounded-xl font-semibold border transition ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'} border-gray-300 bg-white text-gray-800`}
          >
            Retake
          </button>
          <button
            onClick={onUse}
            disabled={disabled}
            className={`flex-1 h-11 rounded-xl text-white font-semibold shadow-md transition ${disabled ? 'bg-zinc-400 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110'}`}
          >
            {disabled ? 'Saving…' : 'Use this photo'}
          </button>
        </div>
      </div>
    </div>
  )
}
