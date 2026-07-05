import { useMemo, useState } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import CategoryHeader from '../../components/category/CategoryHeader'
import { pausedCategoryColumns } from '../../components/category/PausedCategoryColumns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import { useServiceCategories } from '../../hooks/use-category-management'

const PAGE_SIZE = 10

export const PausedCategoriesPage = () => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useServiceCategories({
    status: 'PAUSED',
    search: searchValue.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const pausedCategories = data?.categories ?? []
  const totalItems = data?.pagination?.total ?? pausedCategories.length
  const totalPages = Math.max(
    1,
    data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE),
  )

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
          backPath={scope.basePath}
        />

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            variant="secondary"
            className="w-full md:w-auto"
            onClick={() => navigate(scope.metricsPath)}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button className="w-full md:w-auto" onClick={() => navigate(categoryPath(scope, 'create'))}>
            <Plus className="size-4" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={pausedCategoryColumns}
        data={pausedCategories}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={() => {}}
        onExport={() => {}}
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
    </div>
  )
}
