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
  /** When false, export every mapped column (pending approvals). Default true. */
  restrictExportToVisibleColumns?: boolean
  /** When false, omit live search from export base params. Default true. */
  includeSearchInExport?: boolean
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

  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const tableColumnPreferencesQuery = useTableColumnPreferences(moduleKey)

  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: defaultVisibleColumnIds,
    catalogColumnIds,
  })

  const serviceQueryParams = useMemo(
    () =>
      buildServiceListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams, status],
  )

  const { data, isLoading } = useServices(serviceQueryParams)
  const services = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta

  const visibleColumnIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
    ? tableColumnPreferencesQuery.data.visibleColumnIds
    : defaultVisibleColumnIds

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createServiceFilteredExportHandler(
        fetchServices,
        exportColumnMap,
        exportFileName,
        {
          status,
          ...(includeSearchInExport ? enhancedSearch.buildSearchParams() : {}),
        },
        restrictExportToVisibleColumns
          ? { columnIds: exportColumnIds, catalogOrder: catalogColumnIds }
          : undefined,
      ),
    [
      catalogColumnIds,
      enhancedSearch,
      exportColumnIds,
      exportColumnMap,
      exportFileName,
      includeSearchInExport,
      restrictExportToVisibleColumns,
      status,
    ],
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
    services,
    meta,
    isLoading,
    visibleColumnIds,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
  }
}
