import { useQuery } from '@tanstack/react-query'
import { fetchAdminVenueDetails } from '../api/venue-api'

export const useAdminVenueDetails = (
  venueId: string,
) => {
  return useQuery({
    queryKey: ['admin-venue-details', venueId],
    queryFn: () =>
      fetchAdminVenueDetails(venueId),
    enabled: !!venueId,
  })
}