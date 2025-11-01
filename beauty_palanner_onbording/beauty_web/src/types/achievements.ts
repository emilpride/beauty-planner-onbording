export interface AchievementLevelCfg {
  level: number
  requiredActivities: number
  title: string
}

// Canonical progress shape stored in Firestore (Achievements/Progress)
export interface AchievementProgress {
  totalCompletedActivities: number
  currentLevel: number
  lastUpdated: Date
  levelUnlockDates: Record<number, Date>
  lastSeenLevel: number
}

export const TOTAL_LEVELS = 15
export const MAX_ACTIVITIES_FOR_MAX_LEVEL = 1000

// Evenly distribute thresholds so that:
// - Level 1 unlocks at 1 completed activity
// - Level 15 unlocks at 1000 completed activities
// - Intermediate levels are spaced linearly
export const ACHIEVEMENT_LEVELS: AchievementLevelCfg[] = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
  const level = i + 1
  if (level === 1) return { level, requiredActivities: 1, title: `Level ${level}` }
  const t = Math.ceil(((level - 1) * (MAX_ACTIVITIES_FOR_MAX_LEVEL - 1)) / (TOTAL_LEVELS - 1)) + 1
  return { level, requiredActivities: t, title: `Level ${level}` }
})

export function levelThreshold(level: number) {
  if (level <= 0) return 0
  const found = ACHIEVEMENT_LEVELS.find((l) => l.level === level)
  return found ? found.requiredActivities : ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1].requiredActivities
}

export function calculateLevel(completed: number) {
  // No level unlocked until the first activity is completed
  if (completed < levelThreshold(1)) return 0
  for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
    if (completed >= ACHIEVEMENT_LEVELS[i].requiredActivities) return ACHIEVEMENT_LEVELS[i].level
  }
  return 0
}

export function progressToNextLevel(totalCompletedActivities: number, currentLevel: number) {
  const currentThreshold = levelThreshold(currentLevel)
  const nextThreshold = levelThreshold(currentLevel + 1)
  if (nextThreshold === currentThreshold) return 1
  const progress = (totalCompletedActivities - currentThreshold) / (nextThreshold - currentThreshold)
  return Math.max(0, Math.min(1, progress))
}
