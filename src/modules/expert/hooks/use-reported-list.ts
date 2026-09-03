import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FilterValues, ModuleFilterKey } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { buildFilterParams, createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
import { useTableColumnPreferences } from './use-ui-preferences'

type ReportFetchResult<T> = {
  data: T[]
  meta: {
    pagination: {
      pages?: number
      totalPages?: number
      total?: number
    }
  }
}

type ExportColumnMap<T> = Record<string, { header: string; accessor: (item: T) => string }>

type UseReportedListArgs<T> = {
  moduleKey: ModuleFilterKey
  preferencesKey?: string
  sortFieldMap: Record<string, string | null | undefined>
  exportFileName: string
  exportColumnMap: ExportColumnMap<T>
  fetchReports: (params: Record<string, unknown>) => Promise<unknown>
  /** Normalize API payload → items + pagination. */
  parseResponse: (response: unknown) => {
    items: T[]
    total: number
    totalPages: number
  }
}

function defaultParseResponse<T = unknown>(
  response: unknown,
): {
  items: T[]
  total: number
  totalPages: number
} {
  const res = response as {
    data?: { items?: T[]; pagination?: { total?: number; pages?: number; totalPages?: number } }
    items?: T[]
    pagination?: { total?: number; pages?: number; totalPages?: number }
  }
  const payload = res?.data ?? res
  const items = (payload?.items || []) as T[]
  const pagination = payload?.pagination || res?.pagination
  return {
    items,
    total: pagination?.total || items.length,
    totalPages: pagination?.totalPages || pagination?.pages || 1,
  }
}

export function useReportedList<T>({
  moduleKey,
  preferencesKey,
  sortFieldMap,
  exportFileName,
  exportColumnMap,
  fetchReports,
  parseResponse,
}: UseReportedListArgs<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const serverSort = useServerTableSort({
    sortFieldMap,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const tableColumnPreferencesQuery = useTableColumnPreferences(preferencesKey ?? moduleKey)

  const apiFilterParams = useMemo(() => buildFilterParams(appliedFilters), [appliedFilters])
  const searchParams = useMemo(() => enhancedSearch.buildSearchParams(), [enhancedSearch])

  const loadReports = useCallback(() => {
    setLoading(true)
    fetchReports({
      page: currentPage,
      limit: 10,
      ...serverSort.sortParams,
      ...searchParams,
      ...apiFilterParams,
    })
      .then((res) => {
        const parsed = parseResponse(res)
        setItems(parsed.items)
        setTotalItems(parsed.total)
        setTotalPages(parsed.totalPages)
      })
      .catch(() => {
        setItems([])
        setTotalItems(0)
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [
    apiFilterParams,
    currentPage,
    fetchReports,
    parseResponse,
    searchParams,
    serverSort.sortParams,
  ])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        async (params: Record<string, unknown>) => {
          const response = await fetchReports(params)
          const parsed = parseResponse(response)
          return {
            data: parsed.items,
            meta: {
              pagination: {
                pages: parsed.totalPages,
                totalPages: parsed.totalPages,
                total: parsed.total,
              },
            },
          } satisfies ReportFetchResult<T>
        },
        exportColumnMap,
        exportFileName,
        {
          search: enhancedSearch.globalSearch.trim() || undefined,
        },
      ),
    [enhancedSearch.globalSearch, exportColumnMap, exportFileName, fetchReports, parseResponse],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  return {
    currentPage,
    setCurrentPage,
    activeDropdownId,
    setActiveDropdownId,
    serverSort,
    enhancedSearch,
    items,
    loading,
    totalItems,
    totalPages,
    tableColumnPreferencesQuery,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
    reload: loadReports,
  }
}

export { defaultParseResponse }
