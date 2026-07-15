import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowLeftRight,
  Eye,
  FileText,
  GitMerge,
  SlidersHorizontal,
  SquarePen,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  refundChargebackRowsMock,
  refundSummaryMetricsMock,
  type RefundChargebackRow,
  type RefundChargebackStatus,
} from '@/modules/payments/mock/finance-refunds.mock'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

function getStatusClassName(status: RefundChargebackStatus) {
  if (status === 'Resolved') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  }
  if (status === 'Pending') {
    return 'border-teal-500/25 bg-teal-500/10 text-teal-400'
  }
  if (status === 'Open') {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  }
  return 'border-blue-500/25 bg-blue-500/10 text-blue-400'
}

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

export function FinanceRefundsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return refundChargebackRowsMock

    return refundChargebackRowsMock.filter((row) =>
      [
        row.recordId,
        row.type,
        row.relatedEntity,
        row.amount,
        row.reason,
        row.initiatedDate,
        row.description,
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

  const visibleRowIds = useMemo(() => pageRows.map((row) => row.id), [pageRows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = useCallback(() => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleRowIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }, [allVisibleSelected, visibleRowIds])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
    )
  }, [])

  const renderActions = useCallback(
    (record: RefundChargebackRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open refund record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={220}
          menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(
                record.type === 'Dispute'
                  ? `/finance/refunds/${record.id}/dispute`
                  : `/finance/refunds/${record.id}`,
              )
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Edit ticket coming soon')}
          >
            Edit Ticket
          </TableActionsItem>
          <TableActionsItem
            icon={<ArrowLeftRight className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Change status coming soon')}
          >
            Change Status
          </TableActionsItem>
          <TableActionsItem
            icon={<SlidersHorizontal className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Change priority coming soon')}
          >
            Change Priority
          </TableActionsItem>
          <TableActionsItem
            icon={<FileText className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Add internal note coming soon')}
          >
            Add internal note
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Add tags coming soon')}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Escalate coming soon')}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="size-3.5 text-rose-500" aria-hidden="true" />}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => toast.message('Delete coming soon')}
          >
            Delete
          </TableActionsItem>
          <TableActionsItem
            icon={<GitMerge className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Merge coming soon')}
          >
            Merge
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<RefundChargebackRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all refund records"
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
            aria-label={`Select ${row.original.recordId}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'recordId',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-white uppercase">
            {row.original.recordId}
          </span>
        ),
      },
      { accessorKey: 'type', header: 'Type' },
      { accessorKey: 'relatedEntity', header: 'Related Entity' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.amount}</span>,
      },
      { accessorKey: 'reason', header: 'Reason' },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Refunds & Chargebacks</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Track revenue, payouts, and financial performance
          </p>
        </div>
        <Button onClick={() => toast.message('Metrics configuration coming soon')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {refundSummaryMetricsMock.map((metric) => (
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
        resourceLabel="users"
        emptyMessage="No refund records found."
      />
    </div>
  )
}
