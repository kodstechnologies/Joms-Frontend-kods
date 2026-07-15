import { adminApiClient } from '@/shared/lib/axios'
import type {
  BulkExpertInvitePayload,
  ExpertInvite,
  ExpertInvitePayload,
  ReferralMetrics,
  UpdateRecipientPayload,
} from '../types/referral'

type ListParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const fetchReferralStats = async () => {
  const response = await adminApiClient.get<{
    success: boolean
    data: ReferralMetrics
  }>('/admin/referrals/stats')
  return response.data
}

export const fetchExpertInvites = async (params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: {
      invites: ExpertInvite[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }
  }>('/admin/referrals/expert-invites', { params })
  return response.data
}

export const createExpertInvite = async (payload: ExpertInvitePayload) => {
  const response = await adminApiClient.post('/admin/referrals/expert-invites', payload)
  return response.data
}

export const createBulkExpertInvites = async (payload: BulkExpertInvitePayload) => {
  const response = await adminApiClient.post('/admin/referrals/expert-invites/bulk', payload)
  return response.data
}

export const updateExpertInvite = async (id: string, payload: UpdateRecipientPayload) => {
  const response = await adminApiClient.patch(`/admin/referrals/expert-invites/${id}`, payload)
  return response.data
}

export const deleteExpertInvite = async (id: string) => {
  const response = await adminApiClient.delete(`/admin/referrals/expert-invites/${id}`)
  return response.data
}

export const resendExpertInvite = async (id: string) => {
  const response = await adminApiClient.post(`/admin/referrals/expert-invites/${id}/resend`)
  return response.data
}
