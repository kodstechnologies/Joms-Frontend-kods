import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { fetchExpertSubscriptions } from '@/modules/memberships/api/membership-subscription-api'
import { useExpertSubscriptions } from '@/modules/memberships/hooks/use-membership-subscriptions'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import type { SubscriptionStatus } from '@/modules/memberships/types/membership-subscription'
import {
  mapSubscriptionToFinanceRow,
  type FinanceMembershipRow,
} from '@/modules/payments/utils/finance-membership-mapper'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { FINANCE_MEMBERSHIP_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'
import {
  DEFAULT_FINANCE_MEMBERSHIPS_VISIBLE_COLUMN_IDS,
  FINANCE_MEMBERSHIPS_MODULE_KEY,
  FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-memberships-table-columns.config'
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
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import { FINANCE_DATA_TABLE_CLASS } from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'
import { assembleFinanceTableColumns } from '@/modules/payments/utils/finance-table-column-utils'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = FINANCE_MEMBERSHIP_SORT_OVERRIDES

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: FinanceMembershipRow) => string }
> = {
  'subscription-id': {
    header: 'Subscription ID',
    accessor: (row) => exportDisplayValue(row.subscriptionId),
  },
  name: { header: 'Name', accessor: (row) => exportDisplayValue(row.name) },
  'plan-name': { header: 'Plan Name', accessor: (row) => exportDisplayValue(row.planName) },
  amount: { header: 'Amount', accessor: (row) => exportDisplayValue(row.amount) },
  'billing-cycle': {
    header: 'Billing Cycle',
    accessor: (row) => exportDisplayValue(row.billingCycle),
  },
  'start-date': { header: 'Start Date', accessor: (row) => exportDisplayValue(row.startDate) },
  'next-billing': {
    header: 'Next Billing',
    accessor: (row) => exportDisplayValue(row.nextBilling),
  },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

const MEMBERSHIP_COLUMN_LEGACY_ID_MAP: Record<string, string> = {
  'membership-id': 'subscription-id',
  'member-name': 'name',
  'membership-tier': 'plan-name',
  'amount-paid': 'amount',
  'plan-duration': 'billing-cycle',
  'next-billing-date': 'next-billing',
}

const STATUS_FILTERS: Array<{ label: string; value: SubscriptionStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
]

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
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_MEMBERSHIPS_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_MEMBERSHIPS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: MEMBERSHIP_COLUMN_LEGACY_ID_MAP,
  })

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

  const {
    selectedRowIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisibleRows,
    toggleRowSelection,
  } = useFinanceRowSelection(rows)

  function handleApplyFilters(values: FilterValues) {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }

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
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds, statusFilter])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-memberships',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

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

  const columns = useMemo<ColumnDef<FinanceMembershipRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceMembershipRow> = {
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
          className="ui-table-checkbox"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.name}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="ui-table-checkbox"
        />
      ),
      meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
    }

    const dataColumnsById: Record<string, ColumnDef<FinanceMembershipRow>> = {
      'subscription-id': {
        id: 'subscription-id',
        accessorKey: 'subscriptionId',
        header: 'Subscription ID',
        cell: ({ row }) => (
          <FinanceTableCellText className="font-mono uppercase">
            {row.original.subscriptionId}
          </FinanceTableCellText>
        ),
      },
      name: {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.name}</FinanceTableCellText>,
      },
      'plan-name': {
        id: 'plan-name',
        accessorKey: 'planName',
        header: 'Plan Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.planName}</FinanceTableCellText>,
      },
      amount: {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <FinanceTableCellText className="font-semibold">
            {row.original.amount}
          </FinanceTableCellText>
        ),
      },
      'billing-cycle': {
        id: 'billing-cycle',
        accessorKey: 'billingCycle',
        header: 'Billing Cycle',
        cell: ({ row }) => <FinanceTableCellText>{row.original.billingCycle}</FinanceTableCellText>,
      },
      'start-date': {
        id: 'start-date',
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => <FinanceTableCellText>{row.original.startDate}</FinanceTableCellText>,
      },
      'next-billing': {
        id: 'next-billing',
        accessorKey: 'nextBilling',
        header: 'Next Billing',
        cell: ({ row }) => <FinanceTableCellText>{row.original.nextBilling}</FinanceTableCellText>,
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
    }

    return withServerSortMeta(
      assembleFinanceTableColumns(selectColumn, dataColumnsById, {
        catalogIds: catalogColumnIds,
        visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
        defaultColumnIds: DEFAULT_FINANCE_MEMBERSHIPS_VISIBLE_COLUMN_IDS,
        legacyColumnIdMap: MEMBERSHIP_COLUMN_LEGACY_ID_MAP,
        renderActions,
      }),
      SORT_FIELD_MAP,
    )
  }, [
    allVisibleSelected,
    catalogColumnIds,
    renderActions,
    selectedRowIds,
    someVisibleSelected,
    tableColumnPreferencesQuery.data?.visibleColumnIds,
    toggleRowSelection,
    toggleVisibleRows,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="membership-page-title">Membership Management</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment &amp; Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Memberships</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-memberships?section=table')}
        >
          <ManageMetricsIcon />
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
        className={FINANCE_DATA_TABLE_CLASS}
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
        searchPlaceholder="Search by plan or partner name"
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
