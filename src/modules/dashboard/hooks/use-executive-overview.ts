import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { fetchExecutiveOverview } from '@/modules/dashboard/api/executive-overview-api'

export const executiveOverviewKeys = {
  all: ['executive-overview'] as const,
}

export function useExecutiveOverview() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: executiveOverviewKeys.all,
    queryFn: () => fetchExecutiveOverview(false),
    staleTime: 30_000,
  })

  const refresh = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: executiveOverviewKeys.all,
      queryFn: () => fetchExecutiveOverview(true),
    })
  }, [queryClient])

  return { ...query, refresh }
}
