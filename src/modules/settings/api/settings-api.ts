import { settingsApiClient } from '@/shared/lib/axios'

import type {
  ExpertSettings,
  ModuleSettingsMap,
  ServiceSettings,
  SettingsModule,
  SettingsResponse,
  VenueSettings,
} from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchSettings = async <M extends SettingsModule>(module: M) => {
  const response = await settingsApiClient.get<
    ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>
  >(`/settings/${module}`)
  return response.data.data
}

export const updateSettings = async <M extends SettingsModule>(
  module: M,
  config: ModuleSettingsMap[M],
) => {
  const response = await settingsApiClient.put<
    ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>
  >(`/settings/${module}`, config)
  return response.data.data
}

export const resetSettings = async <M extends SettingsModule>(module: M) => {
  const response = await settingsApiClient.post<
    ApiEnvelope<SettingsResponse<ModuleSettingsMap[M]>>
  >(`/settings/${module}/reset`)
  return response.data.data
}

export type { ExpertSettings, VenueSettings, ServiceSettings }
