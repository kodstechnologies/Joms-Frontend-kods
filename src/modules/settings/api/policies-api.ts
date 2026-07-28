import { settingsApiClient } from '@/shared/lib/axios'

import type {
  PolicyApplication,
  PolicyItem,
  PolicyNotifyVia,
  PolicyStatus,
  PolicyVersion,
} from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchPolicies = async (application?: PolicyApplication) => {
  const response = await settingsApiClient.get<ApiEnvelope<PolicyItem[]>>('/settings/policies', {
    params: application ? { application } : undefined,
  })
  return response.data.data
}

export const fetchPolicy = async (slug: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<PolicyItem>>(
    `/settings/policies/${slug}`,
  )
  return response.data.data
}

export const fetchPolicyVersions = async (slug: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<PolicyVersion[]>>(
    `/settings/policies/${slug}/versions`,
  )
  return response.data.data
}

export const createPolicy = async (payload: {
  slug: string
  title: string
  application?: PolicyApplication
  version: string
  status?: PolicyStatus
  effectiveDate?: string
  effectiveAt?: string | null
  author?: string
  changeSummary?: string
  content?: string
  requireReConsent?: boolean
  blockAppUsageUntilAccepted?: boolean
  notifyVia?: PolicyNotifyVia
}) => {
  const response = await settingsApiClient.post<ApiEnvelope<PolicyItem>>(
    '/settings/policies',
    payload,
  )
  return response.data.data
}

export const updatePolicy = async (
  slug: string,
  payload: { content?: string; changeSummary?: string; author?: string },
) => {
  const response = await settingsApiClient.put<ApiEnvelope<PolicyItem>>(
    `/settings/policies/${slug}`,
    payload,
  )
  return response.data.data
}

export const createPolicyVersion = async (
  slug: string,
  payload: {
    version: string
    status?: PolicyStatus
    effectiveDate?: string
    effectiveAt?: string | null
    author?: string
    changeSummary?: string
    content?: string
    requireReConsent?: boolean
    blockAppUsageUntilAccepted?: boolean
    notifyVia?: PolicyNotifyVia
  },
) => {
  const response = await settingsApiClient.post<ApiEnvelope<PolicyVersion>>(
    `/settings/policies/${slug}/versions`,
    payload,
  )
  return response.data.data
}

export const publishPolicy = async (slug: string, versionId: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<PolicyItem>>(
    `/settings/policies/${slug}/publish`,
    {
      versionId,
    },
  )
  return response.data.data
}
