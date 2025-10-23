export type GenderKey = 'male' | 'female' | 'unknown'

// Base notes for all activities (used when gender-specific text isn't needed)
const BASE_NOTES: Record<string, string> = {
  // Skin
  'cleanse-hydrate': 'Gentle morning cleanse. Apply light moisturizer on damp skin for better absorption.',
  'deep-hydration': 'Use a hydrating serum/ampoule 2–3× per week. Seal with cream to lock in moisture.',
  'exfoliate': 'Use a mild chemical exfoliant 1–2× per week. Avoid scrubbing if skin is irritated.',
  'face-massage': '2–3 minutes of upward, relaxing strokes to boost circulation and reduce tension.',
  'lip-eye-care': 'Apply eye gel/cream and nourishing lip balm in the evening for recovery.',
  'spf-protection': 'SPF 30+ every morning, reapply outdoors every 2–3 hours.',

  // Hair
  'wash-care': 'Wash 2–3× per week. Pick a shampoo/conditioner that fits your hair type.',
  'deep-nourishment': 'Use a mask 1–2× per week. Focus on mid-lengths and ends.',
  'scalp-detox': 'Weekly gentle scalp exfoliation/clarifying to remove buildup.',
  'heat-protection': 'Use a heat protectant before hot tools; avoid high temperatures.',
  'scalp-massage': 'Daily 2–3 minutes to support circulation and hair vitality.',
  'trim-split-ends': 'Trim every 6–8 weeks to keep hair ends healthy.',
  'post-color-care': 'Use color-safe products, cool water rinse, extra hydration post-coloring.',
  'beard-shave-care': 'Beard wash 2–3×/week. Use gentle shave technique and aftershave balm on shaving days.',
  'hair-loss-support': 'Massage scalp daily; consider caffeine/peptide tonics. Consistency is key over 8–12 weeks.',
  'leave-in-care': 'After wash, apply a light leave‑in to mid-lengths and ends. Adds softness and frizz control.',
  'night-care-routine': 'Evening: cleanse, nourishing serum/cream, optional silk pillowcase for hair/skin comfort.',

  // Physical
  'morning-stretch': '5–7 min mobility flow to wake up joints and muscles.',
  'cardio-boost': '20–25 min zone 2–3 cardio 3× per week for heart health.',
  'strength-training': 'Full-body 2–3× per week. Focus on form and progressive overload.',
  'yoga-flexibility': 'Short flow to improve flexibility and posture.',
  'dance-it-out': '10–15 min fun session to elevate mood and activity level.',
  'swimming-time': 'Low-impact cardio option for stamina and joint care.',
  'cycling': '20–30 min outdoor or stationary cycling for aerobic base.',
  'posture-fix': 'Micro-breaks and scapular activation to offset sitting.',
  'evening-stretch': '5–10 min wind-down routine for better sleep quality.',

  // Mental
  'mindful-meditation': 'Daily 5 minutes of breath focus. Increase gradually.',
  'breathing-exercises': 'Box/4-7-8 breathing 2–3× per day to reduce stress.',
  'gratitude-exercises': 'Write 3 short gratitude bullets in the evening.',
  'mood-check-in': 'Quick daily 1–10 mood score plus one note.',
  'learn-grow': '10 minutes of focused reading or skill practice.',
  'social-media-detox': 'Set app limits; no screens 60 min before sleep.',
  'positive-affirmations': '2–3 concise I‑statements each morning to prime focus.',
  'talk-it-out': 'Reach out to a friend or therapist when needed.',
  'stress-relief': 'Pick a favorite technique (walk, music, shower) for 10 min.',
}

// Minor variations per gender (falls back to base if not present)
const MALE_NOTES: Partial<Record<string, string>> = {
  'heat-protection': 'Apply heat protectant before blow-drying or styling; keep temperature moderate.',
}

const FEMALE_NOTES: Partial<Record<string, string>> = {
  'heat-protection': 'Always use heat protectant before straighteners/curlers; avoid >185°C.',
}

export const getDefaultNote = (activityId: string, gender: GenderKey): string => {
  if (gender === 'male') return MALE_NOTES[activityId] ?? BASE_NOTES[activityId] ?? ''
  if (gender === 'female') return FEMALE_NOTES[activityId] ?? BASE_NOTES[activityId] ?? ''
  return BASE_NOTES[activityId] ?? ''
}
