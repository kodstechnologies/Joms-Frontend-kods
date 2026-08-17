import { useQuery } from '@tanstack/react-query'
import { fetchSpaceAnalytics, fetchVenueProfileAnalytics } from '../api/venue-analytics.api'

export const useVenueProfileAnalytics = (
  venueId: string | undefined,
  filters: { dateRange?: string; startDate?: string; endDate?: string } = {},
) => {
  return useQuery({
    queryKey: ['venue-profile-analytics', venueId, filters],
    queryFn: () => fetchVenueProfileAnalytics(venueId!, filters),
    enabled: Boolean(venueId),
    staleTime: 60_000,
    retry: 1,
  })
}

export const useSpaceAnalytics = (spaceId: string | undefined) =>
  useQuery({
    queryKey: ['space-analytics', spaceId],
    queryFn: () => fetchSpaceAnalytics(spaceId!),
    enabled: Boolean(spaceId),
    staleTime: 60_000,
    retry: 1,
  })
