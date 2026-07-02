import { adminApiClient } from '@/shared/lib/axios'
import type { ExpertResponse } from '../type/expert'
import type {
  ExpertConsultationsResponse,
  ExpertProfileResponse,
  ExpertServicesResponse,
} from '../type/expert-profile'

export const fetchExperts = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) => {
    
  const response = await adminApiClient.get<ExpertResponse>(
    '/admin/internal/admin/partners',
    {
      params,
    },
  )

  return response.data
}
export const fetchExpertById = async (id: string) => {
  const response = await adminApiClient.get(
    `/internal/admin/partners/${id}`
  )

  return response.data
}

export const fetchExpertProfile = async (id: string) => {
  const response = await adminApiClient.get<ExpertProfileResponse>(
    `/admin/internal/admin/partners/${id}`,
  )
  return response.data
}

export const fetchExpertServices = async (
  expertId: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await adminApiClient.get<ExpertServicesResponse>(
    `/admin/internal/admin/services/expert/${expertId}/services`,
    { params },
  )
  return response.data
}

export const fetchExpertConsultations = async (
  expertId: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await adminApiClient.get<ExpertConsultationsResponse>(
    `/admin/internal/admin/services/expert/${expertId}/consultations`,
    { params },
  )
  return response.data
}

export type SuspendExpertPayload = {
  selectedReasons: string[]
  startDate?: string
  endDate?: string
  suspendIndefinitely: boolean
  reasonDetails: string
  adminNotes: string
}

export type DeactivateExpertPayload = {
  reason?: string
  adminNotes: string
}

export const suspendExpert = async (id: string, payload: SuspendExpertPayload) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/suspend`,
    payload,
  )
  return response.data
}

export const deactivateExpert = async (id: string, payload: DeactivateExpertPayload) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/deactivate`,
    payload,
  )
  return response.data
}
