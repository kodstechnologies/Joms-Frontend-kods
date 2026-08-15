import { venueApiClient } from '@/shared/lib/axios'
import type { VenueDashboardFilters, VenueDashboardResponse } from '../type/venue-dashboard.types'

/**
 * Fetch complete Venue Dashboard in one single API call.
 * GET /venues/dashboard
 */
export const fetchVenueDashboard = async (
  filters: VenueDashboardFilters = {},
): Promise<VenueDashboardResponse> => {
  const res = await venueApiClient.get<{ success: boolean; data: VenueDashboardResponse }>(
    '/venues/dashboard',
    { params: filters },
  )
  return res.data.data
}
