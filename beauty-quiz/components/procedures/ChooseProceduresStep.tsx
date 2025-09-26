'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import Image from 'next/image'

// Пути к SVG иконкам
const iconPaths = {
  cleanseAndHydrate: '/icons/misc/cleanseAndHydrate.svg',
  deepHydration: '/icons/misc/deepHydration.svg',
  exfoliate: '/icons/misc/exfoliate.svg',
  faceMassage: '/icons/misc/faceMassage.svg',
  lipEyeCare: '/icons/misc/lipEyeCare.svg',
  spfProtection: '/icons/misc/spfProtection.svg',
  washCare: '/icons/misc/washCare.svg',
  deepNourishment: '/icons/misc/deepNourishment.svg',
  scalpDetox: '/icons/misc/scalpDetox.svg',
  heatProtection: '/icons/misc/heatProtection.svg',
  scalpMassage: '/icons/misc/scalpMassage.svg',
  trimSplitEnds: '/icons/misc/trimSplitEnds.svg',
  postColorCare: '/icons/misc/postColorCare.svg',
  morningStretch: '/icons/misc/morningStretch.svg',
  cardioBoost: '/icons/misc/cardioBoost.svg',
  strengthTraining: '/icons/misc/strengthTraining.svg',
  yogaFlexibility: '/icons/misc/yogaFlexibility.svg',
  danceItOut: '/icons/misc/danceItOut.svg',
  swimmingTime: '/icons/misc/swimmingTime.svg',
  cycling: '/icons/misc/cycling.svg',
  postureFix: '/icons/misc/postureFix.svg',
  eveningStretch: '/icons/misc/eveningStretch.svg',
  mindfulMeditation: '/icons/misc/mindfulMeditation.svg',
  breathingExercises: '/icons/misc/breathingExercises.svg',
  gratitudeJournal: '/icons/misc/gratitudeJournal.svg',
  moodCheckIn: '/icons/misc/moodCheckIn.svg',
  learnGrow: '/icons/misc/learnGrow.svg',
  socialMediaDetox: '/icons/misc/socialMediaDetox.svg',
  positiveAffirmations: '/icons/misc/positiveAffirmations.svg',
  talkItOut: '/icons/misc/talkItOut.svg',
  stressRelief: '/icons/misc/stressRelief.svg',
}

// Иконки для активностей
const ActivityIcon = ({ iconPath, color }: { iconPath: string; color: string }) => (
  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
    <Image 
      src={iconPath} 
      alt="" 
      width={24} 
      height={24}
      className="filter brightness-0 invert"
    />
  </div>
)

  // Данные активностей по категориям с точными цветами из Figma
  const activities = {
    skin: [
      { id: 'cleanse-hydrate', name: 'Cleanse & Hydrate', icon: iconPaths.cleanseAndHydrate, color: 'bg-[#0080FF]', bgColor: 'bg-[rgba(0,128,255,0.2)]', aiRecommended: true },
      { id: 'deep-hydration', name: 'Deep Hydration', icon: iconPaths.deepHydration, color: 'bg-[#FF001D]', bgColor: 'bg-[rgba(255,0,29,0.2)]', aiRecommended: false },
      { id: 'exfoliate', name: 'Exfoliate', icon: iconPaths.exfoliate, color: 'bg-[#F7FF00]', bgColor: 'bg-[rgba(246,255,0,0.2)]', aiRecommended: true },
      { id: 'face-massage', name: 'Face Massage', icon: iconPaths.faceMassage, color: 'bg-[#B3FF00]', bgColor: 'bg-[rgba(178,255,0,0.2)]', aiRecommended: false },
      { id: 'lip-eye-care', name: 'Lip & Eye Care', icon: iconPaths.lipEyeCare, color: 'bg-[#2BFF00]', bgColor: 'bg-[rgba(42,255,0,0.2)]', aiRecommended: true },
      { id: 'spf-protection', name: 'SPF Protection', icon: iconPaths.spfProtection, color: 'bg-[#00FFA6]', bgColor: 'bg-[rgba(0,255,166,0.2)]', aiRecommended: false },
    ],
    hair: [
      { id: 'wash-care', name: 'Wash & Care', icon: iconPaths.washCare, color: 'bg-[#00FFFF]', bgColor: 'bg-[rgba(0,255,255,0.2)]', aiRecommended: false },
      { id: 'deep-nourishment', name: 'Deep Nourishment', icon: iconPaths.deepNourishment, color: 'bg-[#4D00FF]', bgColor: 'bg-[rgba(76,0,255,0.2)]', aiRecommended: true },
      { id: 'scalp-detox', name: 'Scalp Detox', icon: iconPaths.scalpDetox, color: 'bg-[#EA00FF]', bgColor: 'bg-[rgba(234,0,255,0.2)]', aiRecommended: false },
      { id: 'heat-protection', name: 'Heat Protection', icon: iconPaths.heatProtection, color: 'bg-[#FF007B]', bgColor: 'bg-[rgba(255,0,123,0.2)]', aiRecommended: true },
      { id: 'scalp-massage', name: 'Scalp Massage', icon: iconPaths.scalpMassage, color: 'bg-[#FF2600]', bgColor: 'bg-[rgba(255,38,0,0.2)]', aiRecommended: false },
      { id: 'trim-split-ends', name: 'Trim Split Ends', icon: iconPaths.trimSplitEnds, color: 'bg-[#FFBB00]', bgColor: 'bg-[rgba(255,187,0,0.2)]', aiRecommended: true },
      { id: 'post-color-care', name: 'Post-Color Care', icon: iconPaths.postColorCare, color: 'bg-[#D9FF00]', bgColor: 'bg-[rgba(217,255,0,0.2)]', aiRecommended: false },
    ],
    physical: [
      { id: 'morning-stretch', name: 'Morning Stretch', icon: iconPaths.morningStretch, color: 'bg-[#0080FF]', bgColor: 'bg-[rgba(0,128,255,0.2)]', aiRecommended: true },
      { id: 'cardio-boost', name: 'Cardio Boost', icon: iconPaths.cardioBoost, color: 'bg-[#2600FF]', bgColor: 'bg-[rgba(38,0,255,0.2)]', aiRecommended: false },
      { id: 'strength-training', name: 'Strength Training', icon: iconPaths.strengthTraining, color: 'bg-[#5F00FF]', bgColor: 'bg-[rgba(95,0,255,0.2)]', aiRecommended: true },
      { id: 'yoga-flexibility', name: 'Yoga & Flexibility', icon: iconPaths.yogaFlexibility, color: 'bg-[#FF00E6]', bgColor: 'bg-[rgba(255,0,230,0.2)]', aiRecommended: false },
      { id: 'dance-it-out', name: 'Dance It Out', icon: iconPaths.danceItOut, color: 'bg-[#00FFFD]', bgColor: 'bg-[rgba(0,255,253,0.2)]', aiRecommended: true },
      { id: 'swimming-time', name: 'Swimming Time', icon: iconPaths.swimmingTime, color: 'bg-[#8CFF00]', bgColor: 'bg-[rgba(140,255,0,0.2)]', aiRecommended: false },
      { id: 'cycling', name: 'Cycling', icon: iconPaths.cycling, color: 'bg-[#BCFF00]', bgColor: 'bg-[rgba(188,255,0,0.2)]', aiRecommended: true },
      { id: 'posture-fix', name: 'Posture Fix', icon: iconPaths.postureFix, color: 'bg-[#F1FF00]', bgColor: 'bg-[rgba(241,255,0,0.2)]', aiRecommended: false },
      { id: 'evening-stretch', name: 'Evening Stretch', icon: iconPaths.eveningStretch, color: 'bg-[#FF7200]', bgColor: 'bg-[rgba(255,114,0,0.2)]', aiRecommended: true },
    ],
    mental: [
      { id: 'mindful-meditation', name: 'Mindful Meditation', icon: iconPaths.mindfulMeditation, color: 'bg-[#D0FF00]', bgColor: 'bg-[rgba(208,255,0,0.2)]', aiRecommended: true },
      { id: 'breathing-exercises', name: 'Breathing Exercises', icon: iconPaths.breathingExercises, color: 'bg-[#00AAFF]', bgColor: 'bg-[rgba(0,170,255,0.2)]', aiRecommended: false },
      { id: 'gratitude-exercises', name: 'Gratitude Exercises', icon: iconPaths.gratitudeJournal, color: 'bg-[#77FF00]', bgColor: 'bg-[rgba(119,255,0,0.2)]', aiRecommended: true },
      { id: 'mood-check-in', name: 'Mood Check-In', icon: iconPaths.moodCheckIn, color: 'bg-[#FFAE00]', bgColor: 'bg-[rgba(255,174,0,0.2)]', aiRecommended: false },
      { id: 'learn-grow', name: 'Learn & Grow', icon: iconPaths.learnGrow, color: 'bg-[#35FC77]', bgColor: 'bg-[rgba(53,252,119,0.2)]', aiRecommended: true },
      { id: 'social-media-detox', name: 'Social Media Detox', icon: iconPaths.socialMediaDetox, color: 'bg-[#2CBFB8]', bgColor: 'bg-[rgba(44,191,184,0.2)]', aiRecommended: false },
      { id: 'positive-affirmations', name: 'Positive Affirmations', icon: iconPaths.positiveAffirmations, color: 'bg-[#622CBF]', bgColor: 'bg-[rgba(98,44,191,0.2)]', aiRecommended: true },
      { id: 'talk-it-out', name: 'Talk It Out', icon: iconPaths.talkItOut, color: 'bg-[#BF2C4C]', bgColor: 'bg-[rgba(191,44,76,0.2)]', aiRecommended: false },
      { id: 'stress-relief', name: 'Stress Relief', icon: iconPaths.stressRelief, color: 'bg-[#FC356D]', bgColor: 'bg-[rgba(252,53,109,0.2)]', aiRecommended: true },
    ],
}

export default function ChooseProceduresStep() {
  const router = useRouter()
  const { setAnswer } = useQuizStore()
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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
          <button className="w-8 h-8 flex items-center justify-center">
            <span className="text-black text-xl">+</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
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
              className="w-full h-[70px] pl-10 pr-4 bg-white border border-[#969AB7] rounded-lg text-[#969AB7] placeholder-[#969AB7] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
                         <ActivityIcon iconPath={activity.icon} color={activity.color} />
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
                         <ActivityIcon iconPath={activity.icon} color={activity.color} />
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
                         <ActivityIcon iconPath={activity.icon} color={activity.color} />
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
                         <ActivityIcon iconPath={activity.icon} color={activity.color} />
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
    </div>
  )
}