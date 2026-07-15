import { kycApiClient } from '@/shared/lib/axios'
import type { ApplicationDetailsResponse, VenueKycStatusPayload } from '../type/venue-kyc.ts'

export const fetchApplicationDetails = async (id: string) => {
  const response = await kycApiClient.get<ApplicationDetailsResponse>(
    `/venue-kyc/admin/${id}/application-details`,
  )
  return response.data
}

export const fetchVenueKycByPartnerId = async (partnerId: string) => {
  const response = await kycApiClient.get<{
    success?: boolean
    data?: { _id?: string }
  }>(`/venue-kyc/admin/partner/${partnerId}`)
  return response.data
}

export const updateVenueKycStatus = async (id: string, payload: VenueKycStatusPayload) => {
  const response = await kycApiClient.patch(`/venue-kyc/status/${id}`, payload)
  return response.data
}

export const approveVenueKycByPartnerId = async (
  partnerId: string,
  payload: Pick<VenueKycStatusPayload, 'adminNote'>,
) => {
  const response = await kycApiClient.post(`/venue-kyc/admin/${partnerId}/approve`, payload)
  return response.data
}

export const updateVenueBankingStatus = async (id: string, payload: VenueKycStatusPayload) => {
  const response = await kycApiClient.patch(`/venue-kyc/banking/status/${id}`, payload)
  return response.data
}
