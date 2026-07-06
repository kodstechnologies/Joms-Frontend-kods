import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  payoutRowsMock,
  payoutSummaryMetricsMock,
  type PayoutRow,
  type PayoutStatus,
} from '@/modules/payments/mock/payout-management.mock'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

function SummaryCard({
  label,
  value,
  change,
  changeNote,
}: {
  label: string
  value: string
  change: string
  changeNote: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
      <p className="text-[11px] font-medium text-[#888888]">{label}</p>
      <p className="mt-2 text-[26px] font-bold tracking-tight text-white">{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          <TrendingUp className="size-3" />
          {change}
        </span>
        <span className="text-[10px] text-[#666666]">{changeNote}</span>
      </div>
    </div>
  )
}

function getStatusClassName(status: PayoutStatus) {
  if (status === 'Completed') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  if (status === 'Pending') return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function PayoutManagementPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return payoutRowsMock
    return payoutRowsMock.filter((row) =>
      [row.payoutId, row.recipient, row.type, row.amount, row.method, row.description, row.status]
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

  const visibleRowIds = useMemo(() => pageRows.map((row) => row.id), [pageRows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = useCallback(() => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) return currentIds.filter((id) => !visibleRowIds.includes(id))
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }, [allVisibleSelected, visibleRowIds])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
    )
  }, [])

  const renderActions = useCallback(
    (record: PayoutRow) => (
      <TableActionsDropdown
        label="Open payout actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
        menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            navigate(`/finance/payouts/${record.id}`)
          }}
        >
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<PayoutRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all payouts"
            checked={allVisibleSelected}
            ref={(input) => {
              if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
            }}
            onChange={toggleVisibleRows}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.recipient}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'payoutId',
        header: 'Payout ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.payoutId}</span>
        ),
      },
      { accessorKey: 'recipient', header: 'Recipient' },
      { accessorKey: 'type', header: 'Type' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.amount}</span>,
      },
      { accessorKey: 'method', header: 'Method' },
      { accessorKey: 'initiatedDate', header: 'Initiated Date' },
      { accessorKey: 'description', header: 'Description' },
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
    [
      allVisibleSelected,
      renderActions,
      selectedRowIds,
      someVisibleSelected,
      toggleRowSelection,
      toggleVisibleRows,
    ],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-white">Payout Management</h1>
        <p className="mt-1 text-[13px] text-[#888888]">
          Track revenue, payouts, and financial performance
        </p>
        <p className="mt-3 text-[12px] text-[#888888]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payout Management</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {payoutSummaryMetricsMock.map((metric) => (
          <SummaryCard key={metric.label} {...metric} />
        ))}
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
        searchPlaceholder="Search by name, ID or profession"
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
        resourceLabel="payouts"
        emptyMessage="No payout records found."
      />
    </div>
  )
}
