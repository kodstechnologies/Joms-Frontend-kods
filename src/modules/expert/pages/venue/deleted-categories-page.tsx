import { useMemo, useState } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import CategoryHeader from '../../components/category/CategoryHeader'
import { deletedVenueCategoryColumns } from '../../components/category/DeletedVenueCategoryColumns'
import { useDeletedVenueCategoryList } from '../../hooks/use-venue-category-management'

const PAGE_SIZE = 10

export function DeletedVenueCategoriesPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const { data: deletedCategories = [], isLoading, isError } = useDeletedVenueCategoryList()

  const filteredCategories = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return deletedCategories

    return deletedCategories.filter((category) => {
      const id = (category.categoryId || category.id || '').toLowerCase()
      const name = (category.name || '').toLowerCase()
      return id.includes(query) || name.includes(query)
    })
  }, [deletedCategories, searchValue])

  const totalItems = filteredCategories.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCategories.slice(start, start + PAGE_SIZE)
  }, [filteredCategories, currentPage])

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
          backPath="/venues/categories/management"
        />

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            variant="secondary"
            className="w-full md:w-auto"
            onClick={() => navigate('/venues/dashboard/metrics')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            className="w-full md:w-auto"
            onClick={() => navigate('/venues/categories/management/create')}
          >
            <Plus className="size-4" />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={deletedVenueCategoryColumns}
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
