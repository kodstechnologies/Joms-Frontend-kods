import { kycApiClient } from '@/shared/lib/axios'
import type { ApplicationDetailsResponse, VenueKycStatusPayload } from '../type/venue-kyc.ts'
import type { DocumentStatusPayload } from '../type/expert-application-view'

export const fetchApplicationDetails = async (id: string) => {
  const response = await kycApiClient.get<ApplicationDetailsResponse>(
    `/venue-kyc/admin/${id}/application-details`,
  )
  return response.data
}

export const fetchVenueKycByPartnerId = async (partnerId: string) => {
  const response = await kycApiClient.get<{
    success?: boolean
    data?: { _id?: string; status?: string }
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

export const updateVenueKycDocumentStatus = async (
  id: string,
  documentKey: string,
  payload: DocumentStatusPayload | VenueKycStatusPayload,
) => {
  const response = await kycApiClient.patch(
    `/venue-kyc/${id}/documents/${documentKey}/status`,
    payload,
  )
  return response.data
}

export const updateVenueBankingDocumentStatus = async (
  id: string,
  documentKey: string,
  payload: DocumentStatusPayload | VenueKycStatusPayload,
) => {
  const response = await kycApiClient.patch(
    `/venue-kyc/banking/${id}/documents/${documentKey}/status`,
    payload,
  )
  return response.data
}

export type VenueKycDocumentRule = {
  key: string
  label: string
  required?: boolean
  requiredIfGstEnabled?: boolean
}

export type VenueDocumentRules = {
  categoryName?: string
  mandatoryDocuments?: VenueKycDocumentRule[]
  conditionalDocuments?: VenueKycDocumentRule[]
}

export const fetchVenueDocumentRules = async (typeOfVenue?: string, hasGST?: boolean) => {
  const response = await kycApiClient.get<{
    success: boolean
    message: string
    data: VenueDocumentRules
  }>('/venue-kyc/document-rules', {
    params: {
      ...(typeOfVenue ? { typeOfVenue } : {}),
      hasGST: hasGST ? 'true' : 'false',
    },
  })
  return response.data
}
