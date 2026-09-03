import { useCallback, useMemo, useState } from 'react'
import type { FilterValues, ModuleFilterKey } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import {
  buildExpertListQueryParams,
  createFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { fetchExperts } from '../api/expert-api'
import { useExperts } from './use-expert'
import { useTableColumnPreferences } from './use-ui-preferences'
import { EXPERT_EXPORT_COLUMN_MAP } from '../utils/table-export-column-maps'
import { useExpertListSelection } from '../pages/experts/use-expert-list-selection'
import type { Expert } from '../type/expert'

type ExportColumnMap = Record<string, { header: string; accessor: (expert: Expert) => string }>

type UseExpertStatusListArgs = {
  moduleKey: ModuleFilterKey
  status: string
  defaultVisibleColumnIds: string[]
  catalogColumnIds: string[]
  exportFileName: string
  exportColumnMap?: ExportColumnMap
  /** Extra client filter after fetch (e.g. suspended list). */
  filterExperts?: (experts: Expert[]) => Expert[]
}

export function useExpertStatusList({
  moduleKey,
  status,
  defaultVisibleColumnIds,
  catalogColumnIds,
  exportFileName,
  exportColumnMap = EXPERT_EXPORT_COLUMN_MAP,
  filterExperts,
}: UseExpertStatusListArgs) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const serverSort = useServerTableSort({
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const tableColumnPreferencesQuery = useTableColumnPreferences(moduleKey)

  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: defaultVisibleColumnIds,
    catalogColumnIds,
  })

  const expertQueryParams = useMemo(
    () =>
      buildExpertListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams, status],
  )

  const { data, isLoading } = useExperts(expertQueryParams)
  const experts = useMemo(() => {
    const rows = data?.data || []
    return filterExperts ? filterExperts(rows) : rows
  }, [data?.data, filterExperts])
  const meta = data?.meta
  const selection = useExpertListSelection(experts)

  const visibleColumnIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
    ? tableColumnPreferencesQuery.data.visibleColumnIds
    : defaultVisibleColumnIds

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        async (params: Record<string, unknown>) => {
          const response = await fetchExperts({ ...params, status })
          const rows = response.data || []
          return {
            data: filterExperts ? filterExperts(rows) : rows,
            meta: response.meta,
          }
        },
        exportColumnMap,
        exportFileName,
        {
          ...enhancedSearch.buildSearchParams(),
        },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [
      catalogColumnIds,
      enhancedSearch,
      exportColumnIds,
      exportColumnMap,
      exportFileName,
      filterExperts,
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
    experts,
    meta,
    isLoading,
    selection,
    visibleColumnIds,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
  }
}
