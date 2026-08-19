import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { type FinanceReconciliationRow } from '@/modules/payments/mock/finance-reconciliation.mock'
import { fetchFinanceReconciliation } from '@/modules/payments/api/finance-api'
import { useFinanceReconciliation } from '@/modules/payments/hooks/use-finance'
import { mapReconToRow } from '@/modules/payments/utils/finance-mappers'
import {
  DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS,
  FINANCE_RECONCILIATION_MODULE_KEY,
} from '@/modules/payments/config/finance-reconciliation-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinanceReconciliationListQueryParams,
  createFinanceReconciliationFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: FinanceReconciliationRow) => string }
> = {
  'reconciliation-id': {
    header: 'Reconciliation ID',
    accessor: (row) => exportDisplayValue(row.reconciliationId),
  },
  gateway: { header: 'Gateway', accessor: (row) => exportDisplayValue(row.gateway) },
  'transaction-id': {
    header: 'Transaction ID',
    accessor: (row) => exportDisplayValue(row.transactionId),
  },
  'platform-record-id': {
    header: 'Platform Record ID',
    accessor: (row) => exportDisplayValue(row.platformRecordId),
  },
  'gateway-amount': {
    header: 'Gateway Amount',
    accessor: (row) => exportDisplayValue(row.gatewayAmount),
  },
  'platform-amount': {
    header: 'Platform Amount',
    accessor: (row) => exportDisplayValue(row.platformAmount),
  },
  difference: { header: 'Difference', accessor: (row) => exportDisplayValue(row.difference) },
}

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
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_RECONCILIATION_MODULE_KEY)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const listQueryParams = useMemo(
    () =>
      buildFinanceReconciliationListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    [appliedFilters, currentPage, debouncedSearch],
  )

  const { data, isLoading, isFetching } = useFinanceReconciliation(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapReconToRow), [data])
  const meta = data?.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinanceReconciliation(params)
      return { data: (result.data?.rows ?? []).map(mapReconToRow) }
    }
    return createFinanceReconciliationFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_reconciliation_export',
      { search: debouncedSearch || undefined },
    )
  }, [debouncedSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-reconciliation',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows])
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
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceReconciliationRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
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
        isLoading={isLoading || isFetching}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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
