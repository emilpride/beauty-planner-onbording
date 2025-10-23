import { getFirebaseStorage } from '@/lib/firebase'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

export interface UploadResult {
  path: string
  url: string
}

export async function uploadReportPhoto(userId: string, file: File): Promise<UploadResult> {
  const storage = getFirebaseStorage()
  const now = new Date()
  const y = now.getFullYear()
  const m = `${now.getMonth() + 1}`.padStart(2, '0')
  const d = `${now.getDate()}`.padStart(2, '0')
  const stamp = now.getTime()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `Users/${userId}/ReportPhotos/${y}-${m}-${d}/${stamp}.${ext}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
  await new Promise<void>((resolve, reject) => {
    task.on('state_changed', undefined, reject, () => resolve())
  })
  const url = await getDownloadURL(storageRef)
  return { path, url }
}
