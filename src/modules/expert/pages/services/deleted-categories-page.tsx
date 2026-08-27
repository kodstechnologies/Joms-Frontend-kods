import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildCategoryListQueryParams,
  createCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import { fetchCategories } from '../../api/category-api'
import CategoryHeader from '../../components/category/CategoryHeader'
import { type Category } from '../../components/category/category-table-columns'
import { deletedCategoryColumns } from '../../components/category/DeletedCategoryColumns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import {
  DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
} from '../../config/service-category-management-table-columns.config'
import { useServiceCategories } from '../../hooks/use-category-management'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { mapServiceCategoryToUi } from '../../utils/category-mapper'
import { selectPreferredColumns } from '../../utils/select-preferred-columns'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (cat: Category) => string }> = {
  'category-id': {
    header: 'Category ID',
    accessor: (cat) => exportDisplayValue(cat.categoryId || cat.id),
  },
  'category-name': { header: 'Category Name', accessor: (cat) => exportDisplayValue(cat.name) },
  'sub-categories': {
    header: 'Number of Sub Categories',
    accessor: (cat) => exportDisplayValue(cat.subCategory),
  },
  'active-listings': {
    header: 'Active Listings',
    accessor: (cat) => exportDisplayValue(cat.services),
  },
  'total-experts': {
    header: 'Total Experts',
    accessor: (cat) => exportDisplayValue(cat.experts),
  },
  'total-orders': {
    header: 'Total Orders',
    accessor: (cat) => exportDisplayValue(cat.totalOrders),
  },
  'completed-orders': {
    header: 'Completed Orders',
    accessor: (cat) => exportDisplayValue(cat.completedOrders),
  },
  'in-progress-orders': {
    header: 'In Progress Orders',
    accessor: (cat) => exportDisplayValue(cat.inProgressOrders),
  },
  'cancelled-orders': {
    header: 'Cancelled Orders',
    accessor: (cat) => exportDisplayValue(cat.cancelledOrders),
  },
  'revenue-generated': {
    header: 'Revenue Generated',
    accessor: (cat) => exportDisplayValue(cat.revenue),
  },
  'repeat-booking-pct': {
    header: 'Repeat Booking %',
    accessor: (cat) => exportDisplayValue(cat.repeatBookingPct),
  },
  status: { header: 'Status', accessor: (cat) => exportDisplayValue(cat.status) },
  'created-by': { header: 'Created By', accessor: (cat) => exportDisplayValue(cat.createdBy) },
  'created-at': { header: 'Created At', accessor: (cat) => exportDisplayValue(cat.createdAt) },
  'last-updated': { header: 'Last Updated', accessor: (cat) => exportDisplayValue(cat.updatedAt) },
}

const PAGE_SIZE = 10
const DEFAULT_VISIBLE_IDS = DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS

export const DeletedCategoriesPage = () => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
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
        status: 'DELETED',
      }),
    [appliedFilters, page, searchValue],
  )

  const { data, isLoading, isError } = useServiceCategories(categoryQueryParams)

  const deletedCategories = useMemo(() => data?.categories ?? [], [data?.categories])
  const totalItems = data?.pagination?.total ?? deletedCategories.length
  const totalPages = Math.max(1, data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE))

  const columns = useMemo<ColumnDef<Category>[]>(() => {
    const rawVisibleIds = preferencesQuery.data?.visibleColumnIds?.length
      ? preferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_IDS
    return selectPreferredColumns(
      deletedCategoryColumns,
      rawVisibleIds,
      DEFAULT_VISIBLE_IDS,
      SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP,
    )
  }, [preferencesQuery.data])

  const handleExportData = useMemo(
    () =>
      createCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchCategories(params)
          return { data: (response.data ?? []).map(mapServiceCategoryToUi) }
        },
        EXPORT_COLUMN_MAP,
        'deleted_service_categories_export',
        { status: 'DELETED' },
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

  const emptyMessage = useMemo(
    () => (isError ? 'Failed to load deleted categories.' : 'No deleted categories found.'),
    [isError],
  )

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <CategoryHeader
          title="Deleted Categories"
          breadcrumb="Deleted Categories"
          backPath={scope.basePath}
        />

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            variant="secondary"
            className="ui-manage-metrics w-full md:w-auto"
            onClick={() => navigate(`${scope.metricsPath}?section=table`)}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            className="w-full md:w-auto"
            onClick={() => navigate(categoryPath(scope, 'create'))}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={deletedCategories}
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
        emptyMessage={emptyMessage}
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
