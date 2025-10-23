"use client"

import { useState, useRef, useEffect } from 'react'

export function Select({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  placeholder,
}: {
  value?: string | number
  onChange: (v: string | number) => void
  options: Array<string | number>
  className?: string
  buttonClassName?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const label = value ?? placeholder ?? ''

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-hover px-3 py-1 text-sm text-text-primary ${buttonClassName}`}
      >
        <span className="truncate max-w-[8rem]">{label}</span>
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border-subtle bg-surface shadow-lg overflow-auto max-h-64">
          {options.map((opt) => (
            <button
              key={String(opt)}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-hover ${
                value === opt ? 'bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]' : ''
              }`}
            >
              {String(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
