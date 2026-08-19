import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { type FinanceReconciliationRow } from '@/modules/payments/mock/finance-reconciliation.mock'
import { useFinanceReconciliation } from '@/modules/payments/hooks/use-finance'
import { mapReconToRow } from '@/modules/payments/utils/finance-mappers'
import { fetchFinanceReconciliation } from '@/modules/payments/api/finance-api'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const handleExportData = useMemo(
    () =>
      createFinanceRowsExportHandler({
        fetchRows: async (params) => (await fetchFinanceReconciliation(params))?.data?.rows ?? [],
        headers: ['ID', 'Status', 'Created'],
        mapRow: (row) => [
          exportDisplayValue(row._id),
          exportDisplayValue(row.status),
          exportDisplayValue(row.createdAt),
        ],
        fileName: 'reconciliation_export',
      }),
    [],
  )
  const { apiFilterParams, onAdvancedFilter, onExport, modals: exportFilterModals } =
    useFinanceListFilters(handleExportData)

  const { data, isLoading, isFetching } = useFinanceReconciliation({
    page: currentPage,
    limit: PAGE_SIZE,
    ...apiFilterParams,
  })

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapReconToRow), [data])
  const meta = data?.data?.meta

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) =>
      [
        row.reconciliationId,
        row.gateway,
        row.transactionId,
        row.platformRecordId,
        row.gatewayAmount,
        row.platformAmount,
        row.difference,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, searchQuery])

  const pageRows = searchQuery.trim() ? filteredRows : rows

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

  const columns = useMemo<ColumnDef<FinanceReconciliationRow>[]>(
    () => [
      {
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
      },
      {
        accessorKey: 'reconciliationId',
        header: 'Reconciliation ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.reconciliationId}
          </span>
        ),
      },
      { accessorKey: 'gateway', header: 'Gateway' },
      {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.transactionId}
          </span>
        ),
      },
      {
        accessorKey: 'platformRecordId',
        header: 'Platform Record ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.platformRecordId}
          </span>
        ),
      },
      {
        accessorKey: 'gatewayAmount',
        header: 'Gateway Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.gatewayAmount}</span>
        ),
      },
      {
        accessorKey: 'platformAmount',
        header: 'Platform Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.platformAmount}</span>
        ),
      },
      {
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
          onClick={() => navigate('/metrics/finance-reconciliation')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
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
