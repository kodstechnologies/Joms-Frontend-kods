import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useExpertSubscriptions } from '@/modules/memberships/hooks/use-membership-subscriptions'
import type { SubscriptionStatus } from '@/modules/memberships/types/membership-subscription'
import {
  mapSubscriptionToFinanceRow,
  type FinanceMembershipRow,
  type FinanceMembershipStatus,
} from '@/modules/payments/utils/finance-membership-mapper'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

const STATUS_FILTERS: Array<{ label: string; value: SubscriptionStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
]

function getStatusClassName(status: FinanceMembershipStatus) {
  if (status === 'Active')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Paused') return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  if (status === 'Cancelled') return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
  return 'border-brand-teal/25 bg-brand-teal/10 text-brand-teal'
}

export function MembershipManagementPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const { data, isLoading, isFetching } = useExpertSubscriptions({
    search: searchQuery.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    limit: PAGE_SIZE,
  })

  const rows = useMemo(
    () => (data?.data?.subscriptions ?? []).map(mapSubscriptionToFinanceRow),
    [data],
  )
  const meta = data?.data?.meta
  const counts = meta?.counts

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows])
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
    (record: FinanceMembershipRow) => (
      <TableActionsDropdown
        label="Open subscription actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            navigate(`/finance/memberships/${record.id}`)
          }}
        >
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<FinanceMembershipRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all subscriptions"
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
        accessorKey: 'subscriptionId',
        header: 'Subscription ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.subscriptionId}
          </span>
        ),
      },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'planName', header: 'Plan Name' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.amount}</span>
        ),
      },
      { accessorKey: 'billingCycle', header: 'Billing Cycle' },
      { accessorKey: 'startDate', header: 'Start Date' },
      { accessorKey: 'nextBilling', header: 'Next Billing' },
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
        <h1 className="text-h2 text-brand-text tracking-tight">Membership Management</h1>
        <p className="text-body-md text-muted mt-1 leading-[20px]">
          Track revenue, payouts, and financial performance
        </p>
        <p className="text-body-sm text-muted mt-3 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Memberships</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const countLabel = filter.value === 'all' ? '' : ` (${counts?.[filter.value] ?? 0})`

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value)
                setCurrentPage(1)
              }}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium',
                statusFilter === filter.value
                  ? 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
                  : 'text-muted border-white/10',
              )}
            >
              {filter.label}
              {countLabel}
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading || isFetching}
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
          page: meta?.page ?? currentPage,
          pageSize: meta?.limit ?? PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="subscriptions"
        emptyMessage="No membership records found."
      />
    </div>
  )
}
