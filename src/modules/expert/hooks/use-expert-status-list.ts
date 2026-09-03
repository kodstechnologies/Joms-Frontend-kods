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
  /** When false, export every mapped column. Default true. */
  restrictExportToVisibleColumns?: boolean
}

export function useExpertStatusList({
  moduleKey,
  status,
  defaultVisibleColumnIds,
  catalogColumnIds,
  exportFileName,
  exportColumnMap = EXPERT_EXPORT_COLUMN_MAP,
  filterExperts,
  restrictExportToVisibleColumns = true,
}: UseExpertStatusListArgs) {
  const [pageIndex, setPageIndex] = useState(1)
  const [menuTargetId, setMenuTargetId] = useState<string | null>(null)
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  const sortControls = useServerTableSort({
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    onPageReset: () => setPageIndex(1),
  })
  const searchControls = useEnhancedSearch({ onSearchChange: () => setPageIndex(1) })
  const columnPreferences = useTableColumnPreferences(moduleKey)

  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: columnPreferences.data?.visibleColumnIds,
    defaultColumnIds: defaultVisibleColumnIds,
    catalogColumnIds,
  })

  const listParams = useMemo(
    () =>
      buildExpertListQueryParams(filterValues, {
        page: pageIndex,
        limit: 10,
        ...sortControls.sortParams,
        ...searchControls.buildSearchParams(),
        status,
      }),
    [filterValues, pageIndex, searchControls, sortControls.sortParams, status],
  )

  const expertsQuery = useExperts(listParams)
  const experts = useMemo(() => {
    const rows = expertsQuery.data?.data || []
    return filterExperts ? filterExperts(rows) : rows
  }, [expertsQuery.data?.data, filterExperts])
  const selection = useExpertListSelection(experts)

  const visibleColumnIds = columnPreferences.data?.visibleColumnIds?.length
    ? columnPreferences.data.visibleColumnIds
    : defaultVisibleColumnIds

  const applyFilters = useCallback((values: FilterValues) => {
    setFilterValues(values)
    setPageIndex(1)
  }, [])

  const exportHandler = useMemo(() => {
    const restrictOptions = restrictExportToVisibleColumns
      ? { columnIds: exportColumnIds, catalogOrder: catalogColumnIds }
      : undefined

    return createFilteredExportHandler(
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
        ...searchControls.buildSearchParams(),
      },
      restrictOptions,
    )
  }, [
    catalogColumnIds,
    exportColumnIds,
    exportColumnMap,
    exportFileName,
    filterExperts,
    restrictExportToVisibleColumns,
    searchControls,
    status,
  ])

  const moduleFilters = useModuleExportFilters({
    moduleKey,
    onApplyFilters: applyFilters,
    onExportData: exportHandler,
  })

  return {
    currentPage: pageIndex,
    setCurrentPage: setPageIndex,
    activeDropdownId: menuTargetId,
    setActiveDropdownId: setMenuTargetId,
    serverSort: sortControls,
    enhancedSearch: searchControls,
    experts,
    meta: expertsQuery.data?.meta,
    isLoading: expertsQuery.isLoading,
    selection,
    visibleColumnIds,
    onAdvancedFilter: moduleFilters.onAdvancedFilter,
    onExport: moduleFilters.onExport,
    exportFilterModals: moduleFilters.modals,
  }
}
