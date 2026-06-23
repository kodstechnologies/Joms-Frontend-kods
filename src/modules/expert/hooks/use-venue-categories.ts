import { useQuery } from '@tanstack/react-query'
import { fetchVenueCategories } from '../api/venue-api'

export const useVenueCategories = () => {
  return useQuery({
    queryKey: ['venue-categories'],
    queryFn: fetchVenueCategories,
  })
}
