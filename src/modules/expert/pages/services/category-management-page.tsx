import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'

import { StatCard } from '../../components/stat-card'
import { SummaryCard } from '../../components/summary-card'
import { categoryColumns } from '../../components/category/category-table-columns'
import { categoryManagementTheme } from '../../components/category/category-management.theme'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import { useServiceCategories } from '../../hooks/use-category-management'

const PAGE_SIZE = 10

export function CategoryManagementPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const scope = useCategoryManagementScope()

  const { data, isLoading, isError } = useServiceCategories({
    status: 'ACTIVE',
    search: searchValue.trim() || undefined,
    page,
    limit: PAGE_SIZE,
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

  const categories = data?.categories ?? []
  const totalItems = data?.pagination?.total ?? categories.length
  const totalPages = Math.max(
    1,
    data?.pagination?.pages ?? Math.ceil(totalItems / PAGE_SIZE),
  )

  const totalSubCategories = useMemo(
    () => categories.reduce((sum, category) => sum + category.subCategory, 0),
    [categories],
  )

  return (
    <div
      className="flex flex-col gap-5 pb-6 md:gap-6"
      style={{ backgroundColor: categoryManagementTheme.pageBg }}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white md:text-[28px]">
            Category Management
          </h1>
          <p className="mt-1.5 text-[13px] text-[#888888]">
            Monitor and manage all categories & sub-category
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            variant="secondary"
            className="h-10 w-full gap-2 rounded-xl border border-[#FFC16B] bg-transparent px-4 text-[13px] font-semibold text-[#FFC16B] shadow-none hover:bg-[#FFC16B]/10 sm:w-auto"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total categories"
          value={String(allData?.pagination?.total ?? totalItems)}
        />
        <StatCard title="Active Categories" value={String(totalItems)} />
        <StatCard title="Total Sub-Category" value={String(totalSubCategories)} />
        <StatCard
          title="Top Category"
          value={categories[0]?.name || '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCard
          onClick={() => navigate(categoryPath(scope, 'paused'))}
          title="Paused Category"
          value={String(pausedData?.pagination?.total ?? 0).padStart(2, '0')}
          color="yellow"
        />

        <SummaryCard
          onClick={() => navigate(categoryPath(scope, 'deleted'))}
          title="Deleted Category"
          value={String(deletedData?.pagination?.total ?? 0).padStart(2, '0')}
          color="red"
        />
      </div>

      {isError ? (
        <p className="text-sm text-red-400">Failed to load categories.</p>
      ) : null}

      <DataTable
        columns={categoryColumns}
        data={categories}
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
