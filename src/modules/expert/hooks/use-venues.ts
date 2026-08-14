import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVenues,
  fetchVenueById,
  fetchVenueFullView,
  suspendVenue,
  activateVenue,
  deleteVenue,
  restoreVenue,
  setVenueOwnerPassword,
  bulkDeleteVenues,
  bulkPauseVenues,
  bulkHideVenues,
  bulkDisableVenues,
  bulkExportVenues,
  bulkNotifyVenues,
  bulkMessageVenues,
  type SuspendVenuePayload,
  type DeleteVenuePayload,
  type SetVenueOwnerPasswordPayload,
  type BulkVenueActionPayload,
} from '../api/venue-api.ts'

export const useVenues = (params?: Record<string, unknown>) => {
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

export const useSetVenueOwnerPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      partnerId,
      payload,
    }: {
      partnerId: string
      payload: SetVenueOwnerPasswordPayload
    }) => setVenueOwnerPassword(partnerId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venue-full-view'] })
      queryClient.invalidateQueries({ queryKey: ['expert-profile', variables.partnerId] })
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

export const useBulkDeleteVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: string[] | BulkVenueActionPayload) => bulkDeleteVenues(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkPauseVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: string[] | BulkVenueActionPayload) => bulkPauseVenues(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkHideVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (venueIds: string[]) => bulkHideVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkDisableVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (venueIds: string[]) => bulkDisableVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkExportVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (venueIds: string[]) => bulkExportVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkNotifyVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (venueIds: string[]) => bulkNotifyVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export const useBulkMessageVenues = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (venueIds: string[]) => bulkMessageVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}
