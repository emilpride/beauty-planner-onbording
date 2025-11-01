import { getAuth } from 'firebase/auth'

// Cloud Function URL (recomputeAchievements) deployed in us-central1
const DEFAULT_RECOMPUTE_URL = process.env.NEXT_PUBLIC_RECOMPUTE_ACHIEVEMENTS_URL
  || 'https://recomputeachievements-jy4jt54bea-uc.a.run.app'

export async function recomputeAchievements(): Promise<boolean> {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return false
    const token = await user.getIdToken()
    const resp = await fetch(DEFAULT_RECOMPUTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    return resp.ok
  } catch {
    return false
  }
}
