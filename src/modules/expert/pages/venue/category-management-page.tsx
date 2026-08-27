import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { VENUE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS,
  VENUE_CATEGORY_LEGACY_METRIC_ID_MAP,
} from '../../config/venue-category-management-metrics.config'
import {
  DEFAULT_VENUE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  VENUE_CATEGORY_LEGACY_COLUMN_ID_MAP,
} from '../../config/venue-category-management-table-columns.config'
import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildVenueCategoryListQueryParams,
  createVenueCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchVenueCategoryList } from '../../api/venue-category-api'
import { mapVenueCategoryToUi } from '../../utils/category-mapper'

import { StatCard } from '../../components/stat-card'
import {
  type VenueCategory,
  venueCategoryColumns,
} from '../../components/category/venue-category-table-columns'
import {
  CategoryManagementPageHeader,
  CategoryQuickLinks,
} from '../../components/category/category-list-shared'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import {
  useDeletedVenueCategoryList,
  usePausedVenueCategoryList,
  useVenueCategoryManagementList,
  useVenueCategoryMetrics,
} from '../../hooks/use-venue-category-management'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (cat: VenueCategory) => string }
> = {
  'category-id': {
    header: 'Category ID',
    accessor: (cat) => exportDisplayValue(cat.categoryId || cat.id),
  },
  'category-name': { header: 'Category Name', accessor: (cat) => exportDisplayValue(cat.name) },
  spaces: { header: 'Spaces', accessor: (cat) => exportDisplayValue(cat.spaces) },
  venues: { header: 'Venues', accessor: (cat) => exportDisplayValue(cat.venues) },
  'active-spaces': {
    header: 'Active Spaces',
    accessor: (cat) => exportDisplayValue(cat.activeSpaces),
  },
  bookings: { header: 'Bookings', accessor: (cat) => exportDisplayValue(cat.bookings) },
  'completed-bookings': {
    header: 'Completed Bookings',
    accessor: (cat) => exportDisplayValue(cat.completedBookings),
  },
  revenue: { header: 'Revenue', accessor: (cat) => exportDisplayValue(cat.revenue) },
  status: { header: 'Status', accessor: (cat) => exportDisplayValue(cat.status) },
  'created-by': { header: 'Created By', accessor: (cat) => exportDisplayValue(cat.createdBy) },
  'created-at': { header: 'Created At', accessor: (cat) => exportDisplayValue(cat.createdAt) },
  'last-updated': { header: 'Last Updated', accessor: (cat) => exportDisplayValue(cat.updatedAt) },
}

const normalizeVenueColumnIds = (ids: string[]) =>
  ids.map((id) => VENUE_CATEGORY_LEGACY_COLUMN_ID_MAP[id] ?? id)

const normalizeVenueMetricIds = (ids: string[]) =>
  ids.map((id) => VENUE_CATEGORY_LEGACY_METRIC_ID_MAP[id] ?? id)

const DEFAULT_VISIBLE_IDS = DEFAULT_VENUE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS

export function VenueCategoryManagementPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const preferencesQuery = useTableColumnPreferences(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setPage(1)
    setAppliedFilters(values)
  }, [])

  const categoryQueryParams = useMemo(
    () =>
      buildVenueCategoryListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        search: searchValue.trim() || undefined,
        excludePaused: true,
      }),
    [appliedFilters, page, searchValue],
  )

  const { data, isLoading, isError } = useVenueCategoryManagementList(categoryQueryParams)
  const { data: metrics } = useVenueCategoryMetrics()

  const categories = useMemo(() => data?.categories ?? [], [data?.categories])
  const totalItems = data?.pagination?.total ?? categories.length
  const totalPages = Math.max(1, data?.pagination?.totalPages ?? Math.ceil(totalItems / PAGE_SIZE))

  const handleExportData = useMemo(
    () =>
      createVenueCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchVenueCategoryList(params)
          return { data: (response.data ?? []).map(mapVenueCategoryToUi) }
        },
        EXPORT_COLUMN_MAP,
        'venue_categories_export',
        { excludePaused: true },
      ),
    [],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'venue-category-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const { data: pausedData } = usePausedVenueCategoryList()
  const pausedCategories = pausedData?.categories || []

  const { data: deletedData } = useDeletedVenueCategoryList()
  const deletedCategories = deletedData?.categories || []

  const pausedCount =
    metrics?.pausedCategories ?? pausedData?.pagination?.total ?? pausedCategories.length
  const deletedCount =
    metrics?.deletedCategories ?? deletedData?.pagination?.total ?? deletedCategories.length

  const savedMetricIdsRaw = useActiveMetricIds(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY, [
    ...DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS,
  ])
  const savedMetricIds = useMemo(
    () => normalizeVenueMetricIds(savedMetricIdsRaw),
    [savedMetricIdsRaw],
  )
  const activeMetricIds = useMemo(() => {
    const missingDefaults = DEFAULT_VENUE_CATEGORY_MANAGEMENT_METRIC_IDS.filter(
      (id) => !savedMetricIds.includes(id),
    )
    return [...missingDefaults, ...savedMetricIds]
  }, [savedMetricIds])

  const metricCardCatalog = useMemo(
    () => [
      {
        id: 'total-categories',
        title: 'Total Venue Categories',
        value: String(metrics?.totalCategories ?? totalItems),
      },
      {
        id: 'active-categories',
        title: 'Active Categories',
        value: String(metrics?.activeCategories ?? totalItems),
      },
      {
        id: 'paused-categories',
        title: 'Paused Categories',
        value: String(pausedCount),
      },
      {
        id: 'deleted-categories',
        title: 'Deleted Categories',
        value: String(deletedCount),
      },
      {
        id: 'top-revenue-category',
        title: 'Top Revenue Category',
        value: metrics?.topCategory?.label || metrics?.topCategory?.name || '—',
      },
      {
        id: 'lowest-revenue-category',
        title: 'Lowest Revenue Category',
        value: metrics?.lowestRevenueCategory?.label || metrics?.lowestRevenueCategory?.name || '—',
      },
      {
        id: 'total-bookings',
        title: 'Total Bookings',
        value: String(metrics?.totalBookings ?? 0),
      },
      {
        id: 'completed-bookings',
        title: 'Completed Bookings',
        value: String(metrics?.completedBookings ?? 0),
      },
      {
        id: 'booking-completion-rate',
        title: 'Booking Completion Rate',
        value: `${metrics?.bookingCompletionRate ?? 0}%`,
      },
    ],
    [deletedCount, metrics, pausedCount, totalItems],
  )

  const metricCards = orderByActiveMetricIds(metricCardCatalog, activeMetricIds)

  const columns = useMemo<ColumnDef<VenueCategory>[]>(() => {
    const rawVisibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS
    const visibleIds = normalizeVenueColumnIds(rawVisibleIds)

    const dataColumnsById = Object.fromEntries(
      venueCategoryColumns.map((column) => [column.id, column] as const),
    ) as Record<string, ColumnDef<VenueCategory>>
    const matched = visibleIds.filter((id) => id in dataColumnsById)
    const selectedDataColumns = sortIdsByCatalogOrder(
      matched.length > 0 ? matched : DEFAULT_VISIBLE_IDS,
      DEFAULT_VISIBLE_IDS,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)
    const actionsColumn = dataColumnsById.actions

    return actionsColumn ? [...selectedDataColumns, actionsColumn] : selectedDataColumns
  }, [preferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <CategoryManagementPageHeader
        title="Category Management"
        metricsPath="/venues/categories/management/metrics"
        createPath="/venues/categories/management/create"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} title={card.title} value={card.value} />
        ))}
      </div>

      <CategoryQuickLinks
        pausedCount={pausedCount}
        deletedCount={deletedCount}
        pausedPath="/venues/categories/management/paused"
        deletedPath="/venues/categories/management/deleted"
      />

      {isError ? <p className="text-sm text-red-400">Failed to load venue categories.</p> : null}

      <DataTable
        columns={columns}
        data={categories}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="categories"
      />

      {exportFilterModals}
    </div>
  )
}
