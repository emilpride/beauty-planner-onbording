interface Activity {
  id: string
  name: string
  category: 'Skin' | 'Hair' | 'Physical health' | 'Mental Wellness'
  icon: string
  color: string
  iconBgColor: string
  recommended?: boolean
}

export const activitiesData: Activity[] = [
  // Skin
  { id: 'cleanse', name: 'Cleanse & Hydrate', category: 'Skin', icon: '/icons/misc/cleanseAndHydrate.svg', color: 'bg-blue-200', iconBgColor: 'bg-blue-500', recommended: true },
  { id: 'deep_hydration', name: 'Deep Hydration', category: 'Skin', icon: '/icons/misc/deepHydration.svg', color: 'bg-red-200', iconBgColor: 'bg-red-500' },
  { id: 'exfoliate', name: 'Exfoliate', category: 'Skin', icon: '/icons/misc/exfoliate.svg', color: 'bg-yellow-200', iconBgColor: 'bg-yellow-500' },
  { id: 'face_massage', name: 'Face Massage', category: 'Skin', icon: '/icons/misc/faceMassage.svg', color: 'bg-lime-200', iconBgColor: 'bg-lime-500' },
  { id: 'lip_eye_care', name: 'Lip & Eye Care', category: 'Skin', icon: '/icons/misc/lipEyeCare.svg', color: 'bg-green-200', iconBgColor: 'bg-green-500' },
  { id: 'spf', name: 'SPF Protection', category: 'Skin', icon: '/icons/misc/spfProtection.svg', color: 'bg-teal-200', iconBgColor: 'bg-teal-500', recommended: true },
  // Hair
  { id: 'wash_care', name: 'Wash & Care', category: 'Hair', icon: '/icons/misc/washCare.svg', color: 'bg-cyan-200', iconBgColor: 'bg-cyan-500' },
  { id: 'deep_nourishment', name: 'Deep Nourishment', category: 'Hair', icon: '/icons/misc/deepNourishment.svg', color: 'bg-purple-200', iconBgColor: 'bg-purple-500', recommended: true },
  { id: 'scalp_detox', name: 'Scalp Detox', category: 'Hair', icon: '/icons/misc/scalpDetox.svg', color: 'bg-pink-200', iconBgColor: 'bg-pink-500' },
  { id: 'heat_protection', name: 'Heat Protection', category: 'Hair', icon: '/icons/misc/heatProtection.svg', color: 'bg-rose-200', iconBgColor: 'bg-rose-500', recommended: true },
  { id: 'scalp_massage', name: 'Scalp Massage', category: 'Hair', icon: '/icons/misc/scalpMassage.svg', color: 'bg-orange-200', iconBgColor: 'bg-orange-500' },
  { id: 'trim_ends', name: 'Trim Split Ends', category: 'Hair', icon: '/icons/misc/trimSplitEnds.svg', color: 'bg-amber-200', iconBgColor: 'bg-amber-500' },
  { id: 'post_color', name: 'Post-Color Care', category: 'Hair', icon: '/icons/misc/postColorCare.svg', color: 'bg-yellow-200', iconBgColor: 'bg-yellow-500' },
  // Physical health
  { id: 'morning_stretch', name: 'Morning Stretch', category: 'Physical health', icon: '/icons/misc/morningStretch.svg', color: 'bg-blue-200', iconBgColor: 'bg-blue-500', recommended: true },
  { id: 'cardio', name: 'Cardio Boost', category: 'Physical health', icon: '/icons/misc/cardioBoost.svg', color: 'bg-indigo-200', iconBgColor: 'bg-indigo-500' },
  { id: 'strength', name: 'Strength Training', category: 'Physical health', icon: '/icons/misc/strengthTraining.svg', color: 'bg-purple-200', iconBgColor: 'bg-purple-500' },
  { id: 'yoga', name: 'Yoga & Flexibility', category: 'Physical health', icon: '/icons/misc/yogaFlexibility.svg', color: 'bg-pink-200', iconBgColor: 'bg-pink-500', recommended: true },
  { id: 'dance', name: 'Dance It Out', category: 'Physical health', icon: '/icons/misc/danceItOut.svg', color: 'bg-teal-200', iconBgColor: 'bg-teal-500' },
  { id: 'swimming', name: 'Swimming Time', category: 'Physical health', icon: '/icons/misc/swimmingTime.svg', color: 'bg-lime-200', iconBgColor: 'bg-lime-500' },
  { id: 'cycling', name: 'Cycling', category: 'Physical health', icon: '/icons/misc/cycling.svg', color: 'bg-green-200', iconBgColor: 'bg-green-500' },
  { id: 'posture', name: 'Posture Fix', category: 'Physical health', icon: '/icons/misc/postureFix.svg', color: 'bg-yellow-200', iconBgColor: 'bg-yellow-500' },
  { id: 'evening_stretch', name: 'Evening Stretch', category: 'Physical health', icon: '/icons/misc/eveningStretch.svg', color: 'bg-orange-200', iconBgColor: 'bg-orange-500' },
  // Mental Wellness
  { id: 'meditation', name: 'Mindful Meditation', category: 'Mental Wellness', icon: '/icons/misc/mindfulMeditation.svg', color: 'bg-lime-200', iconBgColor: 'bg-lime-500', recommended: true },
  { id: 'breathing', name: 'Breathing Exercises', category: 'Mental Wellness', icon: '/icons/misc/breathingExercises.svg', color: 'bg-blue-200', iconBgColor: 'bg-blue-500' },
  { id: 'gratitude', name: 'Gratitude Exercises', category: 'Mental Wellness', icon: '/icons/misc/gratitudeJournal.svg', color: 'bg-green-200', iconBgColor: 'bg-green-500' },
  { id: 'mood_check', name: 'Mood Check-In', category: 'Mental Wellness', icon: '/icons/misc/moodCheckIn.svg', color: 'bg-orange-200', iconBgColor: 'bg-orange-500' },
  { id: 'learn_grow', name: 'Learn & Grow', category: 'Mental Wellness', icon: '/icons/misc/learnGrow.svg', color: 'bg-teal-200', iconBgColor: 'bg-teal-500' },
  { id: 'social_detox', name: 'Social Media Detox', category: 'Mental Wellness', icon: '/icons/misc/socialMediaDetox.svg', color: 'bg-cyan-200', iconBgColor: 'bg-cyan-500' },
  { id: 'affirmations', name: 'Positive Affirmations', category: 'Mental Wellness', icon: '/icons/misc/positiveAffirmations.svg', color: 'bg-purple-200', iconBgColor: 'bg-purple-500' },
  { id: 'talk_it_out', name: 'Talk It Out', category: 'Mental Wellness', icon: '/icons/misc/talkItOut.svg', color: 'bg-rose-200', iconBgColor: 'bg-rose-500' },
  { id: 'stress_relief', name: 'Stress Relief', category: 'Mental Wellness', icon: '/icons/misc/stressRelief.svg', color: 'bg-red-200', iconBgColor: 'bg-red-500', recommended: true },
]
