import { useQuery } from '@tanstack/react-query'
import { fetchVenueDashboard, fetchVenueManagementMetrics } from '../api/venue-dashboard.api'
import type { VenueDashboardFilters } from '../type/venue-dashboard.types'

export const venueQueryKeys = {
  all: ['venue-dashboard'] as const,
  overview: (filters: VenueDashboardFilters) => ['venue-dashboard', 'overview', filters] as const,
  managementMetrics: ['venue-management-metrics'] as const,
}

export const useVenueDashboard = (filters: VenueDashboardFilters = {}) => {
  return useQuery({
    queryKey: venueQueryKeys.overview(filters),
    queryFn: () => fetchVenueDashboard(filters),
    staleTime: 60_000,
    retry: 2,
  })
}

export const useVenueManagementMetrics = () => {
  return useQuery({
    queryKey: venueQueryKeys.managementMetrics,
    queryFn: () => fetchVenueManagementMetrics(),
    staleTime: 60_000,
    retry: 2,
  })
}
