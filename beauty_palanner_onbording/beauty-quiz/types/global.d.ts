// Global declarations for third-party scripts
export {}

declare global {
  interface Window {
    fbq?: (
      method: 'init' | 'track' | 'consent' | string,
      eventNameOrId?: string,
      params?: Record<string, any>
    ) => void
    _fbq?: Window['fbq']
  }
}
