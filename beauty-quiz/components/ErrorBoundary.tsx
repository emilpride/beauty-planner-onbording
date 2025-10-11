'use client'

import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary catches React errors in child components and displays a fallback UI.
 * Usage: Wrap sections of your app to prevent the entire app from crashing on errors.
 * 
 * Example:
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to trigger fallback UI on next render
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    // Reset error state to attempt re-render
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided, otherwise default UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-red-600 dark:text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">Something went wrong</h2>
              <p className="text-sm text-text-secondary">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="text-left bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-xs">
                <p className="font-mono text-red-800 dark:text-red-300 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
              >
                Try again
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
                className="px-6 py-3 bg-surface border border-border-subtle text-text-primary font-semibold rounded-xl hover:bg-surface/80 transition-colors active:scale-95"
              >
                Go to home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
