'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'
import { ICON_CATALOG, getIconById, type IconCatalogEntry } from './iconCatalog'
import { getActivityMeta } from './activityMeta'

const extractColorFromClass = (colorClass: string): string => {
  if (colorClass.startsWith('#')) {
    return colorClass
  }

  if (colorClass.startsWith('bg-[')) {
    return colorClass.match(/bg-\[([^\]]+)\]/)?.[1] || '#A385E9'
  }

  return colorClass
}

const extractRgbaFromClass = (bgColorClass: string): string => {
  if (bgColorClass.startsWith('rgba(')) {
    return bgColorClass
  }

  if (bgColorClass.startsWith('bg-[rgba(')) {
    const match = bgColorClass.match(/bg-\[rgba\(([^)]+)\)\]/)
    if (match) {
      return `rgba(${match[1]})`
    }
  }

  return 'rgba(163, 133, 233, 0.2)'
}

interface ActivityCard {
  id: string
  name: string
  iconId: string
  color: string
  bgColor: string
  aiRecommended: boolean
  note?: string
}

type ActivityCollection = Record<string, ActivityCard[]>

const QUICK_ICON_IDS: readonly string[] = [
  'cleanseAndHydrate',
  'deepHydration',
  'exfoliate',
  'faceMassage',
  'lipEyeCare',
  'mindfulMeditation',
  'breathingExercises',
  'gratitudeJournal',
]

const ICONS_PER_PAGE = 48

const ActivityIcon = ({
  activityId,
  iconId,
  color,
  label,
}: {
  activityId: string
  iconId?: string
  color: string
  label: string
}) => {
  const backgroundColor = extractColorFromClass(color)
  const meta = getActivityMeta(activityId, label)
  const resolvedIconId = iconId || meta.iconId
  const iconEntry = resolvedIconId ? getIconById(resolvedIconId) : undefined
  const iconPath = iconEntry?.path || meta.iconPath

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
      style={{ backgroundColor }}
    >
      {iconPath ? (
        <Image src={iconPath} alt={`${label} icon`} width={28} height={28} />
      ) : (
        <span className="text-white text-base font-semibold">{label.charAt(0)}</span>
      )}
    </div>
  )
}

const createPresetActivity = (
  activityId: string,
  overrides: Partial<ActivityCard> = {}
): ActivityCard => {
  const meta = getActivityMeta(activityId)

  return {
    id: activityId,
    name: overrides.name || meta.name,
    iconId: overrides.iconId || meta.iconId,
    color: overrides.color || meta.primary,
    bgColor: overrides.bgColor || meta.surface,
    aiRecommended: overrides.aiRecommended ?? false,
    note: overrides.note,
  }
}

const initialActivities: ActivityCollection = {
  skin: [
    createPresetActivity('cleanse-hydrate', { aiRecommended: true }),
    createPresetActivity('deep-hydration'),
    createPresetActivity('exfoliate', { aiRecommended: true }),
    createPresetActivity('face-massage'),
    createPresetActivity('lip-eye-care', { aiRecommended: true }),
    createPresetActivity('spf-protection'),
  ],
  hair: [
    createPresetActivity('wash-care'),
    createPresetActivity('deep-nourishment', { aiRecommended: true }),
    createPresetActivity('scalp-detox'),
    createPresetActivity('heat-protection', { aiRecommended: true }),
    createPresetActivity('scalp-massage'),
    createPresetActivity('trim-split-ends', { aiRecommended: true }),
    createPresetActivity('post-color-care'),
  ],
  physical: [
    createPresetActivity('morning-stretch', { aiRecommended: true }),
    createPresetActivity('cardio-boost'),
    createPresetActivity('strength-training', { aiRecommended: true }),
    createPresetActivity('yoga-flexibility'),
    createPresetActivity('dance-it-out', { aiRecommended: true }),
    createPresetActivity('swimming-time'),
    createPresetActivity('cycling', { aiRecommended: true }),
    createPresetActivity('posture-fix'),
    createPresetActivity('evening-stretch', { aiRecommended: true }),
  ],
  mental: [
    createPresetActivity('mindful-meditation', { aiRecommended: true }),
    createPresetActivity('breathing-exercises'),
    createPresetActivity('gratitude-exercises', { aiRecommended: true }),
    createPresetActivity('mood-check-in'),
    createPresetActivity('learn-grow', { aiRecommended: true }),
    createPresetActivity('social-media-detox'),
    createPresetActivity('positive-affirmations', { aiRecommended: true }),
    createPresetActivity('talk-it-out'),
    createPresetActivity('stress-relief', { aiRecommended: true }),
  ],
}

export default function ChooseProceduresStep() {
  const router = useRouter()
  const { setAnswer, answers } = useQuizStore()
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
    iconId: ''
  })
  
  const [newActivity, setNewActivity] = useState({
    name: '',
    note: '',
    category: '',
    color: '',
    iconId: ''
  })
  
  const [activityErrors, setActivityErrors] = useState({
    name: '',
    category: '',
    color: '',
    iconId: ''
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

  const quickIconOptions = useMemo<IconCatalogEntry[]>(() => {
    const seen = new Set<string>()
    const picks: IconCatalogEntry[] = []

    for (const id of QUICK_ICON_IDS) {
      const entry = getIconById(id)
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id)
        picks.push(entry)
      }
    }

    if (!picks.length) {
      for (const entry of ICON_CATALOG) {
        if (!seen.has(entry.id)) {
          seen.add(entry.id)
          picks.push(entry)
        }
        if (picks.length >= 8) {
          break
        }
      }
    }

    return picks
  }, [])

  const iconCategories = useMemo(() => {
    const categories = new Set<string>()
    ICON_CATALOG.forEach((entry) => {
      categories.add(entry.category)
    })
    return Array.from(categories).sort((a, b) => a.localeCompare(b))
  }, [])

  const [iconCategoryFilter, setIconCategoryFilter] = useState<string>('all')
  const [iconPage, setIconPage] = useState(0)

  const normalizedIconSearch = iconSearchQuery.trim().toLowerCase()

  const filteredIconEntries = useMemo(() => {
    return ICON_CATALOG.filter((entry) => {
      const matchesCategory = iconCategoryFilter === 'all' || entry.category === iconCategoryFilter
      if (!matchesCategory) {
        return false
      }

      if (!normalizedIconSearch) {
        return true
      }

      const haystack = [entry.label, entry.id, ...(entry.search ?? [])]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedIconSearch)
    })
  }, [iconCategoryFilter, normalizedIconSearch])

  useEffect(() => {
    setIconPage(0)
  }, [iconCategoryFilter, normalizedIconSearch, isIconPickerOpen])

  const totalIconPages = filteredIconEntries.length
    ? Math.ceil(filteredIconEntries.length / ICONS_PER_PAGE)
    : 0

  useEffect(() => {
    if (totalIconPages === 0) {
      setIconPage(0)
      return
    }

    setIconPage((prev) => Math.min(prev, totalIconPages - 1))
  }, [totalIconPages])

  const paginatedIconEntries = useMemo(() => {
    if (!totalIconPages) {
      return []
    }
    const startIndex = iconPage * ICONS_PER_PAGE
    return filteredIconEntries.slice(startIndex, startIndex + ICONS_PER_PAGE)
  }, [filteredIconEntries, iconPage, totalIconPages])

  const selectedActivityIcon = newActivity.iconId ? getIconById(newActivity.iconId) : null
  const selectedCategoryIcon = newCategory.iconId ? getIconById(newCategory.iconId) : null
  const activeIconId = isCreateCategoryModalOpen ? newCategory.iconId : newActivity.iconId
  const activeIconColor = isCreateCategoryModalOpen ? (newCategory.color || '#A385E9') : (newActivity.color || '#A385E9')

  useEffect(() => {
    const stored = answers.selectedActivities
    if (Array.isArray(stored)) {
      setSelectedActivities(stored)
    }
  }, [answers.selectedActivities])


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
      iconId: !newActivity.iconId ? 'Icon is required' : ''
    }
    
    setActivityErrors(errors)
    
    if (!newActivity.name || !newActivity.category || !newActivity.color || !newActivity.iconId) {
      console.log('Missing required fields:', newActivity)
      return
    }

    // Создаем новую процедуру
    const newActivityData = {
      id: `custom-${Date.now()}`,
      name: newActivity.name,
      iconId: newActivity.iconId,
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

    setAnswer('activityMetaOverrides', {
      ...(answers.activityMetaOverrides || {}),
      [newActivityData.id]: {
        name: newActivityData.name,
        iconId: newActivityData.iconId,
        primary: newActivityData.color,
        surface: newActivityData.bgColor,
      },
    })

    // Сбрасываем форму и ошибки
    setNewActivity({
      name: '',
      note: '',
      category: '',
      color: '',
      iconId: ''
    })
    
    setActivityErrors({
      name: '',
      category: '',
      color: '',
      iconId: ''
    })

    // Закрываем модальное окно
    setIsCreateActivityModalOpen(false)
  }

  // Функция для создания новой категории
  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.color || !newCategory.iconId) {
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
      iconId: ''
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
                           <ActivityIcon activityId={activity.id} iconId={activity.iconId} color={activity.color} label={activity.name} />
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
                <div
                  className={`flex gap-1 p-2 border rounded-lg ${
                    activityErrors.iconId ? 'border-red-500' : 'border-purple-200'
                  }`}
                >
                  {quickIconOptions.map((option) => {
                    const isSelected = newActivity.iconId === option.id

                    return (
                      <button
                        key={`activity-${option.id}`}
                        onClick={() => handleNewActivityChange('iconId', option.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 box-border ${
                          isSelected ? 'ring-2 ring-[#A385E9] ring-offset-1 scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? (newActivity.color || '#A385E9') : '#f3f4f6',
                        }}
                      >
                        <Image src={option.path} alt={`${option.label} icon`} width={20} height={20} />
                      </button>
                    )
                  })}

                  {selectedActivityIcon &&
                    !quickIconOptions.some((option) => option.id === selectedActivityIcon.id) && (
                      <button
                        key={`activity-selected-${selectedActivityIcon.id}`}
                        onClick={() => handleNewActivityChange('iconId', selectedActivityIcon.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-[#A385E9] ring-offset-1 scale-105 box-border"
                        style={{ backgroundColor: newActivity.color || '#A385E9' }}
                        title="Selected icon"
                      >
                        <Image
                          src={selectedActivityIcon.path}
                          alt={`${selectedActivityIcon.label} icon`}
                          width={20}
                          height={20}
                        />
                      </button>
                    )}

                  <button
                    onClick={handleIconPickerOpen}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200 box-border"
                  >
                    <span className="text-gray-400 text-sm font-bold">+</span>
                  </button>
                </div>
                {activityErrors.iconId && (
                  <p className="text-red-500 text-xs mt-1">{activityErrors.iconId}</p>
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
            onClick={(event) => event.stopPropagation()}
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

            <div className="px-8 pb-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={iconSearchQuery}
                  onChange={(event) => setIconSearchQuery(event.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIconCategoryFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full border transition ${
                    iconCategoryFilter === 'all'
                      ? 'bg-[#A385E9] text-white border-[#A385E9]'
                      : 'border-[#D9DCEF] text-[#5C4688] hover:border-[#A385E9]'
                  }`}
                >
                  All
                </button>
                {iconCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setIconCategoryFilter(category)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      iconCategoryFilter === category
                        ? 'bg-[#A385E9] text-white border-[#A385E9]'
                        : 'border-[#D9DCEF] text-[#5C4688] hover:border-[#A385E9]'
                    }`}
                  >
                    {category.replace(/[-_]/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 text-sm text-[#969AB7]">
              Showing {paginatedIconEntries.length} of {filteredIconEntries.length} icons
            </div>

            <div className="flex-1 px-8 overflow-y-auto scrollbar-hide">
              {paginatedIconEntries.length > 0 ? (
                <div className="grid grid-cols-8 gap-3">
                  {paginatedIconEntries.map((entry) => {
                    const isSelected = activeIconId === entry.id

                    return (
                      <button
                        key={entry.id}
                        onClick={() => {
                          if (isCreateCategoryModalOpen) {
                            handleNewCategoryChange('iconId', entry.id)
                          } else {
                            handleNewActivityChange('iconId', entry.id)
                          }
                        }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-[#A385E9] ring-offset-1 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: isSelected ? activeIconColor : '#f3f4f6' }}
                        title={entry.label}
                      >
                        <Image src={entry.path} alt={`${entry.label} icon`} width={24} height={24} />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[#969AB7]">
                  <p className="text-base font-medium">No icons match your search.</p>
                  <p className="text-sm">Try a different keyword or category.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIconPage((prev) => Math.max(prev - 1, 0))}
                  disabled={iconPage === 0}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    iconPage === 0
                      ? 'border-[#D9DCEF] text-[#D9DCEF] cursor-not-allowed'
                      : 'border-[#A385E9] text-[#5C4688] hover:bg-[#F3EDFF]'
                  }`}
                >
                  Prev
                </button>
                <span className="text-sm text-[#5C4688]">Page {totalIconPages ? iconPage + 1 : 0} of {totalIconPages}</span>
                <button
                  type="button"
                  onClick={() => setIconPage((prev) => Math.min(prev + 1, Math.max(totalIconPages - 1, 0)))}
                  disabled={iconPage >= totalIconPages - 1}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    iconPage >= totalIconPages - 1
                      ? 'border-[#D9DCEF] text-[#D9DCEF] cursor-not-allowed'
                      : 'border-[#A385E9] text-[#5C4688] hover:bg-[#F3EDFF]'
                  }`}
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="self-end sm:self-auto px-8 py-3 bg-[#A385E9] text-white rounded-xl hover:bg-[#906fe2] transition-colors font-medium"
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
                  {quickIconOptions.map((option) => {
                    const isSelected = newCategory.iconId === option.id

                    return (
                      <button
                        key={`category-${option.id}`}
                        onClick={() => handleNewCategoryChange('iconId', option.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 box-border ${
                          isSelected ? 'ring-2 ring-[#A385E9] ring-offset-1 scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? (newCategory.color || '#A385E9') : '#f3f4f6',
                        }}
                      >
                        <Image src={option.path} alt={`${option.label} icon`} width={20} height={20} />
                      </button>
                    )
                  })}

                  {selectedCategoryIcon &&
                    !quickIconOptions.some((option) => option.id === selectedCategoryIcon.id) && (
                      <button
                        key={`category-selected-${selectedCategoryIcon.id}`}
                        onClick={() => handleNewCategoryChange('iconId', selectedCategoryIcon.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-[#A385E9] ring-offset-1 scale-105 box-border"
                        style={{ backgroundColor: newCategory.color || '#A385E9' }}
                        title="Selected icon"
                      >
                        <Image
                          src={selectedCategoryIcon.path}
                          alt={`${selectedCategoryIcon.label} icon`}
                          width={20}
                          height={20}
                        />
                      </button>
                    )}

                  <button
                    onClick={handleIconPickerOpen}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[#A385E9] hover:bg-purple-50 transition-all duration-200 box-border"
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
                disabled={!newCategory.name || !newCategory.color || !newCategory.iconId}
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
