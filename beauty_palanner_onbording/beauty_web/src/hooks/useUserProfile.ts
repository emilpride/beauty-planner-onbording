"use client"

import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import { calculateLevel } from '@/types/achievements'

export type UserProfile = {
	id: string
	name: string
	email?: string
	profilePicture?: string
	activitiesCount: number
	level: number
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
		queryFn: async () => {
			if (!userId) return null
			const db = getFirestoreDb()
			const ref = doc(db, 'Users', userId)
			const snap = await getDoc(ref)
			if (!snap.exists()) return null
			const data = snap.data() as Record<string, unknown>
			const name = parseName(data['Name']) || parseName(data['name']) || ''
			const email = typeof data['Email'] === 'string' ? (data['Email'] as string) : undefined
			const profilePicture = typeof data['ProfilePicture'] === 'string' ? (data['ProfilePicture'] as string) : undefined
			const activitiesCount = countActivities(data['Activities'])
			// Derive level from total completed activities if available; fall back to activities count
			const lowerTotal = (data as Record<string, unknown>)['totalCompletedActivities']
			const totalCompleted = (typeof data['TotalCompletedActivities'] === 'number'
				? (data['TotalCompletedActivities'] as number)
				: typeof lowerTotal === 'number'
					? (lowerTotal as number)
					: activitiesCount)
			const level = calculateLevel(totalCompleted)
			return { id: snap.id, name, email, profilePicture, activitiesCount, level }
		}
	})
}

