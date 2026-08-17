import { useQuery } from '@tanstack/react-query'

import {
  fetchExpertAnalytics,
  fetchExpertConsultations,
  fetchExpertProfile,
  fetchExpertServices,
  fetchPartnerInsights,
} from '../api/expert-api'

export const useExpertProfile = (id?: string) =>
  useQuery({
    queryKey: ['expert-profile', id],
    queryFn: () => fetchExpertProfile(id as string),
    enabled: Boolean(id),
  })

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

export const useExpertServices = (expertId?: string, page = 1, limit = 10, enabled = false) =>
  useQuery({
    queryKey: ['expert-services', expertId, page, limit],
    queryFn: () => fetchExpertServices(expertId as string, { page, limit }),
    enabled: Boolean(expertId) && enabled,
  })

export const useExpertConsultations = (expertId?: string, page = 1, limit = 10, enabled = false) =>
  useQuery({
    queryKey: ['expert-consultations', expertId, page, limit],
    queryFn: () => fetchExpertConsultations(expertId as string, { page, limit }),
    enabled: Boolean(expertId) && enabled,
  })
