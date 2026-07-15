import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import CategoryHeader from '../../components/category/CategoryHeader'
import { pausedVenueCategoryColumns } from '../../components/category/PausedVenueCategoryColumns'
import { usePausedVenueCategoryList } from '../../hooks/use-venue-category-management'

const PAGE_SIZE = 10

export function PausedVenueCategoriesPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const { data: pausedCategories = [], isLoading, isError } = usePausedVenueCategoryList()

  const filteredCategories = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return pausedCategories

    return pausedCategories.filter((category) => {
      const id = (category.categoryId || category.id || '').toLowerCase()
      const name = (category.name || '').toLowerCase()
      return id.includes(query) || name.includes(query)
    })
  }, [pausedCategories, searchValue])

  const totalItems = filteredCategories.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCategories.slice(start, start + PAGE_SIZE)
  }, [filteredCategories, currentPage])

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
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/dashboard/metrics')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/categories/management/create')}
          >
            <Plus className="size-4" />
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
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={() => {}}
        onExport={() => {}}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        pagination={{
          page: currentPage,
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
