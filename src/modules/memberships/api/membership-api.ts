import { membershipApiClient } from '@/shared/lib/axios'
import type {
  CreateMembershipPayload,
  DeleteMembershipPayload,
  MembershipDetailResponse,
  MembershipListResponse,
  MembershipStatsResponse,
  MembershipStatus,
  MembershipType,
  PauseMembershipPayload,
  ResumeMembershipPayload,
  SetValidityPayload,
} from '../types/membership'

export const fetchMemberships = async (params?: {
  type?: MembershipType
  status?: MembershipStatus
  search?: string
  page?: number
  limit?: number
}) => {
  const response = await membershipApiClient.get<MembershipListResponse>('/memberships', { params })
  return response.data
}

export const fetchMembershipStats = async (type: MembershipType = 'expert') => {
  const response = await membershipApiClient.get<MembershipStatsResponse>('/memberships/stats', {
    params: { type },
  })
  return response.data
}

export const fetchMembershipById = async (id: string) => {
  const response = await membershipApiClient.get<MembershipDetailResponse>(`/memberships/${id}`)
  return response.data
}

export const fetchMembershipFeatures = async (id: string) => {
  const response = await membershipApiClient.get(`/memberships/${id}/features`)
  return response.data
}

export const fetchMembershipVersions = async (id: string) => {
  const response = await membershipApiClient.get(`/memberships/${id}/versions`)
  return response.data
}

const buildMembershipFormData = (payload: CreateMembershipPayload) => {
  const formData = new FormData()

  formData.append('type', payload.type)
  formData.append('planName', payload.planName)
  formData.append('pricing', JSON.stringify(payload.pricing))
  formData.append('features', JSON.stringify(payload.features))
  if (payload.planConfig) {
    formData.append('planConfig', JSON.stringify(payload.planConfig))
  }
  formData.append('trialPeriodDays', String(payload.trialPeriodDays ?? 0))
  formData.append('enableAutoRenew', String(payload.enableAutoRenew ?? false))
  formData.append('allowPlanUpgrades', String(payload.allowPlanUpgrades ?? false))
  formData.append('allowDowngradePlans', String(payload.allowDowngradePlans ?? false))

  if (payload.updatedBy) {
    formData.append('updatedBy', payload.updatedBy)
  }

  if (payload.icon) {
    formData.append('icon', payload.icon)
  }

  return formData
}

const buildUpdateMembershipFormData = (payload: Partial<CreateMembershipPayload>) => {
  const formData = new FormData()

  if (payload.type) formData.append('type', payload.type)
  if (payload.planName) formData.append('planName', payload.planName)
  if (payload.pricing) formData.append('pricing', JSON.stringify(payload.pricing))
  if (payload.features) formData.append('features', JSON.stringify(payload.features))
  if (payload.planConfig) formData.append('planConfig', JSON.stringify(payload.planConfig))
  if (payload.trialPeriodDays !== undefined) {
    formData.append('trialPeriodDays', String(payload.trialPeriodDays))
  }
  if (payload.enableAutoRenew !== undefined) {
    formData.append('enableAutoRenew', String(payload.enableAutoRenew))
  }
  if (payload.allowPlanUpgrades !== undefined) {
    formData.append('allowPlanUpgrades', String(payload.allowPlanUpgrades))
  }
  if (payload.allowDowngradePlans !== undefined) {
    formData.append('allowDowngradePlans', String(payload.allowDowngradePlans))
  }
  if (payload.updatedBy) formData.append('updatedBy', payload.updatedBy)
  if (payload.icon) formData.append('icon', payload.icon)

  return formData
}

export const createMembership = async (payload: CreateMembershipPayload) => {
  const response = await membershipApiClient.post<MembershipDetailResponse>(
    '/memberships',
    buildMembershipFormData(payload),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const updateMembership = async (id: string, payload: Partial<CreateMembershipPayload>) => {
  const formData = buildUpdateMembershipFormData(payload)

  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const pauseMembership = async (id: string, payload: PauseMembershipPayload) => {
  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}/pause`,
    payload,
  )
  return response.data
}

export const resumeMembership = async (id: string, payload: ResumeMembershipPayload) => {
  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}/resume`,
    payload,
  )
  return response.data
}

export const deactivateMembership = async (id: string, payload: ResumeMembershipPayload) => {
  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}/deactivate`,
    payload,
  )
  return response.data
}

export const activateMembership = async (id: string, payload: ResumeMembershipPayload) => {
  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}/activate`,
    payload,
  )
  return response.data
}

export const setMembershipValidity = async (id: string, payload: SetValidityPayload) => {
  const response = await membershipApiClient.patch<MembershipDetailResponse>(
    `/memberships/${id}/validity`,
    payload,
  )
  return response.data
}

export const deleteMembership = async (id: string, payload: DeleteMembershipPayload) => {
  const response = await membershipApiClient.delete<MembershipDetailResponse>(
    `/memberships/${id}`,
    { data: payload },
  )
  return response.data
}
