import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS,
  SERVICE_CATEGORY_LEGACY_METRIC_ID_MAP,
} from '../../config/service-category-management-metrics.config'
import {
  DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../../config/service-category-management-table-columns.config'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_CATEGORY_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { SERVICE_CATEGORY_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildCategoryListQueryParams,
  createCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchCategories } from '../../api/category-api'
import { StatCard } from '../../components/stat-card'
import { type Category, categoryColumns } from '../../components/category/category-table-columns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import {
  CategoryManagementPageHeader,
  CategoryQuickLinks,
} from '../../components/category/category-list-shared'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import {
  useServiceCategories,
  useServiceCategoryMetrics,
} from '../../hooks/use-category-management'
import { mapServiceCategoryToUi } from '../../utils/category-mapper'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const SERVICE_CATEGORY_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
)

const normalizeServiceColumnIds = (ids: string[]) =>
  ids.map((id) => SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP[id] ?? id)

const normalizeServiceMetricIds = (ids: string[]) =>
  ids.map((id) => SERVICE_CATEGORY_LEGACY_METRIC_ID_MAP[id] ?? id)

const DEFAULT_VISIBLE_IDS = DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS

export function CategoryManagementPage() {
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_CATEGORY_COLUMN_SORT_FIELDS,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const scope = useCategoryManagementScope()
  const preferencesQuery = useTableColumnPreferences(SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((c) => c.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: preferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
  })

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setPage(1)
    setAppliedFilters(values)
  }, [])

  const categoryQueryParams = useMemo(
    () =>
      buildCategoryListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'ACTIVE',
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )

  const { data, isLoading, isError } = useServiceCategories(categoryQueryParams)
  const { data: metrics } = useServiceCategoryMetrics()

  const categories = useMemo(() => data?.categories ?? [], [data?.categories])

  const handleExportData = useMemo(
    () =>
      createCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchCategories(params)
          return { data: (response.data ?? []).map(mapServiceCategoryToUi) }
        },
        SERVICE_CATEGORY_EXPORT_COLUMN_MAP,
        'service_categories_export',
        { status: 'ACTIVE' },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [catalogColumnIds, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-category-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const { data: pausedData } = useServiceCategories({
    status: 'PAUSED',
    page: 1,
    limit: 1,
  })

  const { data: deletedData } = useServiceCategories({
    status: 'DELETED',
    page: 1,
    limit: 1,
  })

  const { data: allData } = useServiceCategories({
    page: 1,
    limit: 1,
  })

  const totalItems = data?.pagination?.total ?? categories.length
  const totalPages = Math.max(1, data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE))

  const pausedCount = metrics?.pausedCategories ?? pausedData?.pagination?.total ?? 0
  const deletedCount = metrics?.deletedCategories ?? deletedData?.pagination?.total ?? 0

  const savedMetricIdsRaw = useActiveMetricIds(SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY, [
    ...DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS,
  ])
  const savedMetricIds = useMemo(
    () => normalizeServiceMetricIds(savedMetricIdsRaw),
    [savedMetricIdsRaw],
  )
  const activeMetricIds = useMemo(() => {
    const missingDefaults = DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS.filter(
      (id) => !savedMetricIds.includes(id),
    )
    return [...missingDefaults, ...savedMetricIds]
  }, [savedMetricIds])

  const metricCardCatalog = useMemo(
    () => [
      {
        id: 'total-categories',
        title: 'Total Categories',
        value: String(metrics?.totalCategories ?? allData?.pagination?.total ?? totalItems),
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
        value: metrics?.lowestRevenueCategory?.name || '—',
      },
      {
        id: 'highest-order-category',
        title: 'Highest Order Category',
        value: metrics?.highestOrderCategory?.name || '—',
      },
      {
        id: 'lowest-order-category',
        title: 'Lowest Order Category',
        value: metrics?.lowestOrderCategory?.name || '—',
      },
      {
        id: 'total-orders',
        title: 'Total Orders',
        value: String(metrics?.totalOrders ?? 0),
      },
      {
        id: 'completed-orders',
        title: 'Completed Orders',
        value: String(metrics?.completedOrders ?? 0),
      },
      {
        id: 'order-completion-rate',
        title: 'Order Completion Rate',
        value: `${metrics?.orderCompletionRate ?? 0}%`,
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: metrics?.totalRevenueLabel || '₹0.00',
      },
    ],
    [allData?.pagination?.total, deletedCount, metrics, pausedCount, totalItems],
  )

  const metricCards = orderByActiveMetricIds(metricCardCatalog, activeMetricIds)

  const columns = useMemo<ColumnDef<Category>[]>(() => {
    const rawVisibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS
    const visibleIds = normalizeServiceColumnIds(rawVisibleIds)

    const dataColumnsById = Object.fromEntries(
      categoryColumns.map((column) => [column.id, column] as const),
    ) as Record<string, ColumnDef<Category>>
    const matched = visibleIds.filter((id) => id in dataColumnsById)
    const selectedDataColumns = sortIdsByCatalogOrder(
      matched.length > 0 ? matched : DEFAULT_VISIBLE_IDS,
      DEFAULT_VISIBLE_IDS,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)
    const actionsColumn = dataColumnsById.actions

    return withServerSortMeta(
      actionsColumn ? [...selectedDataColumns, actionsColumn] : selectedDataColumns,
      SERVICE_CATEGORY_COLUMN_SORT_FIELDS,
    )
  }, [preferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <CategoryManagementPageHeader
        title="Category Management"
        metricsPath={scope.metricsPath}
        createPath={categoryPath(scope, 'create')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} title={card.title} value={card.value} />
        ))}
      </div>

      <CategoryQuickLinks
        pausedCount={pausedCount}
        deletedCount={deletedCount}
        pausedPath={categoryPath(scope, 'paused')}
        deletedPath={categoryPath(scope, 'deleted')}
      />

      {isError ? <p className="text-sm text-red-400">Failed to load categories.</p> : null}

      <DataTable
        columns={columns}
        data={categories}
        getRowId={(row) => row.id}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_CATEGORY_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        {...serverSort.dataTableSortProps}
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
