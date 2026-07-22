import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  financeEventRowsMock,
  financeEventSummaryMetricsMock,
  type FinanceEventRow,
  type FinanceEventStatus,
} from '@/modules/payments/mock/finance-events.mock'
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
    <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{label}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-body-sm-semibold bg-brand-positive/15 text-brand-positive inline-flex items-center gap-1 rounded-md px-2 py-0.5">
          <TrendingUp className="size-3" />
          {change}
        </span>
        <span className="text-body-sm text-muted">{changeNote}</span>
      </div>
    </div>
  )
}

function getStatusClassName(status: FinanceEventStatus) {
  if (status === 'Paid') return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function FinanceEventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return financeEventRowsMock
    return financeEventRowsMock.filter((row) =>
      [row.eventId, row.eventName, row.organizer, row.ticketSales, row.status]
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
    (record: FinanceEventRow) => (
      <TableActionsDropdown
        label="Open event finance actions"
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
            toast.message('Event payment detail coming soon')
          }}
        >
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId],
  )

  const columns = useMemo<ColumnDef<FinanceEventRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all events"
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
            aria-label={`Select ${row.original.eventName}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'eventId',
        header: 'Event ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.eventId}
          </span>
        ),
      },
      { accessorKey: 'eventName', header: 'Event Name' },
      { accessorKey: 'organizer', header: 'Organizer' },
      {
        accessorKey: 'ticketSales',
        header: 'Ticket Sales',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.ticketSales}</span>
        ),
      },
      { accessorKey: 'platformFee', header: 'Platform Fee' },
      { accessorKey: 'netRevenue', header: 'Net Revenue' },
      { accessorKey: 'eventDate', header: 'Event Date' },
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
        <h1 className="text-h2 text-brand-text tracking-tight">Events</h1>
        <p className="text-body-md text-muted mt-1">
          Track event ticket revenue, settlements, and refunds
        </p>
        <p className="text-body-sm text-muted mt-3">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Events</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeEventSummaryMetricsMock.map((metric) => (
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
        resourceLabel="events"
        emptyMessage="No event finance records found."
      />
    </div>
  )
}
