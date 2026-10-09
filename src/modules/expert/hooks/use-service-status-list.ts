import { useCallback, useMemo, useState } from 'react'
import type { FilterValues, ModuleFilterKey } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import {
  buildServiceListQueryParams,
  createServiceFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { fetchServices } from '../api/service-api'
import { useTableColumnPreferences } from './use-ui-preferences'
import { useServices } from './use-services'
import { SERVICE_EXPORT_COLUMN_MAP } from '../utils/table-export-column-maps'
import type { Service } from '../type/service'

type ExportColumnMap = Record<string, { header: string; accessor: (service: Service) => string }>

type UseServiceStatusListArgs = {
  moduleKey: ModuleFilterKey
  status: string
  defaultVisibleColumnIds: string[]
  catalogColumnIds: string[]
  exportFileName: string
  exportColumnMap?: ExportColumnMap
  restrictExportToVisibleColumns?: boolean
  includeSearchInExport?: boolean
}

function resolveVisibleColumnIds(preferred: string[] | undefined, fallback: string[]): string[] {
  return preferred?.length ? preferred : fallback
}

export function useServiceStatusList({
  moduleKey,
  status,
  defaultVisibleColumnIds,
  catalogColumnIds,
  exportFileName,
  exportColumnMap = SERVICE_EXPORT_COLUMN_MAP,
  restrictExportToVisibleColumns = true,
  includeSearchInExport = true,
}: UseServiceStatusListArgs) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const resetToFirstPage = useCallback(() => setCurrentPage(1), [])

  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: resetToFirstPage,
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: resetToFirstPage })
  const tableColumnPreferencesQuery = useTableColumnPreferences(moduleKey)

  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: defaultVisibleColumnIds,
    catalogColumnIds,
  })

  const { data, isLoading } = useServices(
    useMemo(
      () =>
        buildServiceListQueryParams(appliedFilters, {
          page: currentPage,
          limit: 10,
          ...serverSort.sortParams,
          ...enhancedSearch.buildSearchParams(),
          status,
        }),
      [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams, status],
    ),
  )

  const services = data?.data ?? []
  const meta = data?.meta
  const visibleColumnIds = resolveVisibleColumnIds(
    tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultVisibleColumnIds,
  )

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      setAppliedFilters(values)
      resetToFirstPage()
    },
    [resetToFirstPage],
  )

  const handleExportData = useMemo(() => {
    const columnExportOptions = restrictExportToVisibleColumns
      ? { columnIds: exportColumnIds, catalogOrder: catalogColumnIds }
      : undefined

    return createServiceFilteredExportHandler(
      fetchServices,
      exportColumnMap,
      exportFileName,
      {
        status,
        ...(includeSearchInExport ? enhancedSearch.buildSearchParams() : {}),
      },
      columnExportOptions,
    )
  }, [
    catalogColumnIds,
    enhancedSearch,
    exportColumnIds,
    exportColumnMap,
    exportFileName,
    includeSearchInExport,
    restrictExportToVisibleColumns,
    status,
  ])

  const filterExport = useModuleExportFilters({
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
    services,
    meta,
    isLoading,
    visibleColumnIds,
    onAdvancedFilter: filterExport.onAdvancedFilter,
    onExport: filterExport.onExport,
    exportFilterModals: filterExport.modals,
  }
}
