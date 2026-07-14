import { useMemo, useState } from 'react'

import { DataTable } from '@/shared/components/table/data-table'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'

import { StatCard } from '../../components/stat-card'
import { categoryColumns } from '../../components/category/category-table-columns'
import {
  categoryPath,
  useCategoryManagementScope,
} from '../../components/category/category-management-scope'
import {
  CategoryManagementPageHeader,
  CategoryQuickLinks,
} from '../../components/category/category-list-shared'
import { useServiceCategories } from '../../hooks/use-category-management'

const PAGE_SIZE = 10

export function CategoryManagementPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)

  const scope = useCategoryManagementScope()

  const { onAdvancedFilter, onExport, modals: exportFilterModals } = useModuleExportFilters({
    moduleKey: 'service-category-management',
  })

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
    <div className="flex flex-col gap-4 p-0 md:gap-6">
      <CategoryManagementPageHeader
        title="Category Management"
        metricsPath={scope.metricsPath}
        createPath={categoryPath(scope, 'create')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total categories" value={String(allData?.pagination?.total ?? totalItems)} />
        <StatCard title="Active Categories" value={String(totalItems)} />
        <StatCard title="Total Sub-Category" value={String(totalSubCategories)} />
        <StatCard title="Top Category" value={categories[0]?.name || '—'} />
      </div>

      <CategoryQuickLinks
        pausedCount={pausedData?.pagination?.total ?? 0}
        deletedCount={deletedData?.pagination?.total ?? 0}
        pausedPath={categoryPath(scope, 'paused')}
        deletedPath={categoryPath(scope, 'deleted')}
      />

      {isError ? <p className="text-sm text-red-400">Failed to load categories.</p> : null}

      <DataTable
        columns={categoryColumns}
        data={categories}
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
