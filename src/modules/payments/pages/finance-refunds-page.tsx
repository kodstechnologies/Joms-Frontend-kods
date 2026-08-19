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
import { fetchFinanceDisputes, fetchFinanceRefunds } from '@/modules/payments/api/finance-api'
import {
  createFinanceRowsExportHandler,
  useFinanceListFilters,
} from '@/modules/payments/hooks/use-finance-list-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { useTagsApi } from '@/modules/payments/hooks/use-tags-api'
import {
  formatInr,
  mapDisputeToRefundRow,
  mapRefundToRow,
} from '@/modules/payments/utils/finance-mappers'
import { AddTagsModal } from '@/modules/payments/components/add-tags-modal'
import {
  FinanceEscalateDeleteModal,
  type FinanceEscalateDeleteAction,
} from '@/modules/payments/components/finance-escalate-delete-modal'
import { MergeTicketsModal } from '@/modules/payments/components/merge-tickets-modal'
import { ChangeStatusModal } from '@/shared/components/modals/change-status-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

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
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [statusTarget, setStatusTarget] = useState<RefundChargebackRow | null>(null)
  const [tagTarget, setTagTarget] = useState<RefundChargebackRow | null>(null)
  const [mergeTarget, setMergeTarget] = useState<RefundChargebackRow | null>(null)

  const handleExportData = useMemo(
    () =>
      createFinanceRowsExportHandler({
        fetchRows: async (params) => [
          ...((await fetchFinanceRefunds(params))?.data?.rows ?? []),
          ...((await fetchFinanceDisputes(params))?.data?.rows ?? []),
        ],
        headers: ['ID', 'Status', 'Amount', 'Created'],
        mapRow: (row) => [
          exportDisplayValue(row._id),
          exportDisplayValue(row.status),
          exportDisplayValue(
            'amount' in row ? row.amount : row.originalAmount,
          ),
          exportDisplayValue(row.createdAt),
        ],
        fileName: 'refunds_export',
      }),
    [],
  )
  const { apiFilterParams, onAdvancedFilter, onExport, modals: exportFilterModals } =
    useFinanceListFilters(handleExportData)

  const listParams = { page: currentPage, limit: PAGE_SIZE, ...apiFilterParams }
  const disputesQuery = useFinanceDisputes(listParams)
  const refundsQuery = useFinanceRefunds(listParams)
  const dashboardQuery = useFinanceDashboard()
  const updateDisputeStatus = useUpdateDisputeStatus()
  const updateRefundStatus = useUpdateRefundStatus()
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const { mergeTickets } = useTagsApi()

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

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) =>
      [
        row.recordId,
        row.type,
        row.relatedEntity,
        row.amount,
        row.reason,
        row.initiatedDate,
        row.description,
        row.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, searchQuery])

  const pageRows = searchQuery.trim() ? filteredRows : rows

  const refundSummaryMetrics = [
    {
      label: 'Pending Refunds',
      value: String(rows.filter((r) => r.type === 'Refund' && r.status === 'Pending').length),
      change: '—',
      changeNote: 'this page',
    },
    {
      label: 'Active Disputes',
      value: String(summary?.openDisputes ?? 0),
      change: '—',
      changeNote: 'open cases',
    },
    {
      label: 'Amount in Disputed',
      value: formatInr(summary?.disputedAmount ?? 0),
      change: '—',
      changeNote: 'open disputes',
    },
    {
      label: 'Resolved',
      value: String(rows.filter((r) => r.status === 'Resolved').length),
      change: '—',
      changeNote: 'this page',
    },
  ]

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
            onClick={() => {
              setActiveDropdownId(null)
              navigate(
                record.kind === 'dispute' || record.type === 'Dispute'
                  ? `/finance/refunds/${record.id}/dispute`
                  : `/finance/refunds/${record.id}`,
              )
            }}
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
            onClick={() => {
              setActiveDropdownId(null)
              setStatusTarget(record)
            }}
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
              navigate(`/finance/refunds/${record.id}/escalate`)
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

  const columns = useMemo<ColumnDef<RefundChargebackRow>[]>(
    () => [
      {
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
      },
      {
        accessorKey: 'recordId',
        header: 'ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.recordId}
          </span>
        ),
      },
      { accessorKey: 'type', header: 'Type' },
      { accessorKey: 'relatedEntity', header: 'Related Entity' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.amount}</span>
        ),
      },
      { accessorKey: 'reason', header: 'Reason' },
      { accessorKey: 'initiatedDate', header: 'Initiated Date' },
      { accessorKey: 'description', header: 'Description' },
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
        {refundSummaryMetrics.map((metric) => (
          <SummaryCard key={metric.label} {...metric} />
        ))}
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load refunds and disputes.</p>
      ) : null}

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
          page: currentPage,
          pageSize: PAGE_SIZE,
          totalItems: metaTotal,
          totalPages: metaTotalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="records"
        emptyMessage="No refund records found."
      />
      {exportFilterModals}

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
    </div>
  )
}
