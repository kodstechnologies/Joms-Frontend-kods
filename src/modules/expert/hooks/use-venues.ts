import { useQuery } from '@tanstack/react-query'
import {
  fetchVenues,
  fetchVenueById,
} from '../api/venue-api.ts'

export const useVenues = (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['venues', params],
    queryFn: () => fetchVenues(params),
  })
}

export const useVenue = (id: string) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => fetchVenueById(id),
    enabled: !!id,
  })
}