import { useCallback, useMemo, useState } from 'react'
import type { SortingState } from '@tanstack/react-table'

import { resolveSortFieldMapEntry } from '@/shared/utils/table-sort'

export type ServerSortOrder = 'asc' | 'desc'

export type ServerSortParams = {
  sortBy?: string
  sortOrder?: ServerSortOrder
}

type UseServerTableSortOptions = {
  /** Column id used for default sort (kebab-case). */
  defaultSortBy?: string
  defaultSortOrder?: ServerSortOrder
  /** Maps table column id → API sortBy field name. */
  sortFieldMap?: Record<string, string | null | undefined>
  onPageReset?: () => void
}

export function useServerTableSort({
  defaultSortBy = 'created-at',
  defaultSortOrder = 'desc',
  sortFieldMap,
  onPageReset,
}: UseServerTableSortOptions = {}) {
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [sortOrder, setSortOrder] = useState<ServerSortOrder>(defaultSortOrder)

  const apiSortBy = useMemo(() => {
    const mapped = resolveSortFieldMapEntry(sortBy, sortFieldMap)
    if (mapped === null) return defaultSortBy
    if (mapped) return mapped
    return sortBy
  }, [defaultSortBy, sortBy, sortFieldMap])

  const sorting = useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  )

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0]

      if (!first) {
        setSortBy(defaultSortBy)
        setSortOrder(defaultSortOrder)
      } else {
        setSortBy(first.id)
        setSortOrder(first.desc ? 'desc' : 'asc')
      }

      onPageReset?.()
    },
    [defaultSortBy, defaultSortOrder, onPageReset, sorting],
  )

  const sortParams = useMemo<ServerSortParams>(
    () => ({
      sortBy: apiSortBy || defaultSortBy,
      sortOrder: sortOrder || defaultSortOrder,
    }),
    [apiSortBy, defaultSortBy, defaultSortOrder, sortOrder],
  )

  return {
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
    sortParams,
    sorting,
    onSortingChange,
    dataTableSortProps: {
      sorting,
      onSortingChange,
      manualSorting: true as const,
    },
  }
}
