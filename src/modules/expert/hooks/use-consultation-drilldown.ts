import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelConsultationBooking,
  fetchAdminConsultationBooking,
  fetchAdminConsultationDetail,
  fetchAdminConsultationPayment,
  fetchConsultationBookings,
  fetchConsultationPerformance,
  flagConsultationListing,
  pauseConsultationListing,
  requestConsultationChanges,
  unflagConsultationListing,
  unpauseConsultationListing,
} from '../api/consultation-drilldown-api'
import type {
  FlagServicePayload,
  PauseServicePayload,
  RequestServiceChangesPayload,
} from '../api/service-drilldown-api'

export const useAdminConsultationDetail = (consultationId?: string) =>
  useQuery({
    queryKey: ['admin-consultation-detail', consultationId],
    queryFn: () => fetchAdminConsultationDetail(consultationId as string),
    enabled: Boolean(consultationId),
  })

export const useConsultationPerformance = (consultationId?: string) =>
  useQuery({
    queryKey: ['admin-consultation-performance', consultationId],
    queryFn: () => fetchConsultationPerformance(consultationId as string),
    enabled: Boolean(consultationId),
  })

export const useConsultationBookings = (
  consultationId: string | undefined,
  params: { page?: number; limit?: number; search?: string; status?: string },
) =>
  useQuery({
    queryKey: ['admin-consultation-bookings', consultationId, params],
    queryFn: () => fetchConsultationBookings(consultationId as string, params),
    enabled: Boolean(consultationId),
    placeholderData: (previous) => previous,
  })

export const useAdminConsultationBooking = (bookingId?: string) =>
  useQuery({
    queryKey: ['admin-consultation-booking', bookingId],
    queryFn: () => fetchAdminConsultationBooking(bookingId as string),
    enabled: Boolean(bookingId),
  })

export const useAdminConsultationPayment = (bookingId?: string, enabled = true) =>
  useQuery({
    queryKey: ['admin-consultation-payment', bookingId],
    queryFn: () => fetchAdminConsultationPayment(bookingId as string),
    enabled: Boolean(bookingId) && enabled,
  })

const useConsultationAction = <TPayload>(
  mutationFn: (variables: { consultationId: string; payload: TPayload }) => Promise<unknown>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-consultation-detail', variables.consultationId],
      })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
    },
  })
}

export const usePauseConsultationListing = () =>
  useConsultationAction<PauseServicePayload>(({ consultationId, payload }) =>
    pauseConsultationListing(consultationId, payload),
  )

export const useUnpauseConsultationListing = () =>
  useConsultationAction<void>(({ consultationId }) => unpauseConsultationListing(consultationId))

export const useRequestConsultationChanges = () =>
  useConsultationAction<RequestServiceChangesPayload>(({ consultationId, payload }) =>
    requestConsultationChanges(consultationId, payload),
  )

export const useFlagConsultationListing = () =>
  useConsultationAction<FlagServicePayload>(({ consultationId, payload }) =>
    flagConsultationListing(consultationId, payload),
  )

export const useUnflagConsultationListing = () =>
  useConsultationAction<void>(({ consultationId }) => unflagConsultationListing(consultationId))

export const useCancelConsultationBooking = (consultationId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => cancelConsultationBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultation-bookings', consultationId] })
      queryClient.invalidateQueries({
        queryKey: ['admin-consultation-performance', consultationId],
      })
    },
  })
}
