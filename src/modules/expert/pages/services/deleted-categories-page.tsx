import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import CategoryHeader from '../../components/category/CategoryHeader'
import { deletedCategoryColumns } from '../../components/category/DeletedCategoryColumns'
import { categoryManagementTheme } from '../../components/category/category-management.theme'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import { useServiceCategories } from '../../hooks/use-category-management'

const PAGE_SIZE = 10

export const DeletedCategoriesPage = () => {
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useServiceCategories({
    status: 'DELETED',
    search: searchValue.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const deletedCategories = data?.categories ?? []
  const totalItems = data?.pagination?.total ?? deletedCategories.length
  const totalPages = Math.max(
    1,
    data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE),
  )

  const emptyMessage = useMemo(
    () => (isError ? 'Failed to load deleted categories.' : 'No deleted categories found.'),
    [isError],
  )

  return (
    <div
      className="flex flex-col gap-5 pb-6 md:gap-6"
      style={{ backgroundColor: categoryManagementTheme.pageBg }}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <CategoryHeader title="Deleted Categories" breadcrumb="Deleted Categories" />

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            className="h-10 w-full gap-2 rounded-xl bg-[#FFC16B] px-4 text-[13px] font-semibold text-black shadow-none hover:bg-[#F5C27B] sm:w-auto"
            onClick={() => navigate(scope.metricsPath)}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Manage Metrics
          </Button>

          <Button
            className="h-10 w-full gap-2 rounded-xl bg-[#FFC16B] px-4 text-[13px] font-semibold text-black shadow-none hover:bg-[#F5C27B] sm:w-auto"
            onClick={() => navigate(categoryPath(scope, 'create'))}
          >
            <Plus className="size-4" aria-hidden="true" />
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
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => {}}
        advancedFiltersLabel="Advance Filters"
        onExport={() => {}}
        showSortIcons={false}
        tone="category"
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
