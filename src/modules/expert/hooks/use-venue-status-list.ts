import { useCallback, useMemo, useState } from 'react'
import type { FilterValues, ModuleFilterKey } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import {
  buildVenueListQueryParams,
  createVenueFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchVenues } from '../api/venue-api'
import { useVenues } from './use-venues'
import { useTableColumnPreferences } from './use-ui-preferences'
import { useVenueRowSelection, useVenueVisibleIds } from './use-venue-row-selection'
import type { Venue } from '../type/venue'

type ExportColumnMap = Record<string, { header: string; accessor: (venue: Venue) => string }>

type UseVenueStatusListArgs = {
  /** Column-preferences key (may be venue-suspended / venue-deleted). */
  preferencesKey: string
  /** Advanced-filter module key (often venue-management). */
  filterModuleKey: ModuleFilterKey
  status: string
  sortFieldMap: Record<string, string | null | undefined>
  exportFileName: string
  exportColumnMap: ExportColumnMap
}

export function useVenueStatusList({
  preferencesKey,
  filterModuleKey,
  status,
  sortFieldMap,
  exportFileName,
  exportColumnMap,
}: UseVenueStatusListArgs) {
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const sort = useServerTableSort({
    sortFieldMap,
    onPageReset: () => setPage(1),
  })
  const search = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const columnPrefs = useTableColumnPreferences(preferencesKey)

  const query = useMemo(
    () =>
      buildVenueListQueryParams(filters, {
        page,
        limit: 10,
        ...sort.sortParams,
        ...search.buildSearchParams(),
        status,
      }),
    [filters, page, search, sort.sortParams, status],
  )

  const { data, isLoading } = useVenues(query)
  const venues = useMemo(() => data?.data ?? [], [data?.data])
  const visibleVenueIds = useVenueVisibleIds(venues)
  const selection = useVenueRowSelection(visibleVenueIds)

  const onFiltersApplied = useCallback((values: FilterValues) => {
    setFilters(values)
    setPage(1)
  }, [])

  const exportData = useMemo(
    () =>
      createVenueFilteredExportHandler(fetchVenues, exportColumnMap, exportFileName, {
        status,
      }),
    [exportColumnMap, exportFileName, status],
  )

  const exportFilters = useModuleExportFilters({
    moduleKey: filterModuleKey,
    onApplyFilters: onFiltersApplied,
    onExportData: exportData,
  })

  return {
    currentPage: page,
    setCurrentPage: setPage,
    activeDropdownId: openMenuId,
    setActiveDropdownId: setOpenMenuId,
    selectedVenueIds: selection.selectedVenueIds,
    serverSort: sort,
    enhancedSearch: search,
    venues,
    meta: data?.meta,
    isLoading,
    tableColumnPreferencesQuery: columnPrefs,
    allVisibleVenuesSelected: selection.allVisibleVenuesSelected,
    someVisibleVenuesSelected: selection.someVisibleVenuesSelected,
    toggleVisibleVenues: selection.toggleVisibleVenues,
    toggleVenueSelection: selection.toggleVenueSelection,
    onAdvancedFilter: exportFilters.onAdvancedFilter,
    onExport: exportFilters.onExport,
    exportFilterModals: exportFilters.modals,
  }
}
