import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  escrowBookingRowsMock,
  escrowHoldRowsMock,
  escrowManagementTabs,
  type EscrowBookingRow,
  type EscrowHoldRow,
  type EscrowHoldStatus,
  type EscrowManagementTab,
} from '@/modules/payments/mock/finance-escrow.mock'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

function getEscrowStatusClassName(status: EscrowHoldStatus) {
  if (status === 'Active' || status === 'Released') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  }
  return 'border-amber-600/25 bg-amber-600/15 text-amber-400'
}

function getBookingStatusClassName(status: EscrowBookingRow['status']) {
  if (status === 'Paid') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  }
  return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
}

export function EscrowManagementPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<EscrowManagementTab>('escrow')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const isEscrowTab = activeTab === 'escrow' || activeTab === 'all'

  const escrowTabRows = useMemo(
    () => escrowHoldRowsMock.filter((row) => row.tab === activeTab),
    [activeTab],
  )

  const bookingTabRows = useMemo(
    () => escrowBookingRowsMock.filter((row) => row.tab === activeTab),
    [activeTab],
  )

  const filteredEscrowRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return escrowTabRows

    return escrowTabRows.filter((row) =>
      [
        row.escrowId,
        row.transactionId,
        row.type,
        row.amount,
        row.holdReason,
        row.initiatedDate,
        row.expectedRelease,
        row.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [escrowTabRows, searchQuery])

  const filteredBookingRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return bookingTabRows

    return bookingTabRows.filter((row) =>
      [row.serviceId, row.name, row.expertName, row.bookingId, row.userName]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [bookingTabRows, searchQuery])

  const filteredRows = isEscrowTab ? filteredEscrowRows : filteredBookingRows
  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageEscrowRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredEscrowRows.slice(start, start + PAGE_SIZE)
  }, [filteredEscrowRows, safePage])

  const pageBookingRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredBookingRows.slice(start, start + PAGE_SIZE)
  }, [filteredBookingRows, safePage])

  const pageRows = isEscrowTab ? pageEscrowRows : pageBookingRows
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
      currentIds.includes(rowId)
        ? currentIds.filter((id) => id !== rowId)
        : [...currentIds, rowId],
    )
  }, [])

  const renderEscrowActions = useCallback(
    (record: EscrowHoldRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open escrow record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={180}
          menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/escrow/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const renderBookingActions = useCallback(
    (record: EscrowBookingRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open booking record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={180}
          menuClassName="border-slate-200 bg-white py-1.5 shadow-xl"
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/escrow/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const escrowColumns = useMemo<ColumnDef<EscrowHoldRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all escrow records"
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
            aria-label={`Select ${row.original.escrowId}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'escrowId',
        header: 'Escrow ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.escrowId}</span>
        ),
      },
      {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-[#888888]">{row.original.transactionId}</span>
        ),
      },
      { accessorKey: 'type', header: 'Type' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.amount}</span>,
      },
      { accessorKey: 'holdReason', header: 'Hold Reason' },
      { accessorKey: 'initiatedDate', header: 'Initiated Date' },
      { accessorKey: 'expectedRelease', header: 'Expected Release' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              getEscrowStatusClassName(row.original.status),
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
        cell: ({ row }) => renderEscrowActions(row.original),
      },
    ],
    [
      allVisibleSelected,
      renderEscrowActions,
      selectedRowIds,
      someVisibleSelected,
      toggleRowSelection,
      toggleVisibleRows,
    ],
  )

  const bookingColumns = useMemo<ColumnDef<EscrowBookingRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all booking records"
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
            aria-label={`Select ${row.original.name}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'serviceId',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.serviceId}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.name}</span>,
      },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] uppercase text-white">{row.original.bookingId}</span>
        ),
      },
      { accessorKey: 'userName', header: 'User Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              getBookingStatusClassName(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.revenue}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderBookingActions(row.original),
      },
    ],
    [
      allVisibleSelected,
      renderBookingActions,
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
          <h1 className="text-[28px] font-bold tracking-tight text-white">Escrow Management</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="mt-3 text-[12px] text-[#888888]">
            <Link to="/finance/dashboard" className="transition-colors hover:text-white">
              Finance Management
            </Link>
            <span> / </span>
            <Link to="/finance/services" className="transition-colors hover:text-white">
              Services
            </Link>
          </p>
        </div>
        <Button onClick={() => toast.message('Metrics configuration coming soon')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {escrowManagementTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1)
              setSearchQuery('')
              setSelectedRowIds([])
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors',
              activeTab === tab.id
                ? 'bg-[#2A2A2A] text-white'
                : 'text-[#888888] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isEscrowTab ? (
        <DataTable
          columns={escrowColumns}
          data={pageEscrowRows}
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
          emptyMessage="No escrow records found."
        />
      ) : (
        <DataTable
          columns={bookingColumns}
          data={pageBookingRows}
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
          emptyMessage="No booking records found."
        />
      )}
    </div>
  )
}
