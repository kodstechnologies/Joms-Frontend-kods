import { useQuery } from '@tanstack/react-query'
import { fetchVenueDashboard } from '../api/venue-dashboard.api'
import type { VenueDashboardFilters } from '../type/venue-dashboard.types'

export const venueQueryKeys = {
  all: ['venue-dashboard'] as const,
  overview: (filters: VenueDashboardFilters) => ['venue-dashboard', 'overview', filters] as const,
}

/**
 * React Query hook for the venue dashboard
 */
export const useVenueDashboard = (filters: VenueDashboardFilters = {}) => {
  return useQuery({
    queryKey: venueQueryKeys.overview(filters),
    queryFn: () => fetchVenueDashboard(filters),
    staleTime: 60_000,
    retry: 2,
  })
}
