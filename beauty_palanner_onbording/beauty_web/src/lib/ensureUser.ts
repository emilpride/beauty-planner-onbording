import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirestoreDb } from './firebase'
import type { User } from 'firebase/auth'

// Track in-flight requests to prevent race conditions
const pendingCreations = new Set<string>()

/**
 * Ensures that a user document exists in users_v2 collection.
 * Called automatically on first login/signup.
 * Prevents race conditions with in-flight tracking.
 */
export async function ensureUserDocument(user: User): Promise<void> {
  const db = getFirestoreDb()
  const userRef = doc(db, 'users_v2', user.uid)
  
  // Prevent concurrent executions for same user
  if (pendingCreations.has(user.uid)) {
    return
  }
  
  try {
    pendingCreations.add(user.uid)
    
    const snap = await getDoc(userRef)
    
    if (!snap.exists()) {
      // Create initial user document with merge:true to prevent overwrites
      await setDoc(userRef, {
        Email: user.email || '',
        CreatedAt: serverTimestamp(),
        PhotoURL: user.photoURL || '',
        DisplayName: user.displayName || '',
        FullName: user.displayName || '',
        Level: 1,
        Activities: [],
        TotalCompletedActivities: 0,
        ActivitiesCompleted: 0,
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        TimezoneOffsetMinutes: new Date().getTimezoneOffset(),
        NotificationPrefs: {
          enabled: true,
          channels: {
            push: true,
            email: false,
            sms: false,
          },
        },
      }, { merge: true })
      console.log('✅ User document created for', user.uid)
    }
  } catch (error) {
    console.error('Failed to ensure user document:', error)
  } finally {
    pendingCreations.delete(user.uid)
  }
}
