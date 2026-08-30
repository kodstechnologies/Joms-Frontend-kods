import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { FinanceReconciliationRow } from '@/modules/payments/types/finance-table-rows'
import { fetchFinanceReconciliation } from '@/modules/payments/api/finance-api'
import { useFinanceReconciliation } from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { mapReconToRow } from '@/modules/payments/utils/finance-mappers'
import {
  DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS,
  FINANCE_RECONCILIATION_MODULE_KEY,
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-reconciliation-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_RECONCILIATION_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { FINANCE_RECONCILIATION_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  buildFinanceReconciliationListQueryParams,
  createFinanceReconciliationFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

import { FINANCE_RECONCILIATION_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG,
  FINANCE_RECONCILIATION_SORT_OVERRIDES,
)

function getDifferenceClassName(difference: FinanceReconciliationRow['difference']) {
  if (difference === 'Matched') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (difference === 'Pending') {
    return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function FinanceReconciliationPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_RECONCILIATION_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const listQueryParams = useMemo(
    () =>
      buildFinanceReconciliationListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading, isFetching } = useFinanceReconciliation(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapReconToRow), [data])
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
      const result = await fetchFinanceReconciliation(params)
      return { data: (result.data?.rows ?? []).map(mapReconToRow) }
    }
    return createFinanceReconciliationFilteredExportHandler(
      fetchForExport,
      FINANCE_RECONCILIATION_EXPORT_COLUMN_MAP,
      'finance_reconciliation_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-reconciliation',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const renderActions = useCallback(
    (record: FinanceReconciliationRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open reconciliation record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={180}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/reconciliation/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<FinanceReconciliationRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceReconciliationRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all reconciliation records"
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
          aria-label={`Select ${row.original.reconciliationId}`}
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

    const dataColumnsById: Record<string, ColumnDef<FinanceReconciliationRow>> = {
      'reconciliation-id': {
        accessorKey: 'reconciliationId',
        header: 'Reconciliation ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.reconciliationId}
          </span>
        ),
      },
      gateway: { accessorKey: 'gateway', header: 'Gateway' },
      'transaction-id': {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.transactionId}
          </span>
        ),
      },
      'platform-record-id': {
        accessorKey: 'platformRecordId',
        header: 'Platform Record ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.platformRecordId}
          </span>
        ),
      },
      'gateway-amount': {
        accessorKey: 'gatewayAmount',
        header: 'Gateway Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.gatewayAmount}</span>
        ),
      },
      'platform-amount': {
        accessorKey: 'platformAmount',
        header: 'Platform Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.platformAmount}</span>
        ),
      },
      difference: {
        accessorKey: 'difference',
        header: 'Difference',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
              getDifferenceClassName(row.original.difference),
            )}
          >
            {row.original.difference}
          </span>
        ),
      },
      'settlement-date': {
        id: 'settlement-date',
        header: 'Settlement Date',
        cell: ({ row }) => (row.original as { settlementDate?: string }).settlementDate || '—',
      },
      'reconciled-by': {
        id: 'reconciled-by',
        header: 'Reconciled By',
        cell: ({ row }) => (row.original as { reconciledBy?: string }).reconciledBy || '—',
      },
      status: {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (row.original as { status?: string }).status || '—',
      },
    }

    const catalogIds = FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      rawVisibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceReconciliationRow> = {
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
          <h1 className="text-h2 text-brand-text tracking-tight">Financial Reconciliation</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Manage tax records. GST, TDS, and compliance filing
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <span>Payment & Finance</span>
            <span> / </span>
            <span className="text-brand-text font-semibold">Financial Reconciliation</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-reconciliation?section=table')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_RECONCILIATION_SEARCH_COLUMNS}
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
        resourceLabel="records"
        emptyMessage="No reconciliation records found."
      />

      {exportFilterModals}
    </div>
  )
}
