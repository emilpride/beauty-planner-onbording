import { useState, useEffect } from 'react'

/**
 * PWA Installation Hook
 * Detects if PWA can be installed and provides install prompt
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing (desktop)
      event.preventDefault()
      // Store the event for later use
      setInstallPrompt(event)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
    return undefined
  }, [])

  const installApp = async () => {
    if (!installPrompt) return

    setIsInstalling(true)
    try {
      // Trigger the install prompt
      await installPrompt.prompt()

      // Wait for user response
      const { outcome } = await installPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
      }

      setInstallPrompt(null)
    } catch (error) {
      console.error('Error installing PWA:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  return {
    canInstall: !!installPrompt,
    isInstalled,
    isInstalling,
    installApp,
  }
}

/**
 * Hook to detect if app is running online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
    return undefined
  }, [])

  return isOnline
}

/**
 * Hook to manage service worker registration and updates
 */
export function useServiceWorker() {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let intervalId: number | null = null

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('controllerchange', () => {
          setHasUpdate(true)
        })

        // Check for updates every 5 minutes
        intervalId = (setInterval(() => {
          registration.update().catch((error) => {
            console.error('Error checking for service worker update:', error)
          })
        }, 5 * 60 * 1000) as unknown) as number
      })
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const updateServiceWorker = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
        window.location.reload()
      })
    }
  }

  return { hasUpdate, updateServiceWorker }
}
