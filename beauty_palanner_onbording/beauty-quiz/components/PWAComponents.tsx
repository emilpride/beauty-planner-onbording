'use client'

import { useEffect, useState } from 'react'
import { usePWAInstall, useServiceWorker } from '@/hooks/usePWA'

/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the app
 */
export function PWAInstallPrompt() {
  const { canInstall, isInstalled, isInstalling, installApp } = usePWAInstall()
  const { hasUpdate, updateServiceWorker } = useServiceWorker()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled && !hasUpdate) {
    return null // App is already installed and no updates
  }

  if (dismissed && !hasUpdate) {
    return null // User dismissed the prompt
  }

  return (
    <>
      {/* Update Available Banner */}
      {hasUpdate && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white px-4 py-3 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-sm font-medium">A new version is available!</p>
            <div className="flex gap-2">
              <button
                onClick={updateServiceWorker}
                className="bg-white text-blue-500 px-4 py-2 rounded font-medium hover:bg-gray-100 transition"
              >
                Update Now
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-white hover:opacity-80 transition px-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt Banner */}
      {canInstall && !isInstalled && (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 text-white px-4 py-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold">Install Beauty Mirror</p>
              <p className="text-sm text-indigo-100">Add to your home screen for quick access</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={installApp}
                disabled={isInstalling}
                className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-indigo-50 transition disabled:opacity-50"
              >
                {isInstalling ? 'Installing...' : 'Install'}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-indigo-200 hover:text-white transition px-2"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Offline Indicator Component
 * Shows when user is offline
 */
import { useOnlineStatus } from '@/hooks/usePWA'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center z-40">
      <p className="text-sm font-medium">You are currently offline. Some features may not be available.</p>
    </div>
  )
}
