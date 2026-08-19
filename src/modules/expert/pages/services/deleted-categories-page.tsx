import { useCallback, useMemo, useState } from 'react'
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
import { fetchCategories } from '../../api/category-api'
import CategoryHeader from '../../components/category/CategoryHeader'
import { type Category } from '../../components/category/category-table-columns'
import { deletedCategoryColumns } from '../../components/category/DeletedCategoryColumns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import { useServiceCategories } from '../../hooks/use-category-management'
import { mapServiceCategoryToUi } from '../../utils/category-mapper'

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
  experts: {
    header: 'No. of Experts',
    accessor: (cat) => exportDisplayValue(cat.experts),
  },
}

const PAGE_SIZE = 10

export const DeletedCategoriesPage = () => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

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
            onClick={() => navigate(scope.metricsPath)}
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
        columns={deletedCategoryColumns}
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
