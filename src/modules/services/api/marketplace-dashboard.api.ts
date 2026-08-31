import { expertApiClient } from '@/shared/lib/axios'
import type {
  DashboardFilters,
  MarketplaceDashboardData,
} from '../types/marketplace-dashboard.types'

const BASE = '/admin/marketplace/dashboard'

const buildParams = (filters: DashboardFilters): Record<string, string | number> => {
  const params: Record<string, string | number> = {}
  const entries = Object.entries(filters) as [string, string | number | undefined][]
  for (const [key, value] of entries) {
    if (value !== undefined && value !== '' && value !== null) {
      params[key] = value
    }
  }
  return params
}

export const fetchMarketplaceDashboard = async (
  filters: DashboardFilters = {},
): Promise<MarketplaceDashboardData> => {
  const res = await expertApiClient.get<{ success: boolean; data: MarketplaceDashboardData }>(
    BASE,
    { params: buildParams(filters) },
  )
  return res.data.data
}
