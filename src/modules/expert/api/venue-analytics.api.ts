import { venueApiClient } from '@/shared/lib/axios'
import type { VenueProfileAnalyticsResponse } from '../type/venue-analytics.types'

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
