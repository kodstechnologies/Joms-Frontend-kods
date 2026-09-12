import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Eye, Tag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { FINANCE_SERVICE_TABS } from '@/modules/payments/config/finance-services-table-columns.config'
import type {
  FinanceServiceRow,
  FinanceServiceTab,
} from '@/modules/payments/types/finance-table-rows'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceEscrow,
  useFinanceRevenue,
  useSoftDeleteFinance,
} from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { fetchFinanceEscrow, fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import {
  mapEscrowToServiceRow,
  mapPaymentToServiceRow,
} from '@/modules/payments/utils/finance-mappers'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import {
  DEFAULT_FINANCE_SERVICES_VISIBLE_COLUMN_IDS,
  FINANCE_SERVICES_LEGACY_COLUMN_ID_MAP,
  FINANCE_SERVICES_MODULE_KEY,
  FINANCE_SERVICES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-services-table-columns.config'
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
import { FINANCE_SERVICES_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import {
  buildFinanceServicesListQueryParams,
  createFinanceServicesFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { FINANCE_SERVICES_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import {
  FINANCE_ESCROW_SORT_OVERRIDES,
  FINANCE_PAYMENT_SORT_OVERRIDES,
} from '@/modules/payments/config/finance-table-sort-fields'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  FINANCE_DATA_TABLE_CLASS,
  FINANCE_TABLE_CELL_CLASS,
} from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'

const PAGE_SIZE = 10

export function FinanceServicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<FinanceServiceTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const isEscrowTab = activeTab === 'escrow'
  const sortFieldMap = useMemo(
    () =>
      buildCatalogSortFieldMap(
        FINANCE_SERVICES_TABLE_COLUMNS_CATALOG,
        isEscrowTab ? FINANCE_ESCROW_SORT_OVERRIDES : FINANCE_PAYMENT_SORT_OVERRIDES,
      ),
    [isEscrowTab],
  )
  const serverSort = useServerTableSort({
    sortFieldMap,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [tagTarget, setTagTarget] = useState<FinanceServiceRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_SERVICES_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_SERVICES_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: FINANCE_SERVICES_LEGACY_COLUMN_ID_MAP,
  })

  const listQueryParams = useMemo(
    () =>
      buildFinanceServicesListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
        tab: activeTab,
      }),
    [activeTab, appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const revenueQuery = useFinanceRevenue(listQueryParams, !isEscrowTab)
  const escrowQuery = useFinanceEscrow(listQueryParams, isEscrowTab)

  const isLoading = isEscrowTab ? escrowQuery.isLoading : revenueQuery.isLoading
  const isFetching = isEscrowTab ? escrowQuery.isFetching : revenueQuery.isFetching

  const liveRows = useMemo(() => {
    if (isEscrowTab) {
      return (escrowQuery.data?.data?.rows ?? []).map(mapEscrowToServiceRow)
    }
    return (revenueQuery.data?.data?.rows ?? []).map((row) =>
      mapPaymentToServiceRow(row, activeTab),
    )
  }, [activeTab, escrowQuery.data, isEscrowTab, revenueQuery.data])

  const {
    selectedRowIds,
    setSelectedRowIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisibleRows,
    toggleRowSelection,
  } = useFinanceRowSelection(liveRows)

  const handleTabChange = (tabId: FinanceServiceTab) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId)
      setCurrentPage(1)
      enhancedSearch.clearAll()
      setSelectedRowIds([])
      setAppliedFilters({})
    }

    // Always refetch for the tab (cache was keeping prior tab data until full refresh)
    if (tabId === 'escrow') {
      void queryClient.invalidateQueries({ queryKey: ['finance-escrow'] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['finance-revenue'] })
    }
  }

  const meta = isEscrowTab ? escrowQuery.data?.data?.meta : revenueQuery.data?.data?.meta

  function handleApplyFilters(values: FilterValues) {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      if (isEscrowTab) {
        const result = await fetchFinanceEscrow(params)
        return { data: (result.data?.rows ?? []).map(mapEscrowToServiceRow) }
      }
      const result = await fetchFinanceRevenue(params)
      return {
        data: (result.data?.rows ?? []).map((row) => mapPaymentToServiceRow(row, activeTab)),
      }
    }
    return createFinanceServicesFilteredExportHandler(
      fetchForExport,
      FINANCE_SERVICES_EXPORT_COLUMN_MAP,
      'finance_services_export',
      { search: enhancedSearch.globalSearch || undefined, tab: activeTab },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [activeTab, catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds, isEscrowTab])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-services',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const renderActions = useCallback(
    (record: FinanceServiceRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open service record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={174}
        >
          <TableActionsItem
            icon={<Eye className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              // Escrow rows use EscrowHold._id — payment detail API expects Payment._id
              navigate(
                record.tab === 'escrow'
                  ? `/finance/escrow/${record.id}`
                  : `/finance/services/${record.id}`,
              )
            }}
          >
            View Details
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
                  resourceType: record.tab === 'escrow' ? 'EscrowHold' : 'Payment',
                  returnTo: '/finance/services',
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
              setRowAction({
                kind: 'delete',
                id: record.id,
                resourceType: record.tab === 'escrow' ? 'EscrowHold' : 'Payment',
              })
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<FinanceServiceRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceServiceRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all service records"
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
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<FinanceServiceRow>> = {
      'service-id': {
        accessorKey: 'serviceId',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {row.original.serviceId}
          </span>
        ),
      },
      name: {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className={FINANCE_TABLE_CELL_CLASS}>{row.original.name}</span>,
      },
      'expert-name': {
        accessorKey: 'expertName',
        header: 'Expert Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.expertName}</FinanceTableCellText>,
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
      'user-name': {
        accessorKey: 'userName',
        header: 'User Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.userName}</FinanceTableCellText>,
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
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      module: {
        id: 'module',
        header: 'Module',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'related-entity-id': {
        id: 'related-entity-id',
        header: 'Related Entity ID',
        cell: ({ row }) => <FinanceTableCellText>{row.original.serviceId}</FinanceTableCellText>,
      },
      'client-id': {
        id: 'client-id',
        header: 'Client ID',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'client-name': {
        id: 'client-name',
        header: 'Client Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.userName}</FinanceTableCellText>,
      },
      'partner-id': {
        id: 'partner-id',
        header: 'Partner ID',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'partner-name': {
        id: 'partner-name',
        header: 'Partner Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.expertName}</FinanceTableCellText>,
      },
      'transaction-date': {
        id: 'transaction-date',
        header: 'Transaction Date',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'gross-amount': {
        id: 'gross-amount',
        header: 'Gross Amount',
        cell: ({ row }) => <FinanceTableCellText>{row.original.revenue}</FinanceTableCellText>,
      },
      discount: {
        id: 'discount',
        header: 'Discount',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      tax: { id: 'tax', header: 'Tax', cell: () => <FinanceTableCellText>—</FinanceTableCellText> },
      'gateway-charges': {
        id: 'gateway-charges',
        header: 'Gateway Charges',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'platform-commission-pct': {
        id: 'platform-commission-pct',
        header: 'Platform Commission %',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'platform-commission': {
        id: 'platform-commission',
        header: 'Platform Commission',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'partner-payout': {
        id: 'partner-payout',
        header: 'Partner Payout',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'refund-amount': {
        id: 'refund-amount',
        header: 'Refund Amount',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'net-revenue': {
        id: 'net-revenue',
        header: 'Net Revenue',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'net-profit': {
        id: 'net-profit',
        header: 'Net Profit',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'payment-method': {
        id: 'payment-method',
        header: 'Payment Method',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      gateway: {
        id: 'gateway',
        header: 'Gateway',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'transaction-status': {
        id: 'transaction-status',
        header: 'Transaction Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
      'settlement-status': {
        id: 'settlement-status',
        header: 'Settlement Status',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'settlement-date': {
        id: 'settlement-date',
        header: 'Settlement Date',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
      'invoice-id': {
        id: 'invoice-id',
        header: 'Invoice ID',
        cell: () => <FinanceTableCellText>—</FinanceTableCellText>,
      },
    }

    const catalogIds = FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_SERVICES_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      rawVisibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceServiceRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return withServerSortMeta([selectColumn, ...preferenceColumns, actionsColumn], sortFieldMap)
  }, [
    allVisibleSelected,
    renderActions,
    selectedRowIds,
    someVisibleSelected,
    sortFieldMap,
    tableColumnPreferencesQuery.data,
    toggleRowSelection,
    toggleVisibleRows,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">
            {isEscrowTab ? 'Escrow Management' : 'Services'}
          </h1>
          <p className="text-body-sm text-muted mt-1 leading-[20px]">
            {isEscrowTab
              ? 'Track revenue, payouts, and financial performance'
              : 'Manage service bookings, expert commissions, and payouts'}
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment &amp; Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Services</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-services?section=table')}
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <div className="radius-lg bg-brand-surface flex h-[47px] w-full max-w-[1268px] items-center justify-around border border-white/[0.06] p-1">
        {FINANCE_SERVICE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'text-body-sm flex h-[37px] min-w-[169px] items-center justify-center rounded-md px-10 leading-[20px] transition-colors',
              activeTab === tab.id
                ? 'border border-white/5 bg-[#141414] font-medium text-white'
                : 'text-[#FFFFFF] opacity-50 hover:opacity-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        className={FINANCE_DATA_TABLE_CLASS}
        columns={columns}
        data={liveRows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_SERVICES_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by service or transaction ID"
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
        resourceLabel="services"
        emptyMessage="No service records found."
      />

      <AddTagsModal
        open={!!tagTarget}
        entityLabel={tagTarget?.tab === 'escrow' ? 'escrow hold' : 'service payment'}
        onClose={() => setTagTarget(null)}
        onSubmit={async ({ tags, adminNotes }) => {
          if (!tagTarget) return
          try {
            await addNote.mutateAsync({
              id: tagTarget.id,
              resourceType: tagTarget.tab === 'escrow' ? 'EscrowHold' : 'Payment',
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
