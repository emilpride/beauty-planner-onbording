import { saveOnboardingSession } from './firebase'

// Small wrappers used throughout the app to log onboarding events. These call
// the saveOnboardingSession helper which in production posts to your cloud
// function. During local builds these are no-ops (see firebase.ts stub).

export async function logQuizStart(sessionId: string) {
  try {
    await saveOnboardingSession(sessionId, [
      { eventName: 'quizStarted', timestamp: new Date().toISOString() }
    ])
  } catch (e) {
    console.warn('logQuizStart failed', e)
  }
}

export async function logThemeSelected(sessionId: string, theme: string) {
  try {
    await saveOnboardingSession(sessionId, [
      { eventName: 'themeSelected', timestamp: new Date().toISOString(), details: { theme } }
    ])
  } catch (e) {
    console.warn('logThemeSelected failed', e)
  }
}

export async function logAssistantSelected(sessionId: string, assistantId: number) {
  try {
    await saveOnboardingSession(sessionId, [
      { eventName: 'assistantSelected', timestamp: new Date().toISOString(), details: { assistantId } }
    ])
  } catch (e) {
    console.warn('logAssistantSelected failed', e)
  }
}

export async function logEvent(sessionId: string, event: any) {
  try {
    await saveOnboardingSession(sessionId, [event])
  } catch (e) {
    console.warn('logEvent failed', e)
  }
}

export default {
  logQuizStart,
  logThemeSelected,
  logAssistantSelected,
  logEvent,
}
