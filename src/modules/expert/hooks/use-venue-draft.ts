import { useQuery } from '@tanstack/react-query'
import { fetchVenueDraft } from '../api/venue-api'

export const useVenueDraft = () => {
  return useQuery({
    queryKey: ['venue-draft'],
    queryFn: fetchVenueDraft,
  })
}