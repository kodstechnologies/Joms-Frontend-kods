import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Bell, Eye, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  invoiceRowsMock,
  invoiceSummaryMetricsMock,
  type InvoiceRow,
  type InvoiceStatus,
} from '@/modules/payments/mock/invoices-billing.mock'
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
    <div className="bg-brand-surface rounded-xl border border-white/[0.06] p-5">
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

function getStatusClassName(status: InvoiceStatus) {
  if (status === 'Paid') return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function InvoicesBillingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return invoiceRowsMock
    return invoiceRowsMock.filter((row) =>
      [row.invoiceId, row.clientName, row.amount, row.description, row.status]
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
    (record: InvoiceRow) => (
      <TableActionsDropdown
        label="Open invoice actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            navigate(`/finance/invoices/${record.id}`)
          }}
        >
          View Invoice
        </TableActionsItem>
        <TableActionsItem
          icon={<Bell className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            toast.message('Reminder set (static preview)')
          }}
        >
          Set Reminder
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all invoices"
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
            aria-label={`Select ${row.original.clientName}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'invoiceId',
        header: 'Invoice ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.invoiceId}
          </span>
        ),
      },
      { accessorKey: 'clientName', header: 'Client Name' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.amount}</span>,
      },
      { accessorKey: 'issueDate', header: 'Issue Date' },
      { accessorKey: 'dueDate', header: 'Due Date' },
      { accessorKey: 'description', header: 'Description' },
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
        <h1 className="text-h2 text-brand-text tracking-tight">Invoices & Billing</h1>
        <p className="text-body-md text-muted mt-1">
          Track revenue, payouts, and financial performance
        </p>
        <p className="text-body-sm text-muted mt-3">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Invoices & Billing</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {invoiceSummaryMetricsMock.map((metric) => (
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
        resourceLabel="invoices"
        emptyMessage="No invoices found."
      />
    </div>
  )
}
