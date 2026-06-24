import { useQuery } from '@tanstack/react-query'
import { fetchExperts,fetchExpertById } from '../api/expert-api'

export const useExperts = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) => {
  return useQuery({
    queryKey: ['experts', params],
    queryFn: () => fetchExperts(params),
  })
}

export const useExpert = (id: string) => {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: () => fetchExpertById(id),
    enabled: !!id,
  })
}