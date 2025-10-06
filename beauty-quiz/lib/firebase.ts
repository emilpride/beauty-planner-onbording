// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDtNfdtikHmUsKrNRFzP1RBXuie19jUTfw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "beauty-planner-26cc0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "beauty-planner-26cc0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "beauty-planner-26cc0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "587635367697",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:587635367697:web:c61adfac7731beeb0ab6b0",
}

// Mock Firebase services for development
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null)
    return () => {}
  }
}

export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    get: () => Promise.resolve({ docs: [] }),
  })
}

export const storage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    getDownloadURL: () => Promise.resolve('mock-url'),
  })
}

export const functions = {
  httpsCallable: () => () => Promise.resolve({ data: null })
}

export default {
  auth,
  db,
  storage,
  functions
}
