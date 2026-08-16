import { venueApiClient } from '@/shared/lib/axios'
import type { VenueProfileAnalyticsResponse } from '../type/venue-analytics.types'
import type { SpaceAnalyticsResponse } from '../type/space-analytics.types'

export const fetchVenueProfileAnalytics = async (
  venueId: string,
  params: { dateRange?: string; startDate?: string; endDate?: string } = {},
): Promise<VenueProfileAnalyticsResponse> => {
  const res = await venueApiClient.get<{ success: boolean; data: VenueProfileAnalyticsResponse }>(
    `/venues/profile-analytics/${venueId}`,
    { params },
  )
  return res.data.data
}

export const fetchSpaceAnalytics = async (spaceId: string): Promise<SpaceAnalyticsResponse> => {
  const res = await venueApiClient.get<{ success: boolean; data: SpaceAnalyticsResponse }>(
    `/venues/admin/space/${spaceId}/analytics`,
  )
  return res.data.data
}
