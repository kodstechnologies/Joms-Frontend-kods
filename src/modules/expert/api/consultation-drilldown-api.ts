import { expertApiClient } from '@/shared/lib/axios'

import type { ApiEnvelope } from '../type/service-drilldown'
import type {
  AdminConsultationBooking,
  AdminConsultationDetail,
  AdminConsultationPayment,
  ConsultationBookingsResponse,
  ConsultationPerformance,
} from '../type/consultation-drilldown'
import type {
  FlagServicePayload,
  PauseServicePayload,
  RequestServiceChangesPayload,
} from './service-drilldown-api'

const consultBase = '/consultations/internal/admin/consultations'
const bookingBase = '/consultations/internal/admin/bookings'

export const fetchAdminConsultationDetail = async (consultationId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/detail`,
  )
  return response.data
}

export const fetchConsultationPerformance = async (consultationId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<ConsultationPerformance>>(
    `${consultBase}/${consultationId}/performance`,
  )
  return response.data
}

export const fetchConsultationBookings = async (
  consultationId: string,
  params: Record<string, unknown>,
) => {
  const response = await expertApiClient.get<ApiEnvelope<ConsultationBookingsResponse>>(
    `${consultBase}/${consultationId}/bookings`,
    { params },
  )
  return response.data
}

export const fetchAdminConsultationBooking = async (bookingId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminConsultationBooking>>(
    `${bookingBase}/${bookingId}`,
  )
  return response.data
}

export const fetchAdminConsultationPayment = async (bookingId: string) => {
  const response = await expertApiClient.get<ApiEnvelope<AdminConsultationPayment>>(
    `${bookingBase}/${bookingId}/payment`,
  )
  return response.data
}

export const cancelConsultationBooking = async (bookingId: string) => {
  const response = await expertApiClient.patch<ApiEnvelope<{ _id: string; status: string }>>(
    `${bookingBase}/${bookingId}/cancel`,
  )
  return response.data
}

export const pauseConsultationListing = async (
  consultationId: string,
  payload: PauseServicePayload,
) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/pause`,
    payload,
  )
  return response.data
}

export const unpauseConsultationListing = async (consultationId: string) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/unpause`,
  )
  return response.data
}

export const requestConsultationChanges = async (
  consultationId: string,
  payload: RequestServiceChangesPayload,
) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/request-changes`,
    payload,
  )
  return response.data
}

export const flagConsultationListing = async (
  consultationId: string,
  payload: FlagServicePayload,
) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/flag`,
    payload,
  )
  return response.data
}

export const unflagConsultationListing = async (consultationId: string) => {
  const response = await expertApiClient.patch<ApiEnvelope<AdminConsultationDetail>>(
    `${consultBase}/${consultationId}/unflag`,
  )
  return response.data
}
