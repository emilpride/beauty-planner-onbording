export interface AchievementProgress {
  totalCompletedActivities: number
  currentLevel: number
  lastUpdated: Date
  levelUnlockDates: Record<number, Date>
  lastSeenLevel: number
}

export interface AchievementLevelCfg {
  level: number
  requiredActivities: number
  title: string
}

export const ACHIEVEMENT_LEVELS: AchievementLevelCfg[] = [
  { level: 1, requiredActivities: 500, title: 'Level 1' },
  { level: 2, requiredActivities: 1000, title: 'Level 2' },
  { level: 3, requiredActivities: 1500, title: 'Level 3' },
  { level: 4, requiredActivities: 2000, title: 'Level 4' },
  { level: 5, requiredActivities: 2500, title: 'Level 5' },
  { level: 6, requiredActivities: 3000, title: 'Level 6' },
  { level: 7, requiredActivities: 3500, title: 'Level 7' },
  { level: 8, requiredActivities: 4000, title: 'Level 8' },
  { level: 9, requiredActivities: 4500, title: 'Level 9' },
  { level: 10, requiredActivities: 5000, title: 'Level 10' },
  { level: 11, requiredActivities: 5500, title: 'Level 11' },
  { level: 12, requiredActivities: 6000, title: 'Level 12' },
]

export function levelThreshold(level: number) {
  if (level <= 0) return 0
  const found = ACHIEVEMENT_LEVELS.find((l) => l.level === level)
  return found ? found.requiredActivities : ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1].requiredActivities
}

export function calculateLevel(completed: number) {
  for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
    if (completed >= ACHIEVEMENT_LEVELS[i].requiredActivities) return ACHIEVEMENT_LEVELS[i].level
  }
  return 1
}

export function progressToNextLevel(totalCompletedActivities: number, currentLevel: number) {
  const currentThreshold = levelThreshold(currentLevel)
  const nextThreshold = levelThreshold(currentLevel + 1)
  if (nextThreshold === currentThreshold) return 1
  const progress = (totalCompletedActivities - currentThreshold) / (nextThreshold - currentThreshold)
  return Math.max(0, Math.min(1, progress))
}
