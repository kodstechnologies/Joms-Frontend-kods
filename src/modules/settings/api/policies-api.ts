import { settingsApiClient } from '@/shared/lib/axios'

import type { PolicyItem, PolicyStatus, PolicyVersion } from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchPolicies = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<PolicyItem[]>>('/settings/policies')
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
  version: string
  status?: PolicyStatus
  effectiveDate?: string
  author?: string
  changeSummary?: string
  content?: string
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
    author?: string
    changeSummary?: string
    content?: string
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
