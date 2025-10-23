import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

function userUpdateDocRef(userId: string, updateId: string) {
  const db = getFirestoreDb()
  return doc(doc(db, 'Users', userId), 'Updates', updateId)
}

export async function updateTaskStatus(userId: string, updateId: string, status: 'completed' | 'skipped') {
  const ref = userUpdateDocRef(userId, updateId)
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function completeUpdate(userId: string, updateId: string) {
  return updateTaskStatus(userId, updateId, 'completed')
}

export async function skipUpdate(userId: string, updateId: string) {
  return updateTaskStatus(userId, updateId, 'skipped')
}
