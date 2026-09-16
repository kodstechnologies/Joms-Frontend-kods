import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveVenueKycByPartnerId,
  fetchApplicationDetails,
  fetchVenueDocumentRules,
  updateVenueBankingDocumentStatus,
  updateVenueBankingStatus,
  updateVenueKycDocumentStatus,
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
    mutationFn: (payload: VenueKycStatusPayload) => updateVenueKycStatus(id as string, payload),
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
    mutationFn: ({ partnerId, adminNote }: { partnerId: string; adminNote?: string }) =>
      approveVenueKycByPartnerId(partnerId, { adminNote }),
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
    mutationFn: (payload: VenueKycStatusPayload) => updateVenueBankingStatus(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useUpdateVenueKycDocumentStatus = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentKey,
      payload,
    }: {
      documentKey: string
      payload: VenueKycStatusPayload
    }) => updateVenueKycDocumentStatus(id as string, documentKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useUpdateVenueBankingDocumentStatus = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentKey,
      payload,
    }: {
      documentKey: string
      payload: VenueKycStatusPayload
    }) => updateVenueBankingDocumentStatus(id as string, documentKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useVenueDocumentRules = (typeOfVenue?: string, hasGST = true) => {
  return useQuery({
    queryKey: ['venue-document-rules', typeOfVenue || '', hasGST],
    queryFn: () => fetchVenueDocumentRules(typeOfVenue, hasGST),
    enabled: Boolean(typeOfVenue),
    staleTime: 60 * 1000,
  })
}
