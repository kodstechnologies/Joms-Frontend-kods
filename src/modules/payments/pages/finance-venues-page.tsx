import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Eye, Tag, Trash2, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import type { FinanceVenueRow } from '@/modules/payments/types/finance-table-rows'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceRevenue,
  useSoftDeleteFinance,
} from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import { mapPaymentToVenueRow } from '@/modules/payments/utils/finance-mappers'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import {
  DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS,
  FINANCE_VENUES_MODULE_KEY,
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-venues-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { AddTagsModal } from '@/shared/components/modals/add-tags-modal'
import {
  FinanceEscalateDeleteModal,
  type FinanceEscalateDeleteAction,
} from '@/modules/payments/components/finance-escalate-delete-modal'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_VENUES_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { FINANCE_VENUES_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  buildFinanceVenuesListQueryParams,
  createFinanceVenuesFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import type { FinancePayment } from '@/modules/payments/types/finance-api'

import { FINANCE_PAYMENT_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import {
  FINANCE_DATA_TABLE_CLASS,
  FINANCE_TABLE_CELL_CLASS,
} from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
  FINANCE_PAYMENT_SORT_OVERRIDES,
)

export function FinanceVenuesPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [tagTarget, setTagTarget] = useState<FinanceVenueRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_VENUES_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const listQueryParams = useMemo(
    () =>
      buildFinanceVenuesListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading, isFetching, isError } = useFinanceRevenue(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPaymentToVenueRow), [data])
  const meta = data?.data?.meta

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
      const result = await fetchFinanceRevenue(params)
      const payments = (result.data?.rows ?? []) as FinancePayment[]
      return { data: payments.map(mapPaymentToVenueRow) }
    }
    return createFinanceVenuesFilteredExportHandler(
      fetchForExport,
      FINANCE_VENUES_EXPORT_COLUMN_MAP,
      'finance_venues_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-venues',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const renderActions = useCallback(
    (record: FinanceVenueRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open venue record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={174}
        >
          <TableActionsItem
            icon={<Eye className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/venues/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<User className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              const partnerId = String(record.partnerId || '').trim()
              if (!partnerId || partnerId === '—') {
                toast.error('Partner profile is not available for this record')
                return
              }
              navigate(`/experts/management/profile/${encodeURIComponent(partnerId)}`)
            }}
          >
            View Partner
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setTagTarget(record)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(
                escalateUrl(record.id, {
                  kind: 'resource',
                  resourceType: 'Payment',
                  returnTo: '/finance/venues',
                }),
              )
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-[18px]" aria-hidden="true" />}
            className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
            onClick={() => {
              setActiveDropdownId(null)
              setRowAction({ kind: 'delete', id: record.id, resourceType: 'Payment' })
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<FinanceVenueRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceVenueRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all venue records"
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
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<FinanceVenueRow>> = {
      'venue-id': {
        accessorKey: 'venueId',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {row.original.venueId}
          </span>
        ),
      },
      name: {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className={FINANCE_TABLE_CELL_CLASS}>{row.original.name}</span>,
      },
      owner: {
        accessorKey: 'owner',
        header: 'Owner',
        cell: ({ row }) => <FinanceTableCellText>{row.original.owner}</FinanceTableCellText>,
      },
      'booking-id': {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {row.original.bookingId}
          </span>
        ),
      },
      'booking-title': {
        accessorKey: 'bookingTitle',
        header: 'Booking Title',
        cell: ({ row }) => <FinanceTableCellText>{row.original.bookingTitle}</FinanceTableCellText>,
      },
      status: {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
      revenue: {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-semibold')}>
            {row.original.revenue}
          </span>
        ),
      },
      'transaction-id': {
        id: 'transaction-id',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.transactionId || '—'}</FinanceTableCellText>
        ),
      },
      module: {
        id: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.module || '—'}</FinanceTableCellText>
        ),
      },
      'related-entity-id': {
        id: 'related-entity-id',
        header: 'Related Entity ID',
        cell: ({ row }) => <FinanceTableCellText>{row.original.venueId}</FinanceTableCellText>,
      },
      'client-id': {
        id: 'client-id',
        header: 'Client ID',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.clientId || '—'}</FinanceTableCellText>
        ),
      },
      'client-name': {
        id: 'client-name',
        header: 'Client Name',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.clientName || '—'}</FinanceTableCellText>
        ),
      },
      'partner-id': {
        id: 'partner-id',
        header: 'Partner ID',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.partnerId || '—'}</FinanceTableCellText>
        ),
      },
      'partner-name': {
        id: 'partner-name',
        header: 'Partner Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.owner}</FinanceTableCellText>,
      },
      'transaction-date': {
        id: 'transaction-date',
        header: 'Transaction Date',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.transactionDate || '—'}</FinanceTableCellText>
        ),
      },
      'gross-amount': {
        id: 'gross-amount',
        header: 'Gross Amount',
        cell: ({ row }) => <FinanceTableCellText>{row.original.revenue}</FinanceTableCellText>,
      },
      discount: {
        id: 'discount',
        header: 'Discount',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.discount || '—'}</FinanceTableCellText>
        ),
      },
      tax: {
        id: 'tax',
        header: 'Tax',
        cell: ({ row }) => <FinanceTableCellText>{row.original.tax || '—'}</FinanceTableCellText>,
      },
      'gateway-charges': {
        id: 'gateway-charges',
        header: 'Gateway Charges',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.gatewayCharges || '—'}</FinanceTableCellText>
        ),
      },
      'platform-commission-pct': {
        id: 'platform-commission-pct',
        header: 'Platform Commission %',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.platformCommissionPct || '—'}</FinanceTableCellText>
        ),
      },
      'platform-commission': {
        id: 'platform-commission',
        header: 'Platform Commission',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.platformCommission || '—'}</FinanceTableCellText>
        ),
      },
      'partner-payout': {
        id: 'partner-payout',
        header: 'Partner Payout',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.partnerPayout || '—'}</FinanceTableCellText>
        ),
      },
      'refund-amount': {
        id: 'refund-amount',
        header: 'Refund Amount',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.refundAmount || '—'}</FinanceTableCellText>
        ),
      },
      'net-revenue': {
        id: 'net-revenue',
        header: 'Net Revenue',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.netRevenue || '—'}</FinanceTableCellText>
        ),
      },
      'net-profit': {
        id: 'net-profit',
        header: 'Net Profit',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.netProfit || '—'}</FinanceTableCellText>
        ),
      },
      'payment-method': {
        id: 'payment-method',
        header: 'Payment Method',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.paymentMethod || '—'}</FinanceTableCellText>
        ),
      },
      gateway: {
        id: 'gateway',
        header: 'Gateway',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.gateway || '—'}</FinanceTableCellText>
        ),
      },
      'transaction-status': {
        id: 'transaction-status',
        header: 'Transaction Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
      'settlement-status': {
        id: 'settlement-status',
        header: 'Settlement Status',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.settlementStatus || '—'}</FinanceTableCellText>
        ),
      },
      'settlement-date': {
        id: 'settlement-date',
        header: 'Settlement Date',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.settlementDate || '—'}</FinanceTableCellText>
        ),
      },
      'invoice-id': {
        id: 'invoice-id',
        header: 'Invoice ID',
        cell: ({ row }) => (
          <FinanceTableCellText>{row.original.invoiceId || '—'}</FinanceTableCellText>
        ),
      },
    }

    const catalogIds = FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      rawVisibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceVenueRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return withServerSortMeta([selectColumn, ...preferenceColumns, actionsColumn], SORT_FIELD_MAP)
  }, [
    allVisibleSelected,
    renderActions,
    selectedRowIds,
    someVisibleSelected,
    tableColumnPreferencesQuery.data,
    toggleRowSelection,
    toggleVisibleRows,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Venues</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Manage venue bookings, rentals, deposits, and payments
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment &amp; Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Venues</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-venues?section=table')}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load venue records.</p>
      ) : null}

      <DataTable
        className={FINANCE_DATA_TABLE_CLASS}
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_VENUES_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by venue or transaction ID"
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
        resourceLabel="venues"
        emptyMessage="No venue records found."
      />

      <AddTagsModal
        open={!!tagTarget}
        entityLabel="venue payment"
        onClose={() => setTagTarget(null)}
        onSubmit={async ({ tags, adminNotes }) => {
          if (!tagTarget) return
          try {
            await addNote.mutateAsync({
              id: tagTarget.id,
              resourceType: 'Payment',
              adminNote: `[Tags: ${tags.join(', ')}] ${adminNotes}`,
            })
            toast.success('Tags added')
            setTagTarget(null)
          } catch (err) {
            const msg =
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              'Failed to add tags'
            toast.error(msg)
            throw err
          }
        }}
      />

      <FinanceEscalateDeleteModal
        action={rowAction}
        onClose={() => setRowAction(null)}
        escalate={escalate}
        softDelete={softDelete}
      />

      {exportFilterModals}
    </div>
  )
}
