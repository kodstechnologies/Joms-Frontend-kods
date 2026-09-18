import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVenues,
  fetchVenueById,
  fetchVenueFullView,
  fetchVenueInsights,
  fetchSpaceBookings,
  type SpaceBookingStatus,
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
  bulkUpdateSpaceVisibility,
  type SuspendVenuePayload,
  type DeleteVenuePayload,
  type SetVenueOwnerPasswordPayload,
  type BulkVenueActionPayload,
  type BulkSpaceVisibilityPayload,
  fetchVenueReports,
} from '../api/venue-api.ts'
import { updateExpertAdminNotes, updateExpertAdminTags } from '../api/expert-api'

export const useVenues = (params?: Record<string, unknown>) => {
  const isDeletedList = params?.status === 'deleted'

  return useQuery({
    queryKey: isDeletedList ? ['venues', 'deleted', params] : ['venues', params],
    queryFn: () => fetchVenues(params),
    staleTime: 0,
    refetchOnMount: 'always',
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
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export const useSpaceBookings = (
  spaceId?: string,
  status: SpaceBookingStatus = 'all',
  page = 1,
  limit = 20,
) =>
  useQuery({
    queryKey: ['space-bookings', spaceId, status, page, limit],
    queryFn: () => fetchSpaceBookings(spaceId as string, { status, page, limit }),
    enabled: Boolean(spaceId),
  })

export const useVenueInsights = (venueId?: string, sort: 'recent' | 'top' | 'all' = 'recent') =>
  useQuery({
    queryKey: ['venue-insights', venueId, sort],
    queryFn: () => fetchVenueInsights(venueId as string, { sort, limit: 20 }),
    enabled: Boolean(venueId),
  })

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

export const useBulkUpdateSpaceVisibility = (venueId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BulkSpaceVisibilityPayload) => bulkUpdateSpaceVisibility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      if (venueId) {
        queryClient.invalidateQueries({ queryKey: ['venue-full-view', venueId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['venue-full-view'] })
      }
    },
  })
}

export const useUpdateVenueOwnerAdminNotes = (ownerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (internalNotes: string) => updateExpertAdminNotes(ownerId as string, internalNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view'] })
      queryClient.invalidateQueries({ queryKey: ['expert-profile', ownerId] })
    },
  })
}

export const useUpdateVenueOwnerAdminTags = (ownerId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tags: string[]) => updateExpertAdminTags(ownerId as string, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view'] })
      queryClient.invalidateQueries({ queryKey: ['expert-profile', ownerId] })
    },
  })
}

export const useVenueReportsForVenue = (venueId?: string) =>
  useQuery({
    queryKey: ['venue-reports', venueId],
    queryFn: () => fetchVenueReports({ venueId, limit: 50 }),
    enabled: Boolean(venueId),
  })
