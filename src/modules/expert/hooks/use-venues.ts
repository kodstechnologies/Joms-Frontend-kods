import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVenues,
  fetchVenueById,
  fetchVenueFullView,
  suspendVenue,
  activateVenue,
  deleteVenue,
  restoreVenue,
  type SuspendVenuePayload,
  type DeleteVenuePayload,
} from '../api/venue-api.ts'
import type { VenueStatus } from '../type/venue'

export const useVenues = (params?: {
  page?: number
  limit?: number
  status?: VenueStatus | 'reported'
  search?: string
}) => {
  const isDeletedList = params?.status === 'deleted'

  return useQuery({
    queryKey: isDeletedList ? ['venues', 'deleted', params] : ['venues', params],
    queryFn: () => fetchVenues(params),
    refetchOnMount: isDeletedList ? 'always' : true,
  })
}

export const useVenue = (id: string) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => fetchVenueById(id),
    enabled: !!id,
  })
}

export const useVenueFullView = (venueId?: string, spaceId?: string) => {
  return useQuery({
    queryKey: ['venue-full-view', venueId, spaceId],
    queryFn: () => fetchVenueFullView(venueId as string, spaceId),
    enabled: !!venueId,
  })
}

export const useSuspendVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: SuspendVenuePayload }) =>
      suspendVenue(venueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useActivateVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (venueId: string) => activateVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useDeleteVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: DeleteVenuePayload }) =>
      deleteVenue(venueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useRestoreVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (venueId: string) => restoreVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}
