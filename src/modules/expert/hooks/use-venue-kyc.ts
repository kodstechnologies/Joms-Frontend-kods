import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveVenueKycByPartnerId,
  fetchApplicationDetails,
  updateVenueBankingStatus,
  updateVenueKycStatus,
} from '../api/venue-kyc-api.ts'
import type { VenueKycStatusPayload } from '../type/venue-kyc.ts'

export const useApplicationDetails = (id?: string) => {
  return useQuery({
    queryKey: ['venue-kyc-application', id],
    queryFn: () => fetchApplicationDetails(id as string),
    enabled: !!id,
  })
}

export const useUpdateVenueKycStatus = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VenueKycStatusPayload) =>
      updateVenueKycStatus(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useApproveVenueKyc = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      partnerId,
      adminNote,
    }: {
      partnerId: string
      adminNote?: string
    }) => approveVenueKycByPartnerId(partnerId, { adminNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['experts'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useUpdateVenueBankingStatus = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VenueKycStatusPayload) =>
      updateVenueBankingStatus(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}
