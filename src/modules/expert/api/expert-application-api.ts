import { adminApiClient, kycApiClient } from '@/shared/lib/axios'

import type {
  ApplicationViewResponse,
  BankingDecisionPayload,
  KycDecisionPayload,
} from '../type/expert-application-view'

export const fetchExpertApplicationView = async (id: string) => {
  const response = await adminApiClient.get<ApplicationViewResponse>(
    `/admin/internal/admin/partners/${id}/application-view`,
  )
  return response.data
}

export const updateExpertKycStatus = async (
  id: string,
  payload: KycDecisionPayload,
) => {
  const response = await kycApiClient.patch(
    `/concierge-kyc/concierge/${id}/status`,
    payload,
  )
  return response.data
}

export const updateExpertBankingStatus = async (
  id: string,
  payload: BankingDecisionPayload,
) => {
  const response = await kycApiClient.patch(
    `/concierge-banking/concierge/banking/${id}/status`,
    payload,
  )
  return response.data
}
