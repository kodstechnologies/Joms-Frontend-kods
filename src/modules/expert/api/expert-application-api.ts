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

export const updateExpertKycStatus = async (id: string, payload: KycDecisionPayload) => {
  const response = await kycApiClient.patch(`/concierge-kyc/concierge/${id}/status`, payload)
  return response.data
}

export const updateExpertBankingStatus = async (id: string, payload: BankingDecisionPayload) => {
  const response = await kycApiClient.patch(
    `/concierge-banking/concierge/banking/${id}/status`,
    payload,
  )
  return response.data
}

export type EscalationAssignee = {
  id: string
  fullname: string
  email?: string
}

export const fetchEscalationAssignees = async (permission = 'experts.*') => {
  const response = await adminApiClient.get<{
    success: boolean
    data: EscalationAssignee[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>('/admin/rbac/sub-admins', {
    params: { page: 1, limit: 100, status: 'active', permission },
  })
  return response.data
}

export const escalateExpertApplication = async (
  id: string,
  payload: {
    assigneeSubAdminId: string
    assigneeName?: string
    adminNote: string
    escalationTarget?: 'kyc' | 'banking' | 'application'
  },
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/escalate`,
    payload,
  )
  return response.data
}
