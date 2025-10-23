"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import Image from 'next/image'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useActivities, useDeleteActivity } from '@/hooks/useActivities'
import { getActivityMeta } from '@/data/activityMeta'

const CATEGORIES = [
  { id: 'all', name: 'All', color: '#A385E9' },
  { id: 'skin', name: 'Skin', color: '#0080FF' },
  { id: 'hair', name: 'Hair', color: '#4D00FF' },
  { id: 'physical', name: 'Physical', color: '#0080FF' },
  { id: 'mental', name: 'Mental', color: '#D0FF00' },
]

export default function ProceduresPage() {
  const { user } = useAuth()
  const { data: activities = [], isLoading } = useActivities(user?.uid)
  const del = useDeleteActivity()
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => {
        const category = a.category?.toLowerCase()
        if (selectedCategory === 'skin') return category === 'skin'
        if (selectedCategory === 'hair') return category === 'hair'
        if (selectedCategory === 'physical') return category === 'physical health' || category === 'physical'
        if (selectedCategory === 'mental') return category === 'mental wellness' || category === 'mental'
        return true
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(query) ||
        (a.category?.toLowerCase() || '').includes(query)
      )
    }

    return filtered
  }, [activities, selectedCategory, searchQuery])

  // Group by category
  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof activities> = {
      skin: [],
      hair: [],
      physical: [],
      mental: [],
      other: []
    }

    filteredActivities.forEach(activity => {
      const category = activity.category?.toLowerCase()
      if (category === 'skin') {
        groups.skin.push(activity)
      } else if (category === 'hair') {
        groups.hair.push(activity)
      } else if (category === 'physical health' || category === 'physical') {
        groups.physical.push(activity)
      } else if (category === 'mental wellness' || category === 'mental') {
        groups.mental.push(activity)
      } else {
        groups.other.push(activity)
      }
    })

    return groups
  }, [filteredActivities])

  const ActivityCard = ({ activity }: { activity: typeof activities[0] }) => {
    const meta = getActivityMeta(activity.id, activity.name)
    const backgroundColor = meta.surface

    return (
      <div 
        className="rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition group"
        style={{ backgroundColor }}
      >
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: meta.primary }}
        >
          {meta.iconPath ? (
            <Image 
              src={meta.iconPath} 
              alt={activity.name} 
              width={28} 
              height={28}
            />
          ) : (
            <span className="text-white text-lg font-bold">
              {activity.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#5C4688] truncate">
            {activity.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>{activity.category || 'Uncategorized'}</span>
            <span>•</span>
            <span>{activity.type}</span>
            {activity.time && (
              <>
                <span>•</span>
                <span>
                  {String(activity.time.hour).padStart(2, '0')}:
                  {String(activity.time.minute).padStart(2, '0')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          <Link 
            href={`/procedures/${activity.id}` as Route}
            className="px-3 py-1.5 text-sm font-medium text-[#A385E9] hover:bg-white rounded-lg transition"
          >
            Edit
          </Link>
          <button
            onClick={() => user && del.mutate({ userId: user.uid, id: activity.id })}
            className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-white rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[1200px] mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">My Procedures</h1>
              <p className="text-sm text-text-secondary mt-1">
                {filteredActivities.length} procedure{filteredActivities.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link 
              href={"/procedures/new" as Route}
              className="px-6 py-3 bg-gradient-to-r from-[#A385E9] to-[#8B6BC9] text-white font-semibold rounded-xl hover:shadow-lg transition flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M10 4V16M4 10H16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
              Add Procedure
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="bg-surface rounded-xl p-4 shadow-sm space-y-4 border border-border-subtle">
            {/* Search */}
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none"
              >
                <path 
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A385E9] focus:border-transparent bg-surface text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition
                    ${selectedCategory === cat.id 
                      ? 'bg-[#A385E9] text-white shadow-md' 
                      : 'bg-surface-hover text-text-primary hover:bg-surface'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A385E9] border-t-transparent" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-surface rounded-xl p-12 text-center shadow-sm border border-border-subtle">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-hover flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path 
                    d="M20 8V32M8 20H32" 
                    stroke="#A385E9" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No procedures found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding your first procedure'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Link 
                  href={"/procedures/new" as Route}
                  className="inline-block px-6 py-3 bg-[#A385E9] text-white font-semibold rounded-xl hover:bg-[#8B6BC9] transition"
                >
                  Add Your First Procedure
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grouped by category */}
              {selectedCategory === 'all' ? (
                <>
                  {Object.entries(groupedActivities).map(([category, items]) => {
                    if (items.length === 0) return null
                    const catInfo = CATEGORIES.find(c => c.id === category)
                    
                    return (
                      <div key={category} className="bg-surface rounded-xl p-6 shadow-sm border border-border-subtle">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                          {catInfo?.name || 'Other'}
                          <span className="text-sm font-normal text-text-secondary">
                            ({items.length})
                          </span>
                        </h2>
                        <div className="space-y-3">
                          {items.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="bg-surface rounded-xl p-6 shadow-sm border border-border-subtle">
                  <div className="space-y-3">
                    {filteredActivities.map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </Protected>
  )
}
