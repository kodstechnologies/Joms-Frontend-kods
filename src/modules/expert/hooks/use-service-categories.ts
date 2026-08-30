import { useQuery } from '@tanstack/react-query'

import { fetchOfferingsList, fetchServiceCategoriesByType } from '../api/expert-onboarding-api'

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

export const useOfferingsList = (search?: string) => {
  return useQuery({
    queryKey: ['partner-offerings-list', search],
    queryFn: () => fetchOfferingsList({ search }),
    staleTime: 5 * 60 * 1000,
  })
}
