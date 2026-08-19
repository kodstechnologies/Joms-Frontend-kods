import { useQuery } from '@tanstack/react-query'

import { fetchPlatformHealthDashboard } from '../api/platform-health.api'
import type { PlatformHealthFilters } from '../types/platform-health'

export const platformHealthQueryKeys = {
  all: ['platform-health'] as const,
  dashboard: (filters: PlatformHealthFilters) => ['platform-health', 'dashboard', filters] as const,
}

export const usePlatformHealthDashboard = (filters: PlatformHealthFilters = {}) => {
  return useQuery({
    queryKey: platformHealthQueryKeys.dashboard(filters),
    queryFn: () => fetchPlatformHealthDashboard(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 2,
  })
}
