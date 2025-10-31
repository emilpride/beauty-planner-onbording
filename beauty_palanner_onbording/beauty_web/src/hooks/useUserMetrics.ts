"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllUpdates, fetchUserMetrics, saveUserMetrics, calculateBmsTimeseries, computeBmi, formatBmiCategory, computeBodyFatPct, ageFromBirthDate } from '@/lib/userMetrics'
import { fetchUserProfile } from '@/lib/userSettings'

export function useMetrics(userId?: string | null) {
  return useQuery({
    queryKey: ['userMetrics', userId ?? 'anon'],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null
      const [doc, updates, details] = await Promise.all([
        fetchUserMetrics(userId),
        fetchAllUpdates(userId),
        fetchUserProfile(userId),
      ])
      const series = calculateBmsTimeseries(doc.bmsBase ?? 7, updates)
      const last = series[series.length - 1]
      const prev = series[series.length - 2]
      const todayBms = last?.value ?? (doc.bmsBase ?? 7)
      const yesterdayBms = prev?.value ?? (doc.bmsBase ?? 7)
      const deltaVsYesterday = todayBms - yesterdayBms
      const bmi = computeBmi(doc.heightCm, doc.weightKg)
      const age = ageFromBirthDate(details.birthDate)
      const bodyFatPct = computeBodyFatPct(bmi, age, details.gender)
      const bmiCategory = formatBmiCategory(bmi)
      return {
        gender: details.gender,
        heightCm: doc.heightCm,
        weightKg: doc.weightKg,
        bmsBase: doc.bmsBase ?? 7,
        bms: todayBms,
        bmsDelta: deltaVsYesterday,
        bmi,
        bodyFatPct,
        bmiCategory,
      }
    },
  })
}

export function useSaveMetrics() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, heightCm, weightKg }: { userId: string; heightCm?: number; weightKg?: number }) => {
      await saveUserMetrics(userId, { heightCm, weightKg })
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['userMetrics', vars.userId] })
    },
  })
}
