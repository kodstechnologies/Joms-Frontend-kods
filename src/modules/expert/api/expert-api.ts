import { expertApiClient } from '@/shared/lib/axios'
import type { ExpertResponse } from '../type/expert'

export const fetchExperts = async (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) => {
    
  const response = await expertApiClient.get<ExpertResponse>(
    '/admin/internal/admin/partners',
    {
      params,
    },
  )

  return response.data
}
export const fetchExpertById = async (id: string) => {
  const response = await expertApiClient.get(
    `/internal/admin/partners/${id}`
  )

  return response.data
}
