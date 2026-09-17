import { settingsApiClient } from '@/shared/lib/axios'

import type { BackupHistoryRow, PaginationMeta, SettingsMetric } from '../types/settings'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export const fetchBackupMetrics = async () => {
  const response = await settingsApiClient.get<ApiEnvelope<SettingsMetric[]>>(
    '/settings/backups/metrics',
  )
  return response.data.data
}

export const fetchBackups = async (params?: Record<string, unknown>) => {
  const response = await settingsApiClient.get<ApiEnvelope<BackupHistoryRow[]>>(
    '/settings/backups',
    { params },
  )
  return { data: response.data.data, meta: response.data.meta! }
}

export const runBackup = async (payload?: {
  name?: string
  scope?: string
  createdBy?: string
}) => {
  // Local/hybrid full dumps every module DB synchronously and often exceeds the
  // shared 30s axios timeout — surface that as a failure even when the job finishes.
  const response = await settingsApiClient.post<ApiEnvelope<BackupHistoryRow>>(
    '/settings/backups/run',
    payload,
    { timeout: 10 * 60 * 1000 },
  )
  return response.data.data
}

export const restoreBackup = async (id: string, payload: { mode: string; confirm?: string }) => {
  const response = await settingsApiClient.post<ApiEnvelope<unknown>>(
    `/settings/backups/${encodeURIComponent(id)}/restore`,
    payload,
  )
  return response.data.data
}

export const deleteBackup = async (id: string) => {
  const response = await settingsApiClient.delete<ApiEnvelope<{ id: string }>>(
    `/settings/backups/${encodeURIComponent(id)}`,
  )
  return response.data.data
}
