import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import CategoryHeader from '../../components/category/CategoryHeader'
import { pausedVenueCategoryColumns } from '../../components/category/PausedVenueCategoryColumns'
import { categoryManagementTheme } from '../../components/category/category-management.theme'
import { usePausedVenueCategoryList } from '../../hooks/use-venue-category-management'

const PAGE_SIZE = 10

export const PausedVenueCategoriesPage = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const { data: categories = [], isLoading, isError } = usePausedVenueCategoryList()

  const pausedCategories = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return categories

    return categories.filter(
      (category) =>
        category.id.toLowerCase().includes(query) ||
        (category.categoryId || '').toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query),
    )
  }, [categories, searchValue])

  const totalPages = Math.max(1, Math.ceil(pausedCategories.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return pausedCategories.slice(start, start + PAGE_SIZE)
  }, [currentPage, pausedCategories])

  return (
    <div
      className="flex flex-col gap-5 pb-6 md:gap-6"
      style={{ backgroundColor: categoryManagementTheme.pageBg }}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <CategoryHeader title="Paused Categories" breadcrumb="Paused Categories" />

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            className="h-10 w-full gap-2 rounded-xl bg-[#FFC16B] px-4 text-[13px] font-semibold text-black shadow-none hover:bg-[#F5C27B] sm:w-auto"
            onClick={() => navigate('/venues/dashboard/metrics')}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Manage Metrics
          </Button>

          <Button
            className="h-10 w-full gap-2 rounded-xl bg-[#FFC16B] px-4 text-[13px] font-semibold text-black shadow-none hover:bg-[#F5C27B] sm:w-auto"
            onClick={() => navigate('/venues/categories/management/create')}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={pausedVenueCategoryColumns}
        data={paginatedCategories}
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
        emptyMessage={
          isError ? 'Failed to load paused categories.' : 'No paused categories found.'
        }
        pagination={{
          page: currentPage,
          pageSize: PAGE_SIZE,
          totalItems: pausedCategories.length,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="categories"
      />
    </div>
  )
}
