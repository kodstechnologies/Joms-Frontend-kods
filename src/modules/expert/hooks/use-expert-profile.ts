import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchExpertAnalytics,
  fetchExpertAvailability,
  fetchExpertConsultations,
  fetchExpertProfile,
  fetchExpertReports,
  fetchExpertServices,
  fetchPartnerInsights,
  updateExpertAdminNotes,
  updateExpertAdminTags,
} from '../api/expert-api'

export const useExpertProfile = (id?: string) =>
  useQuery({
    queryKey: ['expert-profile', id],
    queryFn: () => fetchExpertProfile(id as string),
    enabled: Boolean(id),
  })

export const useExpertAvailability = (partnerId?: string, enabled = false) =>
  useQuery({
    queryKey: ['expert-availability', partnerId],
    queryFn: () => fetchExpertAvailability(partnerId as string),
    enabled: Boolean(partnerId) && enabled,
  })

export const useExpertReportsForPartner = (partnerId?: string, enabled = true) =>
  useQuery({
    queryKey: ['expert-reports', partnerId],
    queryFn: () => fetchExpertReports({ partnerId, limit: 50 }),
    enabled: Boolean(partnerId) && enabled,
  })

export const useUpdateExpertAdminNotes = (partnerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (internalNotes: string) =>
      updateExpertAdminNotes(partnerId as string, internalNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-profile', partnerId] })
    },
  })
}

export const useUpdateExpertAdminTags = (partnerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tags: string[]) => updateExpertAdminTags(partnerId as string, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-profile', partnerId] })
    },
  })
}

export const useExpertAnalytics = (expertId?: string, timeRange?: string) =>
  useQuery({
    queryKey: ['expert-analytics', expertId, timeRange],
    queryFn: () => fetchExpertAnalytics(expertId as string, timeRange),
    enabled: Boolean(expertId),
  })

export const usePartnerInsights = (
  partnerUserId?: string,
  sort: 'recent' | 'top' | 'all' = 'recent',
) =>
  useQuery({
    queryKey: ['partner-insights', partnerUserId, sort],
    queryFn: () => fetchPartnerInsights(partnerUserId as string, { sort, limit: 20 }),
    enabled: Boolean(partnerUserId),
  })

export const useExpertServices = (
  expertId?: string,
  params?: Record<string, unknown>,
  enabled = false,
) =>
  useQuery({
    queryKey: ['expert-services', expertId, params],
    queryFn: () => fetchExpertServices(expertId as string, params),
    enabled: Boolean(expertId) && enabled,
  })

export const useExpertConsultations = (expertId?: string, page = 1, limit = 10, enabled = false) =>
  useQuery({
    queryKey: ['expert-consultations', expertId, page, limit],
    queryFn: () => fetchExpertConsultations(expertId as string, { page, limit }),
    enabled: Boolean(expertId) && enabled,
  })
