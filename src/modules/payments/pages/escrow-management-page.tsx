import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import {
  escrowBookingRowsMock,
  escrowManagementTabs,
  type EscrowBookingRow,
  type EscrowHoldRow,
  type EscrowHoldStatus,
  type EscrowManagementTab,
} from '@/modules/payments/mock/finance-escrow.mock'
import { useFinanceEscrow } from '@/modules/payments/hooks/use-finance'
import { mapEscrowToRow } from '@/modules/payments/utils/finance-mappers'
import { fetchFinanceEscrow } from '@/modules/payments/api/finance-api'
import {
  createFinanceRowsExportHandler,
  useFinanceListFilters,
} from '@/modules/payments/hooks/use-finance-list-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
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
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

function getBookingStatusClassName(status: EscrowBookingRow['status']) {
  if (status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

export function EscrowManagementPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<EscrowManagementTab>('escrow')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const handleExportData = useMemo(
    () =>
      createFinanceRowsExportHandler({
        fetchRows: async (params) => (await fetchFinanceEscrow(params))?.data?.rows ?? [],
        headers: ['ID', 'Status', 'Amount', 'Created'],
        mapRow: (row) => [
          exportDisplayValue(row._id),
          exportDisplayValue(row.status),
          exportDisplayValue(row.amount),
          exportDisplayValue(row.createdAt),
        ],
        fileName: 'escrow_export',
      }),
    [],
  )
  const { apiFilterParams, onAdvancedFilter, onExport, modals: exportFilterModals } =
    useFinanceListFilters(handleExportData)

  const isEscrowTab = activeTab === 'escrow' || activeTab === 'all'

  const {
    data: escrowData,
    isLoading,
    isFetching,
    isError,
  } = useFinanceEscrow({
    page: currentPage,
    limit: PAGE_SIZE,
    ...apiFilterParams,
  })

  const liveEscrowRows = useMemo(
    () => (escrowData?.data?.rows ?? []).map(mapEscrowToRow),
    [escrowData],
  )
  const escrowMeta = escrowData?.data?.meta

  const escrowTabRows = useMemo(() => {
    if (activeTab === 'escrow' || activeTab === 'all') return liveEscrowRows
    return []
  }, [activeTab, liveEscrowRows])

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
  const totalItems =
    isEscrowTab && !searchQuery.trim()
      ? (escrowMeta?.total ?? filteredEscrowRows.length)
      : filteredRows.length
  const totalPages =
    isEscrowTab && !searchQuery.trim()
      ? (escrowMeta?.totalPages ?? 1)
      : Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageEscrowRows = useMemo(() => {
    if (isEscrowTab && !searchQuery.trim()) return filteredEscrowRows
    const start = (safePage - 1) * PAGE_SIZE
    return filteredEscrowRows.slice(start, start + PAGE_SIZE)
  }, [filteredEscrowRows, isEscrowTab, safePage, searchQuery])

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
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
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
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.escrowId}
          </span>
        ),
      },
      {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.transactionId}
          </span>
        ),
      },
      { accessorKey: 'type', header: 'Type', enableSorting: false },
      {
        accessorKey: 'amount',
        header: 'Amount',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.amount}</span>
        ),
      },
      { accessorKey: 'holdReason', header: 'Hold Reason', enableSorting: false },
      { accessorKey: 'initiatedDate', header: 'Initiated Date' },
      { accessorKey: 'expectedRelease', header: 'Expected Release', enableSorting: false },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
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
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.serviceId}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="text-brand-text font-medium">{row.original.name}</span>,
      },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.bookingId}
          </span>
        ),
      },
      { accessorKey: 'userName', header: 'User Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
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
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.revenue}</span>
        ),
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
          <h1 className="text-h2 text-brand-text tracking-tight">Escrow Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <Link to="/finance/services" className="hover:text-brand-text transition-colors">
              Services
            </Link>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-escrow')}>
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
              'radius-md text-body-sm-semibold px-4 py-2 transition-colors',
              activeTab === tab.id
                ? 'bg-brand-surface text-brand-text'
                : 'text-muted hover:text-brand-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError && isEscrowTab ? (
        <p className="text-body-sm text-brand-danger">Failed to load escrow holds.</p>
      ) : null}

      {isEscrowTab ? (
        <DataTable
          columns={escrowColumns}
          data={pageEscrowRows}
          getRowId={(row) => row.id}
          isLoading={isLoading || isFetching}
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value)
            setCurrentPage(1)
          }}
          searchPlaceholder="Search by name, ID or profession"
          advancedFilterLabel="Advance Filters"
          onAdvancedFilter={onAdvancedFilter}
          onExport={onExport}
          pagination={{
            page: escrowMeta?.page ?? safePage,
            pageSize: escrowMeta?.limit ?? PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setCurrentPage,
          }}
          resourceLabel="escrow holds"
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
          onAdvancedFilter={onAdvancedFilter}
          onExport={onExport}
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
      {exportFilterModals}
    </div>
  )
}
