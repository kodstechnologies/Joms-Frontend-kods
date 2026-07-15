import { useQuery } from '@tanstack/react-query'

import {
  fetchExpertConsultations,
  fetchExpertProfile,
  fetchExpertServices,
} from '../api/expert-api'

export const useExpertProfile = (id?: string) =>
  useQuery({
    queryKey: ['expert-profile', id],
    queryFn: () => fetchExpertProfile(id as string),
    enabled: Boolean(id),
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
