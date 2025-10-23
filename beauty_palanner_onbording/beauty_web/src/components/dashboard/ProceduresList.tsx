"use client"

import Image from 'next/image'
import { useState } from 'react'

interface Activity {
  id: string
  name: string
  time: string
  color: string
  bgColor: string
  iconPath: string
  status: 'planned' | 'completed' | 'skipped'
}

interface ProceduresListProps {
  activities?: Activity[]
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'cleanse-hydrate',
    name: 'Cleanse & Hydrate',
    time: '7AM',
    color: '#0080FF',
    bgColor: 'rgba(0,128,255,0.2)',
    iconPath: '/icons/activities/cleanseAndHydrate.svg',
    status: 'planned'
  },
  {
    id: 'deep-hydration',
    name: 'Deep Hydration',
    time: '8AM',
    color: '#FF69B4',
    bgColor: 'rgba(255,105,180,0.2)',
    iconPath: '/icons/activities/deepHydration.svg',
    status: 'planned'
  },
  {
    id: 'exfoliate',
    name: 'Exfoliate',
    time: '9AM',
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.2)',
    iconPath: '/icons/activities/exfoliate.svg',
    status: 'planned'
  },
  {
    id: 'face-massage',
    name: 'Face Massage',
    time: '10AM',
    color: '#90EE90',
    bgColor: 'rgba(144,238,144,0.2)',
    iconPath: '/icons/activities/faceMassage.svg',
    status: 'planned'
  },
]

const COMPLETED_ACTIVITIES: Activity[] = [
  {
    id: 'wash-care',
    name: 'Wash & Care',
    time: '7AM',
    color: '#00CED1',
    bgColor: 'rgba(0,206,209,0.2)',
    iconPath: '/icons/activities/washCare.svg',
    status: 'completed'
  },
  {
    id: 'deep-nourishment',
    name: 'Deep Nourishment',
    time: '8AM',
    color: '#4B0082',
    bgColor: 'rgba(75,0,130,0.2)',
    iconPath: '/icons/activities/deepNourishment.svg',
    status: 'completed'
  },
  {
    id: 'scalp-detox',
    name: 'Scalp Detox',
    time: '9PM',
    color: '#FF1493',
    bgColor: 'rgba(255,20,147,0.2)',
    iconPath: '/icons/activities/scalpDetox.svg',
    status: 'completed'
  },
]

const SKIPPED_ACTIVITIES: Activity[] = [
  {
    id: 'wash-care-skip',
    name: 'Wash & Care',
    time: '7AM',
    color: '#00CED1',
    bgColor: 'rgba(0,206,209,0.2)',
    iconPath: '/icons/activities/washCare.svg',
    status: 'skipped'
  },
  {
    id: 'deep-nourishment-skip',
    name: 'Deep Nourishment',
    time: '8AM',
    color: '#4B0082',
    bgColor: 'rgba(75,0,130,0.2)',
    iconPath: '/icons/activities/deepNourishment.svg',
    status: 'skipped'
  },
]

export function ProceduresList({ activities = DEFAULT_ACTIVITIES }: ProceduresListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    Completed: true,
    Skipped: true,
  })

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderSection = (title: string, items: Activity[], defaultCollapsed = false) => {
    const isCollapsed = collapsedSections[title] ?? defaultCollapsed

    return (
      <div key={title} className="mb-4">
        <button
          onClick={() => toggleSection(title)}
          className="w-full flex items-center justify-between mb-3 text-left"
        >
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="space-y-2">
            {items.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-full"
                style={{ backgroundColor: activity.bgColor }}
              >
                {/* Icon Circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: activity.color }}
                >
                  <Image
                    src={activity.iconPath}
                    alt={activity.name}
                    width={24}
                    height={24}
                    className="brightness-0 invert"
                  />
                </div>

                {/* Activity Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{activity.name}</div>
                  <div className="text-xs text-text-secondary">{activity.time}</div>
                </div>

                {/* Status Indicator */}
                <div className="shrink-0">
                  {activity.status === 'completed' ? (
                    <div className="w-5 h-5 rounded-full bg-[#2ACF56] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : activity.status === 'skipped' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#969AB7] opacity-50">
                      <svg className="w-full h-full text-[#969AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#969AB7]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
      {renderSection('Planned', DEFAULT_ACTIVITIES, false)}
      {renderSection('Completed', COMPLETED_ACTIVITIES, true)}
      {renderSection('Skipped', SKIPPED_ACTIVITIES, true)}
    </div>
  )
}
