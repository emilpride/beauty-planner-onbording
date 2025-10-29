/**
 * Universal upload helper: uploads via backend proxy endpoint to bypass client-side CORS/Auth issues.
 * Includes timeout and retry logic. Throws an error on final failure.
 */

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      // Strip data:image/jpeg;base64, prefix
      const base64 = dataUrl.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

/**
 * Upload a photo via backend proxy with retry logic and timeout.
 * @param file - File or Blob to upload
 * @param userId - User ID for storage path
 * @param photoType - Type of photo: 'face', 'body', 'hair'
 * @param retries - Number of retry attempts (default 3)
 * @param timeoutMs - Timeout per attempt in ms (default 15000)
 * @returns A promise that resolves with the public URL of the uploaded file.
 * @throws An error if the upload fails after all retry attempts.
 */
export async function uploadPhotoViaProxy(
  file: Blob | File,
  userId: string,
  photoType: 'face' | 'body' | 'hair',
  retries = 3,
  timeoutMs = 15000
): Promise<string> {
  const storagePath = `users/${userId}/uploads/${photoType}_${Date.now()}.${
    file.type.split('/')[1] || 'jpg'
  }`
  const base64Data = await blobToBase64(file)

  // Prefer absolute Cloud Function URL when provided to work on static hosts without API rewrites
  const envUploadUrl =
    (process.env['NEXT_PUBLIC_UPLOAD_PHOTO_URL'] as string | undefined) ||
    (process.env['UPLOAD_PHOTO_URL'] as string | undefined) ||
    ''

  const endpoint = envUploadUrl || '/api/upload-photo'

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Upload attempt ${i + 1}/${retries} for ${photoType}...`)
      const res = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            photoType,
            base64Data,
            storagePath,
            contentType: file.type,
          }),
        },
        timeoutMs
      )

      if (!res.ok) {
        const errorBody = await res.text()
        throw new Error(`Upload failed with status ${res.status}: ${errorBody}`)
      }

      const { url } = await res.json()
      console.log(`Upload successful for ${photoType}: ${url}`)
      return url
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i === retries - 1) {
        // Last attempt failed, throw a definitive error
        throw new Error(`Failed to upload ${photoType} photo after ${retries} attempts. Please check your connection and try again.`)
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }

  // This part should be unreachable due to the throw in the loop, but typescript needs it.
  throw new Error('Upload failed unexpectedly.')
}
