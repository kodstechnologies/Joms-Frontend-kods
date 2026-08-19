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
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import { useFinanceListFilters } from '@/modules/payments/hooks/use-finance-list-filters'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'

const PAGE_SIZE = 10

function getStatusClassName(status: FinanceCategoryStatus) {
  if (status === 'Active')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

export function FinanceCategoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return financeCategoryRowsMock
    return financeCategoryRowsMock.filter((row) =>
      [
        row.categoryName,
        row.module,
        row.platformFee,
        row.commissionRate,
        row.payoutCycle,
        row.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [searchQuery])

  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, safePage])

  const handleExportData = useCallback(async (_values: FilterValues, format: string) => {
    if (!filteredRows.length) throw new Error('NO_RECORDS')
    exportDataToFile(
      ['Category', 'Module', 'Status'],
      filteredRows.map((row) => [
        exportDisplayValue(row.categoryName),
        exportDisplayValue(row.module),
        exportDisplayValue(row.status),
      ]),
      format,
      'finance_categories_export',
    )
  }, [filteredRows])
  const { onAdvancedFilter, onExport, modals: exportFilterModals } =
    useFinanceListFilters(handleExportData)

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

  const columns = useMemo<ColumnDef<FinanceCategoryRow>[]>(
    () => [
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
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by category or module"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
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
