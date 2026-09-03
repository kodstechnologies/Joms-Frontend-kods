import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Download, Eye, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { useBranding } from '@/app/providers/use-branding'
import { fetchFinancePayoutById, fetchFinancePayouts } from '@/modules/payments/api/finance-api'
import { useFinanceDashboard, useFinancePayouts } from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { formatInr, mapPayoutToRow } from '@/modules/payments/utils/finance-mappers'
import type { PayoutRow } from '@/modules/payments/types/finance-table-rows'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-payouts-table-columns.config'
import { FINANCE_PAYOUT_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_PAYOUT_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinancePayoutsListQueryParams,
  createFinancePayoutsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { downloadInvoiceDocument, invoiceFromFinancePayout } from '@/shared/utils/invoice-document'
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import {
  FINANCE_DATA_TABLE_CLASS,
  FINANCE_TABLE_CELL_CLASS,
} from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG,
  FINANCE_PAYOUT_SORT_OVERRIDES,
)

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (row: PayoutRow) => string }> =
  {
    payoutId: { header: 'Payout ID', accessor: (row) => exportDisplayValue(row.payoutId) },
    recipient: { header: 'Recipient', accessor: (row) => exportDisplayValue(row.recipient) },
    type: { header: 'Type', accessor: (row) => exportDisplayValue(row.type) },
    amount: { header: 'Amount', accessor: (row) => exportDisplayValue(row.amount) },
    method: { header: 'Method', accessor: (row) => exportDisplayValue(row.method) },
    initiatedDate: {
      header: 'Initiated Date',
      accessor: (row) => exportDisplayValue(row.initiatedDate),
    },
    description: { header: 'Description', accessor: (row) => exportDisplayValue(row.description) },
    status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
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

export function PayoutManagementPage() {
  const navigate = useNavigate()
  const { logoUrl } = useBranding()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const listQueryParams = useMemo(
    () =>
      buildFinancePayoutsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading, isFetching, isError } = useFinancePayouts(listQueryParams)
  const dashboardQuery = useFinanceDashboard()

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPayoutToRow), [data])
  const meta = data?.data?.meta
  const summary = dashboardQuery.data?.data

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
      const result = await fetchFinancePayouts(params)
      return { data: (result.data?.rows ?? []).map(mapPayoutToRow) }
    }
    return createFinancePayoutsFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_payouts_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-payouts',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const summaryCards = [
    {
      label: 'Total Payments',
      value: String(meta?.total ?? 0),
      change: '—',
      changeNote: 'all payouts',
    },
    {
      label: 'Pending',
      value: formatInr(summary?.pendingPayouts ?? 0),
      change: String(summary?.pendingPayoutCount ?? 0),
      changeNote: 'awaiting release',
    },
    {
      label: 'Completed',
      value: formatInr(summary?.totalPlatformRevenue ?? 0),
      change: '—',
      changeNote: 'platform captured',
    },
    {
      label: 'Failed',
      value: String(rows.filter((r) => r.status === 'Failed').length),
      change: '—',
      changeNote: 'this page',
    },
  ]

  const renderActions = useCallback(
    (record: PayoutRow) => (
      <TableActionsDropdown
        label="Open payout actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
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
        <TableActionsItem
          icon={<Download className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            void fetchFinancePayoutById(record.id)
              .then(async (result) => {
                const payout = result.data
                if (!payout) throw new Error('Payout not found')
                await downloadInvoiceDocument(
                  invoiceFromFinancePayout(payout, { logoUrl }),
                  payout.payoutId,
                )
                toast.success('Invoice downloaded')
              })
              .catch(() => toast.error('Failed to download invoice'))
          }}
        >
          Download Invoice
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, logoUrl, navigate],
  )

  const columns = useMemo<ColumnDef<PayoutRow>[]>(
    () =>
      withServerSortMeta(
        [
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
            cell: ({ row }) => <FinanceTableCellText>{row.original.payoutId}</FinanceTableCellText>,
          },
          {
            accessorKey: 'recipient',
            header: 'Recipient',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.recipient}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <FinanceTableCellText>{row.original.type}</FinanceTableCellText>,
          },
          {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => <FinanceTableCellText>{row.original.amount}</FinanceTableCellText>,
          },
          {
            accessorKey: 'method',
            header: 'Method',
            cell: ({ row }) => <FinanceTableCellText>{row.original.method}</FinanceTableCellText>,
          },
          {
            accessorKey: 'initiatedDate',
            header: 'Initiated Date',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.initiatedDate}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.description}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
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
          <h1 className="text-h2 text-brand-text tracking-tight">Payout Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment & Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Payout Management</span>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-payouts')}>
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      {isError ? <p className="text-body-sm text-brand-danger">Failed to load payouts.</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || dashboardQuery.isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton key={`payout-skel-${idx}`} />
            ))
          : summaryCards.map((metric) => <SummaryCard key={metric.label} {...metric} />)}
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
        searchableColumns={FINANCE_PAYOUT_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by payout ID or partner"
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
        resourceLabel="payouts"
        emptyMessage="No payout records found."
      />

      {exportFilterModals}
    </div>
  )
}
