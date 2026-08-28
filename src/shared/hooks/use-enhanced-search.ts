import { useCallback, useMemo, useState } from 'react'

import type {
  ColumnSearchValues,
  SearchableColumn,
  SearchQueryParams,
} from '@/shared/types/search-types'

type UseEnhancedSearchOptions = {
  onSearchChange?: () => void
}

export function useEnhancedSearch(options: UseEnhancedSearchOptions = {}) {
  const [globalSearch, setGlobalSearchRaw] = useState('')
  const [columnSearches, setColumnSearches] = useState<ColumnSearchValues>({})

  const { onSearchChange } = options

  const setGlobalSearch = useCallback(
    (value: string) => {
      setGlobalSearchRaw(value)
      onSearchChange?.()
    },
    [onSearchChange],
  )

  const setColumnSearch = useCallback(
    (key: string, value: string) => {
      setColumnSearches((prev) => ({ ...prev, [key]: value }))
      onSearchChange?.()
    },
    [onSearchChange],
  )

  const removeColumnSearch = useCallback(
    (key: string) => {
      setColumnSearches((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      onSearchChange?.()
    },
    [onSearchChange],
  )

  const clearAll = useCallback(() => {
    setGlobalSearchRaw('')
    setColumnSearches({})
    onSearchChange?.()
  }, [onSearchChange])

  const activeColumnSearchCount = useMemo(
    () => Object.values(columnSearches).filter((v) => v.trim().length > 0).length,
    [columnSearches],
  )

  const buildSearchParams = useCallback((): SearchQueryParams => {
    const params: SearchQueryParams = {}

    if (globalSearch.trim()) {
      params.search = globalSearch.trim()
    }

    Object.entries(columnSearches).forEach(([key, value]) => {
      if (value.trim()) {
        params[key] = value.trim()
      }
    })

    return params
  }, [globalSearch, columnSearches])

  const hasActiveSearch = useCallback(
    (column: SearchableColumn): boolean => {
      const value = columnSearches[column.key]
      return value !== undefined && value.trim().length > 0
    },
    [columnSearches],
  )

  return {
    globalSearch,
    setGlobalSearch,
    columnSearches,
    setColumnSearch,
    removeColumnSearch,
    clearAll,
    activeColumnSearchCount,
    buildSearchParams,
    hasActiveSearch,
  }
}
