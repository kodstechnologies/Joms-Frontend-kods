import { useQuery } from '@tanstack/react-query'

import { fetchExecutiveOverview } from '@/modules/dashboard/api/executive-overview-api'

export const executiveOverviewKeys = {
  all: ['executive-overview'] as const,
}

export function useExecutiveOverview() {
  return useQuery({
    queryKey: executiveOverviewKeys.all,
    queryFn: () => fetchExecutiveOverview(false),
    staleTime: 30_000,
  })
}
