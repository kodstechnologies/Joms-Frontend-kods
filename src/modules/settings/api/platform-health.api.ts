import { settingsApiClient } from '@/shared/lib/axios'
import type { PlatformHealthDashboard, PlatformHealthFilters } from '../types/platform-health'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

const buildParams = (filters: PlatformHealthFilters): Record<string, string> => {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  }
  return params
}

export const fetchPlatformHealthDashboard = async (
  filters: PlatformHealthFilters = {},
): Promise<PlatformHealthDashboard> => {
  const res = await settingsApiClient.get<ApiEnvelope<PlatformHealthDashboard>>(
    '/settings/platform-health/dashboard',
    { params: buildParams(filters) },
  )
  return res.data.data
}
