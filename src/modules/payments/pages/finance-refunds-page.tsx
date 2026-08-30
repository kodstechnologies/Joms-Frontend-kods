import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowLeftRight,
  Eye,
  GitMerge,
  SlidersHorizontal,
  SquarePen,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchFinanceDisputes, fetchFinanceRefunds } from '@/modules/payments/api/finance-api'
import {
  DISPUTE_STATUS_OPTIONS,
  REFUND_STATUS_OPTIONS,
} from '@/modules/payments/constants/refund-status-options'
import {
  type RefundChargebackRow,
  type RefundChargebackStatus,
} from '@/modules/payments/mock/finance-refunds.mock'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceDashboard,
  useFinanceDisputes,
  useFinanceRefunds,
  useSoftDeleteFinance,
  useUpdateDisputeStatus,
  useUpdateRefundStatus,
} from '@/modules/payments/hooks/use-finance'
import {
  DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_METRIC_ID_SET,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'
import {
  DEFAULT_FINANCE_REFUNDS_VISIBLE_COLUMN_IDS,
  FINANCE_REFUNDS_LEGACY_COLUMN_ID_MAP,
  FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-refunds-table-columns.config'
import { buildFinanceRefundsMetricCards } from '@/modules/payments/utils/finance-refunds-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { mapDisputeToRefundRow, mapRefundToRow } from '@/modules/payments/utils/finance-mappers'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import { AddTagsModal } from '@/shared/components/modals/add-tags-modal'
import { MergeTicketsModal } from '@/modules/payments/components/merge-tickets-modal'
import {
  FinanceEscalateDeleteModal,
  type FinanceEscalateDeleteAction,
} from '@/modules/payments/components/finance-escalate-delete-modal'
import { useTagsApi } from '@/modules/payments/hooks/use-tags-api'
import { ChangeStatusModal } from '@/shared/components/modals/change-status-modal'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_REFUNDS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { FINANCE_REFUNDS_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  buildFinanceRefundsListQueryParams,
  createFinanceRefundsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { FINANCE_REFUND_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG,
  FINANCE_REFUND_SORT_OVERRIDES,
)

function getStatusClassName(status: RefundChargebackStatus) {
  if (status === 'Resolved') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Rejected') {
    return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
  }
  if (status === 'Pending') {
    return 'border-brand-teal/25 bg-brand-teal/10 text-brand-teal'
  }
  if (status === 'Open') {
    return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-action/25 bg-brand-action/10 text-brand-action'
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

export function FinanceRefundsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [statusTarget, setStatusTarget] = useState<RefundChargebackRow | null>(null)
  const [tagTarget, setTagTarget] = useState<RefundChargebackRow | null>(null)
  const [mergeTarget, setMergeTarget] = useState<RefundChargebackRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)

  const listQueryParams = useMemo(
    () =>
      buildFinanceRefundsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const selectedTypes = String(listQueryParams.type || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const wantsDisputes =
    selectedTypes.length === 0 ||
    selectedTypes.includes('Dispute') ||
    selectedTypes.includes('Chargeback') ||
    selectedTypes.includes('Refund')
  const wantsRefunds =
    selectedTypes.length === 0 ||
    selectedTypes.includes('Refund') ||
    selectedTypes.includes('Chargeback')

  const disputeParams = useMemo(() => {
    const next = { ...listQueryParams }
    if (selectedTypes.includes('Chargeback') && !selectedTypes.includes('Dispute')) {
      next.caseType = 'chargeback'
    } else if (selectedTypes.includes('Dispute') && !selectedTypes.includes('Refund')) {
      next.caseType = 'dispute'
    } else if (selectedTypes.includes('Refund') && !selectedTypes.includes('Dispute')) {
      next.caseType = 'refund_request'
    }
    return next
  }, [listQueryParams, selectedTypes])

  const disputesQuery = useFinanceDisputes(disputeParams, wantsDisputes)
  const refundsQuery = useFinanceRefunds(listQueryParams, wantsRefunds)
  const dashboardQuery = useFinanceDashboard()
  const updateDisputeStatus = useUpdateDisputeStatus()
  const updateRefundStatus = useUpdateRefundStatus()
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const { mergeTickets } = useTagsApi()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_REFUNDS_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_REFUNDS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: FINANCE_REFUNDS_LEGACY_COLUMN_ID_MAP,
  })

  const apiErrorMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

  const rows = useMemo(() => {
    const disputeRows = (disputesQuery.data?.data?.rows ?? []).map(mapDisputeToRefundRow)
    const refundRows = (refundsQuery.data?.data?.rows ?? []).map(mapRefundToRow)
    return [...disputeRows, ...refundRows]
  }, [disputesQuery.data, refundsQuery.data])

  const metaTotal =
    (disputesQuery.data?.data?.meta?.total ?? 0) + (refundsQuery.data?.data?.meta?.total ?? 0)
  const metaTotalPages = Math.max(
    disputesQuery.data?.data?.meta?.totalPages ?? 1,
    refundsQuery.data?.data?.meta?.totalPages ?? 1,
  )
  const summary = dashboardQuery.data?.data
  const isLoading = disputesQuery.isLoading || refundsQuery.isLoading
  const isFetching = disputesQuery.isFetching || refundsQuery.isFetching
  const isError = disputesQuery.isError || refundsQuery.isError

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const types = String(params.type || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const includeDisputes =
        types.length === 0 ||
        types.includes('Dispute') ||
        types.includes('Chargeback') ||
        types.includes('Refund')
      const includeRefunds =
        types.length === 0 || types.includes('Refund') || types.includes('Chargeback')
      const [disputes, refunds] = await Promise.all([
        includeDisputes ? fetchFinanceDisputes(params) : Promise.resolve({ data: { rows: [] } }),
        includeRefunds ? fetchFinanceRefunds(params) : Promise.resolve({ data: { rows: [] } }),
      ])
      return {
        data: [
          ...(disputes.data?.rows ?? []).map(mapDisputeToRefundRow),
          ...(refunds.data?.rows ?? []).map(mapRefundToRow),
        ],
      }
    }
    return createFinanceRefundsFilteredExportHandler(
      fetchForExport,
      FINANCE_REFUNDS_EXPORT_COLUMN_MAP,
      'finance_refunds_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-refunds',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const activeMetricIds = useActiveMetricIds(FINANCE_REFUNDS_MODULE_KEY, [
    ...DEFAULT_FINANCE_REFUNDS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => FINANCE_REFUNDS_METRIC_ID_SET.has(id)),
        FINANCE_REFUNDS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleSummaryMetrics = useMemo(() => {
    const allMetrics = buildFinanceRefundsMetricCards({ rows, summary })
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, rows, summary])

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
    (record: RefundChargebackRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open refund record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={220}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(
                record.kind === 'dispute' || record.type === 'Dispute'
                  ? `/finance/refunds/${record.id}/dispute`
                  : `/finance/refunds/${record.id}`,
              )
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Edit ticket coming soon')}
          >
            Edit Ticket
          </TableActionsItem>
          <TableActionsItem
            icon={<ArrowLeftRight className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setStatusTarget(record)
            }}
          >
            Change Status
          </TableActionsItem>
          <TableActionsItem
            icon={<SlidersHorizontal className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Change priority coming soon')}
          >
            Change Priority
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setTagTarget(record)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              const isDispute = record.kind === 'dispute' || record.type === 'Dispute'
              navigate(
                escalateUrl(record.id, {
                  kind: isDispute ? 'dispute' : 'refund',
                  resourceType: isDispute ? 'Dispute' : 'Refund',
                  returnTo: '/finance/refunds',
                }),
              )
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" aria-hidden="true" />}
            className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
            onClick={() => {
              setActiveDropdownId(null)
              const isDispute = record.kind === 'dispute' || record.type === 'Dispute'
              setRowAction({
                kind: 'delete',
                id: record.id,
                resourceType: isDispute ? 'Dispute' : 'Refund',
              })
            }}
          >
            Delete
          </TableActionsItem>
          <TableActionsItem
            icon={<GitMerge className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setMergeTarget(record)
            }}
          >
            Merge
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const statusOptions =
    statusTarget?.kind === 'dispute' || statusTarget?.type === 'Dispute'
      ? DISPUTE_STATUS_OPTIONS
      : REFUND_STATUS_OPTIONS

  const mergeCandidates = useMemo(() => {
    const baseRows =
      selectedRowIds.length > 1
        ? rows.filter((row) => selectedRowIds.includes(row.id))
        : mergeTarget
          ? [mergeTarget]
          : []
    return baseRows.map((row) => ({
      id: row.id,
      title: row.recordId,
      description: `${row.type} - ${row.relatedEntity}`,
      date: row.initiatedDate,
    }))
  }, [mergeTarget, rows, selectedRowIds])

  const columns = useMemo<ColumnDef<RefundChargebackRow>[]>(() => {
    const selectColumn: ColumnDef<RefundChargebackRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all refund records"
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
          aria-label={`Select ${row.original.recordId}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
    }

    const dataColumnsById: Record<string, ColumnDef<RefundChargebackRow>> = {
      'refund-id': {
        id: 'refund-id',
        accessorKey: 'recordId',
        header: 'Refund ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.recordId}
          </span>
        ),
      },
      'transaction-id': {
        id: 'transaction-id',
        header: 'Transaction ID',
        cell: ({ row }) => (row.original as { transactionId?: string }).transactionId || '—',
      },
      module: {
        id: 'module',
        header: 'Module',
        cell: ({ row }) =>
          (row.original as { module?: string }).module || row.original.relatedEntity || '—',
      },
      'customer-name': {
        id: 'customer-name',
        header: 'Customer Name',
        cell: ({ row }) => (row.original as { customerName?: string }).customerName || '—',
      },
      'refund-type': {
        id: 'refund-type',
        accessorKey: 'type',
        header: 'Refund Type',
      },
      'refund-reason': {
        id: 'refund-reason',
        accessorKey: 'reason',
        header: 'Refund Reason',
      },
      'refund-amount': {
        id: 'refund-amount',
        accessorKey: 'amount',
        header: 'Refund Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.amount}</span>
        ),
      },
      'refund-mode': {
        id: 'refund-mode',
        header: 'Refund Mode',
        cell: ({ row }) => (row.original as { refundMode?: string }).refundMode || '—',
      },
      'initiated-by': {
        id: 'initiated-by',
        header: 'Initiated By',
        cell: ({ row }) => (row.original as { initiatedBy?: string }).initiatedBy || '—',
      },
      'approved-by': {
        id: 'approved-by',
        header: 'Approved By',
        cell: ({ row }) => (row.original as { approvedBy?: string }).approvedBy || '—',
      },
      'refund-date': {
        id: 'refund-date',
        accessorKey: 'initiatedDate',
        header: 'Refund Date',
      },
      'chargeback-flag': {
        id: 'chargeback-flag',
        header: 'Chargeback Flag',
        cell: ({ row }) => (row.original as { chargebackFlag?: string }).chargebackFlag || '—',
      },
      gateway: {
        id: 'gateway',
        header: 'Gateway',
        cell: ({ row }) => (row.original as { gateway?: string }).gateway || '—',
      },
      status: {
        id: 'status',
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
    }

    const catalogIds = FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_REFUNDS_VISIBLE_COLUMN_IDS
    const preferenceColumns = sortIdsByCatalogOrder(
      [
        ...new Set(rawVisibleIds.map((id) => FINANCE_REFUNDS_LEGACY_COLUMN_ID_MAP[id] ?? id)),
      ].filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<RefundChargebackRow> = {
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
          <h1 className="text-h2 text-brand-text tracking-tight">Refunds & Chargebacks</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment & Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Refunds & Chargebacks</span>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-refunds')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? filteredActiveMetricIds.map((id) => <StatCardSkeleton key={id} />)
          : visibleSummaryMetrics.map((metric) => <SummaryCard key={metric.id} {...metric} />)}
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load refunds and disputes.</p>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_REFUNDS_SEARCH_COLUMNS}
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
          page: currentPage,
          pageSize: PAGE_SIZE,
          totalItems: metaTotal,
          totalPages: metaTotalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="records"
        emptyMessage="No refund records found."
      />

      <ChangeStatusModal
        open={!!statusTarget}
        recordLabel={statusTarget?.recordId}
        currentStatus={statusTarget?.rawStatus || statusTarget?.status}
        options={statusOptions}
        onClose={() => setStatusTarget(null)}
        onSubmit={async ({ status, adminNotes }) => {
          if (!statusTarget) return
          try {
            if (statusTarget.kind === 'dispute' || statusTarget.type === 'Dispute') {
              await updateDisputeStatus.mutateAsync({
                id: statusTarget.id,
                status,
                adminNote: adminNotes,
              })
            } else {
              await updateRefundStatus.mutateAsync({
                id: statusTarget.id,
                status,
                adminNote: adminNotes,
              })
            }
            toast.success('Status updated')
            setStatusTarget(null)
            void disputesQuery.refetch()
            void refundsQuery.refetch()
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to update status'))
            throw err
          }
        }}
      />

      <AddTagsModal
        open={!!tagTarget}
        entityLabel={
          tagTarget?.kind === 'dispute' || tagTarget?.type === 'Dispute' ? 'dispute' : 'refund'
        }
        onClose={() => setTagTarget(null)}
        onSubmit={async ({ tags, adminNotes }) => {
          if (!tagTarget) return
          try {
            await addNote.mutateAsync({
              id: tagTarget.id,
              resourceType:
                tagTarget.kind === 'dispute' || tagTarget.type === 'Dispute' ? 'Dispute' : 'Refund',
              adminNote: `[Tags: ${tags.join(', ')}] ${adminNotes}`,
            })
            toast.success('Tags added')
            setTagTarget(null)
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to add tags'))
            throw err
          }
        }}
      />

      <MergeTicketsModal
        isOpen={!!mergeTarget}
        onClose={() => setMergeTarget(null)}
        availableTickets={mergeCandidates}
        onMerge={async ({ ticketIds, adminNotes }) => {
          try {
            await mergeTickets(ticketIds, adminNotes)
            toast.success('Tickets merged')
            setMergeTarget(null)
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to merge tickets'))
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
