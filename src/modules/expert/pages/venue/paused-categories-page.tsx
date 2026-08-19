import { useCallback, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildVenueCategoryListQueryParams,
  createVenueCategoryFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchPausedVenueCategories } from '../../api/venue-category-api'
import CategoryHeader from '../../components/category/CategoryHeader'
import { pausedVenueCategoryColumns } from '../../components/category/PausedVenueCategoryColumns'
import { type VenueCategory } from '../../components/category/venue-category-table-columns'
import { usePausedVenueCategoryList } from '../../hooks/use-venue-category-management'
import { mapVenueCategoryToUi } from '../../utils/category-mapper'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (cat: VenueCategory) => string }
> = {
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
  venues: {
    header: 'No. Of Venues',
    accessor: (cat) => exportDisplayValue(cat.venues),
  },
  revenue: {
    header: 'Revenue Generated',
    accessor: (cat) => exportDisplayValue(cat.revenue),
  },
}

export function PausedVenueCategoriesPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

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
      }),
    [appliedFilters, page, searchValue],
  )

  const { data, isLoading, isError } = usePausedVenueCategoryList(categoryQueryParams)

  const pausedCategories = useMemo(() => data?.categories ?? [], [data?.categories])
  const totalItems = data?.pagination?.total ?? pausedCategories.length
  const totalPages = Math.max(1, data?.pagination?.totalPages ?? Math.ceil(totalItems / PAGE_SIZE))

  const handleExportData = useMemo(
    () =>
      createVenueCategoryFilteredExportHandler(
        async (params) => {
          const response = await fetchPausedVenueCategories(params)
          return { data: (response.data ?? []).map(mapVenueCategoryToUi) }
        },
        EXPORT_COLUMN_MAP,
        'paused_venue_categories_export',
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

  const emptyMessage = useMemo(
    () => (isError ? 'Failed to load paused categories.' : 'No paused categories found.'),
    [isError],
  )

  return (
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <CategoryHeader
          title="Paused Categories"
          breadcrumb="Paused Categories"
          backPath="/venues/categories/management"
        />

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/categories/management/metrics?section=table')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/categories/management/create')}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={pausedVenueCategoryColumns}
        data={pausedCategories}
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
