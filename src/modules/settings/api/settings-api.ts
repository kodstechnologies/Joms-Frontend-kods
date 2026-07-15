import { settingsApiClient } from '@/shared/lib/axios'

import type {
  ExpertSettings,
  ModuleSettingsMap,
  ServiceSettings,
  SettingsLog,
  SettingsModule,
  SettingsResponse,
  VenueSettings,
} from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: unknown
}

export const fetchSettings = async <M extends SettingsModule>(module: M) => {
  const response = await settingsApiClient.get<ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>>(
    `/settings/${module}`,
  )
  return response.data.data
}

export const updateSettings = async <M extends SettingsModule>(
  module: M,
  config: ModuleSettingsMap[M],
) => {
  const response = await settingsApiClient.put<ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>>(
    `/settings/${module}`,
    config,
  )
  return response.data.data
}

export const resetSettings = async <M extends SettingsModule>(module: M) => {
  const response = await settingsApiClient.post<
    ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>
  >(`/settings/${module}/reset`)
  return response.data.data
}

export const fetchSettingsLogs = async (params?: {
  page?: number
  limit?: number
  search?: string
  module?: SettingsModule
  action?: 'update' | 'reset'
}) => {
  const response = await settingsApiClient.get<{
    success: boolean
    message: string
    data: SettingsLog[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>('/settings/logs', { params })
  return response.data
}

export const fetchSettingsLog = async (id: string) => {
  const response = await settingsApiClient.get<{
    success: boolean
    message: string
    data: SettingsLog
  }>(`/settings/logs/${id}`)
  return response.data
}

export type { ExpertSettings, VenueSettings, ServiceSettings }
