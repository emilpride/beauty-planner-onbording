'use client'

import * as React from 'react'

type Variant = 'default' | 'destructive' | 'outline' | 'ghost'
type Size = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
  ghost: 'text-gray-800 hover:bg-gray-100',
}

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 py-2 rounded-md',
  sm: 'h-8 px-3 py-1.5 rounded-md text-sm',
  lg: 'h-12 px-6 py-3 rounded-lg text-lg',
  icon: 'h-10 w-10 inline-flex items-center justify-center rounded-md',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const classes = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
    return <button ref={ref} className={classes} {...props} />
  }
)
Button.displayName = 'Button'

export default Button
