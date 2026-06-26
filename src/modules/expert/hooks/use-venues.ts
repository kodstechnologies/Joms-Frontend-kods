import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVenues,
  fetchVenueById,
  fetchVenueFullView,
  suspendVenue,
  type SuspendVenuePayload,
} from '../api/venue-api.ts'
import type { VenueStatus } from '../type/venue'

export const useVenues = (params?: {
  page?: number
  limit?: number
  status?: VenueStatus | 'reported'
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

export const useVenueFullView = (venueId?: string) => {
  return useQuery({
    queryKey: ['venue-full-view', venueId],
    queryFn: () => fetchVenueFullView(venueId as string),
    enabled: !!venueId,
  })
}

export const useSuspendVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      venueId,
      payload,
    }: {
      venueId: string
      payload: SuspendVenuePayload
    }) => suspendVenue(venueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}