import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { VENUE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDataToFile } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'

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
  useVenueCategoryDetails,
  useVenueCategoryManagementList,
} from '../../hooks/use-venue-category-management'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'

const PAGE_SIZE = 10

export function VenueCategoryManagementPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const preferencesQuery = useTableColumnPreferences(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const handleApplyFilters = useCallback(() => {
    setPage(1)
  }, [])

  const { data, isLoading, isError } = useVenueCategoryManagementList({
    search: searchValue.trim() || undefined,
  })

  const categories = useMemo(() => data?.categories ?? [], [data?.categories])
  const totalItems = categories.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return categories.slice(start, start + PAGE_SIZE)
  }, [categories, currentPage])

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      const headers = [
        'Category ID',
        'Category Name',
        'Status',
        'No. of Sub Category',
        'No. Of Venues',
        'Revenue Generated',
      ]
      const exportRows = paginatedCategories.map((cat) => [
        cat.categoryId || cat.id,
        cat.name || '',
        cat.status || '',
        String(cat.subCategory || 0),
        String(cat.venues || 0),
        cat.revenue || '',
      ])
      exportDataToFile(headers, exportRows, format, 'venue_categories_export')
    },
    [paginatedCategories],
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

  const { data: pausedCategories = [] } = usePausedVenueCategoryList()
  const { data: deletedCategories = [] } = useDeletedVenueCategoryList()
  const { data: details = [] } = useVenueCategoryDetails()

  const activeCount = useMemo(
    () =>
      details.filter((item) => {
        const status = item.status?.toUpperCase()
        return status === 'ACTIVE'
      }).length,
    [details],
  )

  const totalSubCategories = useMemo(
    () => details.reduce((sum, item) => sum + (item.subCategoryCount || 0), 0),
    [details],
  )

  const defaultMetricIds = useMemo(
    () => ['total-categories', 'active-categories', 'total-sub-categories', 'top-category'],
    [],
  )
  const activeMetricIds = useActiveMetricIds(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY, defaultMetricIds)

  const metricCardCatalog = useMemo(
    () => [
      {
        id: 'total-categories',
        title: 'Total categories',
        value: String(details.length || totalItems),
      },
      {
        id: 'active-categories',
        title: 'Active Categories',
        value: String(activeCount || totalItems),
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
        value: String(pausedCategories.length),
      },
      {
        id: 'deleted-categories',
        title: 'Deleted Categories',
        value: String(deletedCategories.length),
      },
      {
        id: 'total-venues',
        title: 'Total Venues',
        value: '0',
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: '—',
      },
    ],
    [
      activeCount,
      categories,
      deletedCategories.length,
      details.length,
      pausedCategories.length,
      totalItems,
      totalSubCategories,
    ],
  )

  const metricCards = orderByActiveMetricIds(metricCardCatalog, activeMetricIds)

  const columns = useMemo<ColumnDef<VenueCategory>[]>(() => {
    const defaultVisibleIds = ['categoryId', 'name', 'status', 'subCategory', 'venues', 'revenue']
    const visibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : defaultVisibleIds

    const dataColumnsById = Object.fromEntries(
      venueCategoryColumns.map((column) => [column.id, column] as const),
    ) as Record<string, ColumnDef<VenueCategory>>
    const selectedDataColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)
    const actionsColumn = dataColumnsById.actions

    return actionsColumn ? [...selectedDataColumns, actionsColumn] : selectedDataColumns
  }, [preferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <CategoryManagementPageHeader
        title="Category Management"
        metricsPath="/venues/categories/management/metrics?section=table"
        createPath="/venues/categories/management/create"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <StatCard key={card.id} title={card.title} value={card.value} />
        ))}
      </div>

      <CategoryQuickLinks
        pausedCount={pausedCategories.length}
        deletedCount={deletedCategories.length}
        pausedPath="/venues/categories/management/paused"
        deletedPath="/venues/categories/management/deleted"
      />

      {isError ? <p className="text-sm text-red-400">Failed to load venue categories.</p> : null}

      <DataTable
        columns={columns}
        data={paginatedCategories}
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
          page: currentPage,
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
