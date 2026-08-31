import { useMemo } from 'react'

import { dedupeOrderedIds } from '@/shared/lib/dedupe-ids'
import { useDashboardMetricPreferences } from './use-ui-preferences'

export function useActiveMetricIds(moduleKey: string, fallbackIds: string[]) {
  const preferencesQuery = useDashboardMetricPreferences(moduleKey)

  return useMemo(() => {
    const ids = preferencesQuery.data?.activeMetricIds
    if (ids?.length) return dedupeOrderedIds(ids)
    return dedupeOrderedIds(fallbackIds)
  }, [fallbackIds, preferencesQuery.data?.activeMetricIds])
}

export function orderByActiveMetricIds<T extends { id: string }>(
  items: T[],
  activeMetricIds: string[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  return activeMetricIds.map((id) => byId.get(id)).filter(Boolean) as T[]
}
