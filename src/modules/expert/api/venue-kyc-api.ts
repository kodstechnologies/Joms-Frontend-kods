import { kycApiClient } from '@/shared/lib/axios'
import type {
  ApplicationDetailsResponse,
  VenueKycStatusPayload,
} from '../type/venue-kyc.ts'

export const fetchApplicationDetails = async (id: string) => {
  const response = await kycApiClient.get<ApplicationDetailsResponse>(
    `/venue-kyc/admin/${id}/application-details`,
  )
  return response.data
}

export const updateVenueKycStatus = async (
  id: string,
  payload: VenueKycStatusPayload,
) => {
  const response = await kycApiClient.patch(`/venue-kyc/status/${id}`, payload)
  return response.data
}

export const updateVenueBankingStatus = async (
  id: string,
  payload: VenueKycStatusPayload,
) => {
  const response = await kycApiClient.patch(
    `/venue-kyc/banking/status/${id}`,
    payload,
  )
  return response.data
}
