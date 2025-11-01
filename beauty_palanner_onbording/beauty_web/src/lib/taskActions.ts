import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { TaskInstance, TaskStatus } from '@/types/task'

export function buildUpdateId(activityId: string, date: string, hour?: number, minute?: number) {
  if (typeof hour === 'number' && typeof minute === 'number') {
    const hh = String(hour).padStart(2, '0')
    const mm = String(minute).padStart(2, '0')
    return `${activityId}-${date}-${hh}${mm}`
  }
  return `${activityId}-${date}`
}

export async function setTaskStatus(userId: string, task: TaskInstance, status: TaskStatus) {
  const db = getFirestoreDb()
  const updatesCol = collection(doc(collection(db, 'users_v2'), userId), 'Updates')
  // Always build a deterministic update id from activityId + date [+ time]
  const id = buildUpdateId(task.activityId, task.date, task.time?.hour, task.time?.minute)
  const ref = doc(updatesCol, id)
  await setDoc(
    ref,
    {
      id,
      activityId: task.activityId,
      date: task.date,
      status,
      time: task.time ? { hour: task.time.hour, minute: task.time.minute } : undefined,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
