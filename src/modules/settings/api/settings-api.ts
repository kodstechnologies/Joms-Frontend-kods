import { settingsApiClient } from '@/shared/lib/axios'

import type {
  ExpertSettings,
  ModuleSettingsMap,
  NotificationCatalogGroup,
  ServiceSettings,
  SettingsLog,
  SettingsLogMetrics,
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

export const fetchAdminBranding = async () => {
  const response = await settingsApiClient.get<
    ApiEnvelope<{
      applicationSettings: {
        applicationName: string
        logoUrl: string
        faviconUrl: string
      }
      displayPreferences: {
        timezone: string
        dateTimeFormat: string
      }
    }>
  >('/settings/branding')
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

export const fetchSettingsLogs = async (params?: Record<string, unknown>) => {
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
  return response.data.data
}

export const fetchSettingsLogMetrics = async (params?: { module?: string }) => {
  const response = await settingsApiClient.get<{
    success: boolean
    message: string
    data: SettingsLogMetrics
  }>('/settings/logs/metrics', { params })
  return response.data.data
}

export const fetchSettingsModuleVersions = async (
  module: SettingsModule,
  params?: { page?: number; limit?: number },
) => {
  const response = await settingsApiClient.get<{
    success: boolean
    message: string
    data: SettingsLog[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>(`/settings/versions/${module}`, { params })
  return response.data
}

export const restoreSettingsLog = async (id: string) => {
  const response = await settingsApiClient.post<{
    success: boolean
    message: string
    data: { log: SettingsLog; settings: SettingsResponse<unknown> }
  }>(`/settings/logs/${id}/restore`)
  return response.data.data
}

export const uploadBrandingAsset = async (kind: 'logo' | 'favicon', file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('kind', kind)

  const response = await settingsApiClient.post<ApiEnvelope<{ kind: string; url: string }>>(
    '/settings/upload/branding',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return response.data.data
}

export const fetchErrorTemplates = async () => {
  const response = await settingsApiClient.get<
    ApiEnvelope<{ templates: string[]; selectedMessage: string }>
  >('/settings/platform/error-templates')
  return response.data.data
}

export const createErrorTemplate = async (message: string) => {
  const response = await settingsApiClient.post<ApiEnvelope<{ templates: string[] }>>(
    '/settings/platform/error-templates',
    { message },
  )
  return response.data.data.templates
}

export const updateErrorTemplate = async (index: number, message: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<{ templates: string[] }>>(
    `/settings/platform/error-templates/${index}`,
    { message },
  )
  return response.data.data.templates
}

export const deleteErrorTemplate = async (index: number) => {
  const response = await settingsApiClient.delete<ApiEnvelope<{ templates: string[] }>>(
    `/settings/platform/error-templates/${index}`,
  )
  return response.data.data.templates
}

export const fetchNotificationCatalog = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<NotificationCatalogGroup[]>>(
    '/settings/notifications/catalog',
  )
  return response.data.data
}

export type { ExpertSettings, VenueSettings, ServiceSettings }
