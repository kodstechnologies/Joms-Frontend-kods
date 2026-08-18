import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS } from '../../config/service-category-management-metrics.config'
import { DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS } from '../../config/service-category-management-table-columns.config'
import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildCategoryListQueryParams,
  createCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchCategories } from '../../api/category-api'
import { mapServiceCategoryToUi } from '../../utils/category-mapper'

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
import { useServiceCategories } from '../../hooks/use-category-management'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (cat: Category) => string }> = {
  categoryId: {
    header: 'Category ID',
    accessor: (cat) => exportDisplayValue(cat.categoryId || cat.id),
  },
  name: { header: 'Category Name', accessor: (cat) => exportDisplayValue(cat.name) },
  status: { header: 'Status', accessor: (cat) => exportDisplayValue(cat.status) },
  subCategory: {
    header: 'No. of Sub Category',
    accessor: (cat) => exportDisplayValue(cat.subCategory),
  },
  services: { header: 'No.Of Services', accessor: (cat) => exportDisplayValue(cat.services) },
  experts: { header: 'No.Of Experts', accessor: (cat) => exportDisplayValue(cat.experts) },
  revenue: { header: 'Revenue Generated', accessor: (cat) => exportDisplayValue(cat.revenue) },
}

const DEFAULT_VISIBLE_IDS = DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS

export function CategoryManagementPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const scope = useCategoryManagementScope()
  const preferencesQuery = useTableColumnPreferences(SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setPage(1)
    setAppliedFilters(values)
  }, [])

  const categoryQueryParams = useMemo(
    () =>
      buildCategoryListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        search: searchValue.trim() || undefined,
        status: 'ACTIVE',
      }),
    [appliedFilters, page, searchValue],
  )

  const { data, isLoading, isError } = useServiceCategories(categoryQueryParams)

  const categories = useMemo(() => data?.categories ?? [], [data?.categories])

  const handleExportData = useMemo(
    () =>
      createCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchCategories(params)
          return { data: (response.data ?? []).map(mapServiceCategoryToUi) }
        },
        EXPORT_COLUMN_MAP,
        'service_categories_export',
        { status: 'ACTIVE' },
      ),
    [],
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

  const totalSubCategories = useMemo(
    () => categories.reduce((sum, category) => sum + category.subCategory, 0),
    [categories],
  )

  const activeMetricIds = useActiveMetricIds(SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY, [
    ...DEFAULT_SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS,
  ])

  const metricCardCatalog = useMemo(
    () => [
      {
        id: 'total-categories',
        title: 'Total categories',
        value: String(allData?.pagination?.total ?? totalItems),
      },
      {
        id: 'active-categories',
        title: 'Active Categories',
        value: String(totalItems),
      },
      {
        id: 'total-sub-categories',
        title: 'Total Sub-Category',
        value: String(totalSubCategories),
      },
      {
        id: 'top-category',
        title: 'Top Category',
        value: categories[0]?.name || '—',
      },
      {
        id: 'paused-categories',
        title: 'Paused Categories',
        value: String(pausedData?.pagination?.total ?? 0),
      },
      {
        id: 'deleted-categories',
        title: 'Deleted Categories',
        value: String(deletedData?.pagination?.total ?? 0),
      },
      {
        id: 'total-services',
        title: 'Total Services',
        value: '0',
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: '—',
      },
    ],
    [
      allData?.pagination?.total,
      categories,
      deletedData?.pagination?.total,
      pausedData?.pagination?.total,
      totalItems,
      totalSubCategories,
    ],
  )

  const metricCards = orderByActiveMetricIds(metricCardCatalog, activeMetricIds)

  const columns = useMemo<ColumnDef<Category>[]>(() => {
    const visibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS

    const dataColumnsById = Object.fromEntries(
      categoryColumns.map((column) => [column.id, column] as const),
    ) as Record<string, ColumnDef<Category>>
    const selectedDataColumns = sortIdsByCatalogOrder(
      visibleIds.filter((id) => id in dataColumnsById),
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
        metricsPath={scope.metricsPath}
        createPath={categoryPath(scope, 'create')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} title={card.title} value={card.value} />
        ))}
      </div>

      <CategoryQuickLinks
        pausedCount={pausedData?.pagination?.total ?? 0}
        deletedCount={deletedData?.pagination?.total ?? 0}
        pausedPath={categoryPath(scope, 'paused')}
        deletedPath={categoryPath(scope, 'deleted')}
      />

      {isError ? <p className="text-sm text-red-400">Failed to load categories.</p> : null}

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
