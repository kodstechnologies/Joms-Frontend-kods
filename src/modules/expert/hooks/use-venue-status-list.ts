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
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const serverSort = useServerTableSort({
    sortFieldMap,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const tableColumnPreferencesQuery = useTableColumnPreferences(preferencesKey)

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams, status],
  )

  const { data, isLoading } = useVenues(venueQueryParams)
  const venues = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta

  const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
  const allVisibleVenuesSelected =
    visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createVenueFilteredExportHandler(fetchVenues, exportColumnMap, exportFileName, {
        status,
      }),
    [exportColumnMap, exportFileName, status],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: filterModuleKey,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const toggleVisibleVenues = useCallback(() => {
    setSelectedVenueIds((currentIds) => {
      if (allVisibleVenuesSelected) {
        return currentIds.filter((id) => !visibleVenueIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleVenueIds]))
    })
  }, [allVisibleVenuesSelected, visibleVenueIds])

  const toggleVenueSelection = useCallback((venueId: string) => {
    setSelectedVenueIds((currentIds) =>
      currentIds.includes(venueId)
        ? currentIds.filter((id) => id !== venueId)
        : [...currentIds, venueId],
    )
  }, [])

  return {
    currentPage,
    setCurrentPage,
    activeDropdownId,
    setActiveDropdownId,
    selectedVenueIds,
    serverSort,
    enhancedSearch,
    venues,
    meta,
    isLoading,
    tableColumnPreferencesQuery,
    allVisibleVenuesSelected,
    someVisibleVenuesSelected,
    toggleVisibleVenues,
    toggleVenueSelection,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
  }
}
