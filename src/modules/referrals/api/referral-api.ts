import { adminApiClient } from '@/shared/lib/axios'
import type {
  BulkExpertInvitePayload,
  ExpertInvite,
  ExpertInvitePayload,
  ReferralMetrics,
} from '../types/referral'

export type ExpertInviteListParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  referralId?: string
  referralCode?: string
  referrerName?: string
  expertName?: string
  referredExpertName?: string
  referredExpertEmail?: string
  referredExpertPhone?: string
  sourceType?: string
  referralType?: string
  createdAtFrom?: string
  createdAtTo?: string
  sentAtFrom?: string
  sentAtTo?: string
  acceptedAtFrom?: string
  acceptedAtTo?: string
  expiresAtFrom?: string
  expiresAtTo?: string
  emailSent?: string
  smsSent?: string
  whatsappSent?: string
  signedUpCountMin?: string
  signedUpCountMax?: string
  [key: string]: unknown
}

export const fetchReferralStats = async () => {
  const response = await adminApiClient.get<{
    success: boolean
    data: ReferralMetrics
  }>('/admin/referrals/stats')
  return response.data
}

export const fetchExpertInvites = async (params?: ExpertInviteListParams) => {
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
  const response = await adminApiClient.post<{
    success: boolean
    data: ExpertInvite
  }>('/admin/referrals/manual-invites', payload)
  return response.data
}

export const createBulkExpertInvites = async (payload: BulkExpertInvitePayload) => {
  const response = await adminApiClient.post<{
    success: boolean
    data: {
      invites: ExpertInvite[]
      count: number
      skipped?: Array<{ name: string; reason: string }>
    }
  }>('/admin/referrals/expert-invites/bulk', payload)
  return response.data
}

export type DeleteReferralPayload = {
  selectedReasons?: string[]
  reasonIds?: string[]
  reasonDetails?: string
  adminNotes?: string
}

export const deleteExpertInvite = async (id: string, payload?: DeleteReferralPayload) => {
  const response = await adminApiClient.delete(`/admin/referrals/expert-invites/${id}`, {
    data: payload,
  })
  return response.data
}

export const updateReferralGoalProgress = async (
  id: string,
  payload: { signedUpCount?: number; maxReferrals?: number },
) => {
  const response = await adminApiClient.patch<{
    success: boolean
    data: ExpertInvite
  }>(`/admin/referrals/expert-invites/${id}/progress`, payload)
  return response.data
}

export const resendExpertInvite = async (id: string) => {
  const response = await adminApiClient.post(`/admin/referrals/expert-invites/${id}/resend`)
  return response.data
}
