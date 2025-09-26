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

// Иконки для активностей
const ActivityIcon = ({ icon, color }: { icon: string; color: string }) => (
  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-2xl`}>
    {icon}
  </div>
)

  // Данные активностей по категориям с точными цветами из Figma
  const activities = {
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
  const [newActivity, setNewActivity] = useState({
    name: '',
    note: '',
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
  const categories = [
    'Skin Care', 'Hair Care', 'Physical Health', 'Mental Wellness', 'Beauty', 'Fitness', 'Nutrition', 'Sleep'
  ]

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

  const handleCreateActivity = () => {
    // Здесь можно добавить логику создания новой активности
    console.log('New activity:', newActivity)
    setIsCreateActivityModalOpen(false)
    setNewActivity({
      name: '',
      note: '',
      category: '',
      color: '',
      icon: ''
    })
  }

  const handleNewActivityChange = (field: string, value: string) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }))
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
    handleNewActivityChange('color', hexColor)
    // НЕ закрываем палитру автоматически - пользователь сам нажмет Done
  }


  const handleIconPickerOpen = () => {
    setIsIconPickerOpen(true)
    setIconSearchQuery('') // Сбрасываем поиск при открытии
  }

  const filteredActivities = {
    skin: activities.skin.filter(activity => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    hair: activities.hair.filter(activity => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    physical: activities.physical.filter(activity => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    mental: activities.mental.filter(activity => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }

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
               {/* Skin Category */}
               {filteredActivities.skin.length > 0 && (
                 <div className="mb-6">
                   <h3 className="text-sm text-[#969AB7] mb-3">Skin</h3>
                   <div className="space-y-3">
                     {filteredActivities.skin.map((activity) => (
                       <button
                         key={activity.id}
                         onClick={() => handleActivityToggle(activity.id)}
                         className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                           selectedActivities.includes(activity.id) 
                             ? `${activity.bgColor} hover:opacity-80` 
                             : `${activity.bgColor} hover:opacity-80 opacity-50`
                         }`}
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
               )}

               {/* Hair Category */}
               {filteredActivities.hair.length > 0 && (
                 <div className="mb-6">
                   <h3 className="text-sm text-[#969AB7] mb-3">Hair</h3>
                   <div className="space-y-3">
                     {filteredActivities.hair.map((activity) => (
                       <button
                         key={activity.id}
                         onClick={() => handleActivityToggle(activity.id)}
                         className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                           selectedActivities.includes(activity.id) 
                             ? `${activity.bgColor} hover:opacity-80` 
                             : `${activity.bgColor} hover:opacity-80 opacity-50`
                         }`}
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
               )}

               {/* Physical health Category */}
               {filteredActivities.physical.length > 0 && (
                 <div className="mb-6">
                   <h3 className="text-sm text-[#969AB7] mb-3">Physical health</h3>
                   <div className="space-y-3">
                     {filteredActivities.physical.map((activity) => (
                       <button
              key={activity.id}
                         onClick={() => handleActivityToggle(activity.id)}
                         className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                selectedActivities.includes(activity.id)
                             ? 'bg-purple-100 border-2 border-purple-300' 
                             : `${activity.bgColor} hover:opacity-80`
                         } ${!selectedActivities.includes(activity.id) ? 'opacity-50' : ''}`}
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
               )}

               {/* Mental Wellness Category */}
               {filteredActivities.mental.length > 0 && (
                 <div className="mb-6">
                   <h3 className="text-sm text-[#969AB7] mb-3">Mental Wellness</h3>
                   <div className="space-y-3">
                     {filteredActivities.mental.map((activity) => (
                       <button
                         key={activity.id}
              onClick={() => handleActivityToggle(activity.id)}
                         className={`w-full flex items-center px-3 py-3 rounded-full transition-colors ${
                           selectedActivities.includes(activity.id) 
                             ? `${activity.bgColor} hover:opacity-80` 
                             : `${activity.bgColor} hover:opacity-80 opacity-50`
                         }`}
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
               )}
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
                  className="w-full p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm text-gray-900"
                />
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
                  onChange={(e) => handleNewActivityChange('category', e.target.value)}
                  className="w-full p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A385E9] focus:border-transparent text-sm text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Choose category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-gray-900">{category}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-1 p-2 border border-purple-200 rounded-lg">
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
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex gap-1 p-2 border border-purple-200 rounded-lg">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[80vh] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
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
            <div className="mb-4">
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

            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-8 gap-3">
                {filteredIcons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleNewActivityChange('icon', icon)
                    }}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 text-2xl ${
                      newActivity.icon === icon
                        ? 'text-white ring-2 ring-[#A385E9] ring-offset-1 scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: newActivity.icon === icon 
                        ? (newActivity.color || '#A385E9')
                        : '#f3f4f6'
                    }}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>


            <div className="text-center mt-6">
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
    </div>
  )
}