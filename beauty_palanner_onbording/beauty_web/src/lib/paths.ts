export function userDocPath(userId: string) {
  return `Users/${userId}`
}

export function updatesColPath(userId: string) {
  return `${userDocPath(userId)}/Updates`
}

export function aiAnalysisColPath(userId: string) {
  return `${userDocPath(userId)}/AIAnalysis`
}

export function aiAnalysisUploadsColPath(userId: string) {
  return `${userDocPath(userId)}/AIAnalysisUploads`
}
