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

const PAGE_SIZE = 10

function getStatusClassName(status: FinanceCategoryStatus) {
  if (status === 'Active') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
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

  const renderActions = useCallback(
    (record: FinanceCategoryRow) => (
      <TableActionsDropdown
        label="Open category actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
        menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
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
              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
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
        <h1 className="text-[28px] font-bold tracking-tight text-white">Category Management</h1>
        <p className="mt-1 text-[13px] text-[#888888]">
          Configure platform fees, commission rates, and payout cycles by category
        </p>
        <p className="mt-3 text-[12px] text-[#888888]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Category Management</span>
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
        onAdvancedFilter={() => toast.message('Advance filters coming soon')}
        onExport={() => toast.message('Export coming soon')}
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
    </div>
  )
}
