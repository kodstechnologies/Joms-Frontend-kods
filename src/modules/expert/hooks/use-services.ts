import { useQuery } from '@tanstack/react-query'
import { fetchServices, fetchServiceById } from '../api/service-api'

export const useServices = (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
  })
}

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id),
    enabled: !!id,
  })
}

