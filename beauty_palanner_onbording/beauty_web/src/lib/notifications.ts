import { collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

export async function saveFcmToken(userId: string, token: string) {
  const db = getFirestoreDb()
  const col = collection(doc(collection(db, 'Users'), userId), 'FcmTokens')
  const ref = doc(col, token)
  await setDoc(ref, {
    token,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'server',
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true })
}

export async function removeFcmToken(userId: string, token: string) {
  const db = getFirestoreDb()
  const ref = doc(collection(doc(collection(db, 'Users'), userId), 'FcmTokens'), token)
  await deleteDoc(ref)
}
