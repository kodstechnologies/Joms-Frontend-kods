import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { SquarePen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  financeCategoryRowsMock,
  type FinanceCategoryRow,
  type FinanceCategoryStatus,
} from '@/modules/payments/mock/finance-category.mock'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { sortClientRows, withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_CATEGORY_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  createClientFilteredExportHandler,
  rowMatchesClientFilters,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const FINANCE_CATEGORY_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'categoryName',
  'module',
  'platformFee',
  'commissionRate',
  'taxRate',
  'payoutCycle',
  'status',
])

const CATEGORY_FILTER_ACCESSORS: Record<string, (row: FinanceCategoryRow) => string> = {
  categoryName: (row) => row.categoryName,
  module: (row) => row.module,
  status: (row) => row.status,
  payoutCycle: (row) => row.payoutCycle,
}

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: FinanceCategoryRow) => string }
> = {
  categoryName: {
    header: 'Category Name',
    accessor: (row) => exportDisplayValue(row.categoryName),
  },
  module: { header: 'Module', accessor: (row) => exportDisplayValue(row.module) },
  platformFee: { header: 'Platform Fee', accessor: (row) => exportDisplayValue(row.platformFee) },
  commissionRate: {
    header: 'Commission Rate',
    accessor: (row) => exportDisplayValue(row.commissionRate),
  },
  taxRate: { header: 'Tax Rate', accessor: (row) => exportDisplayValue(row.taxRate) },
  payoutCycle: { header: 'Payout Cycle', accessor: (row) => exportDisplayValue(row.payoutCycle) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

function getStatusClassName(status: FinanceCategoryStatus) {
  if (status === 'Active')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

export function FinanceCategoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: FINANCE_CATEGORY_SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const filteredRows = useMemo(
    () =>
      financeCategoryRowsMock.filter((row) => {
        if (
          !rowMatchesClientFilters(
            row,
            appliedFilters,
            enhancedSearch.globalSearch,
            CATEGORY_FILTER_ACCESSORS,
          )
        ) {
          return false
        }
        for (const [colId, val] of Object.entries(enhancedSearch.columnSearches)) {
          if (!val) continue
          const cellVal = String((row as Record<string, unknown>)[colId] ?? '').toLowerCase()
          if (!cellVal.includes(val.toLowerCase())) return false
        }
        return true
      }),
    [appliedFilters, enhancedSearch.columnSearches, enhancedSearch.globalSearch],
  )

  const sortedRows = useMemo(
    () => sortClientRows(filteredRows, serverSort.sortBy, serverSort.sortOrder),
    [filteredRows, serverSort.sortBy, serverSort.sortOrder],
  )

  const totalItems = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [sortedRows, safePage])

  const renderActions = useCallback(
    (record: FinanceCategoryRow) => (
      <TableActionsDropdown
        label="Open category actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
      >
        <TableActionsItem
          icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            toast.message('Edit category rules coming soon')
          }}
        >
          Edit Rules
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId],
  )

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createClientFilteredExportHandler(
        (values) =>
          financeCategoryRowsMock.filter((row) =>
            rowMatchesClientFilters(
              row,
              values,
              enhancedSearch.globalSearch,
              CATEGORY_FILTER_ACCESSORS,
            ),
          ),
        EXPORT_COLUMN_MAP,
        'finance_categories_export',
      ),
    [enhancedSearch.globalSearch],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-categories',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<FinanceCategoryRow>[]>(
    () =>
      withServerSortMeta(
        [
          { accessorKey: 'categoryName', header: 'Category Name' },
          { accessorKey: 'module', header: 'Module' },
          { accessorKey: 'platformFee', header: 'Platform Fee' },
          { accessorKey: 'commissionRate', header: 'Commission Rate' },
          { accessorKey: 'taxRate', header: 'Tax Rate' },
          { accessorKey: 'payoutCycle', header: 'Payout Cycle' },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
              <span
                className={cn(
                  'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
                  getStatusClassName(row.original.status),
                )}
              >
                {row.original.status}
              </span>
            ),
          },
          {
            id: 'actions',
            header: 'Actions',
            meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
            cell: ({ row }) => renderActions(row.original),
          },
        ],
        FINANCE_CATEGORY_SORT_FIELD_MAP,
      ),
    [renderActions],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2 text-brand-text tracking-tight">Category Management</h1>
        <p className="text-body-md text-muted mt-1">
          Configure platform fees, commission rates, and payout cycles by category
        </p>
        <p className="text-body-sm text-muted mt-3">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Category Management</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_CATEGORY_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by category or module"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page: safePage,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="categories"
        emptyMessage="No finance categories found."
      />

      {exportFilterModals}
    </div>
  )
}
