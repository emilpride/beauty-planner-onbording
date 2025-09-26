'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

// Эмодзи иконки
const iconEmojis = {
  cleanseAndHydrate: '🧴',
  deepHydration: '💧',
  exfoliate: '✨',
  faceMassage: '💆‍♀️',
  lipEyeCare: '👁️',
  spfProtection: '☀️',
  washCare: '🧼',
  deepNourishment: '🌿',
  scalpDetox: '🧽',
  heatProtection: '🔥',
  scalpMassage: '💆‍♂️',
  trimSplitEnds: '✂️',
  postColorCare: '🎨',
  morningStretch: '🌅',
  cardioBoost: '💪',
  strengthTraining: '🏋️‍♀️',
  yogaFlexibility: '🧘‍♀️',
  danceItOut: '💃',
  swimmingTime: '🏊‍♀️',
  cycling: '🚴‍♀️',
  postureFix: '📐',
  eveningStretch: '🌙',
  mindfulMeditation: '🧘‍♂️',
  breathingExercises: '🫁',
  gratitudeJournal: '📝',
  moodCheckIn: '😊',
  learnGrow: '📚',
  socialMediaDetox: '📱',
  positiveAffirmations: '💭',
  talkItOut: '🗣️',
  stressRelief: '😌',
}

// Функция для извлечения цвета из Tailwind класса или HEX строки
const extractColorFromClass = (colorClass: string): string => {
  // Если это уже HEX строка (новый формат)
  if (colorClass.startsWith('#')) {
    return colorClass
  }
  
  // Если это Tailwind класс (старый формат)
  if (colorClass.startsWith('bg-[')) {
    return colorClass.match(/bg-\[([^\]]+)\]/)?.[1] || '#A385E9'
  }
  
  return colorClass
}

// Функция для извлечения RGBA цвета из Tailwind класса или строки
const extractRgbaFromClass = (bgColorClass: string): string => {
  // Если это уже RGBA строка (новый формат)
  if (bgColorClass.startsWith('rgba(')) {
    return bgColorClass
  }
  
  // Если это Tailwind класс (старый формат)
  if (bgColorClass.startsWith('bg-[rgba(')) {
    const match = bgColorClass.match(/bg-\[rgba\(([^)]+)\)\]/)
    if (match) {
      return `rgba(${match[1]})`
    }
  }
  
  return 'rgba(163, 133, 233, 0.2)' // fallback
}

// Иконки для активностей
const ActivityIcon = ({ icon, color }: { icon: string; color: string }) => {
  console.log('ActivityIcon received color:', color)
  
  const backgroundColor = extractColorFromClass(color)
    
  return (
    <div 
      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
      style={{ backgroundColor }}
    >
      {icon}
    </div>
  )
}

  // Данные активностей по категориям с точными цветами из Figma
  const initialActivities = {
    skin: [
      { id: 'cleanse-hydrate', name: 'Cleanse & Hydrate', icon: iconEmojis.cleanseAndHydrate, color: 'bg-[#0080FF]', bgColor: 'bg-[rgba(0,128,255,0.2)]', aiRecommended: true },
      { id: 'deep-hydration', name: 'Deep Hydration', icon: iconEmojis.deepHydration, color: 'bg-[#FF001D]', bgColor: 'bg-[rgba(255,0,29,0.2)]', aiRecommended: false },
      { id: 'exfoliate', name: 'Exfoliate', icon: iconEmojis.exfoliate, color: 'bg-[#F7FF00]', bgColor: 'bg-[rgba(246,255,0,0.2)]', aiRecommended: true },
      { id: 'face-massage', name: 'Face Massage', icon: iconEmojis.faceMassage, color: 'bg-[#B3FF00]', bgColor: 'bg-[rgba(178,255,0,0.2)]', aiRecommended: false },
      { id: 'lip-eye-care', name: 'Lip & Eye Care', icon: iconEmojis.lipEyeCare, color: 'bg-[#2BFF00]', bgColor: 'bg-[rgba(42,255,0,0.2)]', aiRecommended: true },
      { id: 'spf-protection', name: 'SPF Protection', icon: iconEmojis.spfProtection, color: 'bg-[#00FFA6]', bgColor: 'bg-[rgba(0,255,166,0.2)]', aiRecommended: false },
    ],
    hair: [
      { id: 'wash-care', name: 'Wash & Care', icon: iconEmojis.washCare, color: 'bg-[#00FFFF]', bgColor: 'bg-[rgba(0,255,255,0.2)]', aiRecommended: false },
      { id: 'deep-nourishment', name: 'Deep Nourishment', icon: iconEmojis.deepNourishment, color: 'bg-[#4D00FF]', bgColor: 'bg-[rgba(76,0,255,0.2)]', aiRecommended: true },
      { id: 'scalp-detox', name: 'Scalp Detox', icon: iconEmojis.scalpDetox, color: 'bg-[#EA00FF]', bgColor: 'bg-[rgba(234,0,255,0.2)]', aiRecommended: false },
      { id: 'heat-protection', name: 'Heat Protection', icon: iconEmojis.heatProtection, color: 'bg-[#FF007B]', bgColor: 'bg-[rgba(255,0,123,0.2)]', aiRecommended: true },
      { id: 'scalp-massage', name: 'Scalp Massage', icon: iconEmojis.scalpMassage, color: 'bg-[#FF2600]', bgColor: 'bg-[rgba(255,38,0,0.2)]', aiRecommended: false },
      { id: 'trim-split-ends', name: 'Trim Split Ends', icon: iconEmojis.trimSplitEnds, color: 'bg-[#FFBB00]', bgColor: 'bg-[rgba(255,187,0,0.2)]', aiRecommended: true },
      { id: 'post-color-care', name: 'Post-Color Care', icon: iconEmojis.postColorCare, color: 'bg-[#D9FF00]', bgColor: 'bg-[rgba(217,255,0,0.2)]', aiRecommended: false },
    ],
    physical: [
      { id: 'morning-stretch', name: 'Morning Stretch', icon: iconEmojis.morningStretch, color: 'bg-[#0080FF]', bgColor: 'bg-[rgba(0,128,255,0.2)]', aiRecommended: true },
      { id: 'cardio-boost', name: 'Cardio Boost', icon: iconEmojis.cardioBoost, color: 'bg-[#2600FF]', bgColor: 'bg-[rgba(38,0,255,0.2)]', aiRecommended: false },
      { id: 'strength-training', name: 'Strength Training', icon: iconEmojis.strengthTraining, color: 'bg-[#5F00FF]', bgColor: 'bg-[rgba(95,0,255,0.2)]', aiRecommended: true },
      { id: 'yoga-flexibility', name: 'Yoga & Flexibility', icon: iconEmojis.yogaFlexibility, color: 'bg-[#FF00E6]', bgColor: 'bg-[rgba(255,0,230,0.2)]', aiRecommended: false },
      { id: 'dance-it-out', name: 'Dance It Out', icon: iconEmojis.danceItOut, color: 'bg-[#00FFFD]', bgColor: 'bg-[rgba(0,255,253,0.2)]', aiRecommended: true },
      { id: 'swimming-time', name: 'Swimming Time', icon: iconEmojis.swimmingTime, color: 'bg-[#8CFF00]', bgColor: 'bg-[rgba(140,255,0,0.2)]', aiRecommended: false },
      { id: 'cycling', name: 'Cycling', icon: iconEmojis.cycling, color: 'bg-[#BCFF00]', bgColor: 'bg-[rgba(188,255,0,0.2)]', aiRecommended: true },
      { id: 'posture-fix', name: 'Posture Fix', icon: iconEmojis.postureFix, color: 'bg-[#F1FF00]', bgColor: 'bg-[rgba(241,255,0,0.2)]', aiRecommended: false },
      { id: 'evening-stretch', name: 'Evening Stretch', icon: iconEmojis.eveningStretch, color: 'bg-[#FF7200]', bgColor: 'bg-[rgba(255,114,0,0.2)]', aiRecommended: true },
    ],
    mental: [
      { id: 'mindful-meditation', name: 'Mindful Meditation', icon: iconEmojis.mindfulMeditation, color: 'bg-[#D0FF00]', bgColor: 'bg-[rgba(208,255,0,0.2)]', aiRecommended: true },
      { id: 'breathing-exercises', name: 'Breathing Exercises', icon: iconEmojis.breathingExercises, color: 'bg-[#00AAFF]', bgColor: 'bg-[rgba(0,170,255,0.2)]', aiRecommended: false },
      { id: 'gratitude-exercises', name: 'Gratitude Exercises', icon: iconEmojis.gratitudeJournal, color: 'bg-[#77FF00]', bgColor: 'bg-[rgba(119,255,0,0.2)]', aiRecommended: true },
      { id: 'mood-check-in', name: 'Mood Check-In', icon: iconEmojis.moodCheckIn, color: 'bg-[#FFAE00]', bgColor: 'bg-[rgba(255,174,0,0.2)]', aiRecommended: false },
      { id: 'learn-grow', name: 'Learn & Grow', icon: iconEmojis.learnGrow, color: 'bg-[#35FC77]', bgColor: 'bg-[rgba(53,252,119,0.2)]', aiRecommended: true },
      { id: 'social-media-detox', name: 'Social Media Detox', icon: iconEmojis.socialMediaDetox, color: 'bg-[#2CBFB8]', bgColor: 'bg-[rgba(44,191,184,0.2)]', aiRecommended: false },
      { id: 'positive-affirmations', name: 'Positive Affirmations', icon: iconEmojis.positiveAffirmations, color: 'bg-[#622CBF]', bgColor: 'bg-[rgba(98,44,191,0.2)]', aiRecommended: true },
      { id: 'talk-it-out', name: 'Talk It Out', icon: iconEmojis.talkItOut, color: 'bg-[#BF2C4C]', bgColor: 'bg-[rgba(191,44,76,0.2)]', aiRecommended: false },
      { id: 'stress-relief', name: 'Stress Relief', icon: iconEmojis.stressRelief, color: 'bg-[#FC356D]', bgColor: 'bg-[rgba(252,53,109,0.2)]', aiRecommended: true },
    ],
  }

export default function ChooseProceduresStep() {
  const router = useRouter()
  const { setAnswer } = useQuizStore()
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  const [activities, setActivities] = useState(initialActivities)
  
  // Состояние для создания новой категории
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '',
    icon: ''
  })
  
  const [newActivity, setNewActivity] = useState({
    name: '',
    note: '',
    category: '',
    color: '',
    icon: ''
  })
  
  const [activityErrors, setActivityErrors] = useState({
    name: '',
    category: '',
    color: '',
    icon: ''
  })

  // Готовые шаблоны
  const templates = [
    { id: 'morning-routine', name: 'Morning Routine', description: 'Cleanse, moisturize, SPF protection' },
    { id: 'evening-routine', name: 'Evening Routine', description: 'Deep cleanse, exfoliate, night cream' },
    { id: 'weekly-treatment', name: 'Weekly Treatment', description: 'Face mask, deep hydration, massage' },
    { id: 'hair-care', name: 'Hair Care', description: 'Wash, condition, heat protection, styling' },
    { id: 'fitness', name: 'Fitness Plan', description: 'Cardio, strength training, yoga, stretching' },
    { id: 'wellness', name: 'Wellness', description: 'Meditation, breathing exercises, gratitude' },
    { id: 'skincare-intensive', name: 'Intensive Skincare', description: 'Serums, treatments, professional care' },
    { id: 'hair-treatment', name: 'Hair Treatment', description: 'Deep conditioning, scalp care, styling' },
    { id: 'body-care', name: 'Body Care', description: 'Exfoliation, moisturizing, massage' },
    { id: 'mental-health', name: 'Mental Health', description: 'Therapy, journaling, mindfulness' },
    { id: 'nutrition', name: 'Nutrition Plan', description: 'Healthy eating, supplements, hydration' },
    { id: 'sleep-routine', name: 'Sleep Routine', description: 'Wind down, relaxation, quality sleep' },
    { id: 'workout-beginner', name: 'Beginner Workout', description: 'Light exercises, walking, basic stretches' },
    { id: 'workout-advanced', name: 'Advanced Workout', description: 'Intense training, HIIT, weightlifting' },
    { id: 'beauty-maintenance', name: 'Beauty Maintenance', description: 'Nails, eyebrows, hair trimming' },
    { id: 'stress-management', name: 'Stress Management', description: 'Breathing, meditation, relaxation' },
  ]

  // Данные для создания новой активности
  const [categories, setCategories] = useState([
    'Skin', 'Hair', 'Physical health', 'Mental Wellness'
  ])

  const colors = [
    { id: 'red', value: '#FF6B6B', name: 'Red' },
    { id: 'teal', value: '#4ECDC4', name: 'Teal' },
    { id: 'blue', value: '#45B7D1', name: 'Blue' },
    { id: 'green', value: '#96CEB4', name: 'Green' },
    { id: 'purple', value: '#A385E9', name: 'Purple' },
    { id: 'orange', value: '#FFB347', name: 'Orange' },
    { id: 'pink', value: '#FFB6C1', name: 'Pink' },
    { id: 'yellow', value: '#FFEAA7', name: 'Yellow' }
  ]

  const icons = [
    { id: 'checklist', name: 'Checklist', icon: '✓' },
    { id: 'briefcase', name: 'Work', icon: '💼' },
    { id: 'meditation', name: 'Meditation', icon: '🧘' },
    { id: 'basketball', name: 'Sports', icon: '🏀' },
    { id: 'heart', name: 'Health', icon: '❤️' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'book', name: 'Learning', icon: '📚' },
    { id: 'music', name: 'Music', icon: '🎵' }
  ]


  // Простые эмодзи иконки для выбора
  const availableIcons = ['🧴', '💧', '✨', '💆‍♀️', '👁️', '☀️', '🧼', '🌿', '🧽', '🔥', '💆‍♂️', '✂️', '🎨', '🌅', '💪', '🏋️‍♀️', '🧘‍♀️', '💃', '🏊‍♀️', '🚴‍♀️', '📐', '🌙', '🧘‍♂️', '🫁', '📝', '😊', '📚', '📱', '💭', '🗣️', '😌', '🎵', '🎨', '🎭', '🎪', '🎯', '🎲', '🎳', '🎸', '🎹', '🎺', '🎻', '🎼', '🎽', '🎾', '🎿', '🏀', '🏁', '🏂', '🏃', '🏄', '🏅', '🏆', '🏇', '🏈', '🏉', '🏊', '🏋️', '🏌️', '🏍️', '🏎️', '🏏', '🏐', '🏑', '🏒', '🏓', '🏔️', '🏕️', '🏖️', '🏗️', '🏘️', '🏙️', '🏚️', '🏛️', '🏜️', '🏝️', '🏞️', '🏟️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🏰', '🏱', '🏲', '🏳️', '🏴', '🏵️', '🏶', '🏷️', '🏸', '🏹', '🏺', '🏻', '🏼', '🏽', '🏾', '🏿', '🐀', '🐁', '🐂', '🐃', '🐄', '🐅', '🐆', '🐇', '🐈', '🐉', '🐊', '🐋', '🐌', '🐍', '🐎', '🐏', '🐐', '🐑', '🐒', '🐓', '🐔', '🐕', '🐖', '🐗', '🐘', '🐙', '🐚', '🐛', '🐜', '🐝', '🐞', '🐟', '🐠', '🐡', '🐢', '🐣', '🐤', '🐥', '🐦', '🐧', '🐨', '🐩', '🐪', '🐫', '🐬', '🐭', '🐮', '🐯', '🐰', '🐱', '🐲', '🐳', '🐴', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐼', '🐽', '🐾', '🐿️', '👀', '👁️', '👂', '👃', '👄', '👅', '👆', '👇', '👈', '👉', '👊', '👋', '👌', '👍', '👎', '👏', '👐', '👑', '👒', '👓', '👔', '👕', '👖', '👗', '👘', '👙', '👚', '👛', '👜', '👝', '👞', '👟', '👠', '👡', '👢', '👣', '👤', '👥', '👦', '👧', '👨', '👩', '👪', '👫', '👬', '👭', '👮', '👯', '👰', '👱', '👲', '👳', '👴', '👵', '👶', '👷', '👸', '👹', '👺', '👻', '👼', '👽', '👾', '👿', '💀', '💁', '💂', '💃', '💄', '💅', '💆', '💇', '💈', '💉', '💊', '💋', '💌', '💍', '💎', '💏', '💐', '💑', '💒', '💓', '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '💜', '💝', '💞', '💟', '💠', '💡', '💢', '💣', '💤', '💥', '💦', '💧', '💨', '💩', '💪', '💫', '💬', '💭', '💮', '💯', '💰', '💱', '💲', '💳', '💴', '💵', '💶', '💷', '💸', '💹', '💺', '💻', '💼', '💽', '💾', '💿', '📀', '📁', '📂', '📃', '📄', '📅', '📆', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '📏', '📐', '📑', '📒', '📓', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📛', '📜', '📝', '📞', '📟', '📠', '📡', '📢', '📣', '📤', '📥', '📦', '📧', '📨', '📩', '📪', '📫', '📬', '📭', '📮', '📯', '📰', '📱', '📲', '📳', '📴', '📵', '📶', '📷', '📸', '📹', '📺', '📻', '📼', '📽️', '📾', '📿', '🔀', '🔁', '🔂', '🔃', '🔄', '🔅', '🔆', '🔇', '🔈', '🔉', '🔊', '🔋', '🔌', '🔍', '🔎', '🔏', '🔐', '🔑', '🔒', '🔓', '🔔', '🔕', '🔖', '🔗', '🔘', '🔙', '🔚', '🔛', '🔜', '🔝', '🔞', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🔥', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮', '🔯', '🔰', '🔱', '🔲', '🔳', '🔴', '🔵', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '🔼', '🔽', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧', '🕰️', '🕱', '🕲', '🕳️', '🕴️', '🕵️', '🕶️', '🕷️', '🕸️', '🕹️', '🕺', '🖀', '🖁', '🖂', '🖃', '🖄', '🖅', '🖆', '🖇️', '🖈', '🖉', '🖊️', '🖋️', '🖌️', '🖍️', '🖎', '🖏', '🖐️', '🖑', '🖒', '🖓', '🖔', '🖕', '🖖', '🖗', '🖘', '🖙', '🖚', '🖛', '🖜', '🖝', '🖞', '🖟', '🖠', '🖡', '🖢', '🖣', '🖤', '🖥️', '🖦', '🖧', '🖨️', '🖩', '🖪', '🖫', '🖬', '🖭', '🖮', '🖯', '🖰', '🖱️', '🖲️', '🖳', '🖴', '🖵', '🖶', '🖷', '🖸', '🖹', '🖺', '🖻', '🖼️', '🖽', '🖾', '🖿', '🗀', '🗁', '🗂️', '🗃️', '🗄️', '🗅', '🗆', '🗇', '🗈', '🗉', '🗊', '🗋', '🗌', '🗍', '🗎', '🗏', '🗐', '🗑️', '🗒️', '🗓️', '🗔', '🗕', '🗖', '🗗', '🗘', '🗙', '🗚', '🗛', '🗜️', '🗝️', '🗞️', '🗟', '🗠', '🗡️', '🗢', '🗣️', '🗤', '🗥', '🗦', '🗧', '🗨️', '🗩', '🗪', '🗫', '🗬', '🗭', '🗮', '🗯️', '🗰', '🗱', '🗲', '🗳️', '🗴', '🗵', '🗶', '🗷', '🗸', '🗹', '🗺️', '🗻', '🗼', '🗽', '🗾', '🗿', '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', '😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓', '😔', '😕', '😖', '😗', '😘', '😙', '😚', '😛', '😜', '😝', '😞', '😟', '😠', '😡', '😢', '😣', '😤', '😥', '😦', '😧', '😨', '😩', '😪', '😫', '😬', '😭', '😮', '😯', '😰', '😱', '😲', '😳', '😴', '😵', '😶', '😷', '😸', '😹', '😺', '😻', '😼', '😽', '😾', '😿', '🙀', '🙁', '🙂', '🙃', '🙄', '🙅', '🙆', '🙇', '🙈', '🙉', '🙊', '🙋', '🙌', '🙍', '🙎', '🙏', '🙐', '🙑', '🙒', '🙓', '🙔', '🙕', '🙖', '🙗', '🙘', '🙙', '🙚', '🙛', '🙜', '🙝', '🙞', '🙟', '🙠', '🙡', '🙢', '🙣', '🙤', '🙥', '🙦', '🙧', '🙨', '🙩', '🙪', '🙫', '🙬', '🙭', '🙮', '🙯', '🙰', '🙱', '🙲', '🙳', '🙴', '🙵', '🙶', '🙷', '🙸', '🙹', '🙺', '🙻', '🙼', '🙽', '🙾', '🙿', '🚀', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚋', '🚌', '🚍', '🚎', '🚏', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🚝', '🚞', '🚟', '🚠', '🚡', '🚢', '🚣', '🚤', '🚥', '🚦', '🚧', '🚨', '🚩', '🚪', '🚫', '🚬', '🚭', '🚮', '🚯', '🚰', '🚱', '🚲', '🚳', '🚴', '🚵', '🚶', '🚷', '🚸', '🚹', '🚺', '🚻', '🚼', '🚽', '🚾', '🚿', '🛀', '🛁', '🛂', '🛃', '🛄', '🛅', '🛆', '🛇', '🛈', '🛉', '🛊', '🛋️', '🛌', '🛍️', '🛎️', '🛏️', '🛐', '🛑', '🛒', '🛓', '🛔', '🛕', '🛖', '🛗', '🛘', '🛙', '🛚', '🛛', '🛜', '🛝', '🛞', '🛟', '🛠️', '🛡️', '🛢️', '🛣️', '🛤️', '🛥️', '🛦', '🛧', '🛨', '🛩️', '🛪', '🛫', '🛬', '🛭', '🛮', '🛯', '🛰️', '🛱️', '🛲', '🛳️', '🛴', '🛵', '🛶', '🛷', '🛸', '🛹', '🛺', '🛻', '🛼', '🛽', '🛾', '🛿', '🜀', '🜁', '🜂', '🜃', '🜄', '🜅', '🜆', '🜇', '🜈', '🜉', '🜊', '🜋', '🜌', '🜍', '🜎', '🜏', '🜐', '🜑', '🜒', '🜓', '🜔', '🜕', '🜖', '🜗', '🜘', '🜙', '🜚', '🜛', '🜜', '🜝', '🜞', '🜟', '🜠', '🜡', '🜢', '🜣', '🜤', '🜥', '🜦', '🜧', '🜨', '🜩', '🜪', '🜫', '🜬', '🜭', '🜮', '🜯', '🜰', '🜱', '🜲', '🜳', '🜴', '🜵', '🜶', '🜷', '🜸', '🜹', '🜺', '🜻', '🜼', '🜽', '🜾', '🜿', '🝀', '🝁', '🝂', '🝃', '🝄', '🝅', '🝆', '🝇', '🝈', '🝉', '🝊', '🝋', '🝌', '🝍', '🝎', '🝏', '🝐', '🝑', '🝒', '🝓', '🝔', '🝕', '🝖', '🝗', '🝘', '🝙', '🝚', '🝛', '🝜', '🝝', '🝞', '🝟', '🝠', '🝡', '🝢', '🝣', '🝤', '🝥', '🝦', '🝧', '🝨', '🝩', '🝪', '🝫', '🝬', '🝭', '🝮', '🝯', '🝰', '🝱', '🝲', '🝳']

  // Создаем массив иконок с категориями для поиска
  const iconsWithCategories = [
    // Спорт и фитнес
    { icon: '💪', category: 'fitness', keywords: ['muscle', 'strength', 'gym', 'workout'] },
    { icon: '🏋️‍♀️', category: 'fitness', keywords: ['weight', 'lifting', 'gym', 'strength'] },
    { icon: '🏃', category: 'fitness', keywords: ['running', 'jogging', 'cardio', 'exercise'] },
    { icon: '🚴‍♀️', category: 'fitness', keywords: ['cycling', 'bike', 'exercise', 'cardio'] },
    { icon: '🏊‍♀️', category: 'fitness', keywords: ['swimming', 'pool', 'water', 'exercise'] },
    { icon: '🧘‍♀️', category: 'wellness', keywords: ['yoga', 'meditation', 'mindfulness', 'relax'] },
    { icon: '🧘‍♂️', category: 'wellness', keywords: ['yoga', 'meditation', 'mindfulness', 'relax'] },
    { icon: '💃', category: 'fitness', keywords: ['dance', 'dancing', 'fun', 'exercise'] },
    
    // Красота и уход
    { icon: '🧴', category: 'beauty', keywords: ['bottle', 'lotion', 'cream', 'skincare'] },
    { icon: '💧', category: 'beauty', keywords: ['water', 'hydration', 'moisture', 'skincare'] },
    { icon: '✨', category: 'beauty', keywords: ['sparkle', 'glitter', 'shine', 'beauty'] },
    { icon: '💆‍♀️', category: 'beauty', keywords: ['massage', 'spa', 'relax', 'beauty'] },
    { icon: '💆‍♂️', category: 'beauty', keywords: ['massage', 'spa', 'relax', 'beauty'] },
    { icon: '👁️', category: 'beauty', keywords: ['eye', 'vision', 'see', 'beauty'] },
    { icon: '☀️', category: 'beauty', keywords: ['sun', 'sunshine', 'uv', 'protection'] },
    { icon: '🧼', category: 'beauty', keywords: ['soap', 'clean', 'wash', 'hygiene'] },
    { icon: '🌿', category: 'beauty', keywords: ['plant', 'natural', 'green', 'organic'] },
    { icon: '🧽', category: 'beauty', keywords: ['sponge', 'clean', 'wash', 'exfoliate'] },
    { icon: '🔥', category: 'beauty', keywords: ['fire', 'heat', 'hot', 'warm'] },
    { icon: '✂️', category: 'beauty', keywords: ['scissors', 'cut', 'trim', 'hair'] },
    { icon: '🎨', category: 'beauty', keywords: ['art', 'paint', 'color', 'creative'] },
    
    // Время и расписание
    { icon: '🌅', category: 'time', keywords: ['sunrise', 'morning', 'dawn', 'early'] },
    { icon: '🌙', category: 'time', keywords: ['moon', 'night', 'evening', 'sleep'] },
    { icon: '🕐', category: 'time', keywords: ['clock', 'time', 'schedule', 'hour'] },
    { icon: '📅', category: 'time', keywords: ['calendar', 'date', 'schedule', 'plan'] },
    
    // Эмоции и настроение
    { icon: '😊', category: 'emotion', keywords: ['happy', 'smile', 'joy', 'positive'] },
    { icon: '😌', category: 'emotion', keywords: ['relaxed', 'calm', 'peaceful', 'zen'] },
    { icon: '💭', category: 'emotion', keywords: ['thought', 'think', 'mind', 'idea'] },
    { icon: '🗣️', category: 'emotion', keywords: ['talk', 'speak', 'communication', 'voice'] },
    
    // Обучение и развитие
    { icon: '📚', category: 'learning', keywords: ['book', 'study', 'learn', 'education'] },
    { icon: '📝', category: 'learning', keywords: ['note', 'write', 'journal', 'document'] },
    { icon: '🎵', category: 'learning', keywords: ['music', 'song', 'melody', 'sound'] },
    
    // Технологии
    { icon: '📱', category: 'tech', keywords: ['phone', 'mobile', 'device', 'technology'] },
    { icon: '💻', category: 'tech', keywords: ['computer', 'laptop', 'work', 'tech'] },
    
    // Здоровье
    { icon: '🫁', category: 'health', keywords: ['lungs', 'breathing', 'respiratory', 'health'] },
    { icon: '❤️', category: 'health', keywords: ['heart', 'love', 'health', 'cardio'] },
    
    // Дом и быт
    { icon: '🏠', category: 'home', keywords: ['house', 'home', 'building', 'place'] },
    { icon: '🛁', category: 'home', keywords: ['bathtub', 'bath', 'relax', 'home'] },
    
    // Природа
    { icon: '🌱', category: 'nature', keywords: ['plant', 'grow', 'nature', 'green'] },
    { icon: '🌸', category: 'nature', keywords: ['flower', 'bloom', 'beautiful', 'nature'] },
    
    // Еда и напитки
    { icon: '🍎', category: 'food', keywords: ['apple', 'fruit', 'healthy', 'food'] },
    { icon: '🥗', category: 'food', keywords: ['salad', 'healthy', 'vegetables', 'food'] },
    { icon: '💧', category: 'food', keywords: ['water', 'drink', 'hydration', 'liquid'] },
    
    // Дополнительные иконки здоровья и фитнеса
    { icon: '🏋️', category: 'fitness', keywords: ['weight', 'lifting', 'gym', 'strength'] },
    { icon: '🤸', category: 'fitness', keywords: ['gymnastics', 'flexibility', 'acrobatics', 'exercise'] },
    { icon: '🤾', category: 'fitness', keywords: ['handball', 'team', 'sport', 'exercise'] },
    { icon: '🏌️', category: 'fitness', keywords: ['golf', 'sport', 'outdoor', 'leisure'] },
    { icon: '🏄', category: 'fitness', keywords: ['surfing', 'water', 'ocean', 'sport'] },
    { icon: '🏇', category: 'fitness', keywords: ['horse', 'riding', 'equestrian', 'sport'] },
    { icon: '🤽', category: 'fitness', keywords: ['water', 'polo', 'swimming', 'team'] },
    { icon: '🏐', category: 'fitness', keywords: ['volleyball', 'team', 'sport', 'ball'] },
    { icon: '🏑', category: 'fitness', keywords: ['hockey', 'stick', 'sport', 'team'] },
    { icon: '🏒', category: 'fitness', keywords: ['ice', 'hockey', 'sport', 'winter'] },
    { icon: '🏓', category: 'fitness', keywords: ['ping', 'pong', 'table', 'tennis'] },
    { icon: '🏸', category: 'fitness', keywords: ['badminton', 'racket', 'sport', 'shuttlecock'] },
    { icon: '🥊', category: 'fitness', keywords: ['boxing', 'punch', 'fight', 'martial'] },
    { icon: '🥋', category: 'fitness', keywords: ['martial', 'arts', 'karate', 'uniform'] },
    { icon: '🥅', category: 'fitness', keywords: ['goal', 'net', 'sport', 'hockey'] },
    { icon: '⛳', category: 'fitness', keywords: ['golf', 'flag', 'hole', 'sport'] },
    { icon: '⛷️', category: 'fitness', keywords: ['skiing', 'winter', 'snow', 'sport'] },
    { icon: '🏂', category: 'fitness', keywords: ['snowboard', 'winter', 'snow', 'sport'] },
    { icon: '🛷', category: 'fitness', keywords: ['sled', 'sleigh', 'winter', 'snow'] },
    { icon: '🛹', category: 'fitness', keywords: ['skateboard', 'skate', 'wheels', 'sport'] },
    { icon: '🛼', category: 'fitness', keywords: ['roller', 'skate', 'wheels', 'sport'] },
    { icon: '🛺', category: 'fitness', keywords: ['auto', 'rickshaw', 'vehicle', 'transport'] },
    { icon: '🛻', category: 'fitness', keywords: ['pickup', 'truck', 'vehicle', 'transport'] },
    { icon: '🛼', category: 'fitness', keywords: ['roller', 'skate', 'wheels', 'sport'] },
    { icon: '🛹', category: 'fitness', keywords: ['skateboard', 'skate', 'wheels', 'sport'] },
    { icon: '🛷', category: 'fitness', keywords: ['sled', 'sleigh', 'winter', 'snow'] },
    { icon: '🏂', category: 'fitness', keywords: ['snowboard', 'winter', 'snow', 'sport'] },
    { icon: '⛷️', category: 'fitness', keywords: ['skiing', 'winter', 'snow', 'sport'] },
    { icon: '⛳', category: 'fitness', keywords: ['golf', 'flag', 'hole', 'sport'] },
    { icon: '🥅', category: 'fitness', keywords: ['goal', 'net', 'sport', 'hockey'] },
    { icon: '🥋', category: 'fitness', keywords: ['martial', 'arts', 'karate', 'uniform'] },
    { icon: '🥊', category: 'fitness', keywords: ['boxing', 'punch', 'fight', 'martial'] },
    { icon: '🏸', category: 'fitness', keywords: ['badminton', 'racket', 'sport', 'shuttlecock'] },
    { icon: '🏓', category: 'fitness', keywords: ['ping', 'pong', 'table', 'tennis'] },
    { icon: '🏒', category: 'fitness', keywords: ['ice', 'hockey', 'sport', 'winter'] },
    { icon: '🏑', category: 'fitness', keywords: ['hockey', 'stick', 'sport', 'team'] },
    { icon: '🏐', category: 'fitness', keywords: ['volleyball', 'team', 'sport', 'ball'] },
    { icon: '🤽', category: 'fitness', keywords: ['water', 'polo', 'swimming', 'team'] },
    { icon: '🏇', category: 'fitness', keywords: ['horse', 'riding', 'equestrian', 'sport'] },
    { icon: '🏄', category: 'fitness', keywords: ['surfing', 'water', 'ocean', 'sport'] },
    { icon: '🏌️', category: 'fitness', keywords: ['golf', 'sport', 'outdoor', 'leisure'] },
    { icon: '🤾', category: 'fitness', keywords: ['handball', 'team', 'sport', 'exercise'] },
    { icon: '🤸', category: 'fitness', keywords: ['gymnastics', 'flexibility', 'acrobatics', 'exercise'] },
    { icon: '🏋️', category: 'fitness', keywords: ['weight', 'lifting', 'gym', 'strength'] },
    
    // Дополнительные иконки красоты и ухода
    { icon: '💄', category: 'beauty', keywords: ['lipstick', 'makeup', 'cosmetics', 'beauty'] },
    { icon: '💅', category: 'beauty', keywords: ['nail', 'polish', 'manicure', 'beauty'] },
    { icon: '💇', category: 'beauty', keywords: ['haircut', 'salon', 'hair', 'beauty'] },
    { icon: '💈', category: 'beauty', keywords: ['barber', 'pole', 'salon', 'hair'] },
    { icon: '💉', category: 'beauty', keywords: ['syringe', 'injection', 'medical', 'beauty'] },
    { icon: '💊', category: 'beauty', keywords: ['pill', 'medicine', 'supplement', 'health'] },
    { icon: '💋', category: 'beauty', keywords: ['kiss', 'lips', 'love', 'beauty'] },
    { icon: '💌', category: 'beauty', keywords: ['love', 'letter', 'romance', 'heart'] },
    { icon: '💍', category: 'beauty', keywords: ['ring', 'jewelry', 'engagement', 'marriage'] },
    { icon: '💎', category: 'beauty', keywords: ['diamond', 'jewelry', 'luxury', 'beauty'] },
    { icon: '💏', category: 'beauty', keywords: ['couple', 'kiss', 'love', 'romance'] },
    { icon: '💐', category: 'beauty', keywords: ['bouquet', 'flowers', 'gift', 'beauty'] },
    { icon: '💑', category: 'beauty', keywords: ['couple', 'love', 'heart', 'romance'] },
    { icon: '💒', category: 'beauty', keywords: ['wedding', 'church', 'marriage', 'celebration'] },
    { icon: '💓', category: 'beauty', keywords: ['heartbeat', 'love', 'pulse', 'emotion'] },
    { icon: '💔', category: 'beauty', keywords: ['broken', 'heart', 'sad', 'love'] },
    { icon: '💕', category: 'beauty', keywords: ['two', 'hearts', 'love', 'romance'] },
    { icon: '💖', category: 'beauty', keywords: ['sparkling', 'heart', 'love', 'beauty'] },
    { icon: '💗', category: 'beauty', keywords: ['growing', 'heart', 'love', 'emotion'] },
    { icon: '💘', category: 'beauty', keywords: ['cupid', 'arrow', 'love', 'romance'] },
    { icon: '💙', category: 'beauty', keywords: ['blue', 'heart', 'love', 'color'] },
    { icon: '💚', category: 'beauty', keywords: ['green', 'heart', 'love', 'nature'] },
    { icon: '💛', category: 'beauty', keywords: ['yellow', 'heart', 'love', 'color'] },
    { icon: '💜', category: 'beauty', keywords: ['purple', 'heart', 'love', 'color'] },
    { icon: '💝', category: 'beauty', keywords: ['gift', 'heart', 'present', 'love'] },
    { icon: '💞', category: 'beauty', keywords: ['revolving', 'hearts', 'love', 'romance'] },
    { icon: '💟', category: 'beauty', keywords: ['heart', 'decoration', 'love', 'beauty'] },
    { icon: '💠', category: 'beauty', keywords: ['diamond', 'shape', 'gem', 'beauty'] },
    { icon: '💡', category: 'beauty', keywords: ['lightbulb', 'idea', 'bright', 'light'] },
    { icon: '💢', category: 'beauty', keywords: ['anger', 'symbol', 'mad', 'emotion'] },
    { icon: '💣', category: 'beauty', keywords: ['bomb', 'explosive', 'danger', 'warning'] },
    { icon: '💤', category: 'beauty', keywords: ['sleeping', 'zzz', 'sleep', 'rest'] },
    { icon: '💥', category: 'beauty', keywords: ['explosion', 'boom', 'collision', 'impact'] },
    { icon: '💦', category: 'beauty', keywords: ['sweat', 'droplets', 'water', 'exercise'] },
    { icon: '💨', category: 'beauty', keywords: ['wind', 'blowing', 'air', 'fast'] },
    { icon: '💩', category: 'beauty', keywords: ['poop', 'pile', 'waste', 'funny'] },
    { icon: '💫', category: 'beauty', keywords: ['dizzy', 'star', 'sparkle', 'magic'] },
    { icon: '💬', category: 'beauty', keywords: ['speech', 'bubble', 'talk', 'chat'] },
    { icon: '💮', category: 'beauty', keywords: ['white', 'flower', 'blossom', 'beauty'] },
    { icon: '💯', category: 'beauty', keywords: ['hundred', 'points', 'perfect', 'score'] },
    { icon: '💰', category: 'beauty', keywords: ['money', 'bag', 'wealth', 'rich'] },
    { icon: '💱', category: 'beauty', keywords: ['currency', 'exchange', 'money', 'trade'] },
    { icon: '💲', category: 'beauty', keywords: ['dollar', 'sign', 'money', 'currency'] },
    { icon: '💳', category: 'beauty', keywords: ['credit', 'card', 'payment', 'money'] },
    { icon: '💴', category: 'beauty', keywords: ['yen', 'banknote', 'money', 'japan'] },
    { icon: '💵', category: 'beauty', keywords: ['dollar', 'banknote', 'money', 'usa'] },
    { icon: '💶', category: 'beauty', keywords: ['euro', 'banknote', 'money', 'europe'] },
    { icon: '💷', category: 'beauty', keywords: ['pound', 'banknote', 'money', 'uk'] },
    { icon: '💸', category: 'beauty', keywords: ['money', 'wings', 'flying', 'expensive'] },
    { icon: '💹', category: 'beauty', keywords: ['chart', 'increasing', 'yen', 'growth'] },
    { icon: '💺', category: 'beauty', keywords: ['seat', 'chair', 'sitting', 'rest'] },
    { icon: '💻', category: 'beauty', keywords: ['laptop', 'computer', 'work', 'tech'] },
    { icon: '💼', category: 'beauty', keywords: ['briefcase', 'work', 'business', 'office'] },
    { icon: '💽', category: 'beauty', keywords: ['minidisc', 'disk', 'music', 'storage'] },
    { icon: '💾', category: 'beauty', keywords: ['floppy', 'disk', 'save', 'storage'] },
    { icon: '💿', category: 'beauty', keywords: ['optical', 'disk', 'cd', 'music'] },
    { icon: '📀', category: 'beauty', keywords: ['dvd', 'disk', 'movie', 'video'] },
    
    // Минималистичные геометрические формы
    { icon: '⚫', category: 'minimal', keywords: ['circle', 'black', 'dot', 'minimal'] },
    { icon: '⚪', category: 'minimal', keywords: ['circle', 'white', 'dot', 'minimal'] },
    { icon: '🔴', category: 'minimal', keywords: ['circle', 'red', 'dot', 'minimal'] },
    { icon: '🟠', category: 'minimal', keywords: ['circle', 'orange', 'dot', 'minimal'] },
    { icon: '🟡', category: 'minimal', keywords: ['circle', 'yellow', 'dot', 'minimal'] },
    { icon: '🟢', category: 'minimal', keywords: ['circle', 'green', 'dot', 'minimal'] },
    { icon: '🔵', category: 'minimal', keywords: ['circle', 'blue', 'dot', 'minimal'] },
    { icon: '🟣', category: 'minimal', keywords: ['circle', 'purple', 'dot', 'minimal'] },
    { icon: '🟤', category: 'minimal', keywords: ['circle', 'brown', 'dot', 'minimal'] },
    { icon: '⚫', category: 'minimal', keywords: ['square', 'black', 'box', 'minimal'] },
    { icon: '⚪', category: 'minimal', keywords: ['square', 'white', 'box', 'minimal'] },
    { icon: '🔴', category: 'minimal', keywords: ['square', 'red', 'box', 'minimal'] },
    { icon: '🟠', category: 'minimal', keywords: ['square', 'orange', 'box', 'minimal'] },
    { icon: '🟡', category: 'minimal', keywords: ['square', 'yellow', 'box', 'minimal'] },
    { icon: '🟢', category: 'minimal', keywords: ['square', 'green', 'box', 'minimal'] },
    { icon: '🔵', category: 'minimal', keywords: ['square', 'blue', 'box', 'minimal'] },
    { icon: '🟣', category: 'minimal', keywords: ['square', 'purple', 'box', 'minimal'] },
    { icon: '🟤', category: 'minimal', keywords: ['square', 'brown', 'box', 'minimal'] },
    { icon: '🔺', category: 'minimal', keywords: ['triangle', 'red', 'up', 'minimal'] },
    { icon: '🔻', category: 'minimal', keywords: ['triangle', 'red', 'down', 'minimal'] },
    { icon: '🔸', category: 'minimal', keywords: ['triangle', 'orange', 'small', 'minimal'] },
    { icon: '🔹', category: 'minimal', keywords: ['triangle', 'blue', 'small', 'minimal'] },
    { icon: '🔶', category: 'minimal', keywords: ['triangle', 'orange', 'large', 'minimal'] },
    { icon: '🔷', category: 'minimal', keywords: ['triangle', 'blue', 'large', 'minimal'] },
    { icon: '🔴', category: 'minimal', keywords: ['diamond', 'red', 'gem', 'minimal'] },
    { icon: '🔵', category: 'minimal', keywords: ['diamond', 'blue', 'gem', 'minimal'] },
    { icon: '🔺', category: 'minimal', keywords: ['diamond', 'orange', 'gem', 'minimal'] },
    { icon: '🔻', category: 'minimal', keywords: ['diamond', 'blue', 'gem', 'minimal'] },
    
    // Символы и знаки
    { icon: '➕', category: 'minimal', keywords: ['plus', 'add', 'cross', 'minimal'] },
    { icon: '➖', category: 'minimal', keywords: ['minus', 'subtract', 'dash', 'minimal'] },
    { icon: '✖️', category: 'minimal', keywords: ['multiply', 'times', 'x', 'minimal'] },
    { icon: '➗', category: 'minimal', keywords: ['divide', 'division', 'slash', 'minimal'] },
    { icon: '✔️', category: 'minimal', keywords: ['check', 'tick', 'correct', 'minimal'] },
    { icon: '❌', category: 'minimal', keywords: ['cross', 'wrong', 'error', 'minimal'] },
    { icon: '✅', category: 'minimal', keywords: ['check', 'green', 'correct', 'minimal'] },
    { icon: '❎', category: 'minimal', keywords: ['cross', 'red', 'wrong', 'minimal'] },
    { icon: '⭐', category: 'minimal', keywords: ['star', 'favorite', 'rating', 'minimal'] },
    { icon: '🌟', category: 'minimal', keywords: ['star', 'glowing', 'bright', 'minimal'] },
    { icon: '💫', category: 'minimal', keywords: ['star', 'dizzy', 'sparkle', 'minimal'] },
    { icon: '✨', category: 'minimal', keywords: ['sparkles', 'shine', 'magic', 'minimal'] },
    { icon: '❓', category: 'minimal', keywords: ['question', 'help', 'ask', 'minimal'] },
    { icon: '❔', category: 'minimal', keywords: ['question', 'white', 'help', 'minimal'] },
    { icon: '❕', category: 'minimal', keywords: ['exclamation', 'white', 'warning', 'minimal'] },
    { icon: '❗', category: 'minimal', keywords: ['exclamation', 'red', 'warning', 'minimal'] },
    { icon: '‼️', category: 'minimal', keywords: ['double', 'exclamation', 'urgent', 'minimal'] },
    { icon: '⁉️', category: 'minimal', keywords: ['exclamation', 'question', 'surprise', 'minimal'] },
    { icon: '❣️', category: 'minimal', keywords: ['heart', 'exclamation', 'love', 'minimal'] },
    { icon: '💢', category: 'minimal', keywords: ['anger', 'symbol', 'mad', 'minimal'] },
    { icon: '💯', category: 'minimal', keywords: ['hundred', 'points', 'perfect', 'minimal'] },
    { icon: '🔟', category: 'minimal', keywords: ['ten', 'number', 'keycap', 'minimal'] },
    { icon: '🔢', category: 'minimal', keywords: ['numbers', '123', 'digits', 'minimal'] },
    { icon: '🔣', category: 'minimal', keywords: ['symbols', 'punctuation', 'marks', 'minimal'] },
    { icon: '🔤', category: 'minimal', keywords: ['letters', 'abc', 'alphabet', 'minimal'] },
    { icon: '🅰️', category: 'minimal', keywords: ['a', 'blood', 'type', 'minimal'] },
    { icon: '🅱️', category: 'minimal', keywords: ['b', 'blood', 'type', 'minimal'] },
    { icon: '🆎', category: 'minimal', keywords: ['ab', 'blood', 'type', 'minimal'] },
    { icon: '🅾️', category: 'minimal', keywords: ['o', 'blood', 'type', 'minimal'] },
    { icon: '🆑', category: 'minimal', keywords: ['cl', 'clear', 'delete', 'minimal'] },
    { icon: '🆒', category: 'minimal', keywords: ['cool', 'squared', 'fresh', 'minimal'] },
    { icon: '🆓', category: 'minimal', keywords: ['free', 'squared', 'no', 'minimal'] },
    { icon: '🆔', category: 'minimal', keywords: ['id', 'squared', 'identity', 'minimal'] },
    { icon: '🆕', category: 'minimal', keywords: ['new', 'squared', 'fresh', 'minimal'] },
    { icon: '🆖', category: 'minimal', keywords: ['ng', 'squared', 'no', 'minimal'] },
    { icon: '🆗', category: 'minimal', keywords: ['ok', 'squared', 'good', 'minimal'] },
    { icon: '🆘', category: 'minimal', keywords: ['sos', 'squared', 'help', 'minimal'] },
    { icon: '🆙', category: 'minimal', keywords: ['up', 'squared', 'arrow', 'minimal'] },
    { icon: '🆚', category: 'minimal', keywords: ['vs', 'squared', 'versus', 'minimal'] },
    { icon: '🈁', category: 'minimal', keywords: ['japanese', 'here', 'location', 'minimal'] },
    { icon: '🈂️', category: 'minimal', keywords: ['japanese', 'service', 'charge', 'minimal'] },
    { icon: '🈷️', category: 'minimal', keywords: ['japanese', 'monthly', 'amount', 'minimal'] },
    { icon: '🈶', category: 'minimal', keywords: ['japanese', 'not', 'free', 'minimal'] },
    { icon: '🈯', category: 'minimal', keywords: ['japanese', 'reserved', 'booking', 'minimal'] },
    { icon: '🉐', category: 'minimal', keywords: ['japanese', 'bargain', 'deal', 'minimal'] },
    { icon: '🈹', category: 'minimal', keywords: ['japanese', 'discount', 'sale', 'minimal'] },
    { icon: '🈚', category: 'minimal', keywords: ['japanese', 'free', 'charge', 'minimal'] },
    { icon: '🈲', category: 'minimal', keywords: ['japanese', 'prohibited', 'no', 'minimal'] },
    { icon: '🉑', category: 'minimal', keywords: ['japanese', 'acceptable', 'ok', 'minimal'] },
    { icon: '🈸', category: 'minimal', keywords: ['japanese', 'application', 'form', 'minimal'] },
    { icon: '🈴', category: 'minimal', keywords: ['japanese', 'passing', 'grade', 'minimal'] },
    { icon: '🈳', category: 'minimal', keywords: ['japanese', 'vacancy', 'empty', 'minimal'] },
    { icon: '㊗️', category: 'minimal', keywords: ['japanese', 'congratulations', 'celebration', 'minimal'] },
    { icon: '㊙️', category: 'minimal', keywords: ['japanese', 'secret', 'confidential', 'minimal'] },
    { icon: '🈺', category: 'minimal', keywords: ['japanese', 'open', 'business', 'minimal'] },
    { icon: '🈵', category: 'minimal', keywords: ['japanese', 'no', 'vacancy', 'minimal'] },
    
    // Стрелки и направления
    { icon: '⬆️', category: 'minimal', keywords: ['up', 'arrow', 'north', 'minimal'] },
    { icon: '⬇️', category: 'minimal', keywords: ['down', 'arrow', 'south', 'minimal'] },
    { icon: '⬅️', category: 'minimal', keywords: ['left', 'arrow', 'west', 'minimal'] },
    { icon: '➡️', category: 'minimal', keywords: ['right', 'arrow', 'east', 'minimal'] },
    { icon: '↗️', category: 'minimal', keywords: ['up', 'right', 'northeast', 'minimal'] },
    { icon: '↘️', category: 'minimal', keywords: ['down', 'right', 'southeast', 'minimal'] },
    { icon: '↙️', category: 'minimal', keywords: ['down', 'left', 'southwest', 'minimal'] },
    { icon: '↖️', category: 'minimal', keywords: ['up', 'left', 'northwest', 'minimal'] },
    { icon: '↕️', category: 'minimal', keywords: ['up', 'down', 'vertical', 'minimal'] },
    { icon: '↔️', category: 'minimal', keywords: ['left', 'right', 'horizontal', 'minimal'] },
    { icon: '↩️', category: 'minimal', keywords: ['return', 'left', 'back', 'minimal'] },
    { icon: '↪️', category: 'minimal', keywords: ['return', 'right', 'forward', 'minimal'] },
    { icon: '⤴️', category: 'minimal', keywords: ['up', 'right', 'curve', 'minimal'] },
    { icon: '⤵️', category: 'minimal', keywords: ['down', 'right', 'curve', 'minimal'] },
    { icon: '🔃', category: 'minimal', keywords: ['clockwise', 'arrows', 'refresh', 'minimal'] },
    { icon: '🔄', category: 'minimal', keywords: ['counterclockwise', 'arrows', 'undo', 'minimal'] },
    { icon: '🔙', category: 'minimal', keywords: ['back', 'arrow', 'return', 'minimal'] },
    { icon: '🔚', category: 'minimal', keywords: ['end', 'arrow', 'finish', 'minimal'] },
    { icon: '🔛', category: 'minimal', keywords: ['on', 'arrow', 'active', 'minimal'] },
    { icon: '🔜', category: 'minimal', keywords: ['soon', 'arrow', 'coming', 'minimal'] },
    { icon: '🔝', category: 'minimal', keywords: ['top', 'arrow', 'up', 'minimal'] },
    { icon: '🔞', category: 'minimal', keywords: ['18', 'adult', 'restricted', 'minimal'] },
    { icon: '🔟', category: 'minimal', keywords: ['ten', 'number', 'keycap', 'minimal'] },
    { icon: '🔢', category: 'minimal', keywords: ['numbers', '123', 'digits', 'minimal'] },
    { icon: '🔣', category: 'minimal', keywords: ['symbols', 'punctuation', 'marks', 'minimal'] },
    { icon: '🔤', category: 'minimal', keywords: ['letters', 'abc', 'alphabet', 'minimal'] },
    { icon: '🅰️', category: 'minimal', keywords: ['a', 'blood', 'type', 'minimal'] },
    { icon: '🅱️', category: 'minimal', keywords: ['b', 'blood', 'type', 'minimal'] },
    { icon: '🆎', category: 'minimal', keywords: ['ab', 'blood', 'type', 'minimal'] },
    { icon: '🅾️', category: 'minimal', keywords: ['o', 'blood', 'type', 'minimal'] },
    { icon: '🆑', category: 'minimal', keywords: ['cl', 'clear', 'delete', 'minimal'] },
    { icon: '🆒', category: 'minimal', keywords: ['cool', 'squared', 'fresh', 'minimal'] },
    { icon: '🆓', category: 'minimal', keywords: ['free', 'squared', 'no', 'minimal'] },
    { icon: '🆔', category: 'minimal', keywords: ['id', 'squared', 'identity', 'minimal'] },
    { icon: '🆕', category: 'minimal', keywords: ['new', 'squared', 'fresh', 'minimal'] },
    { icon: '🆖', category: 'minimal', keywords: ['ng', 'squared', 'no', 'minimal'] },
    { icon: '🆗', category: 'minimal', keywords: ['ok', 'squared', 'good', 'minimal'] },
    { icon: '🆘', category: 'minimal', keywords: ['sos', 'squared', 'help', 'minimal'] },
    { icon: '🆙', category: 'minimal', keywords: ['up', 'squared', 'arrow', 'minimal'] },
    { icon: '🆚', category: 'minimal', keywords: ['vs', 'squared', 'versus', 'minimal'] },
    { icon: '🈁', category: 'minimal', keywords: ['japanese', 'here', 'location', 'minimal'] },
    { icon: '🈂️', category: 'minimal', keywords: ['japanese', 'service', 'charge', 'minimal'] },
    { icon: '🈷️', category: 'minimal', keywords: ['japanese', 'monthly', 'amount', 'minimal'] },
    { icon: '🈶', category: 'minimal', keywords: ['japanese', 'not', 'free', 'minimal'] },
    { icon: '🈯', category: 'minimal', keywords: ['japanese', 'reserved', 'booking', 'minimal'] },
    { icon: '🉐', category: 'minimal', keywords: ['japanese', 'bargain', 'deal', 'minimal'] },
    { icon: '🈹', category: 'minimal', keywords: ['japanese', 'discount', 'sale', 'minimal'] },
    { icon: '🈚', category: 'minimal', keywords: ['japanese', 'free', 'charge', 'minimal'] },
    { icon: '🈲', category: 'minimal', keywords: ['japanese', 'prohibited', 'no', 'minimal'] },
    { icon: '🉑', category: 'minimal', keywords: ['japanese', 'acceptable', 'ok', 'minimal'] },
    { icon: '🈸', category: 'minimal', keywords: ['japanese', 'application', 'form', 'minimal'] },
    { icon: '🈴', category: 'minimal', keywords: ['japanese', 'passing', 'grade', 'minimal'] },
    { icon: '🈳', category: 'minimal', keywords: ['japanese', 'vacancy', 'empty', 'minimal'] },
    { icon: '㊗️', category: 'minimal', keywords: ['japanese', 'congratulations', 'celebration', 'minimal'] },
    { icon: '㊙️', category: 'minimal', keywords: ['japanese', 'secret', 'confidential', 'minimal'] },
    { icon: '🈺', category: 'minimal', keywords: ['japanese', 'open', 'business', 'minimal'] },
    { icon: '🈵', category: 'minimal', keywords: ['japanese', 'no', 'vacancy', 'minimal'] },
    
    // Животные
    { icon: '🐶', category: 'animals', keywords: ['dog', 'puppy', 'pet', 'animal'] },
    { icon: '🐱', category: 'animals', keywords: ['cat', 'kitten', 'pet', 'animal'] },
    { icon: '🐭', category: 'animals', keywords: ['mouse', 'rat', 'small', 'animal'] },
    { icon: '🐹', category: 'animals', keywords: ['hamster', 'pet', 'small', 'animal'] },
    { icon: '🐰', category: 'animals', keywords: ['rabbit', 'bunny', 'pet', 'animal'] },
    { icon: '🦊', category: 'animals', keywords: ['fox', 'wild', 'cunning', 'animal'] },
    { icon: '🐻', category: 'animals', keywords: ['bear', 'wild', 'strong', 'animal'] },
    { icon: '🐼', category: 'animals', keywords: ['panda', 'cute', 'china', 'animal'] },
    { icon: '🐨', category: 'animals', keywords: ['koala', 'australia', 'cute', 'animal'] },
    { icon: '🐯', category: 'animals', keywords: ['tiger', 'wild', 'stripes', 'animal'] },
    { icon: '🦁', category: 'animals', keywords: ['lion', 'king', 'wild', 'animal'] },
    { icon: '🐮', category: 'animals', keywords: ['cow', 'farm', 'milk', 'animal'] },
    { icon: '🐷', category: 'animals', keywords: ['pig', 'farm', 'pink', 'animal'] },
    { icon: '🐸', category: 'animals', keywords: ['frog', 'green', 'jump', 'animal'] },
    { icon: '🐵', category: 'animals', keywords: ['monkey', 'banana', 'funny', 'animal'] },
    { icon: '🙈', category: 'animals', keywords: ['monkey', 'see', 'no', 'evil'] },
    { icon: '🙉', category: 'animals', keywords: ['monkey', 'hear', 'no', 'evil'] },
    { icon: '🙊', category: 'animals', keywords: ['monkey', 'speak', 'no', 'evil'] },
    { icon: '🐒', category: 'animals', keywords: ['monkey', 'wild', 'jungle', 'animal'] },
    { icon: '🦍', category: 'animals', keywords: ['gorilla', 'strong', 'wild', 'animal'] },
    { icon: '🦧', category: 'animals', keywords: ['orangutan', 'ape', 'wild', 'animal'] },
    { icon: '🐕', category: 'animals', keywords: ['dog', 'pet', 'loyal', 'animal'] },
    { icon: '🐩', category: 'animals', keywords: ['poodle', 'dog', 'curly', 'animal'] },
    { icon: '🐺', category: 'animals', keywords: ['wolf', 'wild', 'pack', 'animal'] },
    { icon: '🦝', category: 'animals', keywords: ['raccoon', 'mask', 'cute', 'animal'] },
    { icon: '🐈', category: 'animals', keywords: ['cat', 'pet', 'independent', 'animal'] },
    { icon: '🦁', category: 'animals', keywords: ['lion', 'king', 'wild', 'animal'] },
    { icon: '🐅', category: 'animals', keywords: ['tiger', 'wild', 'stripes', 'animal'] },
    { icon: '🐆', category: 'animals', keywords: ['leopard', 'spots', 'wild', 'animal'] },
    { icon: '🐴', category: 'animals', keywords: ['horse', 'ride', 'fast', 'animal'] },
    { icon: '🦄', category: 'animals', keywords: ['unicorn', 'magic', 'rainbow', 'animal'] },
    { icon: '🦓', category: 'animals', keywords: ['zebra', 'stripes', 'africa', 'animal'] },
    { icon: '🦌', category: 'animals', keywords: ['deer', 'antlers', 'forest', 'animal'] },
    { icon: '🐂', category: 'animals', keywords: ['ox', 'bull', 'strong', 'animal'] },
    { icon: '🐃', category: 'animals', keywords: ['water', 'buffalo', 'strong', 'animal'] },
    { icon: '🐄', category: 'animals', keywords: ['cow', 'farm', 'milk', 'animal'] },
    { icon: '🐎', category: 'animals', keywords: ['horse', 'race', 'fast', 'animal'] },
    { icon: '🐖', category: 'animals', keywords: ['pig', 'farm', 'pink', 'animal'] },
    { icon: '🐗', category: 'animals', keywords: ['boar', 'wild', 'tusks', 'animal'] },
    { icon: '🐘', category: 'animals', keywords: ['elephant', 'big', 'trunk', 'animal'] },
    { icon: '🦏', category: 'animals', keywords: ['rhinoceros', 'horn', 'big', 'animal'] },
    { icon: '🦛', category: 'animals', keywords: ['hippopotamus', 'water', 'big', 'animal'] },
    { icon: '🐪', category: 'animals', keywords: ['camel', 'desert', 'hump', 'animal'] },
    { icon: '🐫', category: 'animals', keywords: ['two', 'hump', 'camel', 'animal'] },
    { icon: '🦒', category: 'animals', keywords: ['giraffe', 'tall', 'neck', 'animal'] },
    { icon: '🦘', category: 'animals', keywords: ['kangaroo', 'australia', 'jump', 'animal'] },
    { icon: '🐃', category: 'animals', keywords: ['water', 'buffalo', 'strong', 'animal'] },
    { icon: '🐄', category: 'animals', keywords: ['cow', 'farm', 'milk', 'animal'] },
    { icon: '🐎', category: 'animals', keywords: ['horse', 'race', 'fast', 'animal'] },
    { icon: '🐖', category: 'animals', keywords: ['pig', 'farm', 'pink', 'animal'] },
    { icon: '🐗', category: 'animals', keywords: ['boar', 'wild', 'tusks', 'animal'] },
    { icon: '🐘', category: 'animals', keywords: ['elephant', 'big', 'trunk', 'animal'] },
    { icon: '🦏', category: 'animals', keywords: ['rhinoceros', 'horn', 'big', 'animal'] },
    { icon: '🦛', category: 'animals', keywords: ['hippopotamus', 'water', 'big', 'animal'] },
    { icon: '🐪', category: 'animals', keywords: ['camel', 'desert', 'hump', 'animal'] },
    { icon: '🐫', category: 'animals', keywords: ['two', 'hump', 'camel', 'animal'] },
    { icon: '🦒', category: 'animals', keywords: ['giraffe', 'tall', 'neck', 'animal'] },
    { icon: '🦘', category: 'animals', keywords: ['kangaroo', 'australia', 'jump', 'animal'] },
    
    // Птицы
    { icon: '🐦', category: 'animals', keywords: ['bird', 'fly', 'wings', 'animal'] },
    { icon: '🐧', category: 'animals', keywords: ['penguin', 'antarctica', 'cold', 'animal'] },
    { icon: '🐔', category: 'animals', keywords: ['chicken', 'farm', 'egg', 'animal'] },
    { icon: '🐓', category: 'animals', keywords: ['rooster', 'farm', 'crow', 'animal'] },
    { icon: '🦆', category: 'animals', keywords: ['duck', 'water', 'quack', 'animal'] },
    { icon: '🦅', category: 'animals', keywords: ['eagle', 'bird', 'fly', 'animal'] },
    { icon: '🦉', category: 'animals', keywords: ['owl', 'night', 'wise', 'animal'] },
    { icon: '🦇', category: 'animals', keywords: ['bat', 'night', 'fly', 'animal'] },
    { icon: '🦜', category: 'animals', keywords: ['parrot', 'colorful', 'talk', 'animal'] },
    { icon: '🦚', category: 'animals', keywords: ['peacock', 'beautiful', 'feathers', 'animal'] },
    { icon: '🦩', category: 'animals', keywords: ['flamingo', 'pink', 'water', 'animal'] },
    { icon: '🕊️', category: 'animals', keywords: ['dove', 'peace', 'white', 'animal'] },
    { icon: '🐥', category: 'animals', keywords: ['chick', 'baby', 'yellow', 'animal'] },
    { icon: '🐣', category: 'animals', keywords: ['hatching', 'chick', 'egg', 'animal'] },
    { icon: '🐤', category: 'animals', keywords: ['baby', 'chick', 'small', 'animal'] },
    { icon: '🐦', category: 'animals', keywords: ['bird', 'fly', 'wings', 'animal'] },
    { icon: '🐧', category: 'animals', keywords: ['penguin', 'antarctica', 'cold', 'animal'] },
    { icon: '🐔', category: 'animals', keywords: ['chicken', 'farm', 'egg', 'animal'] },
    { icon: '🐓', category: 'animals', keywords: ['rooster', 'farm', 'crow', 'animal'] },
    { icon: '🦆', category: 'animals', keywords: ['duck', 'water', 'quack', 'animal'] },
    { icon: '🦅', category: 'animals', keywords: ['eagle', 'bird', 'fly', 'animal'] },
    { icon: '🦉', category: 'animals', keywords: ['owl', 'night', 'wise', 'animal'] },
    { icon: '🦇', category: 'animals', keywords: ['bat', 'night', 'fly', 'animal'] },
    { icon: '🦜', category: 'animals', keywords: ['parrot', 'colorful', 'talk', 'animal'] },
    { icon: '🦚', category: 'animals', keywords: ['peacock', 'beautiful', 'feathers', 'animal'] },
    { icon: '🦩', category: 'animals', keywords: ['flamingo', 'pink', 'water', 'animal'] },
    { icon: '🕊️', category: 'animals', keywords: ['dove', 'peace', 'white', 'animal'] },
    { icon: '🐥', category: 'animals', keywords: ['chick', 'baby', 'yellow', 'animal'] },
    { icon: '🐣', category: 'animals', keywords: ['hatching', 'chick', 'egg', 'animal'] },
    { icon: '🐤', category: 'animals', keywords: ['baby', 'chick', 'small', 'animal'] },
    
    // Морские животные
    { icon: '🐟', category: 'animals', keywords: ['fish', 'water', 'swim', 'animal'] },
    { icon: '🐠', category: 'animals', keywords: ['tropical', 'fish', 'colorful', 'animal'] },
    { icon: '🐡', category: 'animals', keywords: ['blowfish', 'puffer', 'water', 'animal'] },
    { icon: '🦈', category: 'animals', keywords: ['shark', 'teeth', 'water', 'animal'] },
    { icon: '🐙', category: 'animals', keywords: ['octopus', 'tentacles', 'water', 'animal'] },
    { icon: '🐚', category: 'animals', keywords: ['shell', 'beach', 'spiral', 'animal'] },
    { icon: '🐌', category: 'animals', keywords: ['snail', 'slow', 'shell', 'animal'] },
    { icon: '🦋', category: 'animals', keywords: ['butterfly', 'wings', 'colorful', 'animal'] },
    { icon: '🐛', category: 'animals', keywords: ['bug', 'insect', 'small', 'animal'] },
    { icon: '🐜', category: 'animals', keywords: ['ant', 'small', 'work', 'animal'] },
    { icon: '🐝', category: 'animals', keywords: ['bee', 'honey', 'buzz', 'animal'] },
    { icon: '🦟', category: 'animals', keywords: ['mosquito', 'buzz', 'bite', 'animal'] },
    { icon: '🦗', category: 'animals', keywords: ['cricket', 'chirp', 'jump', 'animal'] },
    { icon: '🕷️', category: 'animals', keywords: ['spider', 'web', 'eight', 'animal'] },
    { icon: '🕸️', category: 'animals', keywords: ['spider', 'web', 'net', 'animal'] },
    { icon: '🦂', category: 'animals', keywords: ['scorpion', 'sting', 'tail', 'animal'] },
    { icon: '🦠', category: 'animals', keywords: ['microbe', 'virus', 'small', 'animal'] },
    { icon: '🐢', category: 'animals', keywords: ['turtle', 'slow', 'shell', 'animal'] },
    { icon: '🦎', category: 'animals', keywords: ['lizard', 'reptile', 'scales', 'animal'] },
    { icon: '🐍', category: 'animals', keywords: ['snake', 'slither', 'reptile', 'animal'] },
    { icon: '🦕', category: 'animals', keywords: ['sauropod', 'dinosaur', 'big', 'animal'] },
    { icon: '🦖', category: 'animals', keywords: ['t-rex', 'dinosaur', 'big', 'animal'] },
    { icon: '🐲', category: 'animals', keywords: ['dragon', 'fire', 'mythical', 'animal'] },
    { icon: '🐉', category: 'animals', keywords: ['dragon', 'chinese', 'mythical', 'animal'] },
    { icon: '🦕', category: 'animals', keywords: ['sauropod', 'dinosaur', 'big', 'animal'] },
    { icon: '🦖', category: 'animals', keywords: ['t-rex', 'dinosaur', 'big', 'animal'] },
    { icon: '🐲', category: 'animals', keywords: ['dragon', 'fire', 'mythical', 'animal'] },
    { icon: '🐉', category: 'animals', keywords: ['dragon', 'chinese', 'mythical', 'animal'] },
    
    // Еда и напитки
    { icon: '🍎', category: 'food', keywords: ['apple', 'fruit', 'healthy', 'food'] },
    { icon: '🍊', category: 'food', keywords: ['orange', 'fruit', 'citrus', 'food'] },
    { icon: '🍋', category: 'food', keywords: ['lemon', 'fruit', 'citrus', 'food'] },
    { icon: '🍌', category: 'food', keywords: ['banana', 'fruit', 'yellow', 'food'] },
    { icon: '🍉', category: 'food', keywords: ['watermelon', 'fruit', 'summer', 'food'] },
    { icon: '🍇', category: 'food', keywords: ['grapes', 'fruit', 'wine', 'food'] },
    { icon: '🍓', category: 'food', keywords: ['strawberry', 'fruit', 'red', 'food'] },
    { icon: '🍈', category: 'food', keywords: ['melon', 'fruit', 'sweet', 'food'] },
    { icon: '🍒', category: 'food', keywords: ['cherry', 'fruit', 'red', 'food'] },
    { icon: '🍑', category: 'food', keywords: ['peach', 'fruit', 'soft', 'food'] },
    { icon: '🥭', category: 'food', keywords: ['mango', 'fruit', 'tropical', 'food'] },
    { icon: '🍍', category: 'food', keywords: ['pineapple', 'fruit', 'tropical', 'food'] },
    { icon: '🥥', category: 'food', keywords: ['coconut', 'fruit', 'tropical', 'food'] },
    { icon: '🥝', category: 'food', keywords: ['kiwi', 'fruit', 'green', 'food'] },
    { icon: '🍅', category: 'food', keywords: ['tomato', 'vegetable', 'red', 'food'] },
    { icon: '🍆', category: 'food', keywords: ['eggplant', 'vegetable', 'purple', 'food'] },
    { icon: '🥑', category: 'food', keywords: ['avocado', 'vegetable', 'green', 'food'] },
    { icon: '🥦', category: 'food', keywords: ['broccoli', 'vegetable', 'green', 'food'] },
    { icon: '🥕', category: 'food', keywords: ['carrot', 'vegetable', 'orange', 'food'] },
    { icon: '🌽', category: 'food', keywords: ['corn', 'vegetable', 'yellow', 'food'] },
    { icon: '🌶️', category: 'food', keywords: ['pepper', 'vegetable', 'spicy', 'food'] },
    { icon: '🫒', category: 'food', keywords: ['olive', 'vegetable', 'green', 'food'] },
    { icon: '🥒', category: 'food', keywords: ['cucumber', 'vegetable', 'green', 'food'] },
    { icon: '🥬', category: 'food', keywords: ['lettuce', 'vegetable', 'green', 'food'] },
    { icon: '🥭', category: 'food', keywords: ['mango', 'fruit', 'tropical', 'food'] },
    { icon: '🍍', category: 'food', keywords: ['pineapple', 'fruit', 'tropical', 'food'] },
    { icon: '🥥', category: 'food', keywords: ['coconut', 'fruit', 'tropical', 'food'] },
    { icon: '🥝', category: 'food', keywords: ['kiwi', 'fruit', 'green', 'food'] },
    { icon: '🍅', category: 'food', keywords: ['tomato', 'vegetable', 'red', 'food'] },
    { icon: '🍆', category: 'food', keywords: ['eggplant', 'vegetable', 'purple', 'food'] },
    { icon: '🥑', category: 'food', keywords: ['avocado', 'vegetable', 'green', 'food'] },
    { icon: '🥦', category: 'food', keywords: ['broccoli', 'vegetable', 'green', 'food'] },
    { icon: '🥕', category: 'food', keywords: ['carrot', 'vegetable', 'orange', 'food'] },
    { icon: '🌽', category: 'food', keywords: ['corn', 'vegetable', 'yellow', 'food'] },
    { icon: '🌶️', category: 'food', keywords: ['pepper', 'vegetable', 'spicy', 'food'] },
    { icon: '🫒', category: 'food', keywords: ['olive', 'vegetable', 'green', 'food'] },
    { icon: '🥒', category: 'food', keywords: ['cucumber', 'vegetable', 'green', 'food'] },
    { icon: '🥬', category: 'food', keywords: ['lettuce', 'vegetable', 'green', 'food'] },
    
    // Напитки
    { icon: '🥤', category: 'food', keywords: ['cup', 'straw', 'drink', 'food'] },
    { icon: '🧃', category: 'food', keywords: ['beverage', 'box', 'drink', 'food'] },
    { icon: '🧉', category: 'food', keywords: ['mate', 'drink', 'herbal', 'food'] },
    { icon: '🧊', category: 'food', keywords: ['ice', 'cube', 'cold', 'food'] },
    { icon: '🥢', category: 'food', keywords: ['chopsticks', 'eating', 'asian', 'food'] },
    { icon: '🍽️', category: 'food', keywords: ['plate', 'fork', 'knife', 'food'] },
    { icon: '🍴', category: 'food', keywords: ['fork', 'knife', 'eating', 'food'] },
    { icon: '🥄', category: 'food', keywords: ['spoon', 'eating', 'soup', 'food'] },
    { icon: '🔪', category: 'food', keywords: ['knife', 'cutting', 'sharp', 'food'] },
    { icon: '🏺', category: 'food', keywords: ['amphora', 'vase', 'ancient', 'food'] },
    { icon: '🥤', category: 'food', keywords: ['cup', 'straw', 'drink', 'food'] },
    { icon: '🧃', category: 'food', keywords: ['beverage', 'box', 'drink', 'food'] },
    { icon: '🧉', category: 'food', keywords: ['mate', 'drink', 'herbal', 'food'] },
    { icon: '🧊', category: 'food', keywords: ['ice', 'cube', 'cold', 'food'] },
    { icon: '🥢', category: 'food', keywords: ['chopsticks', 'eating', 'asian', 'food'] },
    { icon: '🍽️', category: 'food', keywords: ['plate', 'fork', 'knife', 'food'] },
    { icon: '🍴', category: 'food', keywords: ['fork', 'knife', 'eating', 'food'] },
    { icon: '🥄', category: 'food', keywords: ['spoon', 'eating', 'soup', 'food'] },
    { icon: '🔪', category: 'food', keywords: ['knife', 'cutting', 'sharp', 'food'] },
    { icon: '🏺', category: 'food', keywords: ['amphora', 'vase', 'ancient', 'food'] },
    
    // Транспорт
    { icon: '🚗', category: 'transport', keywords: ['car', 'vehicle', 'drive', 'transport'] },
    { icon: '🚕', category: 'transport', keywords: ['taxi', 'car', 'yellow', 'transport'] },
    { icon: '🚙', category: 'transport', keywords: ['suv', 'car', 'big', 'transport'] },
    { icon: '🚌', category: 'transport', keywords: ['bus', 'public', 'transport', 'transport'] },
    { icon: '🚎', category: 'transport', keywords: ['trolleybus', 'electric', 'transport', 'transport'] },
    { icon: '🏎️', category: 'transport', keywords: ['race', 'car', 'fast', 'transport'] },
    { icon: '🚓', category: 'transport', keywords: ['police', 'car', 'blue', 'transport'] },
    { icon: '🚑', category: 'transport', keywords: ['ambulance', 'medical', 'emergency', 'transport'] },
    { icon: '🚒', category: 'transport', keywords: ['fire', 'truck', 'red', 'transport'] },
    { icon: '🚐', category: 'transport', keywords: ['minibus', 'van', 'small', 'transport'] },
    { icon: '🛻', category: 'transport', keywords: ['pickup', 'truck', 'work', 'transport'] },
    { icon: '🚚', category: 'transport', keywords: ['truck', 'delivery', 'big', 'transport'] },
    { icon: '🚛', category: 'transport', keywords: ['articulated', 'lorry', 'big', 'transport'] },
    { icon: '🚜', category: 'transport', keywords: ['tractor', 'farm', 'work', 'transport'] },
    { icon: '🏍️', category: 'transport', keywords: ['motorcycle', 'bike', 'fast', 'transport'] },
    { icon: '🛵', category: 'transport', keywords: ['scooter', 'motor', 'small', 'transport'] },
    { icon: '🛺', category: 'transport', keywords: ['auto', 'rickshaw', 'three', 'transport'] },
    { icon: '🚲', category: 'transport', keywords: ['bicycle', 'bike', 'pedal', 'transport'] },
    { icon: '🛴', category: 'transport', keywords: ['kick', 'scooter', 'push', 'transport'] },
    { icon: '🛹', category: 'transport', keywords: ['skateboard', 'wheels', 'sport', 'transport'] },
    { icon: '🛼', category: 'transport', keywords: ['roller', 'skate', 'wheels', 'transport'] },
    { icon: '🚁', category: 'transport', keywords: ['helicopter', 'rotor', 'fly', 'transport'] },
    { icon: '✈️', category: 'transport', keywords: ['airplane', 'plane', 'fly', 'transport'] },
    { icon: '🛩️', category: 'transport', keywords: ['small', 'airplane', 'fly', 'transport'] },
    { icon: '🛫', category: 'transport', keywords: ['airplane', 'departure', 'takeoff', 'transport'] },
    { icon: '🛬', category: 'transport', keywords: ['airplane', 'arrival', 'landing', 'transport'] },
    { icon: '🪂', category: 'transport', keywords: ['parachute', 'jump', 'sky', 'transport'] },
    { icon: '💺', category: 'transport', keywords: ['seat', 'chair', 'sitting', 'transport'] },
    { icon: '🚀', category: 'transport', keywords: ['rocket', 'space', 'launch', 'transport'] },
    { icon: '🛸', category: 'transport', keywords: ['flying', 'saucer', 'ufo', 'transport'] },
    { icon: '🚉', category: 'transport', keywords: ['station', 'train', 'railway', 'transport'] },
    { icon: '🚞', category: 'transport', keywords: ['mountain', 'railway', 'train', 'transport'] },
    { icon: '🚝', category: 'transport', keywords: ['monorail', 'train', 'single', 'transport'] },
    { icon: '🚄', category: 'transport', keywords: ['high', 'speed', 'train', 'transport'] },
    { icon: '🚅', category: 'transport', keywords: ['bullet', 'train', 'fast', 'transport'] },
    { icon: '🚈', category: 'transport', keywords: ['light', 'rail', 'train', 'transport'] },
    { icon: '🚂', category: 'transport', keywords: ['steam', 'locomotive', 'train', 'transport'] },
    { icon: '🚃', category: 'transport', keywords: ['railway', 'car', 'train', 'transport'] },
    { icon: '🚋', category: 'transport', keywords: ['tram', 'car', 'electric', 'transport'] },
    { icon: '🚍', category: 'transport', keywords: ['oncoming', 'bus', 'public', 'transport'] },
    { icon: '🚘', category: 'transport', keywords: ['oncoming', 'automobile', 'car', 'transport'] },
    { icon: '🚖', category: 'transport', keywords: ['oncoming', 'taxi', 'car', 'transport'] },
    { icon: '🚡', category: 'transport', keywords: ['aerial', 'tramway', 'cable', 'transport'] },
    { icon: '🚠', category: 'transport', keywords: ['mountain', 'cableway', 'cable', 'transport'] },
    { icon: '🚟', category: 'transport', keywords: ['suspension', 'railway', 'cable', 'transport'] },
    { icon: '🎠', category: 'transport', keywords: ['carousel', 'horse', 'merry', 'transport'] },
    { icon: '🎡', category: 'transport', keywords: ['ferris', 'wheel', 'amusement', 'transport'] },
    { icon: '🎢', category: 'transport', keywords: ['roller', 'coaster', 'amusement', 'transport'] },
    { icon: '🚏', category: 'transport', keywords: ['bus', 'stop', 'station', 'transport'] },
    { icon: '⛽', category: 'transport', keywords: ['fuel', 'pump', 'gas', 'transport'] },
    { icon: '🚨', category: 'transport', keywords: ['police', 'car', 'light', 'transport'] },
    { icon: '🚥', category: 'transport', keywords: ['horizontal', 'traffic', 'light', 'transport'] },
    { icon: '🚦', category: 'transport', keywords: ['vertical', 'traffic', 'light', 'transport'] },
    { icon: '🛑', category: 'transport', keywords: ['stop', 'sign', 'red', 'transport'] },
    { icon: '🚧', category: 'transport', keywords: ['construction', 'sign', 'work', 'transport'] },
    
    // Эмоции и лица
    { icon: '😀', category: 'emotions', keywords: ['grinning', 'face', 'happy', 'emotion'] },
    { icon: '😃', category: 'emotions', keywords: ['grinning', 'face', 'big', 'eyes', 'emotion'] },
    { icon: '😄', category: 'emotions', keywords: ['grinning', 'face', 'smiling', 'eyes', 'emotion'] },
    { icon: '😁', category: 'emotions', keywords: ['beaming', 'face', 'smiling', 'eyes', 'emotion'] },
    { icon: '😆', category: 'emotions', keywords: ['grinning', 'squinting', 'face', 'emotion'] },
    { icon: '😅', category: 'emotions', keywords: ['grinning', 'face', 'sweat', 'emotion'] },
    { icon: '🤣', category: 'emotions', keywords: ['rolling', 'floor', 'laughing', 'emotion'] },
    { icon: '😂', category: 'emotions', keywords: ['face', 'tears', 'joy', 'emotion'] },
    { icon: '🙂', category: 'emotions', keywords: ['slightly', 'smiling', 'face', 'emotion'] },
    { icon: '🙃', category: 'emotions', keywords: ['upside', 'down', 'face', 'emotion'] },
    { icon: '😉', category: 'emotions', keywords: ['winking', 'face', 'wink', 'emotion'] },
    { icon: '😊', category: 'emotions', keywords: ['smiling', 'face', 'smiling', 'eyes', 'emotion'] },
    { icon: '😇', category: 'emotions', keywords: ['smiling', 'face', 'halo', 'emotion'] },
    { icon: '🥰', category: 'emotions', keywords: ['smiling', 'face', 'hearts', 'emotion'] },
    { icon: '😍', category: 'emotions', keywords: ['smiling', 'face', 'heart', 'eyes', 'emotion'] },
    { icon: '🤩', category: 'emotions', keywords: ['star', 'struck', 'face', 'emotion'] },
    { icon: '😘', category: 'emotions', keywords: ['face', 'blowing', 'kiss', 'emotion'] },
    { icon: '😗', category: 'emotions', keywords: ['kissing', 'face', 'kiss', 'emotion'] },
    { icon: '☺️', category: 'emotions', keywords: ['smiling', 'face', 'smile', 'emotion'] },
    { icon: '😚', category: 'emotions', keywords: ['kissing', 'face', 'closed', 'eyes', 'emotion'] },
    { icon: '😙', category: 'emotions', keywords: ['kissing', 'face', 'smiling', 'eyes', 'emotion'] },
    { icon: '😋', category: 'emotions', keywords: ['face', 'savoring', 'food', 'emotion'] },
    { icon: '😛', category: 'emotions', keywords: ['face', 'tongue', 'stuck', 'out', 'emotion'] },
    { icon: '😜', category: 'emotions', keywords: ['winking', 'face', 'tongue', 'emotion'] },
    { icon: '🤪', category: 'emotions', keywords: ['zany', 'face', 'crazy', 'emotion'] },
    { icon: '😝', category: 'emotions', keywords: ['squinting', 'face', 'tongue', 'emotion'] },
    { icon: '🤑', category: 'emotions', keywords: ['money', 'mouth', 'face', 'emotion'] },
    { icon: '🤗', category: 'emotions', keywords: ['hugging', 'face', 'hug', 'emotion'] },
    { icon: '🤭', category: 'emotions', keywords: ['face', 'hand', 'over', 'mouth', 'emotion'] },
    { icon: '🤫', category: 'emotions', keywords: ['shushing', 'face', 'quiet', 'emotion'] },
    { icon: '🤔', category: 'emotions', keywords: ['thinking', 'face', 'think', 'emotion'] },
    { icon: '🤐', category: 'emotions', keywords: ['zipper', 'mouth', 'face', 'emotion'] },
    { icon: '🤨', category: 'emotions', keywords: ['face', 'raised', 'eyebrow', 'emotion'] },
    { icon: '😐', category: 'emotions', keywords: ['neutral', 'face', 'neutral', 'emotion'] },
    { icon: '😑', category: 'emotions', keywords: ['expressionless', 'face', 'blank', 'emotion'] },
    { icon: '😶', category: 'emotions', keywords: ['face', 'without', 'mouth', 'emotion'] },
    { icon: '😏', category: 'emotions', keywords: ['smirking', 'face', 'smirk', 'emotion'] },
    { icon: '😒', category: 'emotions', keywords: ['unamused', 'face', 'bored', 'emotion'] },
    { icon: '🙄', category: 'emotions', keywords: ['face', 'rolling', 'eyes', 'emotion'] },
    { icon: '😬', category: 'emotions', keywords: ['grimacing', 'face', 'grimace', 'emotion'] },
    { icon: '🤥', category: 'emotions', keywords: ['lying', 'face', 'lie', 'emotion'] },
    { icon: '😔', category: 'emotions', keywords: ['pensive', 'face', 'sad', 'emotion'] },
    { icon: '😪', category: 'emotions', keywords: ['sleepy', 'face', 'tired', 'emotion'] },
    { icon: '🤤', category: 'emotions', keywords: ['drooling', 'face', 'drool', 'emotion'] },
    { icon: '😴', category: 'emotions', keywords: ['sleeping', 'face', 'sleep', 'emotion'] },
    { icon: '😷', category: 'emotions', keywords: ['face', 'medical', 'mask', 'emotion'] },
    { icon: '🤒', category: 'emotions', keywords: ['face', 'thermometer', 'sick', 'emotion'] },
    { icon: '🤕', category: 'emotions', keywords: ['face', 'bandage', 'hurt', 'emotion'] },
    { icon: '🤢', category: 'emotions', keywords: ['nauseated', 'face', 'sick', 'emotion'] },
    { icon: '🤮', category: 'emotions', keywords: ['face', 'vomiting', 'sick', 'emotion'] },
    { icon: '🤧', category: 'emotions', keywords: ['sneezing', 'face', 'sneeze', 'emotion'] },
    { icon: '🥵', category: 'emotions', keywords: ['hot', 'face', 'hot', 'emotion'] },
    { icon: '🥶', category: 'emotions', keywords: ['cold', 'face', 'cold', 'emotion'] },
    { icon: '🥴', category: 'emotions', keywords: ['woozy', 'face', 'dizzy', 'emotion'] },
    { icon: '😵', category: 'emotions', keywords: ['knocked', 'out', 'face', 'emotion'] },
    { icon: '🤯', category: 'emotions', keywords: ['exploding', 'head', 'mind', 'emotion'] },
    { icon: '🤠', category: 'emotions', keywords: ['cowboy', 'hat', 'face', 'emotion'] },
    { icon: '🥳', category: 'emotions', keywords: ['partying', 'face', 'party', 'emotion'] },
    { icon: '🥸', category: 'emotions', keywords: ['disguised', 'face', 'disguise', 'emotion'] },
    { icon: '😎', category: 'emotions', keywords: ['smiling', 'face', 'sunglasses', 'emotion'] },
    { icon: '🤓', category: 'emotions', keywords: ['nerd', 'face', 'nerd', 'emotion'] },
    { icon: '🧐', category: 'emotions', keywords: ['face', 'monocle', 'monocle', 'emotion'] },
    { icon: '😕', category: 'emotions', keywords: ['confused', 'face', 'confused', 'emotion'] },
    { icon: '😟', category: 'emotions', keywords: ['worried', 'face', 'worried', 'emotion'] },
    { icon: '🙁', category: 'emotions', keywords: ['slightly', 'frowning', 'face', 'emotion'] },
    { icon: '☹️', category: 'emotions', keywords: ['frowning', 'face', 'sad', 'emotion'] },
    { icon: '😮', category: 'emotions', keywords: ['face', 'open', 'mouth', 'emotion'] },
    { icon: '😯', category: 'emotions', keywords: ['hushed', 'face', 'surprised', 'emotion'] },
    { icon: '😲', category: 'emotions', keywords: ['astonished', 'face', 'shocked', 'emotion'] },
    { icon: '😳', category: 'emotions', keywords: ['flushed', 'face', 'embarrassed', 'emotion'] },
    { icon: '🥺', category: 'emotions', keywords: ['pleading', 'face', 'plead', 'emotion'] },
    { icon: '😦', category: 'emotions', keywords: ['frowning', 'face', 'open', 'mouth', 'emotion'] },
    { icon: '😧', category: 'emotions', keywords: ['anguished', 'face', 'pain', 'emotion'] },
    { icon: '😨', category: 'emotions', keywords: ['fearful', 'face', 'scared', 'emotion'] },
    { icon: '😰', category: 'emotions', keywords: ['anxious', 'face', 'sweat', 'emotion'] },
    { icon: '😥', category: 'emotions', keywords: ['sad', 'relieved', 'face', 'emotion'] },
    { icon: '😢', category: 'emotions', keywords: ['crying', 'face', 'cry', 'emotion'] },
    { icon: '😭', category: 'emotions', keywords: ['loudly', 'crying', 'face', 'emotion'] },
    { icon: '😱', category: 'emotions', keywords: ['face', 'screaming', 'fear', 'emotion'] },
    { icon: '😖', category: 'emotions', keywords: ['confounded', 'face', 'confused', 'emotion'] },
    { icon: '😣', category: 'emotions', keywords: ['persevering', 'face', 'struggle', 'emotion'] },
    { icon: '😞', category: 'emotions', keywords: ['disappointed', 'face', 'sad', 'emotion'] },
    { icon: '😓', category: 'emotions', keywords: ['downcast', 'face', 'sweat', 'emotion'] },
    { icon: '😩', category: 'emotions', keywords: ['weary', 'face', 'tired', 'emotion'] },
    { icon: '😫', category: 'emotions', keywords: ['tired', 'face', 'exhausted', 'emotion'] },
    { icon: '🥱', category: 'emotions', keywords: ['yawning', 'face', 'yawn', 'emotion'] },
    { icon: '😤', category: 'emotions', keywords: ['face', 'steam', 'nose', 'emotion'] },
    { icon: '😡', category: 'emotions', keywords: ['pouting', 'face', 'angry', 'emotion'] },
    { icon: '😠', category: 'emotions', keywords: ['angry', 'face', 'mad', 'emotion'] },
    { icon: '🤬', category: 'emotions', keywords: ['face', 'symbols', 'mouth', 'emotion'] },
    { icon: '😈', category: 'emotions', keywords: ['smiling', 'face', 'horns', 'emotion'] },
    { icon: '👿', category: 'emotions', keywords: ['angry', 'face', 'horns', 'emotion'] },
    { icon: '💀', category: 'emotions', keywords: ['skull', 'death', 'dead', 'emotion'] },
    { icon: '☠️', category: 'emotions', keywords: ['skull', 'crossbones', 'death', 'emotion'] },
    { icon: '💩', category: 'emotions', keywords: ['pile', 'poo', 'poop', 'emotion'] },
    { icon: '🤡', category: 'emotions', keywords: ['clown', 'face', 'clown', 'emotion'] },
    { icon: '👹', category: 'emotions', keywords: ['ogre', 'monster', 'japanese', 'emotion'] },
    { icon: '👺', category: 'emotions', keywords: ['goblin', 'monster', 'japanese', 'emotion'] },
    { icon: '👻', category: 'emotions', keywords: ['ghost', 'spooky', 'halloween', 'emotion'] },
    { icon: '👽', category: 'emotions', keywords: ['alien', 'monster', 'ufo', 'emotion'] },
    { icon: '👾', category: 'emotions', keywords: ['alien', 'monster', 'video', 'emotion'] },
    { icon: '🤖', category: 'emotions', keywords: ['robot', 'face', 'robot', 'emotion'] },
    { icon: '😺', category: 'emotions', keywords: ['grinning', 'cat', 'face', 'emotion'] },
    { icon: '😸', category: 'emotions', keywords: ['grinning', 'cat', 'smiling', 'eyes', 'emotion'] },
    { icon: '😹', category: 'emotions', keywords: ['cat', 'face', 'tears', 'joy', 'emotion'] },
    { icon: '😻', category: 'emotions', keywords: ['smiling', 'cat', 'heart', 'eyes', 'emotion'] },
    { icon: '😼', category: 'emotions', keywords: ['cat', 'wry', 'smile', 'emotion'] },
    { icon: '😽', category: 'emotions', keywords: ['kissing', 'cat', 'face', 'emotion'] },
    { icon: '🙀', category: 'emotions', keywords: ['weary', 'cat', 'face', 'emotion'] },
    { icon: '😿', category: 'emotions', keywords: ['crying', 'cat', 'face', 'emotion'] },
    { icon: '😾', category: 'emotions', keywords: ['pouting', 'cat', 'face', 'emotion'] },
    { icon: '🙈', category: 'emotions', keywords: ['see', 'no', 'evil', 'monkey', 'emotion'] },
    { icon: '🙉', category: 'emotions', keywords: ['hear', 'no', 'evil', 'monkey', 'emotion'] },
    { icon: '🙊', category: 'emotions', keywords: ['speak', 'no', 'evil', 'monkey', 'emotion'] },
  ]

  // Фильтрация иконок по поисковому запросу
  const filteredIcons = iconsWithCategories.filter(item => {
    if (iconSearchQuery === '') return true
    
    const query = iconSearchQuery.toLowerCase()
    return item.keywords.some(keyword => keyword.includes(query)) ||
           item.category.includes(query) ||
           item.icon.includes(query)
  }).map(item => item.icon)

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const handleNext = () => {
    setAnswer('selectedActivities', selectedActivities)
    router.push('/procedures/1')
  }

  const handlePromptSubmit = () => {
    // Здесь можно добавить логику обработки промпта
    console.log('Prompt text:', promptText)
    console.log('Selected templates:', selectedTemplates)
    setIsPromptModalOpen(false)
    setPromptText('')
    setSelectedTemplates([])
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }


  const handleNewActivityChange = (field: string, value: string) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку для этого поля
    if (activityErrors[field as keyof typeof activityErrors]) {
      setActivityErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Функция для изменения полей новой категории
  const handleNewCategoryChange = (field: string, value: string) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Функция для создания новой процедуры
  const handleCreateActivity = () => {
    // Валидация полей
    const errors = {
      name: !newActivity.name ? 'Name is required' : '',
      category: !newActivity.category ? 'Category is required' : '',
      color: !newActivity.color ? 'Color is required' : '',
      icon: !newActivity.icon ? 'Icon is required' : ''
    }
    
    setActivityErrors(errors)
    
    if (!newActivity.name || !newActivity.category || !newActivity.color || !newActivity.icon) {
      console.log('Missing required fields:', newActivity)
      return
    }

    // Создаем новую процедуру
    const newActivityData = {
      id: `custom-${Date.now()}`,
      name: newActivity.name,
      icon: newActivity.icon,
      color: newActivity.color, // Сохраняем как есть, без bg-[]
      bgColor: `rgba(${hexToRgb(newActivity.color).join(',')},0.2)`, // Сохраняем как RGBA строку
      aiRecommended: false,
      note: newActivity.note
    }
    
    console.log('Creating activity with color:', newActivity.color, 'bgColor:', newActivityData.bgColor)

    // Добавляем процедуру в соответствующую категорию
    const categoryMapping: { [key: string]: string } = {
      'Skin': 'skin',
      'Hair': 'hair', 
      'Physical health': 'physical',
      'Mental Wellness': 'mental'
    }
    
    // Для новых категорий создаем ключ из названия
    const categoryKey = categoryMapping[newActivity.category] || 
      newActivity.category.toLowerCase().replace(/\s+/g, '')
    
    console.log('Creating activity:', newActivityData, 'in category:', categoryKey)
    
    setActivities(prev => {
      const newState = {
        ...prev,
        [categoryKey]: [...((prev as any)[categoryKey] || []), newActivityData]
      }
      console.log('New activities state:', newState)
      return newState
    })

    // Сбрасываем форму и ошибки
    setNewActivity({
      name: '',
      note: '',
      category: '',
      color: '',
      icon: ''
    })
    
    setActivityErrors({
      name: '',
      category: '',
      color: '',
      icon: ''
    })

    // Закрываем модальное окно
    setIsCreateActivityModalOpen(false)
  }

  // Функция для создания новой категории
  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.color || !newCategory.icon) {
      return
    }

    // Добавляем новую категорию в список
    setCategories(prev => [...prev, newCategory.name])

    // Создаем новую категорию в activities
    const categoryKey = newCategory.name.toLowerCase().replace(/\s+/g, '')
    setActivities(prev => ({
      ...prev,
      [categoryKey]: []
    }))

    console.log('Created new category:', newCategory.name, 'with key:', categoryKey)

    // Автоматически выбираем новую категорию в форме создания процедуры
    setNewActivity(prev => ({
      ...prev,
      category: newCategory.name
    }))

    // Сбрасываем форму категории
    setNewCategory({
      name: '',
      color: '',
      icon: ''
    })

    // Закрываем модальное окно создания категории
    setIsCreateCategoryModalOpen(false)
  }

  // Функция для конвертации HEX в RGB
  const hexToRgb = (hex: string) => {
    console.log('Converting hex to RGB:', hex)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    const rgb = result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]
    console.log('RGB result:', rgb)
    return rgb
  }

  const getColorFromPosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY
    
    // Вычисляем расстояние от центра
    const distance = Math.sqrt(x * x + y * y)
    const maxRadius = rect.width / 2 - 32 // Учитываем белый центр
    
    // Если клик внутри белого центра, не выбираем цвет
    if (distance < 32) return null
    
    // Нормализуем расстояние для насыщенности (0-1)
    const saturation = Math.min(distance / maxRadius, 1)
    
    // Вычисляем угол (начинаем с 0 градусов вверху)
    const angle = (Math.atan2(y, x) * (180 / Math.PI) + 90 + 360) % 360
    
    // Конвертируем в HSL
    const hue = angle
    const lightness = 0.5 // Фиксированная яркость для ярких цветов
    
    return `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`
  }

  const handleColorPickerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const color = getColorFromPosition(e)
    if (color) {
      handleNewActivityChange('color', color)
    }
  }

  const handleColorPickerMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const color = getColorFromPosition(e)
      if (color) {
        handleNewActivityChange('color', color)
      }
    }
  }

  const handleColorPickerClick = (e: React.MouseEvent) => {
    const color = getColorFromPosition(e)
    if (color) {
      handleColorSelect(color)
    }
  }

  const handleColorPickerMouseUp = () => {
    setIsDragging(false)
  }

  // Функция для конвертации HSL в HEX
  const hslToHex = (hsl: string) => {
    if (!hsl.startsWith('hsl')) return hsl
    
    const matches = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!matches) return hsl
    
    const h = parseInt(matches[1]) / 360
    const s = parseInt(matches[2]) / 100
    const l = parseInt(matches[3]) / 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const handleColorSelect = (color: string) => {
    // Конвертируем HSL в HEX для лучшего сравнения
    const hexColor = hslToHex(color)
    if (isCreateCategoryModalOpen) {
      handleNewCategoryChange('color', hexColor)
    } else {
      handleNewActivityChange('color', hexColor)
    }
    // НЕ закрываем палитру автоматически - пользователь сам нажмет Done
  }


  const handleIconPickerOpen = () => {
    setIsIconPickerOpen(true)
    setIconSearchQuery('') // Сбрасываем поиск при открытии
  }

  // Маппинг ключей категорий на отображаемые названия
  const categoryDisplayNames: Record<string, string> = {
    'skin': 'Skin',
    'hair': 'Hair',
    'physical': 'Physical health',
    'mental': 'Mental Wellness',
    // Для новых категорий используем название как есть
  }

  // Создаем динамический filteredActivities на основе всех доступных категорий
  const filteredActivities = Object.keys(activities).reduce((acc, categoryKey) => {
    acc[categoryKey] = ((activities as any)[categoryKey] || []).filter((activity: any) => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
      <div className="w-11/12 max-w-xl">
      {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <button 
            onClick={() => router.back()}
            className="w-7 h-7 flex items-center justify-center"
          >
            <span className="text-black text-xl">‹</span>
          </button>
          <h1 className="text-2xl font-bold text-[#5C4688]">Choose Activities</h1>
          <button 
            onClick={() => setIsCreateActivityModalOpen(true)}
            className="w-10 h-10 bg-white border-2 border-[#A385E9] rounded-full flex items-center justify-center hover:bg-[#A385E9] hover:text-white transition-all duration-200 shadow-sm"
          >
            <span className="text-[#A385E9] text-xl font-medium">+</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-[#969AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
                placeholder="Type something"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[70px] pl-10 pr-4 bg-white border border-[#969AB7] rounded-lg text-gray-900 placeholder-[#969AB7] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
            </div>
          <button
              onClick={() => setIsPromptModalOpen(true)}
              className="px-6 py-3 bg-[#A385E9] text-white rounded-lg font-medium hover:bg-[#906fe2] transition-colors whitespace-nowrap"
          >
              Use prompt
          </button>
          </div>
        </div>

             {/* Activities List */}
             <div className="flex-1 px-6 pb-24">
               {/* Dynamic Categories */}
               {Object.entries(filteredActivities).map(([categoryKey, activitiesList]) => {
                 if (activitiesList.length === 0) return null
                 
                 const displayName = categoryDisplayNames[categoryKey] || 
                   categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)
                 
                 return (
                   <div key={categoryKey} className="mb-6">
                     <h3 className="text-sm text-[#969AB7] mb-3">{displayName}</h3>
                     <div className="space-y-3">
                       {activitiesList.map((activity) => (
                         <button
                           key={activity.id}
                           onClick={() => handleActivityToggle(activity.id)}
                           className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                             selectedActivities.includes(activity.id) 
                               ? 'hover:opacity-80' 
                               : 'hover:opacity-80 opacity-50'
                           }`}
                           style={{ 
                             backgroundColor: extractRgbaFromClass(activity.bgColor)
                           }}
                         >
                           <ActivityIcon icon={activity.icon} color={activity.color} />
                           <div className="ml-3 flex-1 text-left">
                             <div className="text-[#5C4688] font-medium text-base">{activity.name}</div>
                             {activity.aiRecommended && (
                               <div className="text-xs font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent">
                                 AI recommendation for you
                               </div>
                             )}
                           </div>
                           {selectedActivities.includes(activity.id) && (
                             <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                               <span className="text-white text-sm">✓</span>
                             </div>
                           )}
                         </button>
                       ))}
                     </div>
                   </div>
                 )
               })}
             </div>

             {/* Next Button */}
             <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#F5F5F5]">
               <div className="w-11/12 max-w-xl mx-auto">
        <button
          onClick={handleNext}
          disabled={selectedActivities.length === 0}
                   className={`w-full py-4 rounded-xl font-semibold text-sm transition-colors ${
                     selectedActivities.length > 0
                       ? 'bg-[#A385E9] text-white hover:bg-[#906fe2]'
                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   }`}
        >
          Next
        </button>
      </div>
        </div>
      </div>

      {/* Prompt Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#5C4688]">Create Custom Schedule</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#A385E9] to-[#906fe2] rounded-full mt-2"></div>
              </div>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
        </button>
      </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border border-purple-100">
              <p className="text-gray-700 text-sm leading-relaxed">
                Describe what procedures and how often you want to do, and we'll create a personalized schedule for you, or choose from our ready-made templates.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Describe your ideal routine:
              </label>
              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g., I want to do morning skincare routine with cleansing and moisturizing, evening routine with exfoliation twice a week, and yoga 3 times a week..."
                  className="w-full h-28 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent transition-all duration-200 placeholder-gray-400 scrollbar-hide text-gray-900"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                  {promptText.length}/500
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Or choose from templates (multiple selection):
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                      selectedTemplates.includes(template.id)
                        ? 'border-[#A385E9] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">{template.name}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{template.description}</div>
                      </div>
                      {selectedTemplates.includes(template.id) && (
                        <div className="w-4 h-4 bg-[#A385E9] rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedTemplates.length > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  Selected: {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A385E9] to-[#906fe2] text-white rounded-xl hover:from-[#906fe2] hover:to-[#7c5fb8] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#5C4688]">Create New Activity</h2>
              <button
                onClick={() => setIsCreateActivityModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task name</label>
            <input
              type="text"
                  value={newActivity.name}
                  onChange={(e) => handleNewActivityChange('name', e.target.value)}
                  placeholder="Type the name"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm text-gray-900 ${
                    activityErrors.name ? 'border-red-500' : 'border-purple-200'
                  }`}
                />
                {activityErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.name}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={newActivity.note}
                  onChange={(e) => handleNewActivityChange('note', e.target.value)}
                  placeholder="Type the note here..."
                  className="w-full h-16 p-2 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm scrollbar-hide text-gray-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => {
                    if (e.target.value === 'add-new-category') {
                      setIsCreateCategoryModalOpen(true)
                    } else {
                      handleNewActivityChange('category', e.target.value)
                    }
                  }}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm text-gray-900 bg-white ${
                    activityErrors.category ? 'border-red-500' : 'border-purple-200'
                  }`}
                >
                  <option value="" className="text-gray-500">Choose category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-gray-900">{category}</option>
                  ))}
                  <option value="add-new-category" className="text-[#A385E9] font-medium">+ Add new category</option>
                </select>
                {activityErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.category}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className={`flex gap-1 p-2 border rounded-lg ${
                  activityErrors.color ? 'border-red-500' : 'border-purple-200'
                }`}>
                  {/* Показываем все предустановленные цвета */}
                  {colors.map((color) => {
                    // Простое сравнение цветов
                    const isSelected = newActivity.color === color.value
                    
                    return (
              <button
                        key={color.id}
                        onClick={() => handleNewActivityChange('color', color.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-[#A385E9] scale-110 ring-2 ring-[#A385E9] ring-opacity-50 shadow-lg'
                            : 'border-gray-300 hover:scale-105 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    )
                  })}
                  
                  {/* Показываем выбранный цвет, если он не в предустановленных */}
                  {newActivity.color && !colors.some(c => c.value === newActivity.color) && (
                    <button
                      onClick={() => handleNewActivityChange('color', newActivity.color)}
                      className="w-7 h-7 rounded-full border-2 border-[#A385E9] scale-110 ring-2 ring-[#A385E9] ring-opacity-50 shadow-lg transition-all duration-200"
                      style={{ backgroundColor: newActivity.color }}
                      title="Selected color"
                    />
                  )}
                  <button
                    onClick={() => setIsColorPickerOpen(true)}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
                {activityErrors.color && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.color}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className={`flex gap-1 p-2 border rounded-lg ${
                  activityErrors.icon ? 'border-red-500' : 'border-purple-200'
                }`}>
                  {icons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => handleNewActivityChange('icon', icon.icon)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 box-border ${
                        newActivity.icon === icon.icon
                          ? 'ring-2 ring-[#A385E9] ring-offset-1 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: newActivity.color || '#A385E9' 
                      }}
                    >
                      {icon.icon}
                    </button>
                  ))}
                  
                  {/* Показываем выбранную иконку, если она не в предустановленных */}
                  {newActivity.icon && !icons.some(i => i.icon === newActivity.icon) && (
                    <button
                      onClick={() => handleNewActivityChange('icon', newActivity.icon)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 ring-2 ring-[#A385E9] ring-offset-1 scale-110 box-border"
                      style={{ 
                        backgroundColor: newActivity.color || '#A385E9' 
                      }}
                      title="Selected icon"
                    >
                      {newActivity.icon}
                    </button>
                  )}
                  
                  <button
                    onClick={handleIconPickerOpen}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200 box-border"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
                {activityErrors.icon && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.icon}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreateActivityModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                className="flex-1 px-4 py-2 bg-[#A385E9] text-white rounded-lg hover:bg-[#906fe2] transition-colors text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {isColorPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#5C4688]">Choose Color</h3>
              <button
                onClick={() => setIsColorPickerOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative w-80 h-80">
                <div 
                  className="w-full h-full rounded-full cursor-crosshair relative overflow-hidden select-none"
                  style={{
                    background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)'
                  }}
                  onMouseDown={handleColorPickerMouseDown}
                  onMouseMove={handleColorPickerMouseMove}
                  onMouseUp={handleColorPickerMouseUp}
                  onMouseLeave={handleColorPickerMouseUp}
                  onClick={handleColorPickerClick}
                >
                  {/* Белый центр */}
                  <div className="absolute inset-8 bg-white rounded-full"></div>
                  
                  {/* Превью выбранного цвета в центре */}
                  {newActivity.color && (
                    <div 
                      className="absolute w-16 h-16 rounded-full border-4 border-white shadow-lg pointer-events-none"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: newActivity.color
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsColorPickerOpen(false)}
                className="px-8 py-3 bg-[#A385E9] text-white rounded-xl hover:bg-[#906fe2] transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-8 pb-4">
              <h3 className="text-xl font-bold text-[#5C4688]">Choose Icon</h3>
              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Поиск по иконкам */}
            <div className="px-8 pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-8 gap-3">
                {filteredIcons.map((icon, index) => (
                  <button
                    key={index}
                onClick={() => {
                      if (isCreateCategoryModalOpen) {
                        handleNewCategoryChange('icon', icon)
                      } else {
                        handleNewActivityChange('icon', icon)
                      }
                    }}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 text-2xl ${
                      (isCreateCategoryModalOpen ? newCategory.icon : newActivity.icon) === icon
                        ? 'text-white ring-2 ring-[#A385E9] ring-offset-1 scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: (isCreateCategoryModalOpen ? newCategory.icon : newActivity.icon) === icon 
                        ? (isCreateCategoryModalOpen ? (newCategory.color || '#A385E9') : (newActivity.color || '#A385E9'))
                        : '#f3f4f6'
                    }}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center p-8 pt-4">
              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="px-8 py-3 bg-[#A385E9] text-white rounded-xl hover:bg-[#906fe2] transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания новой категории */}
      {isCreateCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#5C4688] mb-6 text-center">Create New Category</h2>
            
            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                  placeholder="Type the name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm text-gray-900"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-1 p-2 border border-purple-200 rounded-lg">
                  {/* Показываем все предустановленные цвета */}
                  {colors.map((color) => {
                    // Простое сравнение цветов
                    const isSelected = newCategory.color === color.value
                    
                    return (
              <button
                        key={color.id}
                        onClick={() => handleNewCategoryChange('color', color.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-[#A385E9] scale-110 ring-2 ring-[#A385E9] ring-opacity-50 shadow-lg'
                            : 'border-gray-300 hover:scale-105 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    )
                  })}
                  
                  {/* Показываем выбранный цвет, если он не в предустановленных */}
                  {newCategory.color && !colors.some(c => c.value === newCategory.color) && (
                    <button
                      onClick={() => handleNewCategoryChange('color', newCategory.color)}
                      className="w-7 h-7 rounded-full border-2 border-[#A385E9] scale-110 ring-2 ring-[#A385E9] ring-opacity-50 shadow-lg transition-all duration-200"
                      style={{ backgroundColor: newCategory.color }}
                      title="Selected color"
                    />
                  )}
                  <button
                    onClick={() => setIsColorPickerOpen(true)}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex gap-1 p-2 border border-purple-200 rounded-lg">
                  {icons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => handleNewCategoryChange('icon', icon.icon)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 box-border ${
                        newCategory.icon === icon.icon
                          ? 'ring-2 ring-[#A385E9] ring-offset-1 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: newCategory.color || '#A385E9' 
                      }}
                    >
                      {icon.icon}
                    </button>
                  ))}
                  
                  {/* Показываем выбранную иконку, если она не в предустановленных */}
                  {newCategory.icon && !icons.some(i => i.icon === newCategory.icon) && (
                    <button
                      onClick={() => handleNewCategoryChange('icon', newCategory.icon)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200 ring-2 ring-[#A385E9] ring-offset-1 scale-110 box-border"
                      style={{ 
                        backgroundColor: newCategory.color || '#A385E9' 
                      }}
                      title="Selected icon"
                    >
                      {newCategory.icon}
                    </button>
                  )}
                  
                  <button
                    onClick={handleIconPickerOpen}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200 box-border"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreateCategoryModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name || !newCategory.color || !newCategory.icon}
                className="flex-1 px-4 py-2 bg-[#A385E9] text-white rounded-lg hover:bg-[#8B6BC2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}