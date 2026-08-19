import { settingsApiClient } from '@/shared/lib/axios'

import type { IncidentRow, PaginationMeta, SettingsMetric } from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export const fetchIncidentMetrics = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<SettingsMetric[]>>(
    '/settings/incidents/metrics',
  )
  return response.data.data
}

export const fetchIncidents = async (params?: Record<string, unknown>) => {
  const response = await settingsApiClient.get<ApiEnvelope<IncidentRow[]>>('/settings/incidents', {
    params,
  })
  return { data: response.data.data, meta: response.data.meta! }
}

export const fetchIncident = async (id: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<IncidentRow>>(
    `/settings/incidents/${id}`,
  )
  return response.data.data
}

export const assignIncident = async (
  id: string,
  payload: { department: string; assignee: string; assigneeId: string },
) => {
  const response = await settingsApiClient.patch<ApiEnvelope<IncidentRow>>(
    `/settings/incidents/${id}/assign`,
    payload,
  )
  return response.data.data
}
