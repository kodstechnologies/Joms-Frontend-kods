import { settingsApiClient } from '@/shared/lib/axios'

import type { LockedAccountRow, LoginTrailRow, PaginationMeta } from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export const fetchLockedAccounts = async (params?: {
  page?: number
  limit?: number
  search?: string
}) => {
  const response = await settingsApiClient.get<ApiEnvelope<LockedAccountRow[]>>(
    '/settings/security/locked-accounts',
    { params },
  )
  return { data: response.data.data, meta: response.data.meta! }
}

export const fetchLockedAccount = async (id: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<LockedAccountRow>>(
    `/settings/security/locked-accounts/${id}`,
  )
  return response.data.data
}

export const unlockAccount = async (id: string) => {
  const response = await settingsApiClient.post<ApiEnvelope<LockedAccountRow>>(
    `/settings/security/locked-accounts/${id}/unlock`,
  )
  return response.data.data
}

export const fetchLoginTrails = async (params?: Record<string, unknown>) => {
  const response = await settingsApiClient.get<ApiEnvelope<LoginTrailRow[]>>(
    '/settings/security/login-trails',
    {
      params,
    },
  )
  return { data: response.data.data, meta: response.data.meta! }
}
