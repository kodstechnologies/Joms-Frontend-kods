import { useQuery } from '@tanstack/react-query'

import { fetchServiceCategoriesByType } from '../api/expert-onboarding-api'

export const useServiceCategoriesByType = (
  servicetype: 'concierge' | 'venue' | '',
  search?: string,
) => {
  return useQuery({
    queryKey: ['expert-service-categories', servicetype, search],
    queryFn: () =>
      fetchServiceCategoriesByType({
        servicetype: servicetype as 'concierge' | 'venue',
        search,
      }),
    enabled: servicetype === 'concierge' || servicetype === 'venue',
  })
}
