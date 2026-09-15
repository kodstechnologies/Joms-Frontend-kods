import { useQuery } from '@tanstack/react-query'

import { fetchOfferingsList, fetchServiceCategoriesByType } from '../api/expert-onboarding-api'

type ServiceCategoryType = 'concierge' | 'venue' | 'expert' | 'service' | ''

const toCatalogServiceType = (servicetype: ServiceCategoryType) => {
  if (servicetype === 'venue') return 'venue' as const
  if (servicetype === 'concierge' || servicetype === 'expert' || servicetype === 'service') {
    return 'expert' as const
  }
  return null
}

export const useServiceCategoriesByType = (servicetype: ServiceCategoryType, search?: string) => {
  const catalogType = toCatalogServiceType(servicetype)
  return useQuery({
    queryKey: ['expert-service-categories', catalogType, search],
    queryFn: () =>
      fetchServiceCategoriesByType({
        servicetype: catalogType as 'expert' | 'venue',
        search,
      }),
    enabled: Boolean(catalogType),
  })
}

export const useOfferingsList = (search?: string) => {
  return useQuery({
    queryKey: ['partner-offerings-list', search],
    queryFn: () => fetchOfferingsList({ search }),
    staleTime: 5 * 60 * 1000,
  })
}
