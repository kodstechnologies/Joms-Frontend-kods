import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchExpertSubscriptions } from '@/modules/memberships/api/membership-subscription-api'
import { useExpertSubscriptions } from '@/modules/memberships/hooks/use-membership-subscriptions'
import type { SubscriptionStatus } from '@/modules/memberships/types/membership-subscription'
import {
  mapSubscriptionToFinanceRow,
  type FinanceMembershipRow,
  type FinanceMembershipStatus,
} from '@/modules/payments/utils/finance-membership-mapper'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_MEMBERSHIP_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinanceMembershipsListQueryParams,
  createFinanceMembershipsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'subscriptionId',
  'name',
  'planName',
  'amount',
  'billingCycle',
  'startDate',
  'nextBilling',
  'status',
])

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: FinanceMembershipRow) => string }
> = {
  subscriptionId: {
    header: 'Subscription ID',
    accessor: (row) => exportDisplayValue(row.subscriptionId),
  },
  name: { header: 'Name', accessor: (row) => exportDisplayValue(row.name) },
  planName: { header: 'Plan Name', accessor: (row) => exportDisplayValue(row.planName) },
  amount: { header: 'Amount', accessor: (row) => exportDisplayValue(row.amount) },
  billingCycle: {
    header: 'Billing Cycle',
    accessor: (row) => exportDisplayValue(row.billingCycle),
  },
  startDate: { header: 'Start Date', accessor: (row) => exportDisplayValue(row.startDate) },
  nextBilling: { header: 'Next Billing', accessor: (row) => exportDisplayValue(row.nextBilling) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

const STATUS_FILTERS: Array<{ label: string; value: SubscriptionStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
]

function getStatusClassName(status: FinanceMembershipStatus) {
  if (status === 'Active') return 'membership-status-badge membership-status-active'
  if (status === 'Paused') return 'membership-status-badge membership-status-paused'
  if (status === 'Suspended') return 'membership-status-badge membership-status-paused'
  if (status === 'Cancelled') return 'membership-status-badge membership-status-cancelled'
  return 'membership-status-badge membership-status-expired'
}

export function MembershipManagementPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const listQueryParams = useMemo(() => {
    const params = buildFinanceMembershipsListQueryParams(appliedFilters, {
      page: currentPage,
      limit: PAGE_SIZE,
      ...enhancedSearch.buildSearchParams(),
      ...serverSort.sortParams,
    })
    if (!params.status && statusFilter !== 'all') params.status = statusFilter
    return params
  }, [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams, statusFilter])

  const { data, isLoading, isFetching } = useExpertSubscriptions(listQueryParams)

  const rows = useMemo(
    () => (data?.data?.subscriptions ?? []).map(mapSubscriptionToFinanceRow),
    [data],
  )
  const meta = data?.data?.meta
  const counts = meta?.counts

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchExpertSubscriptions(params)
      return { data: (result.data?.subscriptions ?? []).map(mapSubscriptionToFinanceRow) }
    }
    return createFinanceMembershipsFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_memberships_export',
      {
        search: enhancedSearch.globalSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      },
    )
  }, [enhancedSearch.globalSearch, statusFilter])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-memberships',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

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
    () =>
      withServerSortMeta(
        [
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
              <span className={getStatusClassName(row.original.status)}>{row.original.status}</span>
            ),
          },
          {
            id: 'actions',
            header: 'Actions',
            meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
            cell: ({ row }) => renderActions(row.original),
          },
        ],
        SORT_FIELD_MAP,
      ),
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
          <h1 className="membership-page-title">Membership Management</h1>
          <p className="membership-page-subtitle mt-1 leading-[20px]">
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
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-memberships?section=table')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
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
                'membership-filter-btn',
                statusFilter === filter.value
                  ? 'membership-filter-btn-active'
                  : 'membership-filter-btn-inactive',
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
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_MEMBERSHIP_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page: meta?.page ?? currentPage,
          pageSize: meta?.limit ?? PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="memberships"
        emptyMessage="No membership records found."
      />

      {exportFilterModals}
    </div>
  )
}
