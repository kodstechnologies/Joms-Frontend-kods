import { useQuery } from '@tanstack/react-query'
import { fetchVenueProfile } from '../api/venue-api'

export const useVenueProfile = (venueId?: string) => {
  return useQuery({
    queryKey: ['venue-profile', venueId],
    queryFn: () => fetchVenueProfile(venueId),
    enabled: !!venueId,
  })
}
