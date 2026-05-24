import { expertApiClient } from '@/shared/lib/axios'
import type { ServiceResponse, ServiceDetailResponse } from '../type/service'

export const fetchServices = async (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  const response = await expertApiClient.get<ServiceResponse>('/services/internal/admin/services', {
    params,
  })
  return response.data
}

export const fetchServiceById = async (id: string) => {
  const response = await expertApiClient.get<ServiceDetailResponse>(`/services/${id}`)
  return response.data
}

