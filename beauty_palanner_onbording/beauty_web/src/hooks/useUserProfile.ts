"use client"

import { useQuery } from '@tanstack/react-query'
import { doc, getDoc, type Timestamp } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import { calculateLevel } from '@/types/achievements'

export type UserProfile = {
	id: string
	name: string
	email?: string
	profilePicture?: string
	activitiesCount: number
	level: number
	avatarStatus?: 'processing' | 'ready' | 'failed'
	avatarUpdatedAt?: string | null
	avatarError?: string | null
}

function parseName(v: unknown) {
	return typeof v === 'string' ? v : ''
}

function countActivities(raw: unknown): number {
	if (!Array.isArray(raw)) return 0
	return raw.length
}

export function useUserProfile(userId?: string | null) {
	return useQuery<UserProfile | null>({
		queryKey: ['userProfile', userId ?? 'anon'],
		enabled: !!userId,
		// Poll while avatar is processing to auto-refresh UI
		refetchInterval: (query) => {
			const data = query.state.data as UserProfile | null | undefined
			return data?.avatarStatus === 'processing' ? 3000 : false
		},
		queryFn: async () => {
			if (!userId) return null
			const db = getFirestoreDb()
			// Read only from users_v2 (normalized profile/stats)
			const v2Snap = await getDoc(doc(db, 'users_v2', userId))
			if (!v2Snap.exists()) return null
			const v2Data = v2Snap.data() as Record<string, unknown>

			// Extract profile fields from users_v2
			const name = (typeof v2Data['FullName'] === 'string' && v2Data['FullName'])
				|| (typeof v2Data['DisplayName'] === 'string' && v2Data['DisplayName'])
				|| ''

			const email = (typeof v2Data['Email'] === 'string' ? (v2Data['Email'] as string) : undefined)

			const profilePicture = (typeof v2Data['PhotoURL'] === 'string' ? (v2Data['PhotoURL'] as string)
				: typeof v2Data['AvatarUrl'] === 'string' ? (v2Data['AvatarUrl'] as string)
				: typeof v2Data['ProfilePicture'] === 'string' ? (v2Data['ProfilePicture'] as string)
				: undefined)

			const activitiesCount = countActivities(v2Data['Activities'])

			// Level: prefer explicit Level from v2, otherwise derive from completed counts in v2
			const lvlRaw = typeof v2Data['Level'] === 'number' ? (v2Data['Level'] as number) : 0
			const totalCompletedV2 = typeof v2Data['ActivitiesCompleted'] === 'number'
				? (v2Data['ActivitiesCompleted'] as number)
				: typeof v2Data['TotalCompletedActivities'] === 'number'
					? (v2Data['TotalCompletedActivities'] as number)
					: 0
			const derivedLevel = lvlRaw > 0 ? lvlRaw : calculateLevel(totalCompletedV2)

			const avatarStatus = (typeof v2Data['AvatarStatus'] === 'string' ? (v2Data['AvatarStatus'] as string) : undefined) as UserProfile['avatarStatus']
			const rawUpdated = v2Data['AvatarUpdatedAt'] as unknown
			let avatarUpdatedAt: string | null = null
			if (rawUpdated && typeof (rawUpdated as { toDate?: () => Date }).toDate === 'function') {
				avatarUpdatedAt = (rawUpdated as Timestamp).toDate().toISOString()
			} else if (typeof rawUpdated === 'string') {
				const d = new Date(rawUpdated)
				avatarUpdatedAt = isNaN(d.getTime()) ? null : d.toISOString()
			}
			const avatarError = typeof v2Data['AvatarError'] === 'string' ? (v2Data['AvatarError'] as string) : null

			return { id: userId, name, email, profilePicture, activitiesCount, level: derivedLevel, avatarStatus, avatarUpdatedAt, avatarError }
		}
	})
}

